from datetime import datetime, timezone

from agents.runtime.models import AgentRun, RunStatus
from app.run_store import RunStore


def test_document_job_response_includes_run_id_after_runtime_index(client, db_session):
    # Regression guard: schema responses must keep the new optional runtime link.
    from app.models import DocumentJob
    from app.schemas import DocumentJobResponse

    job = DocumentJob(
        id="schema-job",
        workspace_id="local-default",
        knowledge_space_id="space",
        document_id="document",
        original_filename="guide.md",
        markdown_filename="guide.md",
        source_path="guide.md",
        status="preview_ready",
        run_id="schema-run",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    response = DocumentJobResponse.model_validate(job)

    assert response.run_id == "schema-run"
