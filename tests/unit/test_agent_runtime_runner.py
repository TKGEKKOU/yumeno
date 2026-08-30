from agents.context import PersonaAgentContext
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
