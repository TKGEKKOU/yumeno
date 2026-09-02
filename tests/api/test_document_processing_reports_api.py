from datetime import datetime, timedelta, timezone

from app.models import DocumentJob


def _create_persona(client, name):
    response = client.post("/api/personas", json={"name": name})
    assert response.status_code == 201
    return response.json()


def _job(*, space_id, job_id, document_id, status, filename, created_at, **metadata):
    return DocumentJob(
        id=job_id,
        workspace_id="local-default",
        knowledge_space_id=space_id,
        document_id=document_id,
        original_filename=filename,
        markdown_filename=f"{filename.rsplit('.', 1)[0]}.md",
        source_path=f"/tmp/{filename}",
        markdown_path=f"/tmp/{filename}.md",
        status=status,
        created_at=created_at,
        updated_at=created_at,
        indexed_at=created_at if status == "indexed" else None,
        **metadata,
    )


def test_knowledge_space_document_report_summarizes_processing_state_and_versions(
    client, db_session
):
    persona = _create_persona(client, "报告角色")
    other_persona = _create_persona(client, "其他角色")
    base = datetime(2026, 8, 30, 8, 0, tzinfo=timezone.utc)
    jobs = [
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-indexed",
            document_id="doc-indexed",
            status="indexed",
            filename="guide.pdf",
            created_at=base,
            document_type="knowledge_expert",
            chunking_preset="knowledge_base",
            chunker_version="semantic-v1",
            index_version="milvus-v1",
        ),
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-failed",
            document_id="doc-failed",
            status="index_failed",
            filename="broken.md",
            created_at=base + timedelta(minutes=1),
            error_message="向量服务不可用",
            document_type="character",
            chunking_preset="character",
            chunker_version="semantic-v1",
            index_version="milvus-v1",
        ),
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-ready",
            document_id="doc-ready",
            status="preview_ready",
            filename="draft.txt",
            created_at=base + timedelta(minutes=2),
        ),
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-converting",
            document_id="doc-converting",
            status="converting",
            filename="pending.docx",
            created_at=base + timedelta(minutes=3),
        ),
        _job(
            space_id=other_persona["knowledge_space_id"],
            job_id="job-foreign",
            document_id="doc-foreign",
            status="indexed",
            filename="foreign.md",
            created_at=base + timedelta(minutes=4),
        ),
    ]
    db_session.add_all(jobs)
    db_session.commit()

    response = client.get(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/documents/report"
    )

    assert response.status_code == 200
    assert response.json() == {
        "knowledge_space_id": persona["knowledge_space_id"],
        "total_documents": 4,
        "status_counts": {
            "indexed": 1,
            "index_failed": 1,
            "preview_ready": 1,
            "converting": 1,
        },
        "indexed_count": 1,
        "failed_count": 1,
        "in_progress_count": 1,
        "ready_count": 1,
        "document_type_counts": {
            "knowledge_expert": 1,
            "character": 1,
            "unknown": 2,
        },
        "chunking_preset_counts": {
            "knowledge_base": 1,
            "character": 1,
            "unknown": 2,
        },
        "chunker_version_counts": {"semantic-v1": 2, "unknown": 2},
        "index_version_counts": {"milvus-v1": 2, "unknown": 2},
        "latest_updated_at": "2026-08-30T08:03:00Z",
        "latest_indexed_at": "2026-08-30T08:00:00Z",
    }


def test_document_processing_report_returns_metadata_and_error_for_one_job(
    client, db_session
):
    persona = _create_persona(client, "单文档报告")
    created_at = datetime(2026, 8, 30, 9, 0, tzinfo=timezone.utc)
    db_session.add(
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-report",
            document_id="doc-report",
            status="index_failed",
            filename="manual.pdf",
            created_at=created_at,
            markdown_preview="# 预览",
            error_message="解析失败：页数超限",
            document_type="knowledge_expert",
            chunking_preset="knowledge_base",
            chunker_version="semantic-v2",
            index_version="milvus-v2",
        )
    )
    db_session.commit()

    response = client.get("/api/documents/job-report/report")

    assert response.status_code == 200
    assert response.json() == {
        "id": "job-report",
        "workspace_id": "local-default",
        "knowledge_space_id": persona["knowledge_space_id"],
        "document_id": "doc-report",
        "original_filename": "manual.pdf",
        "markdown_filename": "manual.md",
        "status": "index_failed",
        "error_message": "解析失败：页数超限",
        "document_type": "knowledge_expert",
        "chunking_preset": "knowledge_base",
        "chunker_version": "semantic-v2",
        "index_version": "milvus-v2",
        "markdown_preview_available": True,
        "markdown_preview_length": 4,
        "created_at": "2026-08-30T09:00:00",
        "updated_at": "2026-08-30T09:00:00",
        "indexed_at": None,
    }


def test_document_processing_report_hides_unknown_space_and_missing_space(client, db_session):
    persona = _create_persona(client, "隔离报告")
    created_at = datetime(2026, 8, 30, 10, 0, tzinfo=timezone.utc)
    db_session.add(
        _job(
            space_id=persona["knowledge_space_id"],
            job_id="job-private",
            document_id="doc-private",
            status="indexed",
            filename="private.md",
            created_at=created_at,
        )
    )
    db_session.commit()

    assert client.get("/api/knowledge-spaces/not-found/documents/report").status_code == 404
    assert client.get("/api/documents/job-private/report").status_code == 200
    assert client.get("/api/documents/missing/report").status_code == 404

