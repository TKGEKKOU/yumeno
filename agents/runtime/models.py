from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from agents.contracts import resolve_error_fields

from .errors import public_error_message
from .events import sanitize_event_details


class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


_TERMINAL_STATES = frozenset({RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED})
_TRANSITIONS = {
    RunStatus.QUEUED: frozenset({RunStatus.RUNNING, RunStatus.FAILED, RunStatus.CANCELLED}),
    RunStatus.RUNNING: frozenset(
        {
            RunStatus.WAITING_APPROVAL,
            RunStatus.PAUSED,
            RunStatus.COMPLETED,
            RunStatus.FAILED,
            RunStatus.CANCELLED,
        }
    ),
    RunStatus.WAITING_APPROVAL: frozenset(
        {RunStatus.RUNNING, RunStatus.PAUSED, RunStatus.FAILED, RunStatus.CANCELLED}
    ),
    RunStatus.PAUSED: frozenset({RunStatus.RUNNING, RunStatus.FAILED, RunStatus.CANCELLED}),
    RunStatus.COMPLETED: frozenset(),
    RunStatus.FAILED: frozenset(),
    RunStatus.CANCELLED: frozenset(),
}


def allowed_transition(source: RunStatus | str, target: RunStatus | str) -> bool:
    """判断状态转换是否合法；终态到自身的转换用于幂等更新。"""

    try:
        source_status = RunStatus(source)
        target_status = RunStatus(target)
    except (TypeError, ValueError):
        return False
    if source_status == target_status:
        return source_status in _TERMINAL_STATES
    return target_status in _TRANSITIONS[source_status]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TaskStatus(str, Enum):
    """持久化任务的生命周期；Phase 1 只定义合同，不驱动状态转换。"""

    QUEUED = "queued"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StepStatus(str, Enum):
    """持久化步骤的生命周期；允许 skipped 表示被编排器跳过的步骤。"""

    QUEUED = "queued"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SKIPPED = "skipped"


def _sanitize_summary(value: dict[str, Any] | None) -> dict[str, Any]:
    """只保留可公开的标量运行摘要，拒绝 Prompt、密钥和原始载荷。"""

    return sanitize_event_details(value)


# 交接合同只承载数据引用和编排元数据；执行入口字段一律不允许出现。
_FORBIDDEN_HANDOFF_FIELDS = frozenset({"path", "command", "python", "shell"})


def _validate_handoff_value(value: Any, *, field_path: str = "handoff") -> None:
    """递归验证交接载荷是 JSON 数据，并拒绝执行/文件系统字段。

    该检查故意不做字符串内容过滤：``path`` 等词可以合法出现在普通文本中，
    这里只禁止它们作为结构化对象的字段名。这样既避免误伤用户文本，也不让
    Core/Supervisor/Worker 之间通过状态合同传递可直接执行的指令。
    """

    if isinstance(value, Mapping):
        for key, nested in value.items():
            if not isinstance(key, str):
                raise ValueError(f"{field_path} keys must be strings")
            normalized_key = key.strip().lower()
            if normalized_key in _FORBIDDEN_HANDOFF_FIELDS:
                raise ValueError(f"forbidden handoff field: {key}")
            _validate_handoff_value(nested, field_path=f"{field_path}.{key}")
        return

    if isinstance(value, (list, tuple)):
        for index, nested in enumerate(value):
            _validate_handoff_value(nested, field_path=f"{field_path}[{index}]")
        return

    if value is None or isinstance(value, (str, int, float, bool)):
        return

    raise ValueError(f"{field_path} contains a non-JSON value: {type(value).__name__}")


class StructuredHandoff(BaseModel):
    """Core → Supervisor → Worker 的最小结构化交接合同。

    合同只保存任务描述、输入/结果引用和用户已选选项，不保存原始 Prompt、
    本地路径或任何命令执行字段。旧图仍可继续使用 ``worker_request``、
    ``worker_call_id`` 等兼容字段；新调用方应优先使用本模型及其状态字段。
    """

    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    conversation_id: str | None = None
    pending_task: dict[str, Any] | str | None = None
    task_type: str | None = None
    dispatch_request: dict[str, Any] | None = None
    input_refs: dict[str, Any] | list[str] = Field(default_factory=dict)
    selected_options: dict[str, Any] = Field(default_factory=dict)
    waiting_inputs: list[dict[str, Any] | str] = Field(default_factory=list)
    workflow: dict[str, Any] = Field(default_factory=dict)
    result_refs: list[str] = Field(default_factory=list)
    dispatch_status: Literal["pending", "accepted", "waiting_input", "completed", "failed"] = "pending"

    @model_validator(mode="before")
    @classmethod
    def _validate_payload(cls, value: Any) -> Any:
        _validate_handoff_value(value)
        return value


def validate_structured_handoff(value: StructuredHandoff | Mapping[str, Any]) -> StructuredHandoff:
    """在交接边界验证并标准化结构化合同。"""

    if isinstance(value, StructuredHandoff):
        # Pydantic 无法拦截对嵌套 dict/list 的原地 mutation；即使调用方传入
        # 已构造实例，也重新检查其当前载荷，避免绕过安全边界。
        _validate_handoff_value(value.model_dump(mode="python"))
        return value
    return StructuredHandoff.model_validate(value)


class RuntimeTask(BaseModel):
    """一次 Run 内可独立追踪的业务任务摘要。"""

    model_config = ConfigDict(use_enum_values=False, validate_assignment=True)

    task_id: str = Field(default_factory=lambda: str(uuid4()))
    run_id: str
    name: str = "task"
    status: TaskStatus = TaskStatus.QUEUED
    input_summary: dict[str, Any] = Field(default_factory=dict)
    output_summary: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=_utc_now)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    updated_at: datetime = Field(default_factory=_utc_now)

    _sanitize_input_summary = field_validator("input_summary", mode="before")(_sanitize_summary)
    _sanitize_output_summary = field_validator("output_summary", mode="before")(_sanitize_summary)
    _sanitize_metadata = field_validator("metadata", mode="before")(_sanitize_summary)


class RuntimeStep(BaseModel):
    """Task 内一个有序、可恢复的 Worker/工具执行步骤摘要。"""

    model_config = ConfigDict(use_enum_values=False, validate_assignment=True)

    step_id: str = Field(default_factory=lambda: str(uuid4()))
    task_id: str
    sequence: int = Field(ge=1)
    name: str = "step"
    worker: str | None = None
    status: StepStatus = StepStatus.QUEUED
    input_summary: dict[str, Any] = Field(default_factory=dict)
    output_summary: dict[str, Any] = Field(default_factory=dict)
    resume_state: dict[str, Any] | None = None
    created_at: datetime = Field(default_factory=_utc_now)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    updated_at: datetime = Field(default_factory=_utc_now)

    _sanitize_input_summary = field_validator("input_summary", mode="before")(_sanitize_summary)
    _sanitize_output_summary = field_validator("output_summary", mode="before")(_sanitize_summary)
    _sanitize_resume_state = field_validator("resume_state", mode="before")(_sanitize_summary)


class AgentRun(BaseModel):
    """一次用户触发的 Agent 运行及其脱敏结果摘要。"""

    model_config = ConfigDict(use_enum_values=False, validate_assignment=True)

    run_id: str = Field(default_factory=lambda: str(uuid4()))
    action: str = "chat"
    status: RunStatus = RunStatus.QUEUED
    workspace_id: str | None = None
    persona_id: str | None = None
    conversation_id: str | None = None
    thread_id: str | None = None
    active_worker: str | None = None
    specialist: str | None = None
    pending_action: dict[str, Any] | None = None
    current_step: str = ""
    current_question: str = ""
    progress: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)
    status_text: str = ""
    resume_state: dict[str, Any] | None = None
    answer: str = ""
    worker_results: list[dict[str, Any]] = Field(default_factory=list)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    citations: list[dict[str, Any]] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    trace: list[dict[str, Any]] = Field(default_factory=list)
    requires_approval: bool = False
    error_code: str | None = None
    error_message: str | None = None
    result_json: dict[str, Any] | None = None
    created_at: datetime = Field(default_factory=_utc_now)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    updated_at: datetime = Field(default_factory=_utc_now)


class AgentResult(BaseModel):
    """统一的 Runtime 结果合同，不暴露底层 LangGraph 消息。"""

    model_config = ConfigDict(use_enum_values=False)

    # Worker 在图内返回时可能还没有拿到外层 Runtime 的 run_id；进入 Runtime
    # 记录层后会补齐该字段。保留可空是为了让 Worker 合同可独立验证。
    run_id: str | None = None
    status: str = "completed"
    answer: str = ""
    # 旧图和部分调用方仍使用 summary 读取 Worker 的公开摘要。将它纳入
    # 统一结果合同，避免 finalize 写入后又被 Supervisor 的二次校验丢弃。
    summary: str = ""
    worker: str | None = None
    specialist: str | None = None
    pending_action: dict[str, Any] | None = None
    current_step: str = ""
    current_question: str = ""
    progress: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)
    status_text: str = ""
    resume_state: dict[str, Any] | None = None
    worker_results: list[dict[str, Any]] = Field(default_factory=list)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    artifacts: list[dict[str, Any]] = Field(default_factory=list)
    citations: list[dict[str, Any]] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    trace: list[dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    requires_approval: bool = False
    error: dict[str, Any] | None = None
    error_code: str | None = None
    error_message: str | None = None
    # Worker 结果引用字段。保留结构化任务/附件/流程摘要，避免在
    # finalize → Supervisor → Core 边界丢失异步任务和可交付文件。
    result_refs: list[dict[str, Any]] = Field(default_factory=list)
    waiting_inputs: list[dict[str, Any]] = Field(default_factory=list)
    task_id: str | None = None
    task: dict[str, Any] | None = None
    attachment: dict[str, Any] | None = None
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    workflow: dict[str, Any] | None = None
    # Managed RVC session metadata is intentionally ID-based; the optional
    # public snapshot lets the chat UI poll and render separated stems without
    # ever receiving a local filesystem path.
    session: dict[str, Any] | None = None
    rvc_session_id: str | None = None
    source_file_id: str | None = None
    session_id: str | None = None
    attachment_ids: list[str] = Field(default_factory=list)
    input_refs: dict[str, Any] = Field(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        """让新旧 Worker 命名在合同边界保持双向兼容。"""

        if self.worker is None and self.specialist:
            self.worker = self.specialist
        elif self.specialist is None and self.worker:
            self.specialist = self.worker

        if not self.summary and self.answer:
            self.summary = self.answer

        error_code, error_message = resolve_error_fields(
            self.error, self.error_code, self.error_message
        )
        if self.error_code is None and error_code is not None:
            self.error_code = error_code
        if self.error_message is None:
            self.error_message = error_message or (
                public_error_message(error_code) if error_code else None
            )

    def as_worker_dict(self) -> dict[str, Any]:
        """返回可交给 Supervisor 的脱敏、稳定 Worker 合同。"""

        return self.model_dump(mode="json", exclude={"run_id"})


class RunEvent(BaseModel):
    """可持久化的公开运行事件。details 会经过白名单脱敏。"""

    model_config = ConfigDict(use_enum_values=False)

    run_id: str
    sequence: int = Field(ge=1)
    category: str
    name: str
    label: str
    status: str = "completed"
    duration_ms: float | None = Field(default=None, ge=0)
    details: dict[str, Any] = Field(default_factory=dict)

    @field_validator("details", mode="before")
    @classmethod
    def _sanitize_details(cls, value: dict[str, Any] | None) -> dict[str, Any]:
        return sanitize_event_details(value)
