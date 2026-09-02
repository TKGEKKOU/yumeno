from typing import Any
import inspect

from langchain.tools import ToolRuntime, tool

from agents.context import PersonaAgentContext
from agents.contracts import SpecialistResult
from rag.contracts import RagErrorCode, RagEvidenceResult, RagQueryContext
from rag.service import RagRequest, RagResult, RagService, create_rag_service


"""Agent 侧 RAG 入口。

search_persona_knowledge 是知识 Worker 暴露给 supervisor 的唯一检索工具：
- 强制走知识链（force_knowledge=True），避免 RAG 内部再把同一问题误分派；
- 统一经 RagService 选择 adaptive 管线，返回的 RagEvidenceResult 只暴露
  通过质量门的证据与引用，未通过的草稿不会上抛给上层模型。
"""


def _failed_knowledge_result(code: RagErrorCode = RagErrorCode.DEPENDENCY_UNAVAILABLE) -> dict[str, Any]:
    """将工具初始化异常转换为统一的脱敏 Worker 合同。"""

    return SpecialistResult.from_rag_evidence(
        RagEvidenceResult.from_rag_result(RagResult.failed(code))
    ).as_dict()


def run_persona_knowledge_search(
    query: str,
    context: PersonaAgentContext,
    service: RagService | None = None,
    on_step=None,
) -> dict[str, Any]:
    try:
        active_service = service or create_rag_service()
        request = RagRequest(
            question=query,
            context=RagQueryContext(
                persona_id=context.persona_id,
                workspace_id=context.workspace_id,
                knowledge_space_ids=context.knowledge_space_ids,
                conversation_id=context.conversation_id,
            ),
            allow_web_fallback=False,
            persona_name=context.persona_name,
            persona_profile=context.persona_profile,
            retrieval_config=(context.persona_profile or {}).get("rag"),
            force_knowledge=True,
        )
        if "on_step" in inspect.signature(active_service.query).parameters:
            result = active_service.query(request, on_step=on_step)
        else:
            result = active_service.query(request)
    except Exception:
        return _failed_knowledge_result()
    evidence_result = RagEvidenceResult.from_rag_result(result)
    return SpecialistResult.from_rag_evidence(evidence_result).as_dict()


def run_persona_web_grounded_search(
    query: str,
    context: PersonaAgentContext,
    documents: list[dict],
    on_step=None,
) -> dict[str, Any]:
    """对已获授权的联网结果执行完整 Adaptive RAG 质量链。"""
    try:
        active_service = create_rag_service()
        request = RagRequest(
            question=query,
            context=RagQueryContext(
                persona_id=context.persona_id,
                workspace_id=context.workspace_id,
                knowledge_space_ids=context.knowledge_space_ids,
                conversation_id=context.conversation_id,
            ),
            allow_web_fallback=False,
            persona_name=context.persona_name,
            persona_profile=context.persona_profile,
            retrieval_config=(context.persona_profile or {}).get("rag"),
            force_knowledge=True,
            prefetched_web_documents=tuple(documents),
        )
        if "on_step" in inspect.signature(active_service.query).parameters:
            result = active_service.query(request, on_step=on_step)
        else:
            result = active_service.query(request)
    except Exception:
        return _failed_knowledge_result()
    return SpecialistResult.from_rag_evidence(
        RagEvidenceResult.from_rag_result(result)
    ).as_dict()


@tool("search_persona_knowledge")
def search_persona_knowledge(
    query: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict[str, Any]:
    """Search the active persona's uploaded knowledge with corrective RAG."""
    return run_persona_knowledge_search(query, runtime.context)
