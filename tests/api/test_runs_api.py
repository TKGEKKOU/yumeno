from agents.runtime.models import AgentRun, RunEvent, RunStatus
from agents.runtime.runner import AgentRuntime
from app.run_store import RunStore


def _runtime(client, db_session):
    store = RunStore(lambda: db_session)
    client.app.state.run_store = store
    client.app.state.agent_runtime = AgentRuntime(object(), store)
    return store


def test_get_missing_run_returns_stable_error(client, db_session):
    _runtime(client, db_session)

    response = client.get("/api/runs/missing-run")

    assert response.status_code == 404
    assert response.json() == {
        "error": {"code": "run_not_found", "message": "运行记录不存在。"}
    }


def test_get_run_events_returns_ordered_public_events(client, db_session):
    store = _runtime(client, db_session)
    store.create(AgentRun(run_id="api-run-1"))
    store.append_event(
        RunEvent(
            run_id="api-run-1", sequence=20, category="agent", name="second",
            label="第二步", status="completed",
        )
    )
    store.append_event(
        RunEvent(
            run_id="api-run-1", sequence=1, category="agent", name="first",
            label="第一步", status="started", details={"prompt": "secret", "worker": "knowledge"},
        )
    )

    response = client.get("/api/runs/api-run-1/events")

    assert response.status_code == 200
    body = response.json()
    assert [event["sequence"] for event in body["events"]] == [1, 2]
    persisted = next(event for event in body["events"] if event["name"] == "first")
    assert persisted["details"] == {"worker": "knowledge"}


def test_cancel_running_run_is_idempotent_and_never_reexecutes(client, db_session):
    store = _runtime(client, db_session)
    store.create(AgentRun(run_id="api-run-2"))
    store.update_status("api-run-2", RunStatus.RUNNING)

    first = client.post("/api/runs/api-run-2/cancel")
    second = client.post("/api/runs/api-run-2/cancel")

    assert first.status_code == 200
    assert first.json()["run"]["status"] == "cancelled"
    assert second.status_code == 200
    assert second.json()["run"]["status"] == "cancelled"
    assert len(store.list_events("api-run-2")) == 1


def test_cancel_terminal_run_returns_stable_error(client, db_session):
    store = _runtime(client, db_session)
    store.create(AgentRun(run_id="api-run-3"))
    store.update_status("api-run-3", RunStatus.RUNNING)
    store.update_status("api-run-3", RunStatus.COMPLETED)

    response = client.post("/api/runs/api-run-3/cancel")

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "run_terminal"


def test_approval_requires_waiting_status_and_is_idempotent(client, db_session):
    store = _runtime(client, db_session)
    store.create(AgentRun(run_id="api-run-4"))
    store.update_status("api-run-4", RunStatus.RUNNING)
    store.update_status("api-run-4", RunStatus.WAITING_APPROVAL)

    approved = client.post("/api/runs/api-run-4/approval", json={"approved": True})
    repeated = client.post("/api/runs/api-run-4/approval", json={"approved": True})

    assert approved.status_code == 200
    assert approved.json()["run"]["status"] == "running"
    assert repeated.status_code == 409
    assert repeated.json()["error"]["code"] == "invalid_approval"

