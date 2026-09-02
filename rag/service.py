from collections.abc import Callable
from dataclasses import dataclass, replace

from settings import Settings
from rag.contracts import (
    RagErrorCode,
    RagQueryContext,
    normalize_rag_error_code,
    public_rag_error_message,
)


@dataclass(frozen=True)
class RagRequest:
    """RAG 统一输入；context 必须由服务端从当前角色派生。"""

    question: str
    context: RagQueryContext
    allow_web_fallback: bool = False
    persona_name: str = ""
    persona_profile: dict | None = None
    available_tools: tuple[str, ...] = ()
    force_knowledge: bool = False
    retrieval_config: dict | None = None
    # 已通过授权策略获得的联网结果；传入后仍必须经过 Adaptive 质量链。
    prefetched_web_documents: tuple[dict, ...] | None = None
    # 由服务工厂注入的请求级 Settings；不会进入公开 trace/合同。
    settings: Settings | None = None


@dataclass(frozen=True)
class RagResult:
    """供 Agent/API 消费的稳定输出，不暴露 LangGraph 内部状态。"""

    answer_draft: str
    evidence: tuple[dict, ...]
    confidence: float
    used_web_search: bool
    trace: tuple[dict, ...]
    grounded: bool
    useful: bool
    missing_points: tuple[str, ...]
    interaction_mode: str = "knowledge"
    error_code: str | None = None
    error_message: str | None = None

    @classmethod
    def empty(cls, reason: str) -> "RagResult":
        return cls(
            answer_draft=reason,
            evidence=(),
            confidence=0.0,
            used_web_search=False,
            trace=(),
            grounded=False,
            useful=False,
            missing_points=(reason,),
            error_code=RagErrorCode.INSUFFICIENT.value,
            error_message=public_rag_error_message(RagErrorCode.INSUFFICIENT),
        )

    @classmethod
    def failed(
        cls,
        error_code: RagErrorCode | str,
        *,
        trace: tuple[dict, ...] = (),
        missing_points: tuple[str, ...] = (),
        interaction_mode: str = "knowledge",
    ) -> "RagResult":
        """创建脱敏失败结果；底层异常只应记录在服务端日志。"""

        normalized = normalize_rag_error_code(error_code) or RagErrorCode.DEPENDENCY_UNAVAILABLE.value
        return cls(
            answer_draft="",
            evidence=(),
            confidence=0.0,
            used_web_search=False,
            trace=trace,
            grounded=False,
            useful=False,
            missing_points=missing_points,
            interaction_mode=interaction_mode,
            error_code=normalized,
            error_message=public_rag_error_message(normalized),
        )


class RagService:
    def __init__(self, runner: Callable[[RagRequest], RagResult]):
        self._runner = runner

    def query(self, request: RagRequest, on_step: Callable | None = None) -> RagResult:
        if not request.question.strip():
            raise ValueError("question must not be empty")
        try:
            result = self._runner(request, on_step=on_step)
        except Exception:
            # Service 是 RAG 的合同边界：意外异常不能直接穿透 API 或 Agent。
            return RagResult.failed(RagErrorCode.DEPENDENCY_UNAVAILABLE)
        if not isinstance(result, RagResult):
            return RagResult.failed(RagErrorCode.DEPENDENCY_UNAVAILABLE)
        return result


# 管线工厂：生产和所有正式 RAG 入口统一使用 Adaptive/Corrective RAG。
# simple（retrieve -> generate）不再作为可用管线，避免绕过精排、质量门和拒答。
def create_rag_service(settings: Settings | None = None) -> RagService:
    """在应用启动时选择 Pipeline，调用方无需了解具体图实现。"""

    active_settings = settings or Settings.load()
    if active_settings.rag_pipeline == "simple":
        raise ValueError(
            "RAG_PIPELINE=simple is not supported; use the standard adaptive pipeline"
        )
    if active_settings.rag_pipeline in {"default", "adaptive"}:
        from rag.adaptive_graph import run_adaptive

        def run(request: RagRequest, on_step=None) -> RagResult:
            # 将工厂选定的不可变配置传入本次请求，避免 Adaptive Graph 节点
            # 继续读取模块导入时的 Settings 快照。Settings 只在进程内传递，
            # 不写入 evidence、citations 或公开 trace。
            request_with_settings = (
                request
                if request.settings is not None
                else replace(request, settings=active_settings)
            )
            return run_adaptive(request_with_settings, on_step=on_step)

        return RagService(run)
    raise ValueError(f"Unsupported RAG_PIPELINE: {active_settings.rag_pipeline}")
