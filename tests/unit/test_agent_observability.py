import time

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from agents.service import AgentTurnResult
from agents.service import PersonaAgentService
from agents.observability import RunRecorder, sanitize_details
from app.routers.agents import response_for


def test_sanitize_details_keeps_only_public_scalar_metadata():
    details = sanitize_details(
        {
            "worker": "knowledge",
            "count": 3,
            "ok": True,
            "api_key": "secret",
            "prompt": "private prompt",
            "result": {"raw": "payload"},
            "ignored": object(),
        }
    )

    assert details == {"worker": "knowledge", "count": 3, "ok": True}


def test_run_recorder_sequences_events_and_summarizes_metrics():
    recorder = RunRecorder(source="web")
    recorder.event("agent", "turn_started", "开始处理", status="started")
    recorder.event(
        "tool",
        "search_persona_knowledge",
        "检索角色资料",
        status="completed",
        duration_ms=12.6,
        details={"count": 3},
    )
    recorder.mark_model_call(input_tokens=20, output_tokens=5, duration_ms=8.0)
    recorder.mark_context(tokens_before=800, tokens_after=500, dropped_messages=6)
    recorder.mark_first_token()
    time.sleep(0.001)
    recorder.finish(status="completed", handoff_count=1)

    events = recorder.events()
    metrics = recorder.metrics()

    assert [event["sequence"] for event in events] == [1, 2, 3]
    assert metrics["status"] == "completed"
    assert metrics["model_calls"] == 1
    assert metrics["input_tokens"] == 20
    assert metrics["output_tokens"] == 5
    assert metrics["total_tokens"] == 25
    assert metrics["tool_calls"] == 1
    assert metrics["tool_successes"] == 1
    assert metrics["tool_failures"] == 0
    assert metrics["handoff_count"] == 1
    assert metrics["context_tokens_before"] == 800
    assert metrics["context_tokens_after"] == 500
    assert metrics["context_dropped_messages"] == 6
    assert metrics["first_token_ms"] is not None
    assert metrics["total_ms"] >= metrics["first_token_ms"]


def test_run_recorder_counts_failed_tools_without_exposing_error_payload():
    recorder = RunRecorder()
    recorder.event(
        "tool",
        "query_structured_data",
        "查询结构化数据",
        status="failed",
        details={"error_code": "query_denied", "sql": "SELECT secret"},
    )
    recorder.finish(status="failed")

    assert recorder.events()[0]["details"] == {"error_code": "query_denied"}
    assert recorder.metrics()["tool_failures"] == 1


def test_agent_response_exposes_request_local_events_and_metrics():
    result = AgentTurnResult(
        status="completed",
        answer="ok",
        specialist="conversation",
        events=({"sequence": 1, "category": "agent", "name": "turn_started"},),
        metrics={"run_id": "run-1", "model_calls": 1},
    )

    response = response_for(result)

    assert response.events[0]["name"] == "turn_started"
    assert response.metrics == {"run_id": "run-1", "model_calls": 1}


def test_result_uses_only_messages_after_latest_user_turn():
    result = PersonaAgentService._result(
        {
            "messages": [
                HumanMessage(content="old question"),
                AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "search_persona_knowledge",
                            "args": {"question": "old"},
                            "id": "old-call",
                        }
                    ],
                ),
                ToolMessage(
                    content='{"evidence": [{"content": "old"}]}',
                    name="search_persona_knowledge",
                    tool_call_id="old-call",
                ),
                AIMessage(content="old answer"),
                HumanMessage(content="current question"),
                AIMessage(content="current answer"),
            ]
        }
    )

    assert result.answer == "current answer"
    assert result.tool_calls == ()
    assert result.evidence == ()
