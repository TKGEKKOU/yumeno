import time

from agents.runtime.errors import RuntimeErrorCode, public_error_message
from agents.runtime.models import AgentRun, RunStatus
from app.run_store import RunStore
from app.models import RagEvaluationRun

from app.routers import eval as eval_router
from persona.service import LOCAL_WORKSPACE_ID


def _create_persona(client):
    response = client.post("/api/personas", json={"name": "Alpha"})
    assert response.status_code == 201
    return response.json()


def test_eval_run_status_and_results_flow(client, monkeypatch):
    persona = _create_persona(client)

    def fake_execute(payload, session_factory, job):
        job["state"] = "done"
        job["progress"] = 1
        job["total"] = 1
        job["metrics"] = {"recall_at_k": 1.0, "grounded_rate": 0.8, "cases_checked": 1}
        job["cases"] = [{"question": "q1"}]

    monkeypatch.setattr(eval_router, "_execute", fake_execute)
    response = client.post("/api/eval/run", json={"persona_id": persona["id"]})
    assert response.status_code == 202

    state = "pending"
    for _ in range(100):
        status = client.get("/api/eval/status").json()
        state = status["state"]
        if state in {"done", "error"}:
            break
        time.sleep(0.02)
    assert state == "done"

    results = client.get("/api/eval/results").json()
    assert results["metrics"]["recall_at_k"] == 1.0
    assert results["cases"][0]["question"] == "q1"


def test_eval_run_rejects_second_concurrent_task(client):
    client.app.state.eval_job = {"state": "running"}
    response = client.post("/api/eval/run", json={"persona_id": "p1"})
    assert response.status_code == 409


def test_eval_run_rejects_pending_or_generating_task(client):
    for state in ("pending", "generating"):
        client.app.state.eval_job = {"state": state}
        response = client.post("/api/eval/run", json={"persona_id": "p1"})
        assert response.status_code == 409


def test_eval_export_requires_done_and_returns_utf8_json(client):
    client.app.state.eval_job = {"state": "running"}
    assert client.get("/api/eval/export").status_code == 409

    client.app.state.eval_job = {
        "state": "done",
        "config": {"persona_id": "p1", "metric_k": 3},
        "metrics": {"recall_at_3": 0.75},
        "cases": [{"question": "角色是谁"}],
    }
    response = client.get("/api/eval/export")

    assert response.status_code == 200
    assert "attachment" in response.headers["content-disposition"]
    assert response.json()["schema_version"] == 1
    assert response.json()["config"]["metric_k"] == 3
    assert response.json()["cases"][0]["question"] == "角色是谁"


def test_eval_run_accepts_tier_payload(client, monkeypatch):
    persona = _create_persona(client)
    captured = {}

    def fake_execute(payload, session_factory, job):
        captured["payload"] = payload
        job["state"] = "done"
        job["phase"] = "done"
        job["progress"] = 5
        job["total"] = 5
        job["metrics"] = {"recall_at_k": 1.0}
        job["cases"] = []

    monkeypatch.setattr(eval_router, "_execute", fake_execute)
    response = client.post(
        "/api/eval/run",
        json={"persona_id": persona["id"], "tier": "standard"},
    )
    assert response.status_code == 202
    assert captured["payload"].tier == "standard"


def test_eval_analyze_requires_completed_job(client):
    client.app.state.eval_job = {"state": "pending"}
    response = client.post("/api/eval/analyze")
    assert response.status_code == 409


def test_eval_analyze_returns_analysis(client, monkeypatch):
    client.app.state.eval_job = {
        "state": "done",
        "metrics": {"cases_total": 5},
        "cases": [],
    }
    monkeypatch.setattr(
        "rag.eval.analyzer.analyze_results",
        lambda metrics, cases: "分析结论",
    )
    response = client.post("/api/eval/analyze")
    assert response.status_code == 200
    assert response.json()["analysis"] == "分析结论"
from app.routers import eval as eval_router
from persona.service import LOCAL_WORKSPACE_ID


def test_eval_history_persists_a_run_snapshot(client, monkeypatch):
    persona = client.post("/api/personas", json={"name": "Eval persona"}).json()

    def fake_execute(payload, session_factory, job):
        eval_router._persist_run(
            session_factory,
            job["run_id"],
            status="done",
            metrics_json={"grounded_rate": 1.0},
            cases_json=[{"question": "q"}],
        )
        job.update({"state": "done", "metrics": {"grounded_rate": 1.0}, "cases": [{"question": "q"}]})

    monkeypatch.setattr(eval_router, "_execute", fake_execute)
    assert client.post("/api/eval/run", json={"persona_id": persona["id"]}).status_code == 202
    history = client.get(f"/api/eval/history?persona_id={persona['id']}")
    assert history.status_code == 200
    assert history.json()[0]["status"] == "done"
    run_id = history.json()[0]["id"]
    detail = client.get(f"/api/eval/history/{run_id}")
    assert detail.status_code == 200
    assert detail.json()["cases"][0]["question"] == "q"


def test_eval_run_accepts_dataset_mode_and_persists_config(client, monkeypatch):
    persona = _create_persona(client)
    captured = {}

    def fake_execute(payload, session_factory, job):
        captured["payload"] = payload
        job.update({"state": "done", "phase": "done", "metrics": {}, "cases": []})

    monkeypatch.setattr(eval_router, "_execute", fake_execute)
    response = client.post(
        "/api/eval/run",
        json={"persona_id": persona["id"], "dataset_mode": "manual"},
    )

    assert response.status_code == 202
    assert captured["payload"].dataset_mode == "manual"
    history = client.get(f"/api/eval/history?persona_id={persona['id']}").json()
    assert history[0]["config"]["dataset_mode"] == "manual"


def test_eval_run_rejects_unknown_dataset_mode(client):
    persona = _create_persona(client)
    response = client.post(
        "/api/eval/run",
        json={"persona_id": persona["id"], "dataset_mode": "surprise"},
    )
    assert response.status_code == 422


def test_execute_manual_dataset_uses_enabled_cases(client, monkeypatch):
    persona = _create_persona(client)
    space_id = persona["knowledge_space_id"]
    created = client.post(
        f"/api/knowledge-spaces/{space_id}/eval-cases",
        json={
            "question": "手工回归问题",
            "expected_answer": "预期答案",
            "tags": ["回归"],
        },
    )
    assert created.status_code == 201
    disabled = client.post(
        f"/api/knowledge-spaces/{space_id}/eval-cases",
        json={"question": "停用问题", "enabled": False},
    )
    assert disabled.status_code == 201

    class Scope:
        workspace_id = LOCAL_WORKSPACE_ID
        knowledge_space_ids = (space_id,)

    captured = {}

    monkeypatch.setattr(eval_router, "resolve_knowledge_scope", lambda session, persona_id: Scope())
    monkeypatch.setattr(eval_router, "_persist_run", lambda *args, **kwargs: None)

    import rag.eval.metrics as metrics
    import rag.eval.runner as runner

    def fake_run_eval(cases, **kwargs):
        captured["cases"] = cases
        return []

    monkeypatch.setattr(runner, "run_eval", fake_run_eval)
    monkeypatch.setattr(runner, "check_scope_isolation", lambda *args: True)
    monkeypatch.setattr(metrics, "summarize_retrieval", lambda cases: {})
    monkeypatch.setattr(metrics, "summarize_generation", lambda cases: {})

    job = {"run_id": None}
    eval_router._execute(
        eval_router.EvalRunPayload(persona_id=persona["id"], dataset_mode="manual"),
        client.app.state.session_factory,
        job,
    )

    assert job["state"] == "done"
    assert [case["question"] for case in captured["cases"]] == ["手工回归问题"]
    assert captured["cases"][0]["reference_answer"] == "预期答案"


def test_execute_combined_dataset_prepends_manual_cases(client, monkeypatch, tmp_path):
    persona = _create_persona(client)
    space_id = persona["knowledge_space_id"]
    created = client.post(
        f"/api/knowledge-spaces/{space_id}/eval-cases",
        json={"question": "人工题"},
    )
    assert created.status_code == 201

    class Scope:
        workspace_id = LOCAL_WORKSPACE_ID
        knowledge_space_ids = (space_id,)

    captured = {}
    generated_path = tmp_path / "generated.jsonl"
    generated_path.write_text('{"question": "自动题", "expected_chunk_ids": ["chunk-1"]}\n', encoding="utf-8")

    monkeypatch.setattr(eval_router, "resolve_knowledge_scope", lambda session, persona_id: Scope())
    monkeypatch.setattr(eval_router, "_persist_run", lambda *args, **kwargs: None)
    import rag.eval.metrics as metrics
    import rag.eval.runner as runner
    import rag.eval.question_generator as generator
    monkeypatch.setattr(generator, "generate_questions_for_persona", lambda **kwargs: generated_path)
    def fake_run_eval(cases, **kwargs):
        captured["cases"] = cases
        return []

    monkeypatch.setattr(runner, "run_eval", fake_run_eval)
    monkeypatch.setattr(runner, "check_scope_isolation", lambda *args: True)
    monkeypatch.setattr(metrics, "summarize_retrieval", lambda cases: {})
    monkeypatch.setattr(metrics, "summarize_generation", lambda cases: {})

    job = {"run_id": None}
    eval_router._execute(
        eval_router.EvalRunPayload(persona_id=persona["id"], dataset_mode="combined"),
        client.app.state.session_factory,
        job,
    )

    assert job["state"] == "done"
    assert [case["question"] for case in captured["cases"]] == ["人工题", "自动题"]


def test_eval_status_falls_back_to_persisted_runtime_state(client, db_session):
    store = RunStore(lambda: db_session)
    client.app.state.run_store = store
    client.app.state.eval_job = {}
    store.create(
        AgentRun(
            run_id="eval-persisted-status-1",
            action="rag_eval",
            workspace_id="local-default",
            persona_id="persona-1",
            current_step="retrieval",
            current_question="问题",
            progress=2,
            total=4,
            status_text="正在检索知识库",
            resume_state={"case_index": 2},
        )
    )
    store.update_status("eval-persisted-status-1", RunStatus.RUNNING)

    response = client.get("/api/eval/status")

    assert response.status_code == 200
    body = response.json()
    assert body["run_id"] == "eval-persisted-status-1"
    assert body["state"] == "running"
    assert body["current_step"] == "retrieval"
    assert body["current_question_text"] == "问题"
    assert body["progress"] == 2
    assert body["total"] == 4
    assert body["status_text"] == "正在检索知识库"


def test_eval_run_creates_a_unified_runtime_record(client, monkeypatch):
    persona = client.post("/api/personas", json={"name": "Runtime eval"}).json()

    def fake_execute(payload, session_factory, job):
        job.update({"state": "done", "phase": "done", "progress": 0, "total": 0})

    monkeypatch.setattr(eval_router, "_execute", fake_execute)
    response = client.post("/api/eval/run", json={"persona_id": persona["id"]})

    assert response.status_code == 202
    run_id = response.json()["run_id"]
    runtime = client.get(f"/api/runs/{run_id}")
    assert runtime.status_code == 200
    assert runtime.json()["run"]["action"] == "rag_eval"
    assert runtime.json()["run"]["status"] in {"queued", "running", "completed"}





def _seed_persisted_eval_snapshot(client, db_session, *, status=RunStatus.COMPLETED):
    run_id = "eval-persisted-result-1"
    db_session.add(
        RagEvaluationRun(
            id=run_id,
            workspace_id=LOCAL_WORKSPACE_ID,
            persona_id="persona-1",
            status="done" if status is RunStatus.COMPLETED else "error",
            config_json={"persona_id": "persona-1", "metric_k": 3},
            metrics_json={"recall_at_3": 0.9},
            cases_json=[{"question": "持久化问题"}],
        )
    )
    db_session.commit()
    store = RunStore(lambda: db_session)
    client.app.state.run_store = store
    client.app.state.eval_job = {}
    store.create(
        AgentRun(
            run_id=run_id,
            action="rag_eval",
            status=status,
            workspace_id=LOCAL_WORKSPACE_ID,
            persona_id="persona-1",
            result_json={"metrics": {"recall_at_3": 0.9}, "cases": [{"question": "持久化问题"}]},
        )
    )
    return run_id


def test_eval_results_falls_back_to_persisted_snapshot(client, db_session):
    run_id = _seed_persisted_eval_snapshot(client, db_session)

    response = client.get("/api/eval/results")

    assert response.status_code == 200
    assert response.json() == {
        "run_id": run_id,
        "state": "done",
        "metrics": {"recall_at_3": 0.9},
        "cases": [{"question": "持久化问题"}],
    }


def test_eval_export_falls_back_to_persisted_snapshot(client, db_session):
    _seed_persisted_eval_snapshot(client, db_session)

    response = client.get("/api/eval/export")

    assert response.status_code == 200
    assert response.json()["config"]["metric_k"] == 3
    assert response.json()["cases"][0]["question"] == "持久化问题"


def test_eval_analyze_falls_back_to_persisted_snapshot(client, db_session, monkeypatch):
    run_id = _seed_persisted_eval_snapshot(client, db_session)
    captured = {}
    monkeypatch.setattr(
        "rag.eval.analyzer.analyze_results",
        lambda metrics, cases: captured.update(metrics=metrics, cases=cases) or "持久化分析",
    )

    response = client.post("/api/eval/analyze")

    assert response.status_code == 200
    assert response.json()["analysis"] == "持久化分析"
    assert captured["metrics"]["recall_at_3"] == 0.9
    with db_session.no_autoflush:
        persisted = db_session.get(RagEvaluationRun, run_id)
    assert persisted is not None
    assert persisted.analysis == "持久化分析"



def test_eval_status_prefers_persisted_runtime_over_stale_process_cache(client, db_session):
    run_id = "eval-persisted-authority-1"
    store = RunStore(lambda: db_session)
    store.create(
        AgentRun(
            run_id=run_id,
            action="rag_eval",
            workspace_id=LOCAL_WORKSPACE_ID,
            persona_id="persona-1",
            status=RunStatus.COMPLETED,
            current_step="",
            status_text="评测完成",
            progress=3,
            total=3,
            result_json={"metrics": {}, "cases": []},
        )
    )
    client.app.state.run_store = store
    client.app.state.eval_job = {
        "run_id": run_id,
        "state": "running",
        "phase": "evaluation",
        "status_text": "旧缓存",
    }

    response = client.get("/api/eval/status")

    assert response.status_code == 200
    assert response.json()["state"] == "done"
    assert response.json()["status_text"] == "评测完成"


def test_eval_failure_uses_public_error_contract_and_syncs_domain_snapshot(client, db_session, monkeypatch):
    persona = _create_persona(client)
    run_id = "eval-failure-contract-1"
    store = RunStore(lambda: db_session)
    store.create(
        AgentRun(
            run_id=run_id,
            action="rag_eval",
            workspace_id=persona["workspace_id"],
            persona_id=persona["id"],
        )
    )
    db_session.add(
        RagEvaluationRun(
            id=run_id,
            workspace_id=persona["workspace_id"],
            persona_id=persona["id"],
            status="pending",
            config_json={"persona_id": persona["id"]},
        )
    )
    db_session.commit()
    monkeypatch.setattr(
        eval_router,
        "resolve_knowledge_scope",
        lambda session, persona_id: (_ for _ in ()).throw(
            RuntimeError("provider secret must not be exposed")
        ),
    )

    job = {"run_id": run_id}
    eval_router._execute(
        eval_router.EvalRunPayload(persona_id=persona["id"], dataset_mode="manual"),
        client.app.state.session_factory,
        job,
    )

    expected_message = public_error_message(RuntimeErrorCode.WORKER_FAILED)
    runtime = store.get(run_id)
    assert runtime is not None
    assert runtime.status is RunStatus.FAILED
    assert runtime.error_code == RuntimeErrorCode.WORKER_FAILED.value
    assert runtime.error_message == expected_message
    assert runtime.result_json["error"] == {
        "code": RuntimeErrorCode.WORKER_FAILED.value,
        "message": expected_message,
    }
    with db_session.no_autoflush:
        evaluation = db_session.get(RagEvaluationRun, run_id)
    assert evaluation is not None
    assert evaluation.status == "error"
    assert evaluation.error_message == expected_message
    assert job["error"] == expected_message


def test_recovered_eval_run_syncs_domain_snapshot(client, db_session):
    persona = _create_persona(client)
    run_id = "eval-recovered-domain-1"
    store = RunStore(lambda: db_session)
    store.create(
        AgentRun(
            run_id=run_id,
            action="rag_eval",
            workspace_id=persona["workspace_id"],
            persona_id=persona["id"],
            status=RunStatus.RUNNING,
        )
    )
    db_session.add(
        RagEvaluationRun(
            id=run_id,
            workspace_id=persona["workspace_id"],
            persona_id=persona["id"],
            status="running",
        )
    )
    db_session.commit()

    recovered = store.recover_incomplete_runs()
    eval_router.sync_recovered_evaluation_runs(client.app.state.session_factory, recovered)

    with db_session.no_autoflush:
        evaluation = db_session.get(RagEvaluationRun, run_id)
    assert evaluation is not None
    assert evaluation.status == "error"
    assert evaluation.error_message == public_error_message(RuntimeErrorCode.RUNTIME_RESTARTED)
    assert evaluation.finished_at is not None

def test_eval_results_prefers_persisted_runtime_over_stale_process_cache(client, db_session):
    run_id = _seed_persisted_eval_snapshot(client, db_session)
    client.app.state.eval_job = {
        "run_id": run_id,
        "state": "running",
        "metrics": {"stale": True},
        "cases": [{"question": "旧缓存"}],
    }

    response = client.get("/api/eval/results")

    assert response.status_code == 200
    assert response.json()["state"] == "done"
    assert response.json()["metrics"]["recall_at_3"] == 0.9
    assert response.json()["cases"][0]["question"] == "持久化问题"


def test_eval_export_prefers_persisted_runtime_over_stale_process_cache(client, db_session):
    run_id = _seed_persisted_eval_snapshot(client, db_session)
    client.app.state.eval_job = {
        "run_id": run_id,
        "state": "running",
        "config": {"stale": True},
        "metrics": {},
        "cases": [],
    }

    response = client.get("/api/eval/export")

    assert response.status_code == 200
    assert response.json()["config"]["metric_k"] == 3
    assert response.json()["cases"][0]["question"] == "持久化问题"


def test_eval_analyze_prefers_persisted_runtime_over_stale_process_cache(client, db_session, monkeypatch):
    run_id = _seed_persisted_eval_snapshot(client, db_session)
    client.app.state.eval_job = {
        "run_id": run_id,
        "state": "running",
        "metrics": {"stale": True},
        "cases": [],
    }
    captured = {}
    monkeypatch.setattr(
        "rag.eval.analyzer.analyze_results",
        lambda metrics, cases: captured.update(metrics=metrics, cases=cases) or "持久化分析",
    )

    response = client.post("/api/eval/analyze")

    assert response.status_code == 200
    assert response.json()["analysis"] == "持久化分析"
    assert captured["metrics"]["recall_at_3"] == 0.9
    assert captured["cases"][0]["question"] == "持久化问题"