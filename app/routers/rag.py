from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import DocumentJob, Persona, RagQueryFeedback, RagQueryRecord
from app.schemas import (
    RagFeedbackPayload,
    RagQualityReportResponse,
    RagQueryPayload,
    RagQueryRecordResponse,
    RagQueryResponse,
)
from persona.service import LOCAL_WORKSPACE_ID, PersonaNotFound, resolve_knowledge_scope
from settings import Settings
from rag.contracts import RagErrorCode, RagQueryContext
from rag.service import RagRequest, RagResult, create_rag_service


router = APIRouter(prefix="/api/personas", tags=["rag"])


class _RagServiceProxy:
    """Keep the module-level query seam while loading current settings per request."""

    def query(self, request: RagRequest):
        return create_rag_service(Settings.load()).query(request)


rag_service = _RagServiceProxy()


@router.post("/{persona_id}/rag/query", response_model=RagQueryResponse)
def query_persona(
    persona_id: str,
    payload: RagQueryPayload,
    session: Session = Depends(get_session),
) -> RagQueryResponse:
    settings = Settings.load()
    try:
        scope = resolve_knowledge_scope(session, persona_id)
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc

    context = RagQueryContext(
        persona_id=persona_id,
        workspace_id=scope.workspace_id,
        knowledge_space_ids=scope.knowledge_space_ids,
        conversation_id=payload.conversation_id,
    )
    persona = session.get(Persona, persona_id)
    try:
        result = rag_service.query(
            RagRequest(
                question=payload.question,
                context=context,
                allow_web_fallback=settings.enable_web_fallback,
                persona_name=persona.name,
                persona_profile=persona.profile_json,
                retrieval_config=(persona.profile_json or {}).get("rag"),
                # 该路由语义就是知识问答，不能被内部交互路由降级为闲聊。
                force_knowledge=True,
            )
        )
    except Exception:
        # API 也是合同边界；配置错误或替身异常不能把底层细节变成 500 响应。
        result = RagResult.failed(RagErrorCode.DEPENDENCY_UNAVAILABLE)
    record = RagQueryRecord(
        workspace_id=scope.workspace_id,
        persona_id=persona_id,
        conversation_id=payload.conversation_id,
        question=payload.question,
        answer=result.answer_draft,
        interaction_mode=result.interaction_mode,
        confidence=float(result.confidence),
        used_web_search=bool(result.used_web_search),
        grounded=bool(result.grounded),
        useful=bool(result.useful),
        evidence_json=list(result.evidence),
        trace_json=list(result.trace),
        missing_points_json=list(result.missing_points),
        retrieval_config_json=(persona.profile_json or {}).get("rag") or {},
        error_code=getattr(result, "error_code", None),
        error_message=getattr(result, "error_message", None),
    )
    # 质量记录不能阻断线上问答；失败时回滚当前会话，仍返回完整答案。
    query_id = None
    try:
        session.add(record)
        session.commit()
        session.refresh(record)
        query_id = record.id
    except Exception:
        session.rollback()

    return RagQueryResponse(
        query_id=query_id,
        answer=result.answer_draft,
        evidence=list(result.evidence),
        confidence=result.confidence,
        used_web_search=result.used_web_search,
        trace=list(result.trace),
        grounded=result.grounded,
        useful=result.useful,
        missing_points=list(result.missing_points),
        error_code=getattr(result, "error_code", None),
        error_message=getattr(result, "error_message", None),
        interaction_mode=result.interaction_mode,
    )


def _feedback_dict(feedback: RagQueryFeedback | None) -> dict | None:
    if feedback is None:
        return None
    return {"helpful": feedback.helpful, "note": feedback.note, "created_at": feedback.created_at}


def _query_response(record: RagQueryRecord, feedback: RagQueryFeedback | None = None) -> dict:
    return {
        "id": record.id,
        "persona_id": record.persona_id,
        "conversation_id": record.conversation_id,
        "question": record.question,
        "answer": record.answer,
        "interaction_mode": record.interaction_mode,
        "confidence": record.confidence,
        "used_web_search": record.used_web_search,
        "grounded": record.grounded,
        "useful": record.useful,
        "evidence": list(record.evidence_json or []),
        "trace": list(record.trace_json or []),
        "missing_points": list(record.missing_points_json or []),
        "error_code": record.error_code,
        "error_message": record.error_message,
        "retrieval_config": dict(record.retrieval_config_json or {}),
        "feedback": _feedback_dict(feedback),
        "created_at": record.created_at,
    }


@router.get("/{persona_id}/rag/queries", response_model=list[RagQueryRecordResponse])
def list_persona_rag_queries(
    persona_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> list[dict]:
    try:
        scope = resolve_knowledge_scope(session, persona_id)
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc
    records = list(session.scalars(
        select(RagQueryRecord)
        .where(
            RagQueryRecord.persona_id == persona_id,
            RagQueryRecord.workspace_id == scope.workspace_id,
        )
        .order_by(desc(RagQueryRecord.created_at), desc(RagQueryRecord.id))
        .limit(limit)
    ))
    ids = [record.id for record in records]
    feedback_by_query = {}
    if ids:
        feedback_by_query = {
            item.query_id: item
            for item in session.scalars(
                select(RagQueryFeedback).where(RagQueryFeedback.query_id.in_(ids))
            )
        }
    return [_query_response(record, feedback_by_query.get(record.id)) for record in records]


@router.post("/{persona_id}/rag/queries/{query_id}/feedback")
def submit_rag_feedback(
    persona_id: str,
    query_id: str,
    payload: RagFeedbackPayload,
    session: Session = Depends(get_session),
) -> dict:
    record = session.get(RagQueryRecord, query_id)
    if (
        record is None
        or record.workspace_id != LOCAL_WORKSPACE_ID
        or record.persona_id != persona_id
    ):
        raise HTTPException(status_code=404, detail="RAG query not found")
    feedback = session.scalar(select(RagQueryFeedback).where(RagQueryFeedback.query_id == query_id))
    if feedback is None:
        feedback = RagQueryFeedback(query_id=query_id, helpful=payload.helpful, note=payload.note)
        session.add(feedback)
    else:
        feedback.helpful = payload.helpful
        feedback.note = payload.note
    session.commit()
    session.refresh(feedback)
    return {"query_id": query_id, "feedback": _feedback_dict(feedback)}


@router.get("/{persona_id}/rag/report", response_model=RagQualityReportResponse)
def get_rag_quality_report(
    persona_id: str,
    window: int = Query(default=100, ge=1, le=1000),
    session: Session = Depends(get_session),
) -> dict:
    try:
        scope = resolve_knowledge_scope(session, persona_id)
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc
    persona = session.get(Persona, persona_id)
    records = list(session.scalars(
        select(RagQueryRecord)
        .where(RagQueryRecord.persona_id == persona_id, RagQueryRecord.workspace_id == scope.workspace_id)
        .order_by(desc(RagQueryRecord.created_at), desc(RagQueryRecord.id))
        .limit(window)
    ))
    ids = [record.id for record in records]
    feedback = list(session.scalars(select(RagQueryFeedback).where(RagQueryFeedback.query_id.in_(ids)))) if ids else []
    node_counts = Counter(
        str(event.get("node"))
        for record in records
        for event in (record.trace_json or [])
        if isinstance(event, dict) and event.get("node")
    )
    docs = list(session.scalars(
        select(DocumentJob)
        .where(
            DocumentJob.workspace_id == scope.workspace_id,
            DocumentJob.knowledge_space_id.in_(list(scope.knowledge_space_ids)),
            DocumentJob.status != "deleted",
        )
        .order_by(desc(DocumentJob.updated_at), desc(DocumentJob.id))
    ))
    helpful_rate = (sum(1 for item in feedback if item.helpful) / len(feedback)) if feedback else None
    average_confidence = (sum(item.confidence for item in records) / len(records)) if records else None
    return {
        "persona_id": persona_id,
        "knowledge_space_id": persona.knowledge_space_id,
        "window": window,
        "query_count": len(records),
        "feedback_count": len(feedback),
        "helpful_rate": helpful_rate,
        "grounded_rate": (sum(1 for item in records if item.grounded) / len(records)) if records else None,
        "useful_rate": (sum(1 for item in records if item.useful) / len(records)) if records else None,
        "average_confidence": average_confidence,
        "web_fallback_rate": (sum(1 for item in records if item.used_web_search) / len(records)) if records else 0.0,
        "top_trace_nodes": [{"node": node, "count": count} for node, count in node_counts.most_common(10)],
        "document_versions": [
            {
                "document_id": item.document_id,
                "filename": item.original_filename,
                "status": item.status,
                "document_type": item.document_type,
                "chunking_preset": item.chunking_preset,
                "chunker_version": item.chunker_version,
                "index_version": item.index_version,
                "updated_at": item.updated_at,
            }
            for item in docs
        ],
        "retrieval_config": dict((persona.profile_json or {}).get("rag") or {}),
    }
