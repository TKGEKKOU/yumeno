import asyncio
import logging
import re
from typing import Any

from agents.runtime.errors import RuntimeErrorCode, public_error_message
from agents.runtime.models import AgentRun, RunStatus
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from app.models import DocumentJob, KnowledgeSpace
from persona.service import LOCAL_WORKSPACE_ID
from settings import Settings
from ingestion.converter import convert_source
from ingestion.indexer import ingest_markdown_file
from ingestion.markdown_parser import DocumentScope
from ingestion.milvus_store import MilvusRagStore
from structured_data.importer import import_structured_file
from structured_data.service import delete_structured_document, structured_db_path


logger = logging.getLogger(__name__)
settings = Settings.load()
DATA_DIR = settings.project_root / "data"
MAX_UPLOAD_BYTES = settings.max_upload_mb * 1024 * 1024
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
    ".html", ".htm", ".csv", ".json", ".xml", ".txt", ".md",
    ".epub", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff",
}
STRUCTURED_EXTENSIONS = {".csv", ".xlsx"}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def sanitize_filename(filename: str) -> str:
    """保留 UTF-8 文件名，同时把路径与危险字符隔离在 staging 目录内。

    扩展名必须从原始文件名单独提取：如果先清理整个文件名，
    日文假名等非 ASCII 字符可能全部被替换，随后 ``Path(...).suffix``
    变成空字符串，合法上传会被误判为不支持的类型。
    """

    leaf = Path(str(filename or "upload")).name
    suffix = Path(leaf).suffix.lower()
    stem = leaf[: -len(suffix)] if suffix else leaf
    # Windows 文件名不能包含这些字符；其余 Unicode 字符（包括日文、
    # 韩文、中文和重音字符）可以保留，便于文档展示与引用。
    stem = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", stem)
    stem = stem.strip(" .")[:180] or "upload"
    return f"{stem}{suffix}"[:200]


def get_local_knowledge_space(session: Session, space_id: str) -> KnowledgeSpace | None:
    space = session.get(KnowledgeSpace, space_id)
    if space is None or space.workspace_id != LOCAL_WORKSPACE_ID:
        return None
    return space


async def create_conversion_job(
    session: Session,
    space: KnowledgeSpace,
    upload: UploadFile,
) -> DocumentJob:
    safe_name = sanitize_filename(upload.filename or "upload")
    if Path(safe_name).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError("UNSUPPORTED_FILE_TYPE")

    job_id = str(uuid4())
    document_id = str(uuid4())
    job_dir = DATA_DIR / "staging" / job_id
    source_path = job_dir / safe_name
    markdown_path = job_dir / "preview.md"
    job_dir.mkdir(parents=True, exist_ok=False)
    job = DocumentJob(
        id=job_id,
        workspace_id=LOCAL_WORKSPACE_ID,
        knowledge_space_id=space.id,
        document_id=document_id,
        original_filename=safe_name,
        markdown_filename=f"{Path(safe_name).stem}.md",
        source_path=str(source_path),
        markdown_path=str(markdown_path),
        status="converting",
    )
    session.add(job)
    session.commit()

    total = 0
    try:
        with source_path.open("wb") as destination:
            while chunk := await upload.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise ValueError("FILE_TOO_LARGE")
                destination.write(chunk)
        job.markdown_preview = await asyncio.to_thread(convert_source, source_path, markdown_path)
        job.status = "preview_ready"
        job.error_message = None
    except Exception as exc:
        job.status = "conversion_failed"
        job.error_message = str(exc)[:2000]
        session.commit()
        raise
    finally:
        await upload.close()

    session.commit()
    session.refresh(job)
    return job


def prepare_index(session: Session, job: DocumentJob) -> DocumentJob:
    if job.status != "preview_ready" or not job.markdown_path:
        raise ValueError("INVALID_DOCUMENT_STATE")
    job.status = "indexing"
    job.error_message = None
    session.commit()
    session.refresh(job)
    return job


def prepare_retry(session: Session, job: DocumentJob) -> DocumentJob:
    if job.status != "index_failed" or not job.markdown_path:
        raise ValueError("INVALID_DOCUMENT_STATE")
    job.status = "indexing"
    job.error_message = None
    session.commit()
    session.refresh(job)
    return job


def dispatch_document_index(
    job_id: str,
    session_factory,
    *,
    runtime=None,
    schedule=None,
    store: MilvusRagStore | None = None,
    structured_root: Path | None = None,
) -> str | None:
    """把文档索引统一派发到 Agent Runtime 或兼容旧执行器。

    ``schedule`` 接收一个可调用对象和参数，HTTP 层传入
    ``BackgroundTasks.add_task``；没有调度器时同步执行，供 Agent 管理工具复用。
    Runtime 只负责持久化运行状态和公开事件，实际索引仍由既有索引器完成。
    """

    run_id: str | None = None
    if runtime is not None:
        with session_factory() as session:
            job = session.get(DocumentJob, job_id)
            if job is not None and job.workspace_id == LOCAL_WORKSPACE_ID and job.markdown_path:
                run = runtime.start_task(
                    action="document_index",
                    workspace_id=job.workspace_id,
                    thread_id=job.id,
                    worker="document_indexer",
                    current_step="indexing",
                    status_text="等待建立索引",
                    resume_state={"phase": "queued", "document_job_id": job.id},
                    metadata={
                        "document_job_id": job.id,
                        "document_id": job.document_id,
                    },
                )
                job.run_id = run.run_id
                session.commit()
                run_id = run.run_id

    if run_id is not None:
        task = run_index_document_job
        args = (job_id, run_id, session_factory, runtime)
    else:
        task = index_document_job
        args = (job_id, session_factory)

    if schedule is not None:
        schedule(task, *args, store=store, structured_root=structured_root)
    elif run_id is not None:
        run_index_document_job(
            job_id,
            run_id,
            session_factory,
            runtime,
            store=store,
            structured_root=structured_root,
        )
    else:
        index_document_job(
            job_id,
            session_factory,
            store=store,
            structured_root=structured_root,
        )
    return run_id


def index_document_job(
    job_id: str,
    session_factory,
    store: MilvusRagStore | None = None,
    structured_root: Path | None = None,
) -> dict[str, Any]:
    with session_factory() as session:
        job = session.get(DocumentJob, job_id)
        if job is None or job.workspace_id != LOCAL_WORKSPACE_ID or not job.markdown_path:
            return {"status": "missing", "document_job_id": job_id}
        scope = DocumentScope(job.workspace_id, job.knowledge_space_id, job.document_id)
        root = structured_root or settings.project_root
        structured_imported = False
        try:
            source_path = Path(job.source_path)
            if source_path.suffix.lower() in STRUCTURED_EXTENSIONS:
                imported = import_structured_file(
                    source_path,
                    db_path=structured_db_path(
                        root, job.workspace_id, job.knowledge_space_id
                    ),
                    workspace_id=job.workspace_id,
                    knowledge_space_id=job.knowledge_space_id,
                    document_id=job.document_id,
                )
                structured_imported = True
                Path(job.markdown_path).write_text(imported.schema_card, encoding="utf-8")
                job.markdown_preview = imported.schema_card
            index_kwargs = {}
            if getattr(job, "chunking_preset", None):
                index_kwargs = {
                    "chunking_preset": job.chunking_preset,
                    "chunker_version": getattr(job, "chunker_version", None),
                }
            if store is not None:
                index_kwargs["store"] = store
            ingest_markdown_file(Path(job.markdown_path), scope, **index_kwargs)
            job.status = "indexed"
            job.indexed_at = utc_now()
            job.error_message = None
        except Exception as exc:
            # 原始异常只进入服务日志，不能通过 DocumentJob/Runtime API 暴露。
            logger.exception("文档任务 %s 索引失败", job_id)
            if structured_imported:
                delete_structured_document(
                    root,
                    job.workspace_id,
                    job.knowledge_space_id,
                    job.document_id,
                )
            job.status = "index_failed"
            job.error_message = str(exc)[:2000]
        try:
            session.commit()
        except StaleDataError:
            # 行被并发删除（删除文档/角色）导致 UPDATE 匹配 0 行：回滚事务后
            # 清理刚写入 Milvus 的向量，避免已删除文档的向量残留污染检索结果。
            session.rollback()
            cleanup_store = store or MilvusRagStore()
            try:
                cleanup_store.delete_document(scope, job.document_id)
            except Exception as cleanup_exc:  # noqa: BLE001 - 清理失败不应再次抛出
                logger.warning("文档任务 %s 清理孤儿向量失败：%s", job_id, cleanup_exc)
            if structured_imported:
                try:
                    delete_structured_document(
                        root,
                        job.workspace_id,
                        job.knowledge_space_id,
                        job.document_id,
                    )
                except Exception as cleanup_exc:  # noqa: BLE001
                    logger.warning("文档任务 %s 清理结构化数据失败：%s", job_id, cleanup_exc)
            logger.warning(
                "文档任务 %s 的行已被并发删除，已回滚并清理 Milvus 向量（document_id=%s）",
                job_id,
                job.document_id,
            )
            return {
                "status": "deleted",
                "document_job_id": job_id,
                "document_id": job.document_id,
            }
        return {
            "status": job.status,
            "document_job_id": job_id,
            "document_id": job.document_id,
        }


def _mark_document_index_cancelled(job_id: str, session_factory) -> None:
    with session_factory() as session:
        job = session.get(DocumentJob, job_id)
        if job is None or job.workspace_id != LOCAL_WORKSPACE_ID:
            return
        if job.status == "indexing":
            job.status = "index_failed"
            job.error_message = public_error_message(RuntimeErrorCode.RUN_CANCELLED)
            session.commit()


def run_index_document_job(
    job_id: str,
    run_id: str,
    session_factory,
    runtime,
    store: MilvusRagStore | None = None,
    structured_root: Path | None = None,
) -> None:
    """在统一 Runtime 中执行文档索引，并同步旧 DocumentJob 状态。"""

    current = runtime.run_store.get(run_id)
    if current is None or current.status is RunStatus.CANCELLED:
        _mark_document_index_cancelled(job_id, session_factory)
        return
    try:
        runtime.update_task_progress(
            run_id,
            current_step="indexing",
            status_text="正在建立索引",
            progress=0,
            total=1,
            resume_state={"phase": "indexing", "document_job_id": job_id},
            event_name="index_started",
            event_label="开始建立索引",
        )
        outcome = index_document_job(
            job_id,
            session_factory,
            store=store,
            structured_root=structured_root,
        )
        if outcome.get("status") == "indexed":
            runtime.finish_task(
                run_id,
                current_step="indexed",
                status_text="文档已建立索引",
                progress=1,
                total=1,
                resume_state={"phase": "completed", "document_job_id": job_id},
                result=outcome,
            )
        else:
            runtime.fail_task(
                run_id,
                error_code=RuntimeErrorCode.RUNTIME_FAILED,
                status_text="文档索引失败",
                result=outcome,
            )
    except Exception:
        # Runtime 只保存稳定错误合同，原始异常留在服务日志。
        runtime.fail_task(
            run_id,
            error_code=RuntimeErrorCode.RUNTIME_FAILED,
            status_text="文档索引失败",
            result={"document_job_id": job_id},
        )


def sync_recovered_document_runs(
    session_factory, recovered_runs: list[AgentRun]
) -> None:
    """把重启后收口的文档 Runtime 状态同步回 DocumentJob。"""

    if not recovered_runs:
        return
    error_message = public_error_message(RuntimeErrorCode.RUNTIME_RESTARTED)
    with session_factory() as session:
        for run in recovered_runs:
            if run.action != "document_index":
                continue
            job_id = (run.result_json or {}).get("document_job_id")
            if not job_id:
                continue
            job = session.get(DocumentJob, job_id)
            # 只收口确实由该 Runtime 运行中的索引任务，避免误改待确认/转码中的任务。
            if job is None or job.status != "indexing":
                continue
            job.status = "index_failed"
            job.error_message = error_message
        session.commit()
