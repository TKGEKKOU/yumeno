from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import DocumentJob, KnowledgeSpace, Persona, RagEvaluationCandidate, RagEvaluationCase, RagQueryFeedback, RagQueryRecord
from app.schemas_eval import (
    EvalCaseCreate,
    EvalCaseListResponse,
    EvalCaseResponse,
    EvalCaseUpdate,
    EvalCandidateListResponse,
    EvalCandidateResponse,
    EvalCandidateReviewPayload,
    EvalCandidateStatus,
    EvalCandidateSyncResponse,
)
from ingestion.document_jobs import get_local_knowledge_space
from persona.service import LOCAL_WORKSPACE_ID

router = APIRouter(tags=["eval-dataset"])


def _space_or_404(session: Session, space_id: str) -> KnowledgeSpace:
    space = get_local_knowledge_space(session, space_id)
    if space is None:
        raise HTTPException(status_code=404, detail="Knowledge space not found")
    return space


def _case_or_404(session: Session, space_id: str, case_id: str) -> RagEvaluationCase:
    case = session.scalar(
        select(RagEvaluationCase).where(
            RagEvaluationCase.id == case_id,
            RagEvaluationCase.knowledge_space_id == space_id,
            RagEvaluationCase.workspace_id == LOCAL_WORKSPACE_ID,
        )
    )
    if case is None:
        raise HTTPException(status_code=404, detail="Evaluation case not found")
    return case


def _resolve_document_ids(session: Session, space: KnowledgeSpace, document_ids: list[str]) -> list[str]:
    if not document_ids:
        return []
    jobs = list(
        session.scalars(
            select(DocumentJob).where(
                DocumentJob.workspace_id == space.workspace_id,
                DocumentJob.knowledge_space_id == space.id,
                DocumentJob.status != "deleted",
            )
        )
    )
    by_id = {job.id: job.id for job in jobs}
    by_document_id = {job.document_id: job.id for job in jobs}
    resolved: list[str] = []
    missing: list[str] = []
    for document_id in document_ids:
        canonical = by_id.get(document_id) or by_document_id.get(document_id)
        if canonical is None:
            missing.append(document_id)
        elif canonical not in resolved:
            resolved.append(canonical)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Relevant document does not belong to this knowledge space: {', '.join(missing)}",
        )
    return resolved


def _to_response(case: RagEvaluationCase) -> EvalCaseResponse:
    return EvalCaseResponse(
        id=case.id,
        workspace_id=case.workspace_id,
        knowledge_space_id=case.knowledge_space_id,
        question=case.question,
        expected_answer=case.expected_answer,
        relevant_document_ids=list(case.relevant_document_ids_json or []),
        tags=list(case.tags_json or []),
        difficulty=case.difficulty,
        enabled=case.enabled,
        source=case.source,
        source_query_id=case.source_query_id,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )


@router.get(
    "/api/knowledge-spaces/{space_id}/eval-cases",
    response_model=EvalCaseListResponse,
)
def list_eval_cases(
    space_id: str,
    limit: int = 100,
    include_disabled: bool = True,
    session: Session = Depends(get_session),
) -> EvalCaseListResponse:
    _space_or_404(session, space_id)
    limit = max(1, min(limit, 200))
    statement = (
        select(RagEvaluationCase)
        .where(
            RagEvaluationCase.workspace_id == LOCAL_WORKSPACE_ID,
            RagEvaluationCase.knowledge_space_id == space_id,
        )
        .order_by(RagEvaluationCase.created_at, RagEvaluationCase.id)
        .limit(limit)
    )
    if not include_disabled:
        statement = statement.where(RagEvaluationCase.enabled.is_(True))
    items = list(session.scalars(statement))
    return EvalCaseListResponse(items=[_to_response(item) for item in items], total=len(items))


@router.post(
    "/api/knowledge-spaces/{space_id}/eval-cases",
    response_model=EvalCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_eval_case(
    space_id: str,
    payload: EvalCaseCreate,
    session: Session = Depends(get_session),
) -> EvalCaseResponse:
    space = _space_or_404(session, space_id)
    case = RagEvaluationCase(
        workspace_id=space.workspace_id,
        knowledge_space_id=space.id,
        question=payload.question,
        expected_answer=payload.expected_answer,
        relevant_document_ids_json=_resolve_document_ids(session, space, payload.relevant_document_ids),
        tags_json=payload.tags,
        difficulty=payload.difficulty,
        enabled=payload.enabled,
        source=payload.source,
        source_query_id=payload.source_query_id,
    )
    session.add(case)
    session.commit()
    session.refresh(case)
    return _to_response(case)


@router.get(
    "/api/knowledge-spaces/{space_id}/eval-cases/{case_id}",
    response_model=EvalCaseResponse,
)
def get_eval_case(
    space_id: str,
    case_id: str,
    session: Session = Depends(get_session),
) -> EvalCaseResponse:
    _space_or_404(session, space_id)
    return _to_response(_case_or_404(session, space_id, case_id))


@router.patch(
    "/api/knowledge-spaces/{space_id}/eval-cases/{case_id}",
    response_model=EvalCaseResponse,
)
def update_eval_case(
    space_id: str,
    case_id: str,
    payload: EvalCaseUpdate,
    session: Session = Depends(get_session),
) -> EvalCaseResponse:
    space = _space_or_404(session, space_id)
    case = _case_or_404(session, space_id, case_id)
    changes = payload.model_dump(exclude_unset=True)
    if "relevant_document_ids" in changes:
        changes["relevant_document_ids_json"] = _resolve_document_ids(session, space, changes.pop("relevant_document_ids"))
    if "tags" in changes:
        changes["tags_json"] = changes.pop("tags")
    for key, value in changes.items():
        setattr(case, key, value)
    session.commit()
    session.refresh(case)
    return _to_response(case)


@router.delete(
    "/api/knowledge-spaces/{space_id}/eval-cases/{case_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_eval_case(
    space_id: str,
    case_id: str,
    session: Session = Depends(get_session),
) -> None:
    _space_or_404(session, space_id)
    case = _case_or_404(session, space_id, case_id)
    session.delete(case)
    session.commit()

LOW_CONFIDENCE_THRESHOLD = 0.55


def _candidate_or_404(session: Session, space_id: str, candidate_id: str) -> RagEvaluationCandidate:
    candidate = session.scalar(
        select(RagEvaluationCandidate).where(
            RagEvaluationCandidate.id == candidate_id,
            RagEvaluationCandidate.knowledge_space_id == space_id,
            RagEvaluationCandidate.workspace_id == LOCAL_WORKSPACE_ID,
        )
    )
    if candidate is None:
        raise HTTPException(status_code=404, detail="Evaluation candidate not found")
    return candidate


def _candidate_response(candidate: RagEvaluationCandidate) -> EvalCandidateResponse:
    return EvalCandidateResponse(
        id=candidate.id,
        workspace_id=candidate.workspace_id,
        knowledge_space_id=candidate.knowledge_space_id,
        source_query_id=candidate.source_query_id,
        status=candidate.status,
        source=candidate.source,
        question=candidate.question,
        suggested_answer=candidate.suggested_answer,
        relevant_document_ids=list(candidate.relevant_document_ids_json or []),
        tags=list(candidate.tags_json or []),
        signals=list(candidate.signals_json or []),
        evidence=list(candidate.evidence_json or []),
        confidence=float(candidate.confidence),
        grounded=bool(candidate.grounded),
        useful=bool(candidate.useful),
        feedback_helpful=candidate.feedback_helpful,
        reviewer_note=candidate.reviewer_note,
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
        reviewed_at=candidate.reviewed_at,
    )


def _candidate_signals(record: RagQueryRecord, feedback: RagQueryFeedback | None) -> list[dict[str, str]]:
    signals: list[dict[str, str]] = []
    if float(record.confidence) < LOW_CONFIDENCE_THRESHOLD:
        signals.append({"code": "low_confidence", "label": f"置信度 {float(record.confidence):.2f}"})
    if not record.grounded:
        signals.append({"code": "ungrounded", "label": "回答未充分接地"})
    if feedback is not None and not feedback.helpful:
        signals.append({"code": "negative_feedback", "label": "用户反馈无帮助"})
    return signals


def _candidate_document_ids(record: RagQueryRecord) -> list[str]:
    ids: list[str] = []
    for evidence in record.evidence_json or []:
        if not isinstance(evidence, dict):
            continue
        value = evidence.get("document_id") or evidence.get("doc_id")
        if value and str(value) not in ids:
            ids.append(str(value))
    return ids[:20]


@router.get(
    "/api/knowledge-spaces/{space_id}/eval-candidates",
    response_model=EvalCandidateListResponse,
)
def list_eval_candidates(
    space_id: str,
    status: EvalCandidateStatus = EvalCandidateStatus.pending,
    limit: int = 100,
    session: Session = Depends(get_session),
) -> EvalCandidateListResponse:
    _space_or_404(session, space_id)
    limit = max(1, min(limit, 200))
    items = list(session.scalars(
        select(RagEvaluationCandidate)
        .where(
            RagEvaluationCandidate.workspace_id == LOCAL_WORKSPACE_ID,
            RagEvaluationCandidate.knowledge_space_id == space_id,
            RagEvaluationCandidate.status == status.value,
        )
        .order_by(RagEvaluationCandidate.created_at.desc(), RagEvaluationCandidate.id.desc())
        .limit(limit)
    ))
    pending_total = session.query(RagEvaluationCandidate).filter(
        RagEvaluationCandidate.workspace_id == LOCAL_WORKSPACE_ID,
        RagEvaluationCandidate.knowledge_space_id == space_id,
        RagEvaluationCandidate.status == "pending",
    ).count()
    return EvalCandidateListResponse(
        items=[_candidate_response(item) for item in items],
        total=len(items),
        pending_total=pending_total,
    )


@router.post(
    "/api/knowledge-spaces/{space_id}/eval-candidates/sync",
    response_model=EvalCandidateSyncResponse,
)
def sync_eval_candidates(
    space_id: str,
    session: Session = Depends(get_session),
) -> EvalCandidateSyncResponse:
    """把低置信度、未接地或负反馈查询同步为待确认候选，不直接污染正式题集。"""
    space = _space_or_404(session, space_id)
    persona = session.scalar(
        select(Persona).where(
            Persona.knowledge_space_id == space.id,
            Persona.workspace_id == space.workspace_id,
        )
    )
    if persona is None:
        return EvalCandidateSyncResponse(created=0, existing=0, items=[])
    records = list(session.scalars(
        select(RagQueryRecord)
        .where(
            RagQueryRecord.workspace_id == space.workspace_id,
            RagQueryRecord.persona_id == persona.id,
            RagQueryRecord.interaction_mode == "knowledge",
        )
        .order_by(RagQueryRecord.created_at, RagQueryRecord.id)
    ))
    query_ids = [record.id for record in records]
    feedback_by_query = {
        feedback.query_id: feedback
        for feedback in session.scalars(
            select(RagQueryFeedback).where(RagQueryFeedback.query_id.in_(query_ids))
        )
    } if query_ids else {}
    existing_ids = {
        candidate.source_query_id
        for candidate in session.scalars(
            select(RagEvaluationCandidate).where(
                RagEvaluationCandidate.workspace_id == space.workspace_id,
                RagEvaluationCandidate.knowledge_space_id == space.id,
                RagEvaluationCandidate.source_query_id.in_(query_ids),
            )
        )
    } if query_ids else set()
    created = 0
    existing = 0
    for record in records:
        feedback = feedback_by_query.get(record.id)
        signals = _candidate_signals(record, feedback)
        if not signals:
            continue
        if record.id in existing_ids:
            existing += 1
            continue
        source = "feedback" if any(item["code"] == "negative_feedback" for item in signals) else "quality"
        tags = [item["code"] for item in signals]
        candidate = RagEvaluationCandidate(
            workspace_id=space.workspace_id,
            knowledge_space_id=space.id,
            source_query_id=record.id,
            source=source,
            question=record.question,
            suggested_answer=record.answer,
            relevant_document_ids_json=_candidate_document_ids(record),
            tags_json=tags,
            signals_json=signals,
            evidence_json=list(record.evidence_json or []),
            confidence=float(record.confidence),
            grounded=bool(record.grounded),
            useful=bool(record.useful),
            feedback_helpful=feedback.helpful if feedback is not None else None,
        )
        session.add(candidate)
        existing_ids.add(record.id)
        created += 1
    session.commit()
    items = list(session.scalars(
        select(RagEvaluationCandidate)
        .where(
            RagEvaluationCandidate.workspace_id == space.workspace_id,
            RagEvaluationCandidate.knowledge_space_id == space.id,
            RagEvaluationCandidate.status == "pending",
        )
        .order_by(RagEvaluationCandidate.created_at.desc(), RagEvaluationCandidate.id.desc())
        .limit(200)
    ))
    return EvalCandidateSyncResponse(
        created=created,
        existing=existing,
        items=[_candidate_response(item) for item in items],
    )


@router.post(
    "/api/knowledge-spaces/{space_id}/eval-candidates/{candidate_id}/approve",
    response_model=EvalCaseResponse,
)
def approve_eval_candidate(
    space_id: str,
    candidate_id: str,
    payload: EvalCandidateReviewPayload,
    session: Session = Depends(get_session),
) -> EvalCaseResponse:
    space = _space_or_404(session, space_id)
    candidate = _candidate_or_404(session, space_id, candidate_id)
    if candidate.status != "pending":
        raise HTTPException(status_code=409, detail="Evaluation candidate has already been reviewed")
    existing_case = session.scalar(
        select(RagEvaluationCase).where(
            RagEvaluationCase.workspace_id == space.workspace_id,
            RagEvaluationCase.knowledge_space_id == space.id,
            RagEvaluationCase.source_query_id == candidate.source_query_id,
        )
    )
    if existing_case is not None:
        candidate.status = "accepted"
        candidate.reviewed_at = datetime.now(timezone.utc)
        session.commit()
        return _to_response(existing_case)
    document_ids = payload.relevant_document_ids
    if document_ids is None:
        document_ids = list(candidate.relevant_document_ids_json or [])
    case = RagEvaluationCase(
        workspace_id=space.workspace_id,
        knowledge_space_id=space.id,
        question=candidate.question,
        expected_answer=payload.expected_answer if payload.expected_answer is not None else candidate.suggested_answer,
        relevant_document_ids_json=_resolve_document_ids(session, space, document_ids),
        tags_json=payload.tags if payload.tags is not None else list(candidate.tags_json or []),
        difficulty=payload.difficulty or "medium",
        enabled=True,
        source="feedback",
        source_query_id=candidate.source_query_id,
    )
    candidate.status = "accepted"
    candidate.reviewer_note = payload.note
    candidate.reviewed_at = datetime.now(timezone.utc)
    session.add(case)
    session.commit()
    session.refresh(case)
    return _to_response(case)


@router.post(
    "/api/knowledge-spaces/{space_id}/eval-candidates/{candidate_id}/reject",
    response_model=EvalCandidateResponse,
)
def reject_eval_candidate(
    space_id: str,
    candidate_id: str,
    payload: EvalCandidateReviewPayload,
    session: Session = Depends(get_session),
) -> EvalCandidateResponse:
    _space_or_404(session, space_id)
    candidate = _candidate_or_404(session, space_id, candidate_id)
    if candidate.status != "pending":
        raise HTTPException(status_code=409, detail="Evaluation candidate has already been reviewed")
    candidate.status = "rejected"
    candidate.reviewer_note = payload.note
    candidate.reviewed_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(candidate)
    return _candidate_response(candidate)

