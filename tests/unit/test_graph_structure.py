"""Graph structure invariants: one worker list, one intent decision, no shadow modules."""

from __future__ import annotations

import importlib.util
from types import SimpleNamespace

from langchain_core.messages import AIMessage, HumanMessage

from agents.context import PersonaAgentContext
from agents.intent_funnel import analyze_intents
from agents.graph.build import _intent_route, _route_to_worker
from agents.graph.policy import direct_worker_for_intent
from agents.service import PersonaAgentService
from agents.workflow import WORKERS, _web_tool_allowed, build_persona_workflow
from agents.graph.state import worker_node_name


def _context() -> PersonaAgentContext:
    return PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
    )


def test_web_authorization_reads_intent_decision_only():
    allowed = {"intent_decision": {"web_authorized": True}}
    denied = {"intent_decision": {"web_authorized": False}}

    assert _web_tool_allowed("web_search", allowed) is True
    assert _web_tool_allowed("search", denied) is False
    assert _web_tool_allowed("research", {}) is False
    assert _web_tool_allowed("web_search", {"web_search_authorized": True}) is False
    assert _web_tool_allowed("delegate_to_knowledge", {}) is True


def test_service_writes_intent_decision_as_the_only_web_gate():
    captured = {}

    class CapturingGraph:
        def stream(self, state, *args, **kwargs):
            captured.update(state)
            return iter(())

        def get_state(self, config):
            return SimpleNamespace(values={"messages": [AIMessage(content="done")]}, interrupts=())

    service = PersonaAgentService(checkpointer=object())
    service._workflow = CapturingGraph()
    list(service.stream_query("搜索今天潍坊天气", _context()))

    assert "web_search_authorized" not in captured
    assert captured["intent_decision"]["web_authorized"] is True
    assert captured["intent_decision"]["primary"] == "web"
    assert analyze_intents("搜索今天潍坊天气").web_authorized is True


def test_shadow_architecture_modules_are_removed():
    for name in ("agents.worker_registry", "agents.tool_guards", "agents.monitoring", "agents.security"):
        assert importlib.util.find_spec(name) is None, name


def test_workers_are_the_single_runtime_set():
    assert WORKERS == ("knowledge", "memory", "document", "profile", "voice", "rvc_worker", "live2d", "config_worker")
    graph = build_persona_workflow(model=None, checkpointer=None)
    node_names = set(graph.get_graph().nodes)
    for worker in WORKERS:
        assert worker_node_name(worker) in node_names
        assert f"finalize_{worker}" in node_names
    assert "persona_supervisor" in node_names
    assert "intent_route" in node_names


def test_strong_intents_route_directly_except_rvc_requires_supervisor_handoff():
    for primary, expected in (
        ("voice", "voice_worker"),
        ("live2d", "live2d_worker"),
        ("memory", "memory_worker"),
        ("document", "document_worker"),
        ("profile", "profile_worker"),
        ("config", "config_worker"),
    ):
        state = {
            "intent_decision": analyze_intents(f"请处理{primary}").to_state() | {"primary": primary},
            "messages": [HumanMessage(content=f"请处理{primary}")],
        }

        assert direct_worker_for_intent(state["intent_decision"]) == expected
        updates = _intent_route(state)
        assert updates["route_node"] == expected
        assert updates["worker_request"] == f"请处理{primary}"
        assert updates["worker_call_id"].startswith(f"direct:{expected}:")
        assert _route_to_worker(updates) == expected


def test_rvc_intent_never_bypasses_core_supervisor():
    state = {
        "intent_decision": analyze_intents("请处理rvc_worker").to_state() | {"primary": "rvc_worker"},
        "messages": [HumanMessage(content="请处理rvc_worker")],
    }

    assert direct_worker_for_intent(state["intent_decision"]) == "rvc_worker"
    updates = _intent_route(state)
    assert updates == {"route_node": "persona_supervisor"}
    assert _route_to_worker(updates) == "persona_supervisor"


def test_ambiguous_and_conversation_intents_use_supervisor():
    for primary in (None, "conversation", "knowledge", "web"):
        state = {"intent_decision": {"primary": primary}}
        assert direct_worker_for_intent(state["intent_decision"]) is None
        assert _intent_route(state) == {"route_node": "persona_supervisor"}
        assert _route_to_worker(state) == "persona_supervisor"

def test_workflow_module_is_a_facade_over_graph_package():
    import agents.graph as graph
    import agents.workflow as workflow

    assert workflow.build_persona_workflow is graph.build_persona_workflow
    assert workflow.WORKERS is graph.WORKERS
    assert workflow._web_tool_allowed is graph._web_tool_allowed
    assert workflow._knowledge_workflow is graph._knowledge_workflow


def test_service_inherits_elliptical_web_intent_from_checkpoint():
    captured = {}
    previous = analyze_intents("查一下北京天气")

    class CapturingGraph:
        def stream(self, state, *args, **kwargs):
            captured.update(state)
            return iter(())

        def get_state(self, config):
            return SimpleNamespace(
                values={
                    "messages": [HumanMessage(content="查一下北京天气")],
                    "intent_decision": previous.to_state(),
                },
                interrupts=(),
            )

    service = PersonaAgentService(checkpointer=object())
    service._workflow = CapturingGraph()
    list(service.stream_query("那上海呢？", _context()))

    assert captured["intent_decision"]["inherited"] is True
    assert captured["intent_decision"]["primary"] == "web"
    assert captured["intent_decision"]["web_authorized"] is True


def test_service_does_not_inherit_intent_for_a_complete_new_question():
    captured = {}
    previous = analyze_intents("查一下北京天气")

    class CapturingGraph:
        def stream(self, state, *args, **kwargs):
            captured.update(state)
            return iter(())

        def get_state(self, config):
            return SimpleNamespace(
                values={
                    "messages": [HumanMessage(content="查一下北京天气")],
                    "intent_decision": previous.to_state(),
                },
                interrupts=(),
            )

    service = PersonaAgentService(checkpointer=object())
    service._workflow = CapturingGraph()
    list(service.stream_query("介绍一下你自己", _context()))

    assert captured["intent_decision"]["inherited"] is False
    assert captured["intent_decision"]["primary"] == "conversation"
    assert captured["intent_decision"]["web_authorized"] is False



def test_knowledge_is_not_an_llm_worker():
    from agents.graph.supervisor import _worker_agent, _worker_prompt

    context = _context()
    try:
        _worker_prompt("knowledge", context)
        raise AssertionError("knowledge prompt should be rejected")
    except RuntimeError as exc:
        assert "planner subgraph" in str(exc)
    try:
        _worker_agent("knowledge", model=None)
        raise AssertionError("knowledge create_agent should be rejected")
    except RuntimeError as exc:
        assert "_knowledge_subgraph" in str(exc)


def test_supervisor_collect_preserves_async_worker_state_and_rejects_invalid_result():
    from agents.graph.supervisor import _supervisor_collect

    accepted = _supervisor_collect({
        "active_worker": "rvc_worker",
        "worker_results": [{
            "worker": "rvc_worker",
            "status": "accepted",
            "answer": "已提交处理",
            "task_id": "task-1",
            "result_refs": [{"file_id": "file-out"}],
            "workflow": {"status": "running"},
        }],
        "dispatch_request": {"worker": "rvc_worker"},
    })
    assert accepted["dispatch_status"] == "accepted"
    assert accepted["result_refs"] == [{"file_id": "file-out"}]
    assert accepted["workflow"] == {"status": "running"}

    failed = _supervisor_collect({
        "active_worker": "rvc_worker",
        "worker_results": [{
            "worker": "rvc_worker",
            "status": "completed",
            "artifacts": [{"path": "C:/private/output.wav"}],
        }],
    })
    assert failed["dispatch_status"] == "failed"
    assert failed["worker_results"][0]["error"]["code"] == "invalid_worker_result"


def test_supervisor_collect_keeps_worker_failure_failed():
    from agents.graph.supervisor import _supervisor_collect

    result = _supervisor_collect({
        "active_worker": "rvc_worker",
        "worker_results": [{
            "worker": "rvc_worker",
            "status": "failed",
            "answer": "处理失败",
            "error": {"code": "rvc_failed", "message": "公开错误"},
        }],
    })
    assert result["dispatch_status"] == "failed"
    assert result["worker_results"][0]["status"] == "failed"
