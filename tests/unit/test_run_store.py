from agents.runtime.models import AgentRun, RunEvent, RunStatus
from app.run_store import RunStore


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
