from collections import Counter
from typing import Annotated
import shutil
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import DocumentJob
from app.schemas import DocumentJobResponse
from app.schemas_documents import (
    DocumentProcessingReportResponse,
    DocumentProcessingSummaryResponse,
)
from persona.service import LOCAL_WORKSPACE_ID
from settings import Settings
from ingestion.document_jobs import (
    create_conversion_job,
    get_local_knowledge_space,
    dispatch_document_index,
    prepare_index,
    prepare_retry,
)
from ingestion.markdown_parser import DocumentScope
from ingestion.milvus_store import MilvusRagStore
from structured_data.service import delete_structured_document


router = APIRouter(tags=["documents"])


def get_job_or_404(session: Session, job_id: str) -> DocumentJob:
    job = session.get(DocumentJob, job_id)
    if job is None or job.workspace_id != LOCAL_WORKSPACE_ID:
        raise HTTPException(status_code=404, detail="Document job not found")
    return job


def session_factory_from(request: Request):
    return request.app.state.session_factory


def _count_document_field(jobs: list[DocumentJob], field_name: str) -> dict[str, int]:
    return dict(Counter(getattr(job, field_name) or "unknown" for job in jobs))


def _document_jobs_for_space(session: Session, space_id: str) -> list[DocumentJob]:
    statement = (
        select(DocumentJob)
        .where(
            DocumentJob.workspace_id == LOCAL_WORKSPACE_ID,
            DocumentJob.knowledge_space_id == space_id,
            DocumentJob.status != "deleted",
        )
        .order_by(DocumentJob.created_at, DocumentJob.id)
    )
    return list(session.scalars(statement))


def _document_processing_summary(
    space_id: str, jobs: list[DocumentJob]
) -> DocumentProcessingSummaryResponse:
    statuses = Counter(job.status for job in jobs)
    indexed_count = statuses.get("indexed", 0)
    failed_count = sum(
        count for current_status, count in statuses.items() if current_status.endswith("_failed")
    )
    in_progress_count = sum(
        statuses.get(current_status, 0) for current_status in ("converting", "indexing")
    )
    ready_count = statuses.get("preview_ready", 0)
    indexed_at_values = [job.indexed_at for job in jobs if job.indexed_at is not None]
    updated_at_values = [job.updated_at for job in jobs if job.updated_at is not None]
    return DocumentProcessingSummaryResponse(
        knowledge_space_id=space_id,
        total_documents=len(jobs),
        status_counts=dict(statuses),
        indexed_count=indexed_count,
        failed_count=failed_count,
        in_progress_count=in_progress_count,
        ready_count=ready_count,
        document_type_counts=_count_document_field(jobs, "document_type"),
        chunking_preset_counts=_count_document_field(jobs, "chunking_preset"),
        chunker_version_counts=_count_document_field(jobs, "chunker_version"),
        index_version_counts=_count_document_field(jobs, "index_version"),
        latest_updated_at=max(updated_at_values) if updated_at_values else None,
        latest_indexed_at=max(indexed_at_values) if indexed_at_values else None,
    )


def _schedule_document_index(
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session,
    job: DocumentJob,
) -> DocumentJob:
    """创建统一 Runtime 运行记录，并兼容无数据库测试/演示模式。"""

    dispatch_document_index(
        job.id,
        session_factory_from(request),
        runtime=getattr(request.app.state, "agent_runtime", None),
        schedule=background_tasks.add_task,
    )
    session.refresh(job)
    return job


def _document_processing_report(job: DocumentJob) -> DocumentProcessingReportResponse:
    preview = job.markdown_preview
    return DocumentProcessingReportResponse(
        id=job.id,
        workspace_id=job.workspace_id,
        knowledge_space_id=job.knowledge_space_id,
        document_id=job.document_id,
        original_filename=job.original_filename,
        markdown_filename=job.markdown_filename,
        status=job.status,
        error_message=job.error_message,
        document_type=job.document_type,
        chunking_preset=job.chunking_preset,
        chunker_version=job.chunker_version,
        index_version=job.index_version,
        markdown_preview_available=preview is not None,
        markdown_preview_length=len(preview or ""),
        created_at=job.created_at,
        updated_at=job.updated_at,
        indexed_at=job.indexed_at,
    )


@router.get(
    "/api/knowledge-spaces/{space_id}/documents/report",
    response_model=DocumentProcessingSummaryResponse,
)
def get_knowledge_space_document_report(
    space_id: str,
    session: Session = Depends(get_session),
) -> DocumentProcessingSummaryResponse:
    if get_local_knowledge_space(session, space_id) is None:
        raise HTTPException(status_code=404, detail="Knowledge space not found")
    return _document_processing_summary(space_id, _document_jobs_for_space(session, space_id))


@router.get(
    "/api/documents/{job_id}/report",
    response_model=DocumentProcessingReportResponse,
)
def get_document_processing_report(
    job_id: str,
    session: Session = Depends(get_session),
) -> DocumentProcessingReportResponse:
    return _document_processing_report(get_job_or_404(session, job_id))


@router.post(
    "/api/knowledge-spaces/{space_id}/documents/upload",
    response_model=list[DocumentJobResponse],
    status_code=status.HTTP_201_CREATED,
)
async def upload_documents(
    space_id: str,
    files: Annotated[list[UploadFile], File(...)],
    session: Session = Depends(get_session),
):
    if not files:
        raise HTTPException(status_code=422, detail="At least one file is required")
    space = get_local_knowledge_space(session, space_id)
    if space is None:
        raise HTTPException(status_code=404, detail="Knowledge space not found")
    jobs = []
    for upload in files:
        try:
            jobs.append(await create_conversion_job(session, space, upload))
        except ValueError as exc:
            if str(exc) == "UNSUPPORTED_FILE_TYPE":
                raise HTTPException(status_code=415, detail="Unsupported file type") from exc
            if str(exc) == "FILE_TOO_LARGE":
                raise HTTPException(status_code=413, detail="File too large") from exc
            raise HTTPException(status_code=422, detail="Document conversion failed") from exc
        except Exception as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
    return jobs


@router.get("/api/documents/{job_id}", response_model=DocumentJobResponse)
def get_document(job_id: str, session: Session = Depends(get_session)):
    return get_job_or_404(session, job_id)


@router.post("/api/documents/{job_id}/confirm", response_model=DocumentJobResponse)
def confirm_document(
    job_id: str,
    background_tasks: BackgroundTasks,
    request: Request,
    session: Session = Depends(get_session),
):
    job = get_job_or_404(session, job_id)
    try:
        prepare_index(session, job)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail="Invalid document state") from exc
    return _schedule_document_index(request, background_tasks, session, job)


@router.post("/api/documents/{job_id}/retry-index", response_model=DocumentJobResponse)
def retry_document(
    job_id: str,
    background_tasks: BackgroundTasks,
    request: Request,
    session: Session = Depends(get_session),
):
    job = get_job_or_404(session, job_id)
    try:
        prepare_retry(session, job)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail="Invalid document state") from exc
    return _schedule_document_index(request, background_tasks, session, job)


@router.delete("/api/documents/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(job_id: str, session: Session = Depends(get_session)):
    job = get_job_or_404(session, job_id)
    # indexing 状态也可能已有部分/全部向量（后台任务与删除并发），
    # 一并清理，避免删除后残留孤儿向量仍被检索到。
    if job.status in ("indexing", "indexed", "index_failed"):
        scope = DocumentScope(job.workspace_id, job.knowledge_space_id, job.document_id)
        try:
            MilvusRagStore().delete_document(scope, job.document_id)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Failed to remove document vectors: {exc}") from exc
    delete_structured_document(
        Settings.load().project_root,
        job.workspace_id,
        job.knowledge_space_id,
        job.document_id,
    )
    staging_parent = (Settings.load().project_root / "data" / "staging").resolve()
    if job.source_path:
        staging = Path(job.source_path).resolve().parent
        if staging != staging_parent and staging_parent in staging.parents:
            shutil.rmtree(staging, ignore_errors=True)
    session.delete(job)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
