from agents.context import PersonaAgentContext
from agents.runtime.errors import RuntimeOperationError
from agents.runtime.models import RunStatus
from agents.runtime.runner import AgentRuntime, to_agent_result
from agents.service import AgentTurnResult


def _context():
    return PersonaAgentContext(
        persona_id="persona-1",
        workspace_id="workspace-1",
        knowledge_space_ids=("space-1",),
        conversation_id="conversation-1",
        persona_name="Yumeno",
        persona_type="companion",
    )


def test_to_agent_result_maps_completed_turn_and_keeps_public_fields():
    result = to_agent_result(
        "run-1",
        AgentTurnResult(
            status="completed",
            answer="你好",
            specialist="conversation",
            tool_calls=({"name": "search", "result": {"status": "ok"}},),
            evidence=({"title": "资料"},),
            trace=({"node": "retrieve"},),
        ),
    )

    assert result.run_id == "run-1"
    assert result.status == "completed"
    assert result.answer == "你好"
    assert result.worker_results == [{"name": "search", "result": {"status": "ok"}}]
    assert result.requires_approval is False

def test_agent_turn_result_declares_shared_runtime_fields_and_legacy_aliases():
    turn = AgentTurnResult(
        status="failed",
        answer="",
        specialist="memory",
        worker="memory",
        artifacts=({"kind": "memory_preview"},),
        citations=({"source": "conversation"},),
        uncertainties=("等待用户确认",),
        error={"code": "approval_required", "message": "需要确认"},
        error_code="approval_required",
        error_message="需要确认",
        worker_results=({"status": "failed"},),
    )

    assert turn.worker == "memory"
    assert turn.specialist == "memory"
    assert turn.artifacts == ({"kind": "memory_preview"},)
    assert turn.citations == ({"source": "conversation"},)
    assert turn.uncertainties == ("等待用户确认",)
    assert turn.error == {"code": "approval_required", "message": "需要确认"}
    assert turn.error_code == "approval_required"
    assert turn.error_message == "需要确认"
    assert turn.worker_results == ({"status": "failed"},)

def test_to_agent_result_maps_pending_and_degraded_turns():
    pending = to_agent_result(
        "run-2",
        AgentTurnResult(
            status="pending_confirmation",
            answer="",
            specialist="web",
            pending_action={"tool": "web_search"},
        ),
    )
    degraded = to_agent_result(
        "run-3",
        AgentTurnResult(
            status="completed",
            answer="服务暂时不可用",
            specialist="conversation",
            metrics={"status": "degraded"},
        ),
    )

    assert pending.status == "pending_confirmation"
    assert pending.requires_approval is True
    assert degraded.status == "degraded"
    assert degraded.error_code == "provider_unavailable"


def test_runtime_start_and_record_result_persist_state_and_events(db_session):
    runtime = AgentRuntime(object(), __import__("app.run_store", fromlist=["RunStore"]).RunStore(lambda: db_session))
    run = runtime.start_run(_context())

    assert run.status is RunStatus.RUNNING
    updated = runtime.record_result(
        run.run_id,
        AgentTurnResult(
            status="completed",
            answer="完成",
            specialist="conversation",
            events=({
                "sequence": 1,
                "category": "agent",
                "name": "turn_started",
                "label": "开始处理",
                "status": "started",
                "details": {"prompt": "secret", "worker": "knowledge"},
            },),
        ),
    )

    assert updated.status is RunStatus.COMPLETED
    assert updated.answer == "完成"
    events = runtime.run_store.list_events(run.run_id)
    persisted = next(event for event in events if event.name == "turn_started")
    assert persisted.details == {"worker": "knowledge"}


def test_runtime_pending_and_failure_use_stable_run_statuses(db_session):
    runtime = AgentRuntime(object(), __import__("app.run_store", fromlist=["RunStore"]).RunStore(lambda: db_session))
    pending_run = runtime.start_run(_context())
    pending = runtime.record_pending(
        pending_run.run_id,
        AgentTurnResult(status="pending_confirmation", answer="", specialist="web"),
    )
    assert pending.status is RunStatus.WAITING_APPROVAL
    assert pending.requires_approval is True

    failed_run = runtime.start_run(_context())
    failed = runtime.record_failure(failed_run.run_id, TimeoutError())
    assert failed.status is RunStatus.FAILED
    assert failed.error_code == "worker_timeout"


def test_finish_task_is_idempotent_when_cancel_wins_the_commit_race(db_session):
    import threading

    from app.run_store import RunStore

    runtime = AgentRuntime(object(), RunStore(lambda: db_session))
    run = runtime.start_task(action="document_index", worker="document_indexer")
    original_update = runtime.run_store.update_status
    finish_update_started = threading.Event()
    release_finish_update = threading.Event()
    result = []
    errors = []

    def delayed_update(run_id, status, **fields):
        if status is RunStatus.COMPLETED:
            finish_update_started.set()
            assert release_finish_update.wait(2)
        return original_update(run_id, status, **fields)

    runtime.run_store.update_status = delayed_update

    def finish():
        try:
            result.append(runtime.finish_task(run.run_id, current_step="indexed", progress=1, total=1))
        except Exception as exc:  # pragma: no cover - assertion below reports a regression
            errors.append(exc)

    worker = threading.Thread(target=finish)
    worker.start()
    assert finish_update_started.wait(1)

    cancelled = runtime.cancel(run.run_id)
    assert cancelled.status is RunStatus.CANCELLED
    release_finish_update.set()
    worker.join(timeout=2)

    assert not worker.is_alive()
    assert errors == []
    assert result[0].status is RunStatus.CANCELLED
    assert runtime.run_store.get(run.run_id).status is RunStatus.CANCELLED


def test_cancel_reports_terminal_run_when_completion_wins_the_commit_race(db_session):
    import threading

    from app.run_store import RunStore

    runtime = AgentRuntime(object(), RunStore(lambda: db_session))
    run = runtime.start_task(action="document_index", worker="document_indexer")
    original_update = runtime.run_store.update_status
    cancel_update_started = threading.Event()
    release_cancel_update = threading.Event()
    errors = []

    def delayed_update(run_id, status, **fields):
        if status is RunStatus.CANCELLED:
            cancel_update_started.set()
            assert release_cancel_update.wait(2)
        return original_update(run_id, status, **fields)

    runtime.run_store.update_status = delayed_update

    def cancel():
        try:
            runtime.cancel(run.run_id)
        except Exception as exc:
            errors.append(exc)

    request = threading.Thread(target=cancel)
    request.start()
    assert cancel_update_started.wait(1)

    finished = runtime.finish_task(run.run_id, current_step="indexed", progress=1, total=1)
    assert finished.status is RunStatus.COMPLETED
    release_cancel_update.set()
    request.join(timeout=2)

    assert not request.is_alive()
    assert len(errors) == 1
    assert isinstance(errors[0], RuntimeOperationError)
    assert errors[0].code == "run_terminal"
    assert runtime.run_store.get(run.run_id).status is RunStatus.COMPLETED
