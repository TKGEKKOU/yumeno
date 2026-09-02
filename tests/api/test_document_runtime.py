from agents.runtime.runner import AgentRuntime
from app.run_store import RunStore


def _attach_runtime(client, db_session):
    runtime = AgentRuntime(object(), RunStore(client.app.state.session_factory))
    client.app.state.run_store = runtime.run_store
    client.app.state.agent_runtime = runtime
    return runtime


def _upload_preview(client, monkeypatch, tmp_path, persona):
    monkeypatch.setattr("ingestion.document_jobs.DATA_DIR", tmp_path)
    monkeypatch.setattr(
        "ingestion.document_jobs.convert_source",
        lambda source, destination: "# Preview",
    )
    uploaded = client.post(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/documents/upload",
        files=[("files", ("guide.txt", b"guide", "text/plain"))],
    )
    assert uploaded.status_code == 201
    return uploaded.json()[0]


def _create_persona(client, name="Runtime 文档角色"):
    response = client.post("/api/personas", json={"name": name})
    assert response.status_code == 201
    return response.json()


def test_confirm_document_exposes_completed_runtime_and_event_chain(
    client, db_session, monkeypatch, tmp_path
):
    persona = _create_persona(client)
    _attach_runtime(client, db_session)
    job = _upload_preview(client, monkeypatch, tmp_path, persona)
    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", lambda path, scope: 1)

    confirmed = client.post(f"/api/documents/{job['id']}/confirm")

    assert confirmed.status_code == 200
    response_job = confirmed.json()
    assert response_job["run_id"]
    run_id = response_job["run_id"]
    runtime_run = client.get(f"/api/runs/{run_id}").json()["run"]
    assert runtime_run["status"] == "completed"
    assert runtime_run["result_json"]["document_job_id"] == job["id"]
    event_names = [event["name"] for event in client.get(f"/api/runs/{run_id}/events").json()["events"]]
    assert event_names == ["task_started", "index_started", "task_completed"]
    assert client.get(f"/api/documents/{job['id']}").json()["status"] == "indexed"


def test_failed_document_index_updates_runtime_without_leaking_worker_error(
    client, db_session, monkeypatch, tmp_path
):
    persona = _create_persona(client, "失败文档角色")
    _attach_runtime(client, db_session)
    job = _upload_preview(client, monkeypatch, tmp_path, persona)

    def fail_index(path, scope):
        raise RuntimeError("milvus secret connection details")

    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", fail_index)

    confirmed = client.post(f"/api/documents/{job['id']}/confirm")

    assert confirmed.status_code == 200
    run_id = confirmed.json()["run_id"]
    runtime_run = client.get(f"/api/runs/{run_id}").json()["run"]
    assert runtime_run["status"] == "failed"
    assert runtime_run["error_code"] == "runtime_failed"
    assert runtime_run["error_message"] == "运行处理失败，请稍后重试。"
    assert "secret connection" not in str(runtime_run)
    assert client.get(f"/api/documents/{job['id']}").json()["status"] == "index_failed"


def test_recovered_document_runtime_marks_indexing_job_failed(
    client, db_session, monkeypatch, tmp_path
):
    from app.models import AgentRunRecord, DocumentJob
    from agents.runtime.models import AgentRun, RunStatus
    from ingestion.document_jobs import sync_recovered_document_runs

    persona = _create_persona(client, "恢复文档角色")
    monkeypatch.setattr("ingestion.document_jobs.DATA_DIR", tmp_path)
    job_id = "document-recovery-job"
    run_id = "document-recovery-run"
    db_session.add(
        DocumentJob(
            id=job_id,
            workspace_id="local-default",
            knowledge_space_id=persona["knowledge_space_id"],
            document_id="document-recovery-doc",
            original_filename="guide.md",
            markdown_filename="guide.md",
            source_path=str(tmp_path / "guide.md"),
            markdown_path=str(tmp_path / "preview.md"),
            status="indexing",
            run_id=run_id,
        )
    )
    db_session.commit()
    runtime = _attach_runtime(client, db_session)
    runtime.run_store.create(
        AgentRun(
            run_id=run_id,
            action="document_index",
            status=RunStatus.RUNNING,
            workspace_id="local-default",
            result_json={"document_job_id": job_id},
        )
    )

    recovered = runtime.run_store.recover_incomplete_runs()
    sync_recovered_document_runs(client.app.state.session_factory, recovered)

    assert client.get(f"/api/documents/{job_id}").json()["status"] == "index_failed"
    assert client.get(f"/api/documents/{job_id}").json()["error_message"] == (
        "服务重启后，未完成的运行已安全结束，请重新发起。"
    )
