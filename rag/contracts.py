from dataclasses import dataclass
from enum import Enum
from typing import Any, Literal


class RagErrorCode(str, Enum):
    """稳定的 RAG 错误分类；代码可供 API、Agent 和前端直接消费。"""

    INSUFFICIENT = "insufficient"
    FAILED_RETRIEVAL = "failed_retrieval"
    FAILED_GENERATION = "failed_generation"
    FAILED_QUALITY_GATE = "failed_quality_gate"
    DEPENDENCY_UNAVAILABLE = "dependency_unavailable"


_RAG_PUBLIC_MESSAGES = {
    RagErrorCode.INSUFFICIENT: "资料中没有足够信息回答这个问题。",
    RagErrorCode.FAILED_RETRIEVAL: "知识检索暂时失败，请稍后重试。",
    RagErrorCode.FAILED_GENERATION: "知识回答生成暂时失败，请稍后重试。",
    RagErrorCode.FAILED_QUALITY_GATE: "回答校验暂时失败，请稍后重试。",
    RagErrorCode.DEPENDENCY_UNAVAILABLE: "知识服务依赖暂时不可用，请稍后重试。",
}


def normalize_rag_error_code(code: RagErrorCode | str | None) -> str | None:
    """归一化错误码；未知值不穿透到公开合同。"""

    if code is None:
        return None
    try:
        return RagErrorCode(code).value
    except (TypeError, ValueError):
        return None


def public_rag_error_message(code: RagErrorCode | str | None) -> str:
    """将 RAG 内部错误分类转换为脱敏的用户可见消息。"""

    normalized = normalize_rag_error_code(code)
    if normalized is None:
        return "知识服务暂时不可用，请稍后重试。"
    return _RAG_PUBLIC_MESSAGES[RagErrorCode(normalized)]


@dataclass(frozen=True)
class RagQueryContext:
    persona_id: str
    workspace_id: str
    knowledge_space_ids: tuple[str, ...]
    conversation_id: str | None = None

    def __post_init__(self) -> None:
        if not self.knowledge_space_ids:
            raise ValueError("knowledge_space_ids must not be empty")


@dataclass(frozen=True)
class RagEvidenceResult:
    """RAG 交给 Agent 的证据合同，不暴露未通过质量门禁的草稿。"""

    status: Literal["accepted", "insufficient", "failed"]
    answer: str
    evidence: tuple[dict[str, Any], ...]
    confidence: float
    citations: tuple[dict[str, Any], ...]
    uncertainties: tuple[str, ...]
    trace: tuple[dict[str, Any], ...]
    used_web_search: bool
    grounded: bool
    useful: bool
    missing_points: tuple[str, ...]
    error_code: str | None = None
    error_message: str | None = None

    @classmethod
    def from_rag_result(cls, result: Any) -> "RagEvidenceResult":
        error_code = normalize_rag_error_code(getattr(result, "error_code", None))
        # 公开合同只使用代码映射出的固定消息，禁止底层异常原文穿透。
        error_message = public_rag_error_message(error_code) if error_code else None
        accepted = (
            error_code is None
            and bool(result.grounded and result.useful and result.evidence)
        )
        # 门禁失败或管线失败时主动丢弃答案和证据，防止上层模型把低质量草稿重新包装成事实。
        evidence = tuple(result.evidence) if accepted else ()
        missing_points = tuple(result.missing_points)
        if not accepted and error_message and error_message not in missing_points:
            uncertainties = (*missing_points, error_message)
        else:
            uncertainties = missing_points if not accepted else ()
        status: Literal["accepted", "insufficient", "failed"] = (
            "accepted"
            if accepted
            else "insufficient"
            if error_code in {None, RagErrorCode.INSUFFICIENT.value}
            else "failed"
        )
        return cls(
            status=status,
            answer=result.answer_draft if accepted else "",
            evidence=evidence,
            confidence=float(result.confidence),
            citations=_citations_from_evidence(evidence),
            uncertainties=uncertainties,
            trace=tuple(result.trace),
            used_web_search=bool(result.used_web_search),
            grounded=bool(result.grounded),
            useful=bool(result.useful),
            missing_points=missing_points,
            error_code=error_code,
            error_message=error_message,
        )


def _citations_from_evidence(
    evidence: tuple[dict[str, Any], ...],
) -> tuple[dict[str, Any], ...]:
    """提取可公开引用字段，原始片段仍保留在 evidence 中供 API 展示。"""

    citation_fields = ("source", "filename", "title", "url", "section", "document_id", "chunk_id", "evidence_role")
    return tuple(
        {key: item[key] for key in citation_fields if item.get(key) is not None}
        for item in evidence
    )
