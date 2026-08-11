from agents.context_factory import build_agent_runner, persona_agent_context
from agents.service import AgentTurnResult
from persona.service import create_persona


def test_persona_context_factory_builds_server_owned_scope(db_session):
    persona = create_persona(db_session, "Alpha")
    db_session.commit()

    context = persona_agent_context(
        lambda: db_session,
        persona.id,
        "conversation-a",
    )

    assert context.persona_id == persona.id
    assert context.workspace_id == "local-default"
    assert context.knowledge_space_ids == (persona.knowledge_space_id,)
    assert context.conversation_id == "conversation-a"


def test_agent_runner_forwards_current_turn_observability(db_session):
    persona = create_persona(db_session, "Alpha")
    db_session.commit()

    class Service:
        def query(self, question, context):
            return AgentTurnResult(
                status="completed",
                answer="ok",
                specialist="conversation",
                duration_seconds=0.25,
                loaded_skills=("web-research",),
                events=({"sequence": 1, "name": "turn_started"},),
                metrics={"run_id": "run-a", "model_calls": 1},
            )

    result = build_agent_runner(lambda: db_session, Service())(
        "hello", persona.id, "conversation-a"
    )

    assert result["duration_seconds"] == 0.25
    assert result["loaded_skills"] == ["web-research"]
    assert result["events"][0]["name"] == "turn_started"
    assert result["metrics"]["model_calls"] == 1
