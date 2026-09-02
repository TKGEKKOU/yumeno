"""LangChain agent middleware for skills, capability guards, and observability."""

from __future__ import annotations

import json
import time
from typing import Callable

from langgraph.config import get_stream_writer

from langchain.agents.middleware import ModelRequest, dynamic_prompt, wrap_model_call, wrap_tool_call
from langchain.messages import AIMessage, SystemMessage, ToolMessage

from agents.capabilities import evaluate_capability, skill_is_assigned, skill_policy_value
from agents.confirmation_policy import decide_capability
from agents.context_budget import ContextBudget, build_bounded_context
from agents.graph.policy import _SEARCH_TOOL_NAMES, _search_already_used, _web_tool_allowed
from agents.mcp_grants import is_mcp_tool_visible
from agents.registry import capability_catalog
from agents.skills import get_skill, list_skills, tools_for_skill
from agents.tools.management import request_confirmation


def _prompt_middleware(prompt_factory):
    @dynamic_prompt
    def set_prompt(request: ModelRequest) -> str:
        return prompt_factory(request.runtime.context)

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
        try:
            get_stream_writer()({"kind": "stage", "stage": f"正在执行工具 {tool_name}", "details": {"tool": tool_name}})
        except RuntimeError:
            pass
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



def build_worker_action_tool_middleware(worker: str):
    """按结构化 dispatch action 收窄 Worker 的模型可见工具。

    RVC 的准备/恢复/转换是互斥阶段。仅在工具执行层拒绝错误调用还不够：
    模型会把 denied 当作新证据继续尝试其它工具，最终可能回退到旧的
    waiting_input。这里在每次模型调用前直接隐藏不属于当前 action 的工具，
    保留 Agent、Supervisor、worker 的原有架构不变。
    """
    action_tools = {
        "prepare_and_separate": {"prepare_rvc_source"},
        "session_status": {"get_rvc_session"},
        "separate_vocals": {"separate_rvc_vocals"},
        "convert": {"convert_audio_with_rvc"},
        "cancel": {"cancel_rvc_task"},
    }

    @wrap_model_call
    def worker_action_tools(request: ModelRequest, handler: Callable):
        if worker != "rvc_worker":
            return handler(request)
        dispatch = request.state.get("dispatch_request") or request.state.get("pending_task") or {}
        options = dispatch.get("options") if isinstance(dispatch, dict) else {}
        raw_action = dispatch.get("action") if isinstance(dispatch, dict) else None
        raw_action = raw_action or (options.get("action") if isinstance(options, dict) else None)
        action = str(raw_action or "").strip().lower()
        allowed = action_tools.get(action)
        if not allowed:
            return handler(request)
        visible = [
            item for item in request.tools
            if isinstance(item, dict) or getattr(item, "name", "") in allowed
        ]
        # 隐藏其它工具仍可能让模型直接输出自由文本，随后回退成旧确认卡。
        # action 是 Supervisor 已校验的结构化合同，因此在单工具阶段强制调用。
        if len(visible) == 1 and not isinstance(visible[0], dict):
            return handler(request.override(
                tools=visible,
                tool_choice={"type": "function", "function": {"name": visible[0].name}},
            ))
        return handler(request.override(tools=visible))

    return worker_action_tools

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
