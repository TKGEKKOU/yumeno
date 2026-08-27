from app.models import DocumentJob
import json
from types import SimpleNamespace

from langchain.messages import AIMessage, HumanMessage, ToolMessage
from agents.context import PersonaAgentContext
from agents.registry import READ_ONLY_TOOL_NAMES, tool_specs
from agents.supervisor import route_specialist, specialist_prompt
from agents.service import (
    PersonaAgentService,
    is_capability_question,
    is_explicit_web_search_question,
)
from agents.tools.knowledge import run_persona_knowledge_search
from agents.tools.management import list_documents_for_context
from persona.service import create_persona
from rag.service import RagResult


def test_capability_question_requires_explicit_self_inspection():
    assert is_capability_question("这个工具怎么用") is False
    assert is_capability_question("知识库里有工具相关资料吗") is False
    assert is_capability_question("你有哪些工具可以调用") is True
    assert is_capability_question("你具备什么能力") is True


def test_web_search_requires_explicit_request_or_external_fact():
    assert is_explicit_web_search_question("请搜索一下这个项目") is True
    assert is_explicit_web_search_question("今天的天气怎么样") is True
    assert is_explicit_web_search_question("最新的汇率是多少") is True
    assert is_explicit_web_search_question("今天我很累") is False
    assert is_explicit_web_search_question("工具怎么用") is False
    assert is_explicit_web_search_question("查一下角色资料") is False
    assert is_explicit_web_search_question("直接搜薇欧拉") is True


def test_rag_insufficient_requests_confirmation_without_search(monkeypatch):
    from agents.workflow import _knowledge_workflow

    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )
    seen = {}
    def deny(action):
        seen["action"] = action
        return False

    monkeypatch.setattr("agents.workflow.request_confirmation", deny)
    search_calls = []
    run = _knowledge_workflow(
        lambda query, ctx: {"status": "insufficient", "answer": "", "evidence": []},
        lambda ctx, sql: {},
        web_search_executor=lambda query, ctx: search_calls.append(query) or [],
    )

    result = run(
        {"worker_request": "工具怎么配置", "worker_call_id": "call-1", "messages": []},
        SimpleNamespace(context=context),
    )

    assert seen["action"]["tool"] == "web_search_confirmation"
    assert "知识库" in seen["action"]["target"]
    assert search_calls == []
    assert result["messages"][-1].content == "用户未授权联网搜索。"


def test_rag_confirmation_runs_one_batch_search_and_hides_payload(monkeypatch):
    from agents.workflow import _knowledge_workflow

    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )
    calls = []
    monkeypatch.setattr("agents.workflow.request_confirmation", lambda action: True)
    run = _knowledge_workflow(
        lambda query, ctx: {"status": "insufficient", "answer": "", "evidence": []},
        lambda ctx, sql: {},
        web_search_executor=lambda query, ctx: calls.append(query) or [
            {"title": "结果一", "url": "https://example.test/1", "content": "事实一"},
            {"title": "结果二", "url": "https://example.test/2", "content": "事实二"},
        ],
    )

    result = run(
        {"worker_request": "请搜索工具配置", "worker_call_id": "call-1", "messages": []},
        SimpleNamespace(context=context),
    )

    assert calls == ["请搜索工具配置"]
    answer = result["messages"][-1].content
    assert "结果一" in answer and "事实二" in answer
    assert '"title"' not in answer


def test_explicit_web_request_skips_rag_fallback_confirmation(monkeypatch):
    from agents.intent_funnel import analyze_intents
    from agents.workflow import _knowledge_workflow

    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )
    monkeypatch.setattr(
        "agents.workflow.request_confirmation",
        lambda action: (_ for _ in ()).throw(AssertionError("explicit web must not confirm")),
    )
    calls = []
    run = _knowledge_workflow(
        lambda query, ctx: {"status": "insufficient", "answer": "", "evidence": []},
        lambda ctx, sql: {},
        web_search_executor=lambda query, ctx: calls.append(query) or [
            {"title": "结果", "content": "薇欧拉资料", "url": "https://example.test"}
        ],
    )
    intent = analyze_intents("直接搜薇欧拉")

    result = run(
        {
            "worker_request": "直接搜薇欧拉",
            "worker_call_id": "call-1",
            "messages": [],
            "intent_decision": intent.to_state(),
        },
        SimpleNamespace(context=context),
    )

    assert calls == ["直接搜薇欧拉"]
    assert "薇欧拉资料" in result["messages"][-1].content


def test_internal_tool_payload_is_removed_from_final_answer():
    from agents.service import _sanitize_answer

    assert _sanitize_answer('{"result":"# Search: hidden"}') == ""
    assert _sanitize_answer("Error: fetch is not a valid tool") == ""
    assert _sanitize_answer("正常角色回复") == "正常角色回复"


def test_web_tools_require_request_authorization():
    from agents.workflow import _web_tool_allowed

    assert _web_tool_allowed("delegate_to_web", {"web_search_authorized": False}) is False
    assert _web_tool_allowed("search", {"web_search_authorized": False}) is False
    assert _web_tool_allowed("research", {"web_search_authorized": True}) is True
    assert _web_tool_allowed("delegate_to_knowledge", {}) is True


def test_search_usage_is_counted_from_tool_messages():
    from agents.workflow import _search_already_used

    assert _search_already_used({"messages": []}) is False
    assert _search_already_used({
        "messages": [ToolMessage(content="ok", name="search", tool_call_id="search-1")]
    }) is True
    assert _search_already_used({
        "messages": [ToolMessage(content="ok", name="search_persona_knowledge", tool_call_id="rag-1")]
    }) is False
    assert _search_already_used({
        "messages": [
            ToolMessage(content="old", name="search", tool_call_id="search-old"),
            HumanMessage(content="new turn"),
        ]
    }) is False


def test_confirmed_search_prefers_keyless_batch_tool(monkeypatch):
    from agents.workflow import _default_web_search_executor

    called = []

    class FakeTool:
        def __init__(self, name):
            self.name = name

        def invoke(self, payload):
            called.append(self.name)
            return [{"title": self.name, "content": "ok"}]

    monkeypatch.setattr(
        "agents.workflow.tool_specs",
        lambda: [
            SimpleNamespace(name="web_search", tool=FakeTool("web_search"), specialist="web"),
            SimpleNamespace(name="search", tool=FakeTool("search"), specialist="mcp"),
        ],
    )
    monkeypatch.setattr("agents.workflow.is_mcp_tool_visible", lambda persona_id, name: True)
    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )

    result = _default_web_search_executor("query", context)

    assert called == ["search"]
    assert result[0]["title"] == "search"


def test_confirmed_search_uses_configured_key_provider_without_tool_runtime(monkeypatch):
    from langchain_core.documents import Document
    from agents.workflow import _default_web_search_executor

    monkeypatch.setattr(
        "agents.workflow.tool_specs",
        lambda: [SimpleNamespace(name="web_search", specialist="web")],
    )
    monkeypatch.setattr(
        "agents.workflow.web_search_documents",
        lambda query, recent=True: [
            Document(page_content="weather result", metadata={"title": "Tavily", "source": "https://example.com"})
        ],
    )
    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )

    result = _default_web_search_executor("今天潍坊天气", context)

    assert result == [{"content": "weather result", "title": "Tavily", "source": "https://example.com"}]


def test_real_graph_pauses_before_rag_fallback_search():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langgraph.checkpoint.memory import MemorySaver
    from langgraph.types import Command

    from agents.workflow import build_persona_workflow

    class ToolCallingFake(FakeMessagesListChatModel):
        def bind_tools(self, tools, **kwargs):
            return self

    model = ToolCallingFake(
        responses=[
            AIMessage(
                content="",
                tool_calls=[{
                    "name": "delegate_to_knowledge",
                    "args": {"request": "未知资料"},
                    "id": "handoff-knowledge",
                    "type": "tool_call",
                }],
            )
        ]
    )
    calls = []
    graph = build_persona_workflow(
        model,
        MemorySaver(),
        knowledge_executor=lambda query, context: {
            "specialist": "knowledge", "status": "insufficient", "answer": "", "evidence": [],
        },
        web_search_executor=lambda query, context: calls.append(query) or [
            {"title": "公开来源", "content": "补充事实", "url": "https://example.test"}
        ],
    )
    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
    )
    config = {"configurable": {"thread_id": "persona-a:thread-a"}}

    first = graph.invoke(
        {
            "messages": [("user", "未知资料")], "active_worker": None,
            "loaded_skills": [], "web_search_authorized": False,
            "worker_results": [], "handoff_count": 0,
        },
        config,
        context=context,
    )

    snapshot = graph.get_state(config)
    assert snapshot.interrupts[0].value["tool"] == "web_search_confirmation"
    assert calls == []

    resumed = graph.invoke(Command(resume={"approved": True}), config, context=context)

    assert calls == ["未知资料"]
    assert "补充事实" in resumed["messages"][-1].content


def test_worker_tools_are_limited_to_registered_owner():
    from agents.workflow import worker_tools

    assert [tool.name for tool in worker_tools("web")] == ["web_search"]
    assert "search_persona_knowledge" not in [tool.name for tool in worker_tools("web")]


def test_persona_workflow_has_supervisor_and_worker_nodes():
    from langgraph.checkpoint.memory import MemorySaver

    from agents.workflow import WORKERS, build_persona_workflow

    graph = build_persona_workflow(model=None, checkpointer=MemorySaver())
    nodes = graph.get_graph().nodes

    assert "persona_supervisor" in nodes
    for worker in WORKERS:
        assert f"{worker}_worker" in nodes
    assert "finalize_knowledge" not in nodes
    for worker in ("web", "memory", "management"):
        assert f"finalize_{worker}" in nodes


def test_supervisor_prompt_includes_full_persona_profile_and_fact_first_rules():
    from agents.workflow import _supervisor_prompt

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
        persona_profile={"voice": "calm and observant", "style": "state conclusions first"},
    )

    prompt = _supervisor_prompt(context)

    assert '"voice": "calm and observant"' in prompt
    assert "Answer the user's question directly before offering advice." in prompt
    assert "weather, news, or other factual requests" in prompt
    assert "status=accepted" in prompt
    assert "status=insufficient" in prompt


def test_supervisor_prompt_limits_tts_enabled_chat_length():
    from agents.workflow import _supervisor_prompt

    context = PersonaAgentContext(
        persona_id="persona-a", workspace_id="local-default", knowledge_space_ids=("space-a",),
        conversation_id="thread-a", persona_name="Ames", persona_type="character",
        persona_profile={"tts": {"enabled": True}},
    )

    prompt = _supervisor_prompt(context)
    assert "ordinary chat" in prompt
    assert "around 30 Chinese characters" in prompt
    assert "never exceeding 50" in prompt
    assert "knowledge, web, or memory answers" in prompt


def test_persona_chat_prompt_limits_ordinary_reply_length():
    from rag.persona_chat import PERSONA_PROMPT

    assert "30" in PERSONA_PROMPT.messages[0].prompt.template


def test_rag_generation_prompt_limits_answer_length():
    from rag.generate import PROMPT

    assert "300" in PROMPT.template


def test_web_worker_prompt_requires_structured_evidence_handoff():
    from agents.workflow import _worker_prompt

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
    )

    prompt = _worker_prompt("web", context)

    assert "KEY FACTS" in prompt
    assert "SOURCES" in prompt
    assert "UNCERTAINTIES OR CONFLICTS" in prompt


def test_service_builds_one_parent_workflow(monkeypatch):
    import agents.service as service_module

    captured = {}
    parent_graph = object()
    monkeypatch.setattr(
        service_module,
        "build_persona_workflow",
        lambda model, checkpointer: captured.update(model=model, checkpointer=checkpointer) or parent_graph,
    )
    checkpointer = object()
    model = object()

    service = PersonaAgentService(checkpointer=checkpointer, model=model)

    assert service._graph() is parent_graph
    assert captured == {"model": model, "checkpointer": checkpointer}


def test_service_rebuilds_workflow_after_tool_registry_change(monkeypatch):
    import agents.service as service_module
    import agents.registry as registry_module

    built = []
    monkeypatch.setattr(
        service_module,
        "build_persona_workflow",
        lambda model, checkpointer: built.append(object()) or built[-1],
    )
    revision = 10
    monkeypatch.setattr(registry_module, "tool_registry_revision", lambda: revision)
    service = PersonaAgentService(checkpointer=object(), model=object())

    first = service._graph()
    assert service._graph() is first
    revision = 11
    assert service._graph() is not first
    assert len(built) == 2


def test_supervisor_handoff_returns_to_persona_response():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
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
                        "name": "delegate_to_web",
                        "args": {"request": "today's news"},
                        "id": "handoff-web",
                        "type": "tool_call",
                    }
                ],
            ),
            AIMessage(content="Current public result."),
            AIMessage(content="Persona final response."),
        ]
    )
    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )

    result = build_persona_workflow(model, MemorySaver()).invoke(
        {"messages": [("user", "What happened today?")], "active_worker": None},
        {"configurable": {"thread_id": "persona-a:thread-a"}},
        context=context,
    )

    assert result["active_worker"] is None
    assert result["worker_results"] == [{"worker": "web", "summary": "Current public result."}]
    assert result["messages"][-1].content == "Persona final response."


def test_knowledge_handoff_uses_one_strategy_call_then_deterministic_tool():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
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
            )
        ]
    )
    calls = []

    def knowledge_executor(query, context):
        calls.append((query, context.persona_id))
        return {
            "specialist": "knowledge",
            "status": "accepted",
            "answer": "她出生在龙门。",
            "evidence": [{"filename": "设定.md", "content": "出生于龙门"}],
            "citations": [{"filename": "设定.md"}],
            "uncertainties": [],
            "trace": [{"node": "quality_gate"}],
            "confidence": 0.95,
        }

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )
    result = build_persona_workflow(
        model,
        MemorySaver(),
        knowledge_executor=knowledge_executor,
    ).invoke(
        {"messages": [("user", "角色在哪里出生？")], "active_worker": None},
        {"configurable": {"thread_id": "persona-a:thread-a"}},
        context=context,
    )

    assert calls == [("角色在哪里出生？", "persona-a")]
    assert result["messages"][-1].content == "她出生在龙门。"
    assert result["worker_results"][-1]["status"] == "accepted"


def test_structured_handoff_executes_validated_sql_and_formats_result():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
    from langgraph.checkpoint.memory import MemorySaver

    from agents.workflow import build_persona_workflow

    class ToolCallingFake(FakeMessagesListChatModel):
        def bind_tools(self, tools, **kwargs):
            return self

    request = json.dumps(
        {
            "kind": "structured",
            "query": "哪个地区销售额最高？",
            "sql": "SELECT c_001 AS region, SUM(c_002) AS total FROM t_a GROUP BY c_001",
        },
        ensure_ascii=False,
    )
    model = ToolCallingFake(
        responses=[
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "delegate_to_knowledge",
                        "args": {"request": request},
                        "id": "handoff-structured",
                        "type": "tool_call",
                    }
                ],
            )
        ]
    )
    sql_calls = []

    def structured_executor(context, sql):
        sql_calls.append(sql)
        return {
            "specialist": "knowledge",
            "status": "accepted",
            "answer": "",
            "columns": ["region", "total"],
            "rows": [["华东", 30]],
            "row_count": 1,
            "truncated": False,
            "evidence": [],
            "uncertainties": [],
        }

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="knowledge_expert",
    )
    result = build_persona_workflow(
        model,
        MemorySaver(),
        structured_executor=structured_executor,
    ).invoke(
        {"messages": [("user", "哪个地区销售额最高？")], "active_worker": None},
        {"configurable": {"thread_id": "persona-a:thread-a"}},
        context=context,
    )

    assert sql_calls == [
        "SELECT c_001 AS region, SUM(c_002) AS total FROM t_a GROUP BY c_001"
    ]
    assert "华东" in result["messages"][-1].content
    assert "30" in result["messages"][-1].content


def test_service_reports_one_agent_model_call_for_knowledge_fast_path():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
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
            )
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
            "evidence": [{"filename": "设定.md", "content": "出生于龙门"}],
            "citations": [{"filename": "设定.md"}],
            "uncertainties": [],
            "trace": [{"node": "quality_gate"}],
            "confidence": 0.95,
        },
    )
    context = PersonaAgentContext(
        persona_id="persona-fast-path",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-fast-path",
        persona_name="Alpha",
        persona_type="character",
    )

    result = service.query("角色在哪里出生？", context)

    assert result.answer == "她出生在龙门。"
    assert result.metrics["model_calls"] == 1
    assert result.metrics["tool_calls"] == 1
    assert result.tool_calls[0]["name"] == "search_persona_knowledge"
    assert result.evidence[0]["filename"] == "设定.md"


def test_management_handoff_resumes_in_same_parent_workflow(db_session):
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
    from langgraph.checkpoint.memory import MemorySaver
    from langgraph.types import Command

    from agents.workflow import build_persona_workflow

    class ToolCallingFake(FakeMessagesListChatModel):
        def bind_tools(self, tools, **kwargs):
            return self

    persona = create_persona(db_session, "Alpha")
    db_session.commit()
    context = PersonaAgentContext(
        persona_id=persona.id,
        workspace_id="local-default",
        knowledge_space_ids=(persona.knowledge_space_id,),
        conversation_id="thread-a",
        persona_name=persona.name,
        persona_type=persona.persona_type,
        session_factory=lambda: db_session,
    )
    model = ToolCallingFake(
        responses=[
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "delegate_to_management",
                        "args": {"request": "rename"},
                        "id": "handoff-management",
                        "type": "tool_call",
                    }
                ],
            ),
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "rename_persona",
                        "args": {"name": "Beta"},
                        "id": "rename-persona",
                        "type": "tool_call",
                    }
                ],
            ),
            AIMessage(content="Persona renamed."),
            AIMessage(content="Persona final response."),
        ]
    )
    graph = build_persona_workflow(model, MemorySaver())
    config = {"configurable": {"thread_id": f"{persona.id}:thread-a"}}

    graph.invoke({"messages": [("user", "Rename yourself")], "active_worker": None}, config, context=context)

    assert graph.get_state(config).interrupts
    result = graph.invoke(Command(resume={"approved": True}), config, context=context)

    assert db_session.get(type(persona), persona.id).name == "Beta"
    assert result["messages"][-1].content == "Persona final response."


def test_registry_exposes_expected_read_only_tools():
    assert READ_ONLY_TOOL_NAMES == (
        "search_persona_knowledge",
        "web_search",
        "list_persona_documents",
        "read_persona_memories",
        "read_workspace_memories",
        "list_structured_tables",
        "query_structured_data",
    )
    read_only_specs = [spec for spec in tool_specs() if spec.name in READ_ONLY_TOOL_NAMES]
    assert read_only_specs and all(not spec.requires_confirmation for spec in read_only_specs)


def test_web_search_returns_guidance_when_no_key_configured(monkeypatch):
    from agents.tools import web

    fake_settings = type("S", (), {"enable_web_fallback": False})()
    monkeypatch.setattr(
        "agents.tools.web.Settings.load", staticmethod(lambda: fake_settings)
    )
    result = web.web_search.func("测试", None)
    text = str(result)
    assert "API key" in text
    assert "web-research" not in text
    assert "未配置" in text


def test_supervisor_routes_to_capability_specialists():
    assert route_specialist("查一下今天的新闻") == "web"
    assert route_specialist("记住我喜欢红茶") == "memory"
    assert route_specialist("列出这个角色的资料") == "management"
    assert route_specialist("根据资料介绍她的经历") == "conversation"
    assert route_specialist("你好") == "conversation"


def test_every_specialist_receives_persona_type_and_profile():
    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="爱弥斯",
        persona_type="character",
        persona_profile={"voice": "活泼", "boundaries": "不伤害用户"},
    )

    for specialist in ("conversation", "web", "memory", "management"):
        prompt = specialist_prompt(specialist, context)
        assert "严格遵循人物设定" in prompt
        assert "活泼" in prompt
        assert "不伤害用户" in prompt


def test_all_specialists_share_one_conversation_thread():
    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="conversation-a",
        persona_name="Alpha",
        persona_type="character",
        persona_profile={},
    )

    assert PersonaAgentService.thread_id(context, "conversation") == PersonaAgentService.thread_id(
        context, "memory"
    )


def test_rag_tool_uses_only_server_injected_scope():
    captured = {}

    class FakeRagService:
        def query(self, request):
            captured["request"] = request
            return RagResult.empty("none")

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
        persona_profile={"description": "calm"},
    )

    run_persona_knowledge_search("private facts", context, FakeRagService())

    request = captured["request"]
    assert request.context.persona_id == "persona-a"
    assert request.context.knowledge_space_ids == ("space-a",)
    assert request.force_knowledge is True
    assert request.allow_web_fallback is False


def test_knowledge_tool_returns_fail_closed_specialist_result():
    class FakeRagService:
        def query(self, request):
            return RagResult(
                answer_draft="model guess must not reach supervisor",
                evidence=({"content": "weak evidence"},),
                confidence=0.2,
                used_web_search=False,
                trace=({"node": "quality_gate"},),
                grounded=False,
                useful=True,
                missing_points=("资料没有说明原因",),
            )

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )

    result = run_persona_knowledge_search("为什么", context, FakeRagService())

    assert result["specialist"] == "knowledge"
    assert result["status"] == "insufficient"
    assert result["answer"] == ""
    assert result["evidence"] == []
    assert result["uncertainties"] == ["资料没有说明原因"]


def test_knowledge_finalize_discards_worker_text_when_gate_rejects_evidence():
    from agents.workflow import _finalize_worker

    messages = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "delegate_to_knowledge",
                    "args": {"request": "为什么"},
                    "id": "handoff-knowledge",
                    "type": "tool_call",
                }
            ],
        ),
        ToolMessage(
            content=json.dumps(
                {
                    "specialist": "knowledge",
                    "status": "insufficient",
                    "answer": "",
                    "evidence": [],
                    "citations": [],
                    "uncertainties": ["资料没有说明原因"],
                    "trace": [{"node": "quality_gate"}],
                    "confidence": 0.2,
                }
            ),
            name="search_persona_knowledge",
            tool_call_id="rag-tool",
        ),
        AIMessage(content="她可能是为了自由，这句话没有证据。"),
    ]

    updates = _finalize_worker("knowledge")({"messages": messages})

    assert updates["worker_results"][0]["status"] == "insufficient"
    handoff = updates["messages"][0].content
    assert "她可能是为了自由" not in handoff
    assert "资料没有说明原因" in handoff


def test_knowledge_finalize_only_hands_accepted_answer_to_supervisor():
    from agents.workflow import _finalize_worker

    messages = [
        AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "delegate_to_knowledge",
                    "args": {"request": "经历"},
                    "id": "handoff-knowledge",
                    "type": "tool_call",
                }
            ],
        ),
        ToolMessage(
            content=json.dumps(
                {
                    "specialist": "knowledge",
                    "status": "accepted",
                    "answer": "她在十八岁时离开故乡。",
                    "evidence": [{"content": "十八岁时离开故乡", "filename": "设定.md"}],
                    "citations": [{"filename": "设定.md"}],
                    "uncertainties": [],
                    "trace": [{"node": "quality_gate"}],
                    "confidence": 0.9,
                }
            ),
            name="search_persona_knowledge",
            tool_call_id="rag-tool",
        ),
        AIMessage(content="自由发挥的 Worker 总结。"),
    ]

    updates = _finalize_worker("knowledge")({"messages": messages})

    handoff = updates["messages"][0].content
    assert "她在十八岁时离开故乡" in handoff
    assert "设定.md" in handoff
    assert "自由发挥的 Worker 总结" not in handoff


def test_document_tool_never_lists_another_personas_documents(db_session):
    first = create_persona(db_session, "First")
    second = create_persona(db_session, "Second")
    db_session.add_all(
        [
            DocumentJob(
                workspace_id="local-default",
                knowledge_space_id=first.knowledge_space_id,
                original_filename="first.md",
                markdown_filename="first.md",
                source_path="first.md",
                status="indexed",
            ),
            DocumentJob(
                workspace_id="local-default",
                knowledge_space_id=second.knowledge_space_id,
                original_filename="second.md",
                markdown_filename="second.md",
                source_path="second.md",
                status="indexed",
            ),
        ]
    )
    db_session.commit()
    context = PersonaAgentContext(
        persona_id=first.id,
        workspace_id="local-default",
        knowledge_space_ids=(first.knowledge_space_id,),
        conversation_id="thread-a",
        persona_name=first.name,
        persona_type="knowledge_expert",
        persona_profile={},
        session_factory=lambda: db_session,
    )

    documents = list_documents_for_context(context)

    assert [document["filename"] for document in documents] == ["first.md"]


def test_capability_question_does_not_match_character_ability_setting():
    assert is_capability_question("你有哪些 tools")
    assert is_capability_question("你会调用哪些工具")
    assert not is_capability_question("异能力>>长航的星辉")
    assert not is_capability_question("给你加上一些能力设定")


def test_supervisor_routes_profile_mutations_to_management():
    assert route_specialist("update_persona_profile") == "management"
    assert route_specialist("rename_persona") == "management"
    assert route_specialist("把你的名字改为 Ameath") == "management"
    assert route_specialist("给你加上一些设定：电子幽灵") == "management"
    assert route_specialist("记住，这是你的共鸣回路：光学取样") == "management"
    assert route_specialist("记住我喜欢红茶") == "memory"


class _TransientProviderError(RuntimeError):
    status_code = 503


def test_agent_query_returns_friendly_answer_when_llm_service_unavailable(monkeypatch):
    from rag.llm import LLM_UNAVAILABLE_MESSAGE

    class FailingGraph:
        def get_state(self, config):
            class Snapshot:
                interrupts = ()
                values = {}

            return Snapshot()

        def invoke(self, *args, **kwargs):
            raise _TransientProviderError("Service is too busy")

    service = PersonaAgentService(checkpointer=object())
    monkeypatch.setattr(service, "_graph", lambda: FailingGraph())
    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="测试角色",
        persona_type="knowledge_expert",
    )

    result = service.query("角色核心设定是什么", context)

    assert result.status == "completed"
    assert result.answer == LLM_UNAVAILABLE_MESSAGE
    assert result.metrics["status"] == "degraded"


def test_stage_mapping_from_updates():
    from agents.service import _stage_from_update

    assert _stage_from_update({"knowledge_worker": {"messages": []}}) == "知识agent · 正在检索角色资料…"
    assert _stage_from_update({"persona_supervisor": {"messages": []}}) == "正在思考…"
    assert _stage_from_update({}) is None


def test_stream_query_emits_stage_token_and_result():
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage
    from langgraph.checkpoint.memory import MemorySaver

    from agents.context import PersonaAgentContext
    from agents.service import PersonaAgentService

    class ToolCallingFake(FakeMessagesListChatModel):
        def bind_tools(self, tools, **kwargs):
            return self

    service = PersonaAgentService(
        MemorySaver(),
        model=ToolCallingFake(responses=[AIMessage(content="你好")]),
    )
    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )
    kinds = [event["kind"] for event in service.stream_query("你好", context)]
    assert "stage" in kinds
    assert "token" in kinds
    assert "result" in kinds


def test_knowledge_search_forwards_public_rag_steps():
    from agents.tools.knowledge import run_persona_knowledge_search

    seen = []

    class FakeRagService:
        def query(self, request, on_step=None):
            del request
            if on_step:
                on_step("retrieve", {"documents": [1, 2, 3]})
            return RagResult.empty("none")

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )

    run_persona_knowledge_search(
        "facts",
        context,
        FakeRagService(),
        on_step=lambda node, state: seen.append((node, state)),
    )

    assert seen == [("retrieve", {"documents": [1, 2, 3]})]
