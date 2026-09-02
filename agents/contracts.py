from dataclasses import asdict, dataclass, field
from typing import Any, Literal

from rag.contracts import RagEvidenceResult


def resolve_error_fields(
    error: dict[str, Any] | None,
    error_code: str | None = None,
    error_message: str | None = None,
) -> tuple[str | None, str | None]:
    """Resolve the public error fields without exposing private exception data."""

    nested = error if isinstance(error, dict) else {}
    code = error_code or nested.get("code")
    message = error_message or nested.get("message")
    normalized_code = str(code).strip() if code is not None and str(code).strip() else None
    normalized_message = (
        str(message).strip()
        if message is not None and str(message).strip()
        else None
    )
    return normalized_code, normalized_message


SpecialistStatus = Literal[
    "accepted",
    "insufficient",
    "confirmation_required",
    "completed",
    "failed",
]


@dataclass(frozen=True)
class WorkerRetryPolicy:
    """Worker 的最小重试声明。

    策略只描述允许的边界，不负责真正执行重试；执行层可以据此接入统一
    Runtime，而不让每个 Worker 自己实现一套重试循环。
    """

    max_attempts: int = 1
    backoff_seconds: float = 0.0
    retryable_errors: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if self.max_attempts < 1:
            raise ValueError("max_attempts must be at least 1")
        if self.backoff_seconds < 0:
            raise ValueError("backoff_seconds must be non-negative")


@dataclass(frozen=True)
class WorkerManifest:
    """Worker 的公开能力边界。

    Manifest 是描述性合同：它声明输入/输出、可用能力、变更范围和执行
    策略，但不直接执行工具。所有字段都适合被 API、控制台和 Runtime 读取。
    """

    name: str
    description: str
    input_schema: dict[str, Any] = field(default_factory=dict)
    output_schema: dict[str, Any] = field(default_factory=dict)
    capabilities: tuple[str, ...] = ()
    mutating_operations: tuple[str, ...] = ()
    requires_confirmation: bool = False
    timeout_seconds: float = 60.0
    retry_policy: WorkerRetryPolicy = field(default_factory=WorkerRetryPolicy)
    tools: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("worker name must not be empty")
        if self.timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be positive")

    @property
    def read_only(self) -> bool:
        return not self.mutating_operations

    def as_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["retry_policy"] = asdict(self.retry_policy)
        value["read_only"] = self.read_only
        return value


@dataclass(frozen=True)
class SpecialistResult:
    """Worker 与 Supervisor 之间的稳定合同，避免依赖自然语言模板解析。"""

    specialist: Literal["knowledge", "memory", "document", "profile", "voice", "rvc_worker", "live2d", "config"]
    status: SpecialistStatus
    answer: str = ""
    evidence: tuple[dict[str, Any], ...] = ()
    citations: tuple[dict[str, Any], ...] = ()
    uncertainties: tuple[str, ...] = ()
    trace: tuple[dict[str, Any], ...] = ()
    confidence: float = 0.0
    pending_action: dict[str, Any] | None = None
    artifacts: tuple[dict[str, Any], ...] = ()
    error: dict[str, Any] | None = None

    @property
    def worker(self) -> str:
        """Canonical Worker 字段；specialist 保留用于旧 API 兼容。"""

        return self.specialist

    @classmethod
    def from_rag_evidence(cls, result: RagEvidenceResult) -> "SpecialistResult":
        return cls(
            specialist="knowledge",
            status=result.status,
            answer=result.answer,
            evidence=result.evidence,
            citations=result.citations,
            uncertainties=result.uncertainties,
            trace=result.trace,
            confidence=result.confidence,
            error=(
                {"code": result.error_code, "message": result.error_message}
                if result.error_code
                else None
            ),
        )

    def as_dict(self) -> dict[str, Any]:
        value = asdict(self)
        # worker 是新合同字段；specialist 保留，避免旧客户端和旧图节点断裂。
        value["worker"] = self.worker
        # ToolMessage 经过 JSON 序列化后本来就是数组；这里直接返回 list，方便 API 与测试消费。
        for key in ("evidence", "citations", "uncertainties", "trace", "artifacts"):
            value[key] = list(value[key])
        value["requires_approval"] = self.status == "confirmation_required" or self.pending_action is not None
        return value
