import asyncio
from types import SimpleNamespace

from agents.service import AgentTurnResult
from agents.runtime.runner import AgentRuntime, to_agent_result
from app.routers.agents import response_for
from app.run_store import RunStore
from integrations.onebot11.router import ImMessageRouter


def test_runtime_result_derives_top_level_error_fields_from_public_error():
    result = to_agent_result(
        "run-error",
        AgentTurnResult(
            status="failed",
            answer="",
            specialist="config",
            error={"code": "approval_required", "message": "需要确认"},
        ),
    )

    assert result.error_code == "approval_required"
    assert result.error_message == "需要确认"


def test_http_response_derives_top_level_error_fields_from_public_error():
    response = response_for(
        AgentTurnResult(
            status="failed",
            answer="",
            specialist="management",
            worker="config",
            error={"code": "approval_required", "message": "需要确认"},
        )
    )

    assert response.error_code == "approval_required"
    assert response.error_message == "需要确认"


def test_onebot_questions_use_the_shared_runtime_when_available(tmp_path):
    calls = []

    class Service:
        def query(self, question, context):
            raise AssertionError("direct PersonaAgentService path must not be used")

    class Runtime:
        def query(self, question, context):
            calls.append((question, context))
            return SimpleNamespace(
                status="completed",
                answer="运行时回答",
                pending_action=None,
            )

    router = ImMessageRouter(
        Service(),
        lambda: None,
        tmp_path / "bindings.json",
        tmp_path / "integrations.json",
        agent_runtime=Runtime(),
    )
    replies = []
    router._persona_for = lambda event: "persona-1"
    router._context = lambda event: "shared-context"

    async def reply(event, text):
        replies.append(text)

    router._reply = reply
    event = SimpleNamespace(content="你好")

    asyncio.run(router._handle_question(event))

    assert calls == [("你好", "shared-context")]
    assert replies == ["运行时回答"]


def test_runtime_failure_persists_nested_public_error(db_session):
    context = SimpleNamespace(
        persona_id="persona-1",
        workspace_id="workspace-1",
        conversation_id="conversation-1",
    )
    runtime = AgentRuntime(object(), RunStore(lambda: db_session))
    run = runtime.start_run(context)

    updated = runtime.record_failure(run.run_id, TimeoutError())

    assert updated.result_json["error"] == {
        "code": "worker_timeout",
        "message": "能力模块处理超时，请稍后重试。",
    }
    assert updated.result_json["error_code"] == "worker_timeout"
    assert updated.result_json["error_message"] == "能力模块处理超时，请稍后重试。"
