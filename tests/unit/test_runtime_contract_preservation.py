from agents.context import PersonaAgentContext
from agents.runtime.runner import AgentRuntime
from agents.service import AgentTurnResult
from app.run_store import RunStore


def _context():
    return PersonaAgentContext(
        persona_id="persona-1",
        workspace_id="workspace-1",
        knowledge_space_ids=("space-1",),
        conversation_id="conversation-1",
        persona_name="Yumeno",
        persona_type="companion",
    )


def test_record_pending_preserves_shared_result_contract(db_session):
    runtime = AgentRuntime(object(), RunStore(lambda: db_session))
    run = runtime.start_run(_context())
    result = AgentTurnResult(
        status="completed",
        answer="需要确认",
        specialist="memory",
        pending_action={"tool": "save_persona_memory"},
        artifacts=({"kind": "memory_preview", "id": "artifact-1"},),
        citations=({"source": "conversation"},),
        uncertainties=("等待用户确认",),
        error={"code": "approval_required", "message": "需要确认"},
    )

    updated = runtime.record_pending(run.run_id, result)

    assert updated.status.value == "waiting_approval"
    assert updated.result_json["artifacts"] == [{"kind": "memory_preview", "id": "artifact-1"}]
    assert updated.result_json["citations"] == [{"source": "conversation"}]
    assert updated.result_json["uncertainties"] == ["等待用户确认"]
    assert updated.result_json["error"] == {"code": "approval_required", "message": "需要确认"}
