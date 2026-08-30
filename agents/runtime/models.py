from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator

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
    RunStatus.QUEUED: frozenset({RunStatus.RUNNING, RunStatus.CANCELLED}),
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

    run_id: str
    status: str = "completed"
    answer: str = ""
    specialist: str | None = None
    pending_action: dict[str, Any] | None = None
    worker_results: list[dict[str, Any]] = Field(default_factory=list)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    citations: list[dict[str, Any]] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    trace: list[dict[str, Any]] = Field(default_factory=list)
    requires_approval: bool = False
    error_code: str | None = None


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
