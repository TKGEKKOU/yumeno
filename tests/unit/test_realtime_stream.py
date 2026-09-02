import asyncio
from types import SimpleNamespace

import pytest
from langchain_core.messages import AIMessage

from agents.context import PersonaAgentContext
from agents.service import PersonaAgentService
from realtime.execution import ConversationExecutionRegistry


def _context() -> PersonaAgentContext:
    return PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
    )


class FakeGraph:
    def __init__(self, chunks, state, interrupts=()):
        self._chunks = chunks
        self._state = state
        self._interrupts = interrupts

    def stream(self, *args, **kwargs):
        for item in self._chunks:
            yield item

    def get_state(self, config):
        return SimpleNamespace(values=self._state, interrupts=self._interrupts)


def test_explicit_web_query_authorizes_key_search_without_loading_free_skill():
    captured = {}

    class CapturingGraph(FakeGraph):
        def stream(self, state, *args, **kwargs):
            captured.update(state)
            return iter(())

    service = PersonaAgentService(checkpointer=object())
    service._workflow = CapturingGraph([], {"messages": [AIMessage(content="done")]})

    events = list(service.stream_query("搜索今天潍坊天气", _context()))

    assert captured["loaded_skills"] == []
    assert "web_search_authorized" not in captured
    assert captured["intent_decision"]["web_authorized"] is True
    assert captured["intent_decision"]["primary"] == "web"
    assert events[0] == {
        "kind": "stage",
        "stage": "已识别为联网查询，正在准备搜索...",
    }


def test_rvc_does_not_emit_workflow_before_agent_worker_handoff():
    """RVC 专项工作区只能由 Agent 返回的 worker 合同激活。"""
    graph = FakeGraph(
        chunks=[],
        state={"messages": [AIMessage(content="已收到")], "active_worker": None, "loaded_skills": []},
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph
    service._intent_for_question = lambda graph, context, question: SimpleNamespace(
        primary="rvc_worker", to_state=lambda: {}
    )

    events = list(service.stream_query("请用音频做 RVC 变声", _context()))

    assert events[0] == {"kind": "stage", "stage": "正在分析请求..."}
    assert not any(event["kind"] == "workflow_update" for event in events)


def test_historical_rvc_worker_does_not_leak_into_new_turn():
    state = {
        "active_worker": None,
        "dispatch_status": "completed",
        "worker_results": [{"worker": "rvc_worker", "status": "completed"}],
    }
    assert PersonaAgentService._worker_for_state(state) is None


def test_stream_query_yields_only_supervisor_tokens_and_result():
    graph = FakeGraph(
        chunks=[
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content="第一句。"), {"lc_agent_name": "persona_supervisor"}),
            ),
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content="第二句。"), {"lc_agent_name": "persona_supervisor"}),
            ),
            (
                ("memory_worker:x",),
                "messages",
                (AIMessage(content="内部交接文本"), {"lc_agent_name": "memory_worker"}),
            ),
            (("memory_worker:x",), "updates", {"memory_worker": {}}),
        ],
        state={
            "messages": [AIMessage(content="第一句。第二句。")],
            "active_worker": None,
            "loaded_skills": [],
        },
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph

    events = list(service.stream_query("普通问题", _context()))
    assert events[0] == {"kind": "stage", "stage": "正在分析请求..."}
    tokens = [event["text"] for event in events if event["kind"] == "token"]
    assert tokens == ["第一句。", "第二句。"]
    assert [event["stage"] for event in events if event["kind"] == "stage"] == [
        "正在分析请求..."
    ]
    result = events[-1]["result"]
    assert result.status == "completed"
    assert result.answer == "第一句。第二句。"


def test_stream_query_forwards_custom_rag_stages():
    graph = FakeGraph(
        chunks=[
            (("knowledge_worker:x",), "custom", {"kind": "stage", "stage": "正在召回候选内容..."}),
        ],
        state={"messages": [AIMessage(content="完成")], "active_worker": None, "loaded_skills": []},
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph

    events = list(service.stream_query("问题", _context()))

    assert {"kind": "stage", "stage": "正在召回候选内容..."} in events


def test_stream_query_converts_non_provider_execution_error_to_visible_result():
    class FailingGraph(FakeGraph):
        def stream(self, *args, **kwargs):
            raise TimeoutError("graph execution timed out")

    service = PersonaAgentService(checkpointer=object())
    service._workflow = FailingGraph([], {"messages": []})

    events = list(service.stream_query("问题", _context()))

    assert events[0]["kind"] == "stage"
    assert events[-1]["kind"] == "result"
    assert events[-1]["result"].status == "degraded"
    assert "超时" in events[-1]["result"].answer


def test_stream_query_hides_dsml_protocol_split_across_tokens():
    graph = FakeGraph(
        chunks=[
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content="ん……どうしたの？<"), {"lc_agent_name": "persona_supervisor"}),
            ),
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content="/｜｜DSML｜｜parameter>"), {"lc_agent_name": "persona_supervisor"}),
            ),
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content="</｜｜DSML｜｜tool_calls>"), {"lc_agent_name": "persona_supervisor"}),
            ),
        ],
        state={
            "messages": [
                AIMessage(
                    content=(
                        "ん……どうしたの？"
                        "</｜｜DSML｜｜parameter>\n"
                        "</｜｜DSML｜｜invoke>\n"
                        "</｜｜DSML｜｜tool_calls>"
                    )
                )
            ],
            "active_worker": None,
            "loaded_skills": [],
        },
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph

    events = list(service.stream_query("111", _context()))

    assert "".join(event["text"] for event in events if event["kind"] == "token") == "ん……どうしたの？"
    assert events[-1]["result"].answer == "ん……どうしたの？"


def test_stream_query_hides_raw_tool_json_tokens():
    graph = FakeGraph(
        chunks=[
            (
                ("persona_supervisor:x",),
                "messages",
                (AIMessage(content='{"result":"# Search: hidden"}'), {"lc_agent_name": "persona_supervisor"}),
            ),
        ],
        state={
            "messages": [AIMessage(content='{"result":"# Search: hidden"}')],
            "active_worker": None,
            "loaded_skills": [],
        },
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph

    events = list(service.stream_query("普通问题", _context()))

    assert [event for event in events if event["kind"] == "token"] == []
    assert events[-1]["result"].answer == ""


def test_result_hides_spaced_ascii_dsml_protocol():
    result = PersonaAgentService._result(
        {
            "messages": [
                AIMessage(
                    content=(
                        "何か用事？"
                        "</ | | DSML | | parameter>\n"
                        "</ | | DSML | | invoke>"
                    )
                )
            ]
        }
    )

    assert result.answer == "何か用事？"


def test_stream_query_returns_pending_confirmation_without_tokens():
    graph = FakeGraph(
        chunks=[],
        state={
            "messages": [],
            "active_worker": "web",
            "loaded_skills": [],
            "__interrupt__": (SimpleNamespace(value={"tool": "web_search"}),),
        },
    )
    service = PersonaAgentService(checkpointer=object())
    service._workflow = graph

    events = list(service.stream_query("问题", _context()))
    assert [event for event in events if event["kind"] == "token"] == []
    assert events[-1]["result"].status == "pending_confirmation"


def test_stream_query_emits_supervisor_knowledge_answer_as_token():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langgraph.checkpoint.memory import MemorySaver

    from agents.workflow import build_persona_workflow

    class ToolCallingFake(FakeMessagesListChatModel):
        def bind_tools(self, tools, **kwargs):
            return self

    model = ToolCallingFake(
        responses=[
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "delegate_to_knowledge",
                        "args": {"request": "角色在哪里出生？"},
                        "id": "handoff-knowledge",
                        "type": "tool_call",
                    }
                ],
            ),
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "search_persona_knowledge",
                        "args": {"query": "角色在哪里出生？"},
                        "id": "rag-1",
                        "type": "tool_call",
                    }
                ],
            ),
            AIMessage(content="她出生在龙门。"),
        ]
    )
    checkpointer = MemorySaver()
    service = PersonaAgentService(checkpointer, model=model)
    service._workflow = build_persona_workflow(
        model,
        checkpointer,
        knowledge_executor=lambda query, context: {
            "specialist": "knowledge",
            "status": "accepted",
            "answer": "她出生在龙门。",
            "evidence": [{"filename": "设定.md"}],
            "citations": [{"filename": "设定.md"}],
            "uncertainties": [],
            "trace": [],
            "confidence": 0.9,
        },
    )

    events = list(service.stream_query("角色在哪里出生？", _context()))

    assert [event["text"] for event in events if event["kind"] == "token"] == [
        "她出生在龙门。"
    ]
    assert events[-1]["result"].answer == "她出生在龙门。"
    assert events[-1]["result"].metrics["model_calls"] == 3


def test_run_stream_forwards_events_and_stops():
    async def consume():
        registry = ConversationExecutionRegistry()
        events = []
        async for event in registry.run_stream(
            "thread-a",
            lambda: iter(
                [
                    {"kind": "token", "text": "你好"},
                    {"kind": "result", "result": "done"},
                ]
            ),
        ):
            events.append(event)
        return events

    assert asyncio.run(consume()) == [
        {"kind": "token", "text": "你好"},
        {"kind": "result", "result": "done"},
    ]


def test_run_stream_propagates_worker_error():
    def boom():
        yield {"kind": "token", "text": "x"}
        raise RuntimeError("boom")

    async def consume():
        registry = ConversationExecutionRegistry()
        with pytest.raises(RuntimeError, match="boom"):
            async for _event in registry.run_stream("thread-a", boom):
                pass

    asyncio.run(consume())


def test_stream_query_does_not_leak_worker_handoff_as_fallback():
    from agents.service import PersonaAgentService, AgentTurnResult
    from agents.context import PersonaAgentContext

    class _State:
        values = {"messages": []}
        interrupts = ()

    class _Graph:
        def get_state(self, config):
            return _State()

        def stream(self, *args, **kwargs):
            yield ("", "updates", {"profile_worker": {}})
            yield ("", "custom", {"kind": "stage", "stage": "人设管理完成"})

    service = PersonaAgentService(checkpointer=object())
    service._graph = lambda: _Graph()
    service._config = lambda context: {}
    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="w", knowledge_space_ids=("k",),
        conversation_id="c", persona_name="Alpha", persona_type="character",
    )
    events = list(service.stream_query("你改名为 agent 工程师", context))
    leaked = "".join(e.get("text", "") for e in events if e.get("kind") == "token")
    assert "KEY FACTS" not in leaked
    assert "SOURCES" not in leaked
