from agents.runtime.models import AgentRun, RunEvent, RunStatus
from agents.runtime.runner import AgentRuntime
from app.run_store import RunStore


def _runtime(db_session):
    return AgentRuntime(object(), RunStore(lambda: db_session))


def test_start_task_persists_running_task_and_start_event(db_session):
    runtime = _runtime(db_session)

    run = runtime.start_task(
        action="document_index",
        workspace_id="local-default",
        thread_id="document-job-1",
        worker="document_indexer",
        current_step="indexing",
        status_text="正在建立索引",
        metadata={"document_job_id": "document-job-1"},
    )

    assert run.status is RunStatus.RUNNING
    assert run.action == "document_index"
    assert run.active_worker == "document_indexer"
    assert run.result_json == {"document_job_id": "document-job-1"}
    events = runtime.run_store.list_events(run.run_id)
    assert [(event.name, event.status) for event in events] == [("task_started", "started")]


def test_finish_task_keeps_metadata_and_persists_completion_event(db_session):
    runtime = _runtime(db_session)
    run = runtime.start_task(
        action="document_index",
        workspace_id="local-default",
        metadata={"document_job_id": "document-job-2"},
    )

    finished = runtime.finish_task(
        run.run_id,
        current_step="indexed",
        status_text="文档已建立索引",
        progress=1,
        total=1,
        result={"document_id": "document-2"},
    )

    assert finished.status is RunStatus.COMPLETED
    assert finished.progress == 1
    assert finished.result_json == {
        "document_job_id": "document-job-2",
        "run_id": run.run_id,
        "status": "completed",
        "document_id": "document-2",
    }
    assert [event.name for event in runtime.run_store.list_events(run.run_id)] == [
        "task_started",
        "task_completed",
    ]


def test_fail_task_uses_public_error_contract_and_does_not_overwrite_cancelled_run(db_session):
    runtime = _runtime(db_session)
    run = runtime.start_task(
        action="document_index",
        workspace_id="local-default",
        metadata={"document_job_id": "document-job-3"},
    )

    runtime.cancel(run.run_id)
    failed = runtime.fail_task(run.run_id)

    assert failed.status is RunStatus.CANCELLED
    assert failed.error_code is None
    assert [event.name for event in runtime.run_store.list_events(run.run_id)] == [
        "task_started",
        "run_cancelled",
    ]

    other = runtime.start_task(
        action="document_index",
        workspace_id="local-default",
        metadata={"document_job_id": "document-job-4"},
    )
    failed = runtime.fail_task(other.run_id)
    assert failed.status is RunStatus.FAILED
    assert failed.error_code == "runtime_failed"
    assert failed.error_message == "运行处理失败，请稍后重试。"
    assert failed.result_json["error"] == {
        "code": "runtime_failed",
        "message": "运行处理失败，请稍后重试。",
    }



def test_start_task_creates_running_task_and_initial_step(db_session):
    runtime = _runtime(db_session)

    run = runtime.start_task(
        action="document_index",
        workspace_id="local-default",
        thread_id="document-job-5",
        worker="document_indexer",
        current_step="indexing",
        status_text="building index",
        resume_state={"phase": "indexing", "document_job_id": "document-job-5", "prompt": "must-not-persist"},
        metadata={"document_job_id": "document-job-5", "query": "must-not-persist"},
    )

    assert run.resume_state == {"phase": "indexing", "document_job_id": "document-job-5"}

    tasks = runtime.run_store.list_tasks(run.run_id)
    assert len(tasks) == 1
    task = tasks[0]
    assert task.run_id == run.run_id
    assert task.name == "document_index"
    assert task.status.value == "running"
    assert task.started_at is not None
    assert task.metadata == {"document_job_id": "document-job-5"}

    steps = runtime.run_store.list_steps(task.task_id)
    assert len(steps) == 1
    step = steps[0]
    assert step.sequence == 1
    assert step.name == "indexing"
    assert step.worker == "document_indexer"
    assert step.status.value == "running"
    assert step.started_at is not None
    assert step.resume_state == {"phase": "indexing", "document_job_id": "document-job-5"}


def test_start_task_creation_does_not_depend_on_a_second_run_update(db_session, monkeypatch):
    runtime = _runtime(db_session)

    def fail_update(*args, **kwargs):
        raise AssertionError("start_task must create the running run in its atomic transaction")

    monkeypatch.setattr(runtime.run_store, "update_status", fail_update)

    run = runtime.start_task(action="document_index", worker="document_indexer")

    assert run.status is RunStatus.RUNNING
    assert len(runtime.run_store.list_tasks(run.run_id)) == 1


def test_start_task_does_not_leave_child_records_when_initial_event_fails(db_session, monkeypatch):
    runtime = _runtime(db_session)

    def fail_event(*args, **kwargs):
        raise RuntimeError("event write failed")

    monkeypatch.setattr(runtime.run_store, "_append_event_in_session", fail_event)

    try:
        runtime.start_task(action="document_index", worker="document_indexer")
    except RuntimeError as exc:
        assert str(exc) == "event write failed"
    else:
        raise AssertionError("initial event failure should abort the whole creation transaction")

    assert runtime.run_store.latest() is None



def test_progress_and_finish_sync_task_and_step_state(db_session):
    runtime = _runtime(db_session)
    run = runtime.start_task(
        action="document_index",
        worker="document_indexer",
        current_step="planning",
        resume_state={"phase": "planning"},
    )

    progressed = runtime.update_task_progress(
        run.run_id,
        current_step="retrieving",
        progress=1,
        total=3,
        resume_state={"phase": "retrieving", "prompt": "must-not-persist"},
    )

    task = runtime.run_store.list_tasks(run.run_id)[0]
    step = runtime.run_store.list_steps(task.task_id)[0]
    assert progressed.current_step == "retrieving"
    assert task.status.value == "running"
    assert step.status.value == "running"
    assert step.name == "retrieving"
    assert step.resume_state == {"phase": "retrieving"}

    finished = runtime.finish_task(
        run.run_id,
        current_step="indexed",
        progress=3,
        total=3,
        resume_state={"phase": "indexed"},
    )

    task = runtime.run_store.list_tasks(run.run_id)[0]
    step = runtime.run_store.list_steps(task.task_id)[0]
    assert finished.status is RunStatus.COMPLETED
    assert task.status.value == "completed"
    assert step.status.value == "completed"
    assert step.name == "indexed"
    assert step.finished_at is not None


def test_late_progress_after_cancel_cannot_reactivate_task_or_step(db_session):
    runtime = _runtime(db_session)
    run = runtime.start_task(action="document_index", worker="document_indexer", current_step="indexing")
    runtime.cancel(run.run_id)

    updated = runtime.update_task_progress(
        run.run_id,
        current_step="late-write",
        progress=1,
        total=1,
        resume_state={"phase": "late-write"},
    )

    task = runtime.run_store.list_tasks(run.run_id)[0]
    step = runtime.run_store.list_steps(task.task_id)[0]
    assert updated.status is RunStatus.CANCELLED
    assert task.status.value == "cancelled"
    assert step.status.value == "cancelled"
