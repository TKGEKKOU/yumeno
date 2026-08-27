"""LangGraph 人设对话主流程。

只有 persona_supervisor 对用户可见；四类 Worker 只执行受限工具并把事实结果交还
主 Agent，最终措辞始终由主 Agent 结合完整人设统一生成。
"""

from __future__ import annotations

import json
import inspect
import operator
import time
from typing import Annotated, Callable, Literal

from langchain.agents import create_agent
from langchain.agents.middleware import (
    ModelRequest,
    dynamic_prompt,
    wrap_model_call,
    wrap_tool_call,
)
from langchain.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain.tools import ToolRuntime, tool
from langchain_core.language_models import BaseChatModel
from langgraph.constants import END, START
from langgraph.errors import GraphInterrupt
from langgraph.graph import MessagesState, StateGraph
from langgraph.runtime import Runtime
from langgraph.types import Command
from langgraph.config import get_stream_writer

from agents.context import PersonaAgentContext
from agents.confirmation_policy import decide_capability, decide_web_fallback
from agents.context_budget import ContextBudget, build_bounded_context
from agents.capabilities import (
    evaluate_capability,
    guard_capability,
    skill_is_assigned,
    skill_policy_value,
)
from agents.mcp_grants import is_mcp_tool_visible
from agents.registry import capability_catalog, tool_specs, tools_for_specialist
from agents.tools.management import request_confirmation
from agents.skills import get_skill, list_skills, load_skill, tools_for_skill
from agents.tools.memory import memories_for_context
from agents.tools.workspace_memory import workspace_memories_for_context
from agents.tools.knowledge import run_persona_knowledge_search
from agents.tools.structured_query import (
    list_structured_tables_for_context,
    query_structured_data_for_context,
)
from agents.intent_funnel import IntentAnalysis, analyze_message_history
from rag.llm import get_llm
from rag.adaptive_graph import serialize_document
from rag.web_search import web_search_documents


Worker = Literal["knowledge", "web", "memory", "management"]
WORKERS: tuple[Worker, ...] = ("knowledge", "web", "memory", "management")
_WORKER_SPECIALISTS = {"knowledge": "conversation", "web": "web", "memory": "memory", "management": "management"}


class PersonaWorkflowState(MessagesState):
    """跨节点共享状态；messages 由 LangGraph 管理，Worker 结果采用追加合并。"""

    active_worker: Worker | None
    worker_results: list[dict]
    loaded_skills: list[str]
    handoff_count: int
    worker_request: str
    worker_call_id: str
    web_search_authorized: bool
    intent_decision: dict


class SupervisorAgentState(MessagesState):
    """Supervisor 子图状态：只声明 messages 与 loaded_skills。

    刻意不继承 PersonaWorkflowState——子图若把未修改的 worker_results 等字段
    原样输出，父图 reducer 会把同一份值再次合并导致重复；子图只需回传
    loaded_skills（load_skill 工具写入）即可。
    """

    loaded_skills: list[str]
    web_search_authorized: bool
    intent_decision: dict


_WEB_TOOL_NAMES = {"delegate_to_web", "web_search", "search", "research"}
_SEARCH_TOOL_NAMES = {"web_search", "search", "research"}


def _web_tool_allowed(tool_name: str, state: dict) -> bool:
    return (
        tool_name not in _WEB_TOOL_NAMES
        or "web_search_authorized" not in state
        or bool(state.get("web_search_authorized"))
    )


def _search_already_used(state: dict) -> bool:
    messages = list(state.get("messages", []))
    for index in range(len(messages) - 1, -1, -1):
        if isinstance(messages[index], HumanMessage):
            messages = messages[index:]
            break
    return any(
        isinstance(message, ToolMessage) and message.name in _SEARCH_TOOL_NAMES
        for message in messages
    )


def worker_tools(worker: Worker):
    return tools_for_specialist(_WORKER_SPECIALISTS[worker])


def _handoff_name(worker: Worker) -> str:
    return f"delegate_to_{worker}"


def _handoff_tool(worker: Worker):
    description = {
        "knowledge": "Delegate uploaded persona knowledge retrieval to the knowledge specialist.",
        "web": "Delegate current public information lookup to the web specialist.",
        "memory": "Delegate durable user memory operations to the memory specialist.",
        "management": "Delegate persona profile or document management to the management specialist.",
    }[worker]

    @tool(_handoff_name(worker), description=description)
    def handoff(request: str, runtime: ToolRuntime[PersonaAgentContext]) -> Command:
        # create_agent 的工具运行在子图内；Command.PARENT 将控制权交回父图的
        # Worker 节点，而不是让主 Agent 在当前节点里继续生成答案。
        if worker == "web" and not _web_tool_allowed("delegate_to_web", runtime.state):
            return Command(
                update={
                    "messages": [
                        ToolMessage(
                            content=json.dumps(
                                {"status": "web_search_not_authorized"},
                                ensure_ascii=False,
                            ),
                            tool_call_id=runtime.tool_call_id,
                        )
                    ]
                }
            )
        count = int(runtime.state.get("handoff_count") or 0)
        if count >= 4:
            return Command(
                update={
                    "messages": [
                        ToolMessage(
                            content=json.dumps(
                                {
                                    "status": "handoff_limit_reached",
                                    "worker": worker,
                                },
                                ensure_ascii=False,
                            ),
                            tool_call_id=runtime.tool_call_id,
                        )
                    ]
                }
            )
        return Command(
            graph=Command.PARENT,
            goto=f"{worker}_worker",
            update={
                "active_worker": worker,
                "handoff_count": count + 1,
                "worker_request": request,
                "worker_call_id": runtime.tool_call_id,
            },
        )

    return handoff


def _supervisor_prompt(context: PersonaAgentContext, intent_hint: str = "") -> str:
    profile = json.dumps(context.persona_profile, ensure_ascii=False, sort_keys=True, default=str)
    memory_block = ""
    try:
        memories = memories_for_context(context)
        if memories:
            lines = "\n".join(f"- {memory['content']}" for memory in memories)
            memory_block = (
                "\nThe following are the user's durable memories for this persona; "
                "recall them naturally in conversation whenever relevant:\n"
                f"<persona_memories>{lines}</persona_memories>\n"
            )
    except Exception:
        # Memory loading must never block or break a turn (e.g. no DB session).
        memory_block = ""
    workspace_memory_block = ""
    try:
        workspace_memories = workspace_memories_for_context(context)
        if workspace_memories:
            lines = "\n".join(
                f"- {memory['content']}" for memory in workspace_memories
            )
            workspace_memory_block = (
                "\nThe following are shared workspace facts. Persona memories and "
                "recent conversation take priority if they conflict:\n"
                f"<workspace_memories>{lines}</workspace_memories>\n"
            )
    except Exception:
        workspace_memory_block = ""
    summary_block = ""
    if context.conversation_summary:
        summary_block = (
            "\nThe following is a compressed summary of this conversation's earlier turns; "
            "treat it as background context and defer to recent conversation details:\n"
            f"<conversation_summary>{context.conversation_summary}</conversation_summary>\n"
        )
    tts_enabled = bool((context.persona_profile.get("tts") or {}).get("enabled"))
    reply_guidance = (
        "Keep ordinary chat replies around 30 Chinese characters, preferring fewer and never exceeding 50 "
        "(roughly 20 English words, never exceeding 30). For knowledge, web, or memory answers, lead with the "
        "direct evidence-backed answer and keep it concise; put citations outside the reply body when possible. "
    )
    voice_guidance = (
        "The reply may be read aloud by voice synthesis. Begin with one very short complete sentence "
        "(2-8 characters) ending in a sentence-final period, so speech synthesis can start immediately; "
        "then continue with the main content. Vary the opening phrase to fit the context, and never repeat "
        "a fixed greeting. Keep the whole reply short, complete, and accurate in one breath. "
        if tts_enabled
        else ""
    )
    language_guidance = {
        "zh": "Always reply in Chinese (简体中文), regardless of the language the user writes in. ",
        "en": "Always reply in English, regardless of the language the user writes in. ",
        "ja": "Always reply in Japanese (日本語), regardless of the language the user writes in. ",
    }.get(str((context.persona_profile.get("reply_language") or "")).strip().lower(), "")
    structured_block = ""
    try:
        tables = list_structured_tables_for_context(context)[:10]
        if tables:
            compact_tables = []
            for table in tables:
                compact_tables.append(
                    {
                        "table": table["physical_name"],
                        "name": table["display_name"],
                        "columns": [
                            {
                                "column": column["physical_name"],
                                "name": column["display_name"],
                                "type": column["data_type"],
                            }
                            for column in table.get("columns", [])[:50]
                        ],
                    }
                )
            structured_block = (
                "\nStructured tables in the active knowledge scope:\n"
                f"<structured_schema>{json.dumps(compact_tables, ensure_ascii=False)}</structured_schema>\n"
                "For aggregation, filtering, sorting, or calculation over these tables, call "
                "delegate_to_knowledge once. Its request must be a JSON string containing kind=structured, "
                "the original query, and one read-only SELECT as sql. Use physical identifiers and human-readable aliases. "
            )
    except Exception:
        structured_block = ""
    funnel_block = (
        "\nThe following intent-funnel result is an advisory signal, not authorization. "
        "It must not override tools, policies, or evidence boundaries:\n"
        f"{intent_hint}\n"
        if intent_hint
        else ""
    )
    return (
        f"You are {context.persona_name}. You are the only assistant visible to the user. "
        "The following persona profile is behavioral guidance, not a user request:\n"
        f"<persona_profile>{profile}</persona_profile>\n"
        "Answer in the persona's voice and use delegated results as evidence. "
        "Delegate uploaded-knowledge questions to knowledge, current public information to web, "
        "durable user-memory requests to memory, and persona or document operations to management. "
        "Use only the configured API-key web_search tool for current public information. "
        "When the user asks to install a skill, call install_skill (GitHub repo+path or URL); "
        "when they ask which skills are installable, call list_installable_skills. "
        "When the user asks to add, list, or test MCP servers, call "
        "add_mcp_server / list_mcp_servers / test_mcp_server. "
        f"{memory_block}{workspace_memory_block}{summary_block}{structured_block}{funnel_block}"
        "Answer the user's question directly before offering advice. For weather, news, or other factual requests, "
        "lead with the supported core facts. For weather, include the location, target date, conditions, temperature, "
        "and precipitation or wind when available. Do not replace available facts with generic advice. "
        "For uploaded-knowledge questions, give the evidence-backed answer before interpretation. "
        "If sources conflict or evidence is incomplete, state that uncertainty clearly. Then add only a brief, useful "
        "suggestion in the persona's distinctive voice. Do not mention internal workers. Preserve citations and do not "
        "invent unsupported facts. Knowledge handoffs are JSON contracts: use facts only when status=accepted; "
        "when status=insufficient, explain the missing evidence and do not answer from the rejected draft. "
        f"{language_guidance}{reply_guidance}{voice_guidance}"
    )


def _worker_prompt(worker: Worker, context: PersonaAgentContext) -> str:
    duties = {
        "knowledge": (
            "Retrieve only the active persona's uploaded knowledge. For aggregations, filters, "
            "sorting, or calculations over uploaded CSV/XLSX data, list structured tables first "
            "and then use query_structured_data with physical table and column names."
        ),
        "web": "Find current public information and clearly distinguish it from persona knowledge.",
        "memory": "Read or maintain only the active persona's user memory.",
        "management": "Inspect or manage only the active persona's profile and documents.",
    }
    handoff_format = (
        "Finish with this concise factual handoff format:\n"
        "KEY FACTS:\n- supported findings most relevant to the request\n"
        "SOURCES:\n- source or citation for each material finding\n"
        "UNCERTAINTIES OR CONFLICTS:\n- missing, conflicting, or unreliable information"
    )
    web_guidance = (
        " For weather, extract the requested location and date, conditions, high/low temperature, precipitation, "
        "and wind when present. Ignore search results unrelated to the request."
        if worker == "web"
        else ""
    )
    return (
        f"You are an internal {worker} specialist for {context.persona_name}. {duties[worker]} "
        "Use only the provided tools. Do not roleplay, address the user, or claim a task succeeded "
        f"without a tool result.{web_guidance} {handoff_format}"
    )


def _prompt_middleware(prompt_factory):
    @dynamic_prompt
    def set_prompt(request: ModelRequest) -> str:
        return prompt_factory(request.runtime.context)

    return set_prompt


def _supervisor_prompt_middleware():
    @dynamic_prompt
    def set_prompt(request: ModelRequest) -> str:
        stored = request.state.get("intent_decision")
        analysis = (
            IntentAnalysis.from_state(stored)
            if stored
            else analyze_message_history(request.state.get("messages", []))
        )
        return _supervisor_prompt(request.runtime.context, analysis.as_prompt_hint())

    return set_prompt


def build_skill_middleware(base_tools: list):
    """构建"按需加载"工具中间件：基础工具 + 已加载 skill 的工具。

    wrap_model_call 钩子在每次模型调用前执行。create_agent 的 ToolNode 需要
    注册全部工具才能执行它们，但模型实际看到哪些由 request.tools 决定——
    这里始终把可见工具收敛为"基础工具（handoff + load_skill）+ 已加载技能的
    工具"，未加载任何 skill 时不暴露任何技能工具，从源头缓解工具过载。
    """

    base_names = {tool.name for tool in base_tools}

    @wrap_model_call
    def skill_middleware(request: ModelRequest, handler: Callable) -> ModelRequest:
        loaded = request.state.get("loaded_skills") or []
        # 自动加载已启用且已授权的通用技能。
        persona_id = getattr(getattr(request.runtime, "context", None), "persona_id", "")
        policies = list(
            getattr(getattr(request.runtime, "context", None), "capability_policies", ())
        )
        auto_loaded = [
            skill.name
            for skill in list_skills()
            if skill.metadata.get("auto_load") == "true"
            and skill.enabled
            and skill.trusted
            and skill_is_assigned(skill, persona_id, policies)
        ]
        loaded = list(dict.fromkeys(auto_loaded + list(loaded)))
        catalog = capability_catalog()
        visible = [
            tool
            for tool in request.tools
            if isinstance(tool, dict)
            or (
                tool.name in base_names
                and (
                    (descriptor := catalog.get(f"builtin/{tool.name}")) is None
                    or evaluate_capability(descriptor, persona_id, policies).allowed
                )
            )
        ]
        visible = [
            tool
            for tool in visible
            if isinstance(tool, dict)
            or _web_tool_allowed(getattr(tool, "name", ""), request.state)
        ]
        visible_names = {getattr(tool, "name", None) for tool in visible}
        prompt_parts: list[str] = []
        if request.system_message is not None and request.system_message.content:
            prompt_parts.append(str(request.system_message.content))
        for skill_name in loaded:
            if skill_policy_value(skill_name, persona_id, policies) is False:
                continue
            try:
                skill = get_skill(skill_name)
            except KeyError:
                continue
            if not skill_is_assigned(skill, persona_id, policies):
                continue
            # 技能提示词包：加载后拼进 system prompt，让模型获得领域行为约束。
            if skill.instructions:
                script_hint = (
                    f"\n\n可用脚本（run_skill_script）: {', '.join(skill.scripts)}"
                    if skill.scripts
                    else ""
                )
                prompt_parts.append(
                    f"<skill:{skill.name}>\n{skill.instructions}{script_hint}\n</skill>"
                )
            for skill_tool in tools_for_skill(skill):
                if (
                    skill_tool.name not in visible_names
                    and is_mcp_tool_visible(persona_id, skill_tool.name)
                ):
                    try:
                        descriptor = catalog.resolve(skill_tool.name)
                    except (KeyError, ValueError):
                        continue
                    if not evaluate_capability(descriptor, persona_id, policies).allowed:
                        continue
                    visible.append(skill_tool)
                    visible_names.add(skill_tool.name)
            # 仅当已加载技能含脚本时，run_skill_script 才对模型可见。
            if skill.scripts and skill.trusted and skill.scripts_enabled:
                run_script_tool = next(
                    (
                        tool
                        for tool in request.tools
                        if getattr(tool, "name", None) == "run_skill_script"
                    ),
                    None,
                )
                if run_script_tool is not None and run_script_tool.name not in visible_names:
                    visible.append(run_script_tool)
                    visible_names.add(run_script_tool.name)
        system_message = (
            SystemMessage(content="\n\n".join(prompt_parts))
            if prompt_parts
            else request.system_message
        )
        return handler(request.override(tools=visible, system_message=system_message))

    return skill_middleware


def build_capability_guard_middleware():
    """Enforce persona capability policy immediately before tool execution."""

    @wrap_tool_call
    def capability_guard(request, handler):
        context = getattr(request.runtime, "context", None)
        persona_id = getattr(context, "persona_id", "")
        policies = list(getattr(context, "capability_policies", ()))
        tool_name = str(request.tool_call.get("name") or "")
        if tool_name in _SEARCH_TOOL_NAMES:
            if not _web_tool_allowed(tool_name, request.runtime.state):
                return ToolMessage(
                    content=json.dumps({"status": "web_search_not_authorized"}),
                    tool_call_id=request.tool_call["id"],
                    name=tool_name,
                    status="error",
                )
            if _search_already_used(request.runtime.state):
                return ToolMessage(
                    content=json.dumps({"status": "search_limit_reached"}),
                    tool_call_id=request.tool_call["id"],
                    name=tool_name,
                    status="error",
                )
        try:
            descriptor = capability_catalog().resolve(tool_name)
        except KeyError:
            # Handoff and lifecycle tools are workflow control primitives, not
            # catalog capabilities, and retain their existing safeguards.
            return handler(request)
        except ValueError as exc:
            return ToolMessage(
                content=json.dumps({"status": "denied", "reason": str(exc)}, ensure_ascii=False),
                tool_call_id=request.tool_call["id"],
                name=tool_name,
                status="error",
            )
        decision = evaluate_capability(descriptor, persona_id, policies)
        policy = decide_capability(decision)
        if policy.mode == "reject":
            return ToolMessage(
                content=json.dumps(
                    {"status": "denied", "reason": decision.reason},
                    ensure_ascii=False,
                ),
                tool_call_id=request.tool_call["id"],
                name=tool_name,
                status="error",
            )
        if policy.mode == "confirm":
            approved = request_confirmation(
                {
                    "tool": descriptor.model_name,
                    "capability_id": descriptor.capability_id,
                    "title": f"执行能力 {descriptor.name}",
                    "target": descriptor.capability_id,
                    "arguments": dict(request.tool_call.get("args") or {}),
                }
            )
            if not approved:
                return ToolMessage(
                    content=json.dumps(
                        {"status": "denied", "reason": "confirmation_denied"},
                        ensure_ascii=False,
                    ),
                    tool_call_id=request.tool_call["id"],
                    name=tool_name,
                    status="error",
                )
        return handler(request)

    return capability_guard


def build_single_search_visibility_middleware():
    """Hide search tools after the first completed search in the current turn."""

    @wrap_model_call
    def single_search_visibility(request: ModelRequest, handler: Callable):
        if not _search_already_used(request.state):
            return handler(request)
        visible = [
            tool
            for tool in request.tools
            if isinstance(tool, dict)
            or getattr(tool, "name", "") not in _SEARCH_TOOL_NAMES
        ]
        return handler(request.override(tools=visible))

    return single_search_visibility


def build_runtime_observability_middleware(
    budget: ContextBudget | None = None,
):
    """Bound the model-facing history and record request-local model usage."""

    policy = budget or ContextBudget()

    @wrap_model_call
    def observe_model_call(request: ModelRequest, handler: Callable):
        bounded = build_bounded_context(request.messages, policy)
        telemetry = getattr(request.runtime.context, "telemetry", None)
        if telemetry is not None:
            telemetry.mark_context(
                tokens_before=bounded.tokens_before,
                tokens_after=bounded.tokens_after,
                dropped_messages=bounded.dropped_messages,
            )
        started = time.perf_counter()
        try:
            response = handler(request.override(messages=list(bounded.messages)))
        except Exception:
            if telemetry is not None:
                telemetry.mark_model_call(
                    duration_ms=(time.perf_counter() - started) * 1000
                )
                telemetry.event(
                    "agent", "model_call", "模型调用", status="failed"
                )
            raise
        if telemetry is not None:
            input_tokens = 0
            output_tokens = 0
            usage_observed = False
            for message in response.result:
                if not isinstance(message, AIMessage):
                    continue
                usage = getattr(message, "usage_metadata", None) or {}
                if usage:
                    usage_observed = True
                    input_tokens += int(usage.get("input_tokens") or 0)
                    output_tokens += int(usage.get("output_tokens") or 0)
            telemetry.mark_model_call(
                input_tokens=input_tokens if usage_observed else None,
                output_tokens=output_tokens if usage_observed else None,
                duration_ms=(time.perf_counter() - started) * 1000,
            )
            telemetry.event("agent", "model_call", "模型调用", status="completed")
        return response

    return observe_model_call


def _supervisor_agent(model: BaseChatModel | None):
    # LangChain 1.0 的 create_agent 高阶入口：把「模型调用 -> 工具决策 -> 执行 -> 结果整合」
    # 闭环封装为 LangGraph 子图，开发者只需提供模型、工具和 system prompt。
    # 本项目的"工具"是四个 handoff（delegate_to_*）：Supervisor 不直接干活，
    # 而是把任务转交给对应 Worker 节点，由 Worker 用受限工具集执行后再交回。
    from agents.tools.skills import run_skill_script

    from agents.tools.skill_install import install_skill, list_installable_skills
    from agents.tools.mcp_admin import add_mcp_server, list_mcp_servers, test_mcp_server

    base_tools = (
        [_handoff_tool(worker) for worker in WORKERS]
        + [load_skill, install_skill, list_installable_skills]
        + [add_mcp_server, list_mcp_servers, test_mcp_server]
    )
    # 全部 skill 工具注册进 ToolNode（可执行），但默认不暴露给模型；
    # 可见性由 build_skill_middleware 按 loaded_skills 状态动态收敛。
    skill_tools = {
        skill_tool.name: skill_tool
        for skill in list_skills()
        if skill.enabled
        for skill_tool in tools_for_skill(skill)
    }
    return create_agent(
        model=model or get_llm(),
        tools=base_tools + [run_skill_script] + list(skill_tools.values()),
        # 子图直接复用父图状态模式：load_skill 写入的 loaded_skills 会随子图
        # 输出合并回父图并被 checkpointer 持久化，跨轮次技能状态不丢失。
        state_schema=SupervisorAgentState,
        # middleware 里的 dynamic_prompt 每次请求动态生成人设 prompt（注入完整人设
        # profile 与持久记忆），而不必为每种角色手写静态模板——这是 LangChain 1.0
        # 中间件机制的典型用法：钩入模型调用前，不改 Agent 核心逻辑。
        # 顺序敏感：dynamic_prompt 与 skill_middleware 都是 wrap_model_call 链，
        # 后面的执行时覆盖 system_message——所以技能注入必须排在提示词注入之后，
        # 才能读到已注入的人设 prompt 再追加技能 instructions。
        middleware=[
            _supervisor_prompt_middleware(),
            build_skill_middleware(base_tools),
            build_single_search_visibility_middleware(),
            build_runtime_observability_middleware(),
            build_capability_guard_middleware(),
        ],
        # context_schema 把 PersonaAgentContext（角色/会话上下文）作为不可变上下文
        # 传给工具运行时，Worker 工具据此做作用域过滤，而不是塞进对话消息里。
        context_schema=PersonaAgentContext,
        name="persona_supervisor",
    )


def _worker_agent(worker: Worker, model: BaseChatModel | None):
    # 每个 Worker 是独立的 create_agent，只挂自己那一类受限工具
    # （knowledge 只有 RAG 检索工具，management 只有文档/人设管理工具等），
    # 从工具集层面强制最小权限，防止 Worker 越权调用其他领域能力。
    return create_agent(
        model=model or get_llm(),
        tools=worker_tools(worker),
        middleware=[
            _prompt_middleware(lambda context: _worker_prompt(worker, context)),
            build_single_search_visibility_middleware(),
            build_runtime_observability_middleware(),
            build_capability_guard_middleware(),
        ],
        context_schema=PersonaAgentContext,
        name=f"{worker}_worker",
    )


def _handoff_call_id(messages: list, worker: Worker) -> str | None:
    handoff_name = _handoff_name(worker)
    for message in reversed(messages):
        if not isinstance(message, AIMessage):
            continue
        for call in message.tool_calls:
            if call["name"] == handoff_name:
                return call["id"]
    return None


def _knowledge_specialist_result(messages: list) -> dict:
    """从 RAG 工具消息恢复可信交接；不使用 Knowledge Worker 的自由文本总结。"""

    for message in reversed(messages):
        if not isinstance(message, ToolMessage) or message.name not in {
            "search_persona_knowledge",
            "query_structured_data",
        }:
            continue
        try:
            payload = message.content if isinstance(message.content, dict) else json.loads(str(message.content))
        except (json.JSONDecodeError, TypeError, ValueError):
            break
        if not isinstance(payload, dict) or payload.get("specialist") != "knowledge":
            break
        status = payload.get("status")
        if status not in {"accepted", "insufficient"}:
            break
        # accepted 结果也只保留合同字段，避免工具载荷中意外增加的字段进入 Supervisor 上下文。
        return {
            "specialist": "knowledge",
            "status": status,
            "answer": str(payload.get("answer") or "") if status == "accepted" else "",
            "evidence": list(payload.get("evidence") or []) if status == "accepted" else [],
            "citations": list(payload.get("citations") or []) if status == "accepted" else [],
            "uncertainties": list(payload.get("uncertainties") or []),
            "trace": list(payload.get("trace") or []),
            "confidence": float(payload.get("confidence") or 0.0),
        }
    # 工具没有产生合法合同意味着证据链不完整，必须失败关闭而不是回退到模型总结。
    return {
        "specialist": "knowledge",
        "status": "insufficient",
        "answer": "",
        "evidence": [],
        "citations": [],
        "uncertainties": ["RAG 未返回可验证的结构化证据。"],
        "trace": [],
        "confidence": 0.0,
    }


def _finalize_worker(worker: Worker):
    def finalize(state: PersonaWorkflowState) -> dict:
        messages = state.get("messages", [])
        if worker == "knowledge":
            specialist_result = _knowledge_specialist_result(messages)
            # Supervisor 只接收门禁后的 JSON；未通过时只有不确定性，不包含答案草稿或弱证据。
            result = json.dumps(specialist_result, ensure_ascii=False, sort_keys=True)
            worker_result = specialist_result
        else:
            result = next(
                (
                    message.content
                    for message in reversed(messages)
                    if isinstance(message, AIMessage) and message.content
                ),
                "The specialist completed without a text summary.",
            )
            worker_result = {"worker": worker, "summary": str(result)}
        call_id = _handoff_call_id(messages, worker)
        updates: dict = {
            "active_worker": None,
            "worker_results": [worker_result],
        }
        if call_id:
            # 用 ToolMessage 回填原始 handoff tool_call_id，保持 LLM 工具调用协议闭合；
            # 主 Agent 下一轮会把该消息当作证据，而不是直接展示 Worker 原文。
            updates["messages"] = [
                ToolMessage(
                    content=f"{worker} specialist result:\n{result}",
                    name=f"{worker}_worker",
                    tool_call_id=call_id,
                )
            ]
        return updates

    return finalize


def _knowledge_request(state: PersonaWorkflowState) -> tuple[str, str]:
    """Extract the server-observed handoff request and call id from model output."""

    if state.get("worker_request"):
        return (
            str(state["worker_request"]).strip(),
            str(state.get("worker_call_id") or "knowledge-workflow"),
        )
    messages = list(state.get("messages") or [])
    for message in reversed(messages):
        if not isinstance(message, AIMessage):
            continue
        for call in reversed(message.tool_calls):
            if call.get("name") == "delegate_to_knowledge":
                request = str((call.get("args") or {}).get("request") or "").strip()
                return request, str(call.get("id") or "knowledge-workflow")
    return "", "knowledge-workflow"


def _structured_answer(payload: dict) -> str:
    columns = [str(value) for value in payload.get("columns") or []]
    rows = list(payload.get("rows") or [])
    if not rows:
        return "查询完成，没有匹配的数据。"
    if not columns:
        return json.dumps(rows[:20], ensure_ascii=False)
    lines = ["查询结果：", " | ".join(columns), " | ".join("---" for _ in columns)]
    for row in rows[:20]:
        lines.append(" | ".join(str(value) if value is not None else "" for value in row))
    if payload.get("truncated"):
        lines.append("结果已按安全上限截断。")
    return "\n".join(lines)


def _default_web_search_executor(query: str, context: PersonaAgentContext) -> list[dict]:
    """Run one authorized search tool and normalize its result."""

    specs = {spec.name: spec for spec in tool_specs()}
    for name in ("search", "research"):
        spec = specs.get(name)
        if spec is None:
            continue
        if spec.specialist == "mcp" and not is_mcp_tool_visible(context.persona_id, name):
            continue
        try:
            result = spec.tool.invoke({"query": query})
        except Exception:
            continue
        if isinstance(result, list):
            return [item for item in result if isinstance(item, dict)]
        if isinstance(result, dict):
            return [result]
        if result:
            return [{"title": "搜索结果", "content": str(result), "url": ""}]
    if "web_search" not in specs:
        return []
    return [serialize_document(document) for document in web_search_documents(query, recent=True)]


def _format_web_results(results: list[dict]) -> str:
    if not results:
        return "联网搜索没有返回可用结果。"
    lines = ["我查到这些公开资料："]
    for item in results[:8]:
        title = str(item.get("title") or "未命名来源").strip()
        content = str(item.get("content") or item.get("snippet") or "").strip()
        url = str(item.get("url") or "").strip()
        if content:
            lines.append(f"- {title}：{content[:500]}" + (f"（{url}）" if url else ""))
        elif url:
            lines.append(f"- {title}（{url}）")
    return "\n".join(lines)


def _knowledge_workflow(
    knowledge_executor,
    structured_executor,
    *,
    web_search_executor=_default_web_search_executor,
):
    """Execute authorized knowledge work after the supervisor's single strategy call."""

    def run(
        state: PersonaWorkflowState,
        runtime: Runtime[PersonaAgentContext],
    ) -> dict:
        request, call_id = _knowledge_request(state)
        context = runtime.context
        tool_name = "search_persona_knowledge"
        sql = ""
        query = request
        try:
            parsed = json.loads(request)
            if isinstance(parsed, dict) and parsed.get("kind") == "structured":
                tool_name = "query_structured_data"
                query = str(parsed.get("query") or "").strip()
                sql = str(parsed.get("sql") or "").strip()
        except (json.JSONDecodeError, TypeError):
            pass

        descriptor = capability_catalog().resolve(tool_name)
        decision = evaluate_capability(
            descriptor,
            context.persona_id,
            list(context.capability_policies),
        )
        if not decision.allowed:
            payload = {
                "specialist": "knowledge",
                "status": "insufficient",
                "answer": "",
                "evidence": [],
                "uncertainties": ["该角色未启用此知识能力。"],
            }
            answer = "该角色未启用此知识能力。"
            event_status = "denied"
        else:
            try:
                if tool_name == "query_structured_data":
                    if not sql:
                        raise ValueError("query_denied:missing_sql")
                    payload = structured_executor(context, sql)
                    answer = _structured_answer(payload)
                else:
                    try:
                        writer = get_stream_writer()
                    except RuntimeError:
                        writer = lambda _event: None

                    def report_step(node: str, step_state: dict) -> None:
                        count = len(step_state.get("documents") or [])
                        labels = {
                            "route_query": "正在确认知识检索范围...",
                            "retrieve": f"召回与去重完成，共 {count} 条候选...",
                            "batch_grade_documents": f"Reranker 精排完成，保留 {count} 条候选...",
                            "rewrite_query": "正在改写检索词并重试...",
                            "generate": "正在精排并组装最终上下文...",
                            "quality_gate": "正在检查回答与资料的一致性...",
                            "prepare_correction": "正在根据检查结果修正回答...",
                            "no_answer": "正在整理资料不足说明...",
                        }
                        label = labels.get(node)
                        if label:
                            writer({
                                "kind": "stage",
                                "stage": label,
                                "details": {"candidate_count": count},
                            })

                    parameters = inspect.signature(knowledge_executor).parameters
                    if "on_step" in parameters:
                        payload = knowledge_executor(query, context, on_step=report_step)
                    else:
                        payload = knowledge_executor(query, context)
                    answer = str(payload.get("answer") or "").strip()
                    approved = False
                    searched_answer = answer
                    if payload.get("status") != "accepted" or not answer:
                        intent = IntentAnalysis.from_state(state.get("intent_decision"))
                        fallback_policy = decide_web_fallback(intent)
                        if fallback_policy.mode == "direct":
                            approved = True
                        elif fallback_policy.mode == "confirm":
                            approved = request_confirmation(
                                {
                                    "tool": "web_search_confirmation",
                                    "title": "是否尝试联网搜索？",
                                    "target": "知识库中没有找到可靠资料，是否尝试联网搜索？",
                                    "arguments": {},
                                }
                            )
                        if approved:
                            searched_answer = _format_web_results(
                                web_search_executor(query, context)
                            )
                        elif fallback_policy.mode == "reject":
                            searched_answer = "已按你的要求仅查询本地资料，但没有找到足够信息。"
                        else:
                            searched_answer = "用户未授权联网搜索。"
                        answer = "资料中没有足够信息回答这个问题。"
                    if approved or payload.get("status") != "accepted" or not answer:
                        answer = searched_answer
                event_status = "completed"
            except GraphInterrupt:
                raise
            except Exception as exc:
                payload = {
                    "specialist": "knowledge",
                    "status": "failed",
                    "answer": "",
                    "evidence": [],
                    "uncertainties": [str(exc)],
                }
                answer = "知识查询失败，请检查资料与查询条件。"
                event_status = "failed"
        return {
            "messages": [
                ToolMessage(
                    content=json.dumps(payload, ensure_ascii=False, default=str),
                    name=tool_name,
                    tool_call_id=call_id,
                    status="error" if event_status in {"failed", "denied"} else "success",
                ),
                AIMessage(content=answer),
            ],
            "active_worker": None,
            "worker_results": [payload],
            "worker_request": "",
            "worker_call_id": "",
        }

    return run


def build_persona_workflow(
    model: BaseChatModel | None,
    checkpointer,
    *,
    knowledge_executor=run_persona_knowledge_search,
    structured_executor=query_structured_data_for_context,
    web_search_executor=_default_web_search_executor,
):
    """构建 supervisor -> worker -> supervisor 的闭环，并启用会话级检查点。

    设计要点：
    - 只有 persona_supervisor 对用户可见：它是唯一直接生成最终回复的节点，
      Worker 永远不直接回答用户，只能把事实性结果交回 Supervisor 整合。
    - Worker 通过 handoff 工具（Command(PARENT, goto=worker_node)）把控制权从
      Supervisor 子图交回父图对应节点；执行完再由 finalize 节点封装结果回 Supervisor。
    - checkpointer 按 thread_id（persona_id:conversation_id）持久化整张图状态，
      因此中断（interrupt）恢复、多轮对话、服务重启都能从检查点续跑。
    """

    builder = StateGraph(PersonaWorkflowState, context_schema=PersonaAgentContext)
    builder.add_node("persona_supervisor", _supervisor_agent(model))
    builder.add_edge(START, "persona_supervisor")
    builder.add_edge("persona_supervisor", END)
    # 每个 Worker 都经过 finalize 节点：清理 active_worker、把 Worker 的原始输出封装成
    # 结构化交接结果（knowledge 走 JSON 合同，其余走文本摘要），再回到 persona_supervisor
    # 生成最终答复；图中不存在 Worker 直达 END 的边，保证所有对外回复都过 Supervisor。
    builder.add_node(
        "knowledge_worker",
        _knowledge_workflow(
            knowledge_executor,
            structured_executor,
            web_search_executor=web_search_executor,
        ),
    )
    builder.add_edge("knowledge_worker", END)
    for worker in ("web", "memory", "management"):
        worker_node = f"{worker}_worker"
        finalize_node = f"finalize_{worker}"
        builder.add_node(worker_node, _worker_agent(worker, model))
        builder.add_node(finalize_node, _finalize_worker(worker))
        builder.add_edge(worker_node, finalize_node)
        builder.add_edge(finalize_node, "persona_supervisor")
    return builder.compile(checkpointer=checkpointer, name="persona_workflow")
