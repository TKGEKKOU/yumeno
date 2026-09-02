from agents.runtime.models import AgentRun, RunEvent, RunStatus
from app.run_store import RunStore
from agents.runtime.runner import AgentRuntime


def _store(db_session):
    return RunStore(lambda: db_session)


def test_run_store_round_trips_run_records(db_session):
    store = _store(db_session)
    created = store.create(
        AgentRun(
            run_id="run-store-1",
            action="chat",
            workspace_id="workspace-1",
            persona_id="persona-1",
            conversation_id="conversation-1",
        )
    )

    loaded = store.get(created.run_id)

    assert loaded is not None
    assert loaded.run_id == "run-store-1"
    assert loaded.status is RunStatus.QUEUED
    assert loaded.persona_id == "persona-1"


def test_run_store_validates_status_transitions_and_sets_timestamps(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-store-2"))

    running = store.update_status("run-store-2", RunStatus.RUNNING)
    completed = store.update_status("run-store-2", RunStatus.COMPLETED, answer="done")

    assert running.status is RunStatus.RUNNING
    assert running.started_at is not None
    assert completed.status is RunStatus.COMPLETED
    assert completed.answer == "done"
    assert completed.finished_at is not None

    try:
        store.update_status("run-store-2", RunStatus.RUNNING)
    except Exception as exc:
        assert getattr(exc, "code", None) == "invalid_transition"
    else:
        raise AssertionError("terminal run should reject a non-idempotent transition")


def test_run_store_appends_ordered_events_with_sanitized_details(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-store-3"))

    first = store.append_event(
        RunEvent(
            run_id="run-store-3",
            sequence=99,
            category="agent",
            name="turn_started",
            label="开始处理",
            status="started",
            details={"worker": "knowledge", "prompt": "secret"},
        )
    )
    second = store.append_event(
        RunEvent(
            run_id="run-store-3",
            sequence=1,
            category="system",
            name="turn_finished",
            label="处理完成",
            status="completed",
        )
    )

    assert first.sequence == 1
    assert second.sequence == 2
    assert store.list_events("run-store-3") == [first, second]
    assert first.details == {"worker": "knowledge"}


def test_terminal_status_update_is_idempotent(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-store-4"))
    store.update_status("run-store-4", RunStatus.RUNNING)
    completed = store.update_status("run-store-4", RunStatus.COMPLETED, answer="done")

    same = store.update_status("run-store-4", RunStatus.COMPLETED, answer="ignored")

    assert same.model_dump() == completed.model_dump()


def test_recover_incomplete_runs_marks_only_process_owned_states_failed(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-recovery-queued"))
    store.create(AgentRun(run_id="run-recovery-running"))
    store.update_status("run-recovery-running", RunStatus.RUNNING)
    store.create(AgentRun(run_id="run-recovery-approval"))
    store.update_status("run-recovery-approval", RunStatus.RUNNING)
    store.update_status("run-recovery-approval", RunStatus.WAITING_APPROVAL)
    store.create(AgentRun(run_id="run-recovery-completed"))
    store.update_status("run-recovery-completed", RunStatus.RUNNING)
    store.update_status("run-recovery-completed", RunStatus.COMPLETED, answer="done")

    recovered = store.recover_incomplete_runs()

    assert {run.run_id for run in recovered} == {
        "run-recovery-queued",
        "run-recovery-running",
    }
    for run_id in ("run-recovery-queued", "run-recovery-running"):
        run = store.get(run_id)
        assert run is not None
        assert run.status is RunStatus.FAILED
        assert run.error_code == "runtime_restarted"
        assert run.error_message == "服务重启后，未完成的运行已安全结束，请重新发起。"
        assert run.requires_approval is False
        assert run.result_json == {
            "run_id": run_id,
            "status": "failed",
            "error": {
                "code": "runtime_restarted",
                "message": "服务重启后，未完成的运行已安全结束，请重新发起。",
            },
            "error_code": "runtime_restarted",
            "error_message": "服务重启后，未完成的运行已安全结束，请重新发起。",
            "requires_approval": False,
        }
        events = store.list_events(run_id)
        assert events[-1].name == "run_recovered_failed"
        assert events[-1].details == {
            "previous_status": "queued" if run_id.endswith("queued") else "running",
            "error_code": "runtime_restarted",
        }

    approval = store.get("run-recovery-approval")
    completed = store.get("run-recovery-completed")
    assert approval is not None and approval.status is RunStatus.WAITING_APPROVAL
    assert completed is not None and completed.status is RunStatus.COMPLETED



def test_recover_incomplete_runs_syncs_runtime_task_and_step(db_session):
    runtime = AgentRuntime(object(), _store(db_session))
    run = runtime.start_task(
        action="document_index",
        worker="document_indexer",
        current_step="indexing",
    )

    recovered = runtime.run_store.recover_incomplete_runs()

    assert [item.run_id for item in recovered] == [run.run_id]
    task = runtime.run_store.list_tasks(run.run_id)[0]
    step = runtime.run_store.list_steps(task.task_id)[0]
    assert task.status.value == "failed"
    assert task.finished_at is not None
    assert step.status.value == "failed"
    assert step.finished_at is not None



def test_delete_run_removes_runtime_task_and_step_children(db_session):
    runtime = AgentRuntime(object(), _store(db_session))
    run = runtime.start_task(action="document_index", worker="document_indexer")
    task = runtime.run_store.list_tasks(run.run_id)[0]
    step = runtime.run_store.list_steps(task.task_id)[0]

    assert runtime.run_store.delete(run.run_id) is True
    assert runtime.run_store.get(run.run_id) is None
    assert runtime.run_store.list_tasks(run.run_id) == []
    assert runtime.run_store.get_task(task.task_id) is None
    assert runtime.run_store.get_step(step.step_id) is None
