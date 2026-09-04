"""Knowledge worker: planner agent plus deterministic retrieve/fallback."""

from __future__ import annotations

import inspect
import json
import logging
import time

from langchain.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain.tools import tool
from langchain_core.language_models import BaseChatModel
from langgraph.config import get_stream_writer
from langgraph.constants import END, START
from langgraph.errors import GraphInterrupt
from langgraph.graph import StateGraph
from langgraph.runtime import Runtime

from agents.capabilities import evaluate_capability
from agents.confirmation_policy import decide_web_fallback
from agents.context import PersonaAgentContext
from agents.graph.state import PersonaWorkflowState
from agents.intent_funnel import IntentAnalysis
from agents.mcp_grants import is_mcp_tool_visible
from agents.registry import capability_catalog, tool_specs
from agents.tools.management import request_confirmation
from agents.tools.knowledge import run_persona_web_grounded_search
from rag.adaptive_graph import serialize_document
from rag.contracts import RagErrorCode, public_rag_error_message
from rag.llm import get_llm
from rag.web_search import web_search_documents


logger = logging.getLogger(__name__)


_KNOWLEDGE_CONTRACT_TOOLS = {
    "search_persona_knowledge",
    "query_structured_data",
    "web_search",
}


def _current_knowledge_messages(messages: list) -> list:
    """只看本轮 knowledge handoff 之后的消息，避免复用上一轮合同。"""

    current = list(messages or [])
    for index in range(len(current) - 1, -1, -1):
        message = current[index]
        if isinstance(message, AIMessage):
            for call in message.tool_calls:
                if call.get("name") == "delegate_to_knowledge":
                    return current[index:]
        if isinstance(message, HumanMessage):
            return current[index:]
    return current


def _parse_knowledge_contract(message) -> dict | None:
    if not isinstance(message, ToolMessage) or message.name not in _KNOWLEDGE_CONTRACT_TOOLS:
        return None
    try:
        payload = message.content if isinstance(message.content, dict) else json.loads(str(message.content))
    except (json.JSONDecodeError, TypeError, ValueError):
        return None
    if not isinstance(payload, dict) or payload.get("specialist") != "knowledge_worker":
        return None
    if payload.get("status") not in {"accepted", "insufficient", "failed"}:
        return None
    return payload


def _latest_knowledge_contract(messages: list) -> tuple[dict | None, str]:
    for message in reversed(_current_knowledge_messages(messages)):
        payload = _parse_knowledge_contract(message)
        if payload is not None:
            return payload, str(message.name)
    return None, ""


def _knowledge_specialist_result(messages: list) -> dict:
    """从 RAG / SQL / 联网兜底工具消息恢复可信交接；不使用 Worker 自由文本。"""

    payload, _tool_name = _latest_knowledge_contract(messages)
    if payload is not None:
        status = payload.get("status")
        if status in {"accepted", "insufficient", "failed"}:
            # accepted 结果也只保留合同字段，避免工具载荷中意外增加的字段进入 Supervisor 上下文。
            error_code = payload.get("error_code")
            error_message = payload.get("error_message")
            if error_code and not error_message:
                error_message = public_rag_error_message(error_code)
            return {
                "specialist": "knowledge_worker",
                "status": status,
                "answer": str(payload.get("answer") or "") if status == "accepted" else "",
                "evidence": list(payload.get("evidence") or []) if status == "accepted" else [],
                "citations": list(payload.get("citations") or []) if status == "accepted" else [],
                "uncertainties": list(payload.get("uncertainties") or []),
                "trace": list(payload.get("trace") or []),
                "confidence": float(payload.get("confidence") or 0.0),
                "error": (
                    {"code": str(error_code), "message": str(error_message)}
                    if error_code
                    else None
                ),
            }
    # 工具没有产生合法合同意味着证据链不完整，必须失败关闭而不是回退到模型总结。
    return {
        "specialist": "knowledge_worker",
        "status": "insufficient",
        "answer": "",
        "evidence": [],
        "citations": [],
        "uncertainties": ["RAG 未返回可验证的结构化证据。"],
        "trace": [],
        "confidence": 0.0,
    }

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
    # Legacy executor callers expect the original normalized document shape.  The
    # evidence role is added when the result enters the formal RAG contract, not
    # at this compatibility seam.
    return [
        {
            key: value
            for key, value in serialize_document(document).items()
            if key != "evidence_role"
        }
        for document in web_search_documents(query, recent=True)
    ]


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


def _accepted_web_payload(query: str, answer: str, results: list[dict]) -> dict:
    evidence = [
        {
            "source": "web_search",
            "title": str(item.get("title") or ""),
            "content": str(item.get("content") or item.get("snippet") or ""),
            "url": str(item.get("url") or ""),
        }
        for item in results[:8]
        if isinstance(item, dict)
    ]
    return {
        "specialist": "knowledge_worker",
        "status": "accepted",
        "answer": answer,
        "evidence": evidence,
        "citations": [{"title": item.get("title"), "url": item.get("url")} for item in evidence],
        "uncertainties": [],
        "trace": [{"node": "web_fallback", "query": query}],
        "confidence": 0.7 if evidence else 0.0,
    }


def _knowledge_plan_tools():
    @tool("search_persona_knowledge")
    def search_persona_knowledge(query: str) -> dict:
        """Search the active persona's uploaded knowledge with corrective RAG."""

        raise RuntimeError("schema-only knowledge tool cannot be executed")

    @tool("query_structured_data")
    def query_structured_data(sql: str) -> dict:
        """Run one bounded read-only SELECT against an active structured table."""

        raise RuntimeError("schema-only knowledge tool cannot be executed")

    return [search_persona_knowledge, query_structured_data]


def _knowledge_planner_prompt(context: PersonaAgentContext) -> str:
    return (
        f"You are an internal knowledge planner for {context.persona_name}. "
        "Call exactly one tool, then stop. Use search_persona_knowledge for uploaded "
        "knowledge questions. If worker_request is JSON with kind=structured, call "
        "query_structured_data with the provided sql and do not invent SQL. "
        "Do not roleplay, address the user, search the public web, or summarize freely. "
        "Leave retrieval and web fallback to deterministic executors."
    )


def _as_ai_message(result) -> AIMessage:
    if isinstance(result, AIMessage):
        return result
    if isinstance(result, list):
        for item in result:
            if isinstance(item, AIMessage):
                return item
    return AIMessage(content=str(result or ""))


def _knowledge_planner(model: BaseChatModel | None):
    plan_tools = _knowledge_plan_tools()

    def run(state: PersonaWorkflowState, runtime: Runtime[PersonaAgentContext]) -> dict:
        request, _call_id = _knowledge_request(state)
        if _parse_structured_request(request) is not None:
            # Supervisor 已给出 SQL 合同：planner 只在需要选择检索方式时才调用 LLM，
            # 避免二次选工具或发明 SQL。
            return {}
        context = runtime.context
        try:
            writer = get_stream_writer()
            writer({"kind": "stage", "stage": "正在检查知识能力权限..."})
            writer({"kind": "stage", "stage": "正在规划知识检索"})
        except RuntimeError:
            pass
        try:
            llm = model or get_llm()
            bound = llm.bind_tools(plan_tools)
            started = time.perf_counter()
            message = _as_ai_message(
                bound.invoke(
                    [
                        SystemMessage(content=_knowledge_planner_prompt(context)),
                        HumanMessage(content=request or "Retrieve relevant knowledge."),
                    ]
                )
            )
            telemetry = getattr(context, "telemetry", None)
            if telemetry is not None:
                telemetry.mark_model_call(
                    duration_ms=(time.perf_counter() - started) * 1000
                )
            return {"messages": [message]}
        except GraphInterrupt:
            raise
        except Exception:
            return {}

    return run


def _parse_structured_request(request: str) -> dict | None:
    try:
        parsed = json.loads(request)
    except (json.JSONDecodeError, TypeError):
        return None
    if isinstance(parsed, dict) and parsed.get("kind") == "structured":
        return parsed
    return None


def _latest_planner_tool_call(messages: list) -> dict | None:
    for message in reversed(_current_knowledge_messages(messages)):
        if not isinstance(message, AIMessage):
            continue
        for call in reversed(message.tool_calls or []):
            if call.get("name") in {"search_persona_knowledge", "query_structured_data"}:
                return call
    return None


def _resolve_knowledge_plan(state: PersonaWorkflowState) -> dict:
    request, handoff_id = _knowledge_request(state)
    structured = _parse_structured_request(request)
    planner_call = _latest_planner_tool_call(state.get("messages") or [])
    plan_call_id = str((planner_call or {}).get("id") or "") or f"{handoff_id}:plan"
    if structured is not None:
        query = str(structured.get("query") or "").strip() or request
        sql = str(structured.get("sql") or "").strip()
        return {
            "tool_name": "query_structured_data",
            "query": query,
            "sql": sql,
            "plan_call_id": plan_call_id,
        }
    if planner_call is not None and planner_call.get("name") == "search_persona_knowledge":
        args = planner_call.get("args") or {}
        query = str(args.get("query") or request).strip() or request
        return {
            "tool_name": "search_persona_knowledge",
            "query": query,
            "sql": "",
            "plan_call_id": plan_call_id,
        }
    return {
        "tool_name": "search_persona_knowledge",
        "query": request,
        "sql": "",
        "plan_call_id": plan_call_id,
    }


def _merge_knowledge_updates(state: dict, updates: dict | None) -> dict:
    merged = dict(state)
    for key, value in (updates or {}).items():
        if key == "messages":
            merged[key] = list(merged.get("messages") or []) + list(value or [])
        else:
            merged[key] = value
    return merged


def _contract_payload(payload: dict, *, web_fallback: bool) -> dict:
    data = dict(payload or {})
    data["specialist"] = "knowledge_worker"
    data["web_fallback"] = bool(web_fallback)
    return data


def _knowledge_tool_message(payload: dict, tool_name: str, tool_call_id: str, event_status: str) -> ToolMessage:
    return ToolMessage(
        content=json.dumps(payload, ensure_ascii=False, default=str),
        name=tool_name,
        tool_call_id=tool_call_id,
        status="error" if event_status in {"failed", "denied"} else "success",
    )


def _run_knowledge_search(knowledge_executor, query: str, context: PersonaAgentContext) -> dict:
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
        return knowledge_executor(query, context, on_step=report_step)
    return knowledge_executor(query, context)


def _knowledge_retrieve(knowledge_executor, structured_executor):
    def run(state: PersonaWorkflowState, runtime: Runtime[PersonaAgentContext]) -> dict:
        context = runtime.context
        plan = _resolve_knowledge_plan(state)
        tool_name = plan["tool_name"]
        query = plan["query"]
        sql = plan["sql"]
        plan_call_id = plan["plan_call_id"]
        existing_payload, existing_tool = _latest_knowledge_contract(state.get("messages") or [])
        if existing_payload is not None and existing_tool != "web_search":
            payload = _contract_payload(
                existing_payload,
                web_fallback=bool(existing_payload.get("web_fallback")),
            )
            return {"worker_results": [payload]}

        descriptor = capability_catalog().resolve(tool_name)
        decision = evaluate_capability(
            descriptor,
            context.persona_id,
            list(context.capability_policies),
        )
        if not decision.allowed:
            payload = _contract_payload(
                {
                    "status": "insufficient",
                    "answer": "",
                    "evidence": [],
                    "uncertainties": ["该角色未启用此知识能力。"],
                },
                web_fallback=False,
            )
            return {
                "messages": [_knowledge_tool_message(payload, tool_name, plan_call_id, "denied")],
                "worker_results": [payload],
            }
        try:
            if tool_name == "query_structured_data":
                if not sql:
                    raise ValueError("query_denied:missing_sql")
                raw = structured_executor(context, sql)
                answer = str(raw.get("answer") or "").strip() or _structured_answer(raw)
                payload = _contract_payload(
                    {
                        **raw,
                        "status": raw.get("status") or "accepted",
                        "answer": answer,
                    },
                    web_fallback=False,
                )
                event_status = "failed" if payload.get("status") == "failed" else "completed"
            else:
                raw = _run_knowledge_search(knowledge_executor, query, context)
                status = str(raw.get("status") or "insufficient")
                raw = dict(raw)
                raw["web_fallback"] = status == "insufficient"
                payload = _contract_payload(raw, web_fallback=status == "insufficient")
                payload["status"] = status
                event_status = "failed" if status == "failed" else "completed"
        except GraphInterrupt:
            raise
        except Exception as exc:
            logger.exception("Knowledge worker retrieval failed")
            payload = _contract_payload(
                {
                    "status": "failed",
                    "answer": "",
                    "evidence": [],
                    "uncertainties": [],
                    "error_code": RagErrorCode.FAILED_RETRIEVAL.value,
                    "error_message": public_rag_error_message(RagErrorCode.FAILED_RETRIEVAL),
                },
                web_fallback=False,
            )
            event_status = "failed"
        return {
            "messages": [_knowledge_tool_message(payload, tool_name, plan_call_id, event_status)],
            "worker_results": [payload],
        }

    return run


def _knowledge_fallback(web_search_executor, web_rag_executor=None):
    def run(state: PersonaWorkflowState, runtime: Runtime[PersonaAgentContext]) -> dict:
        payload, _tool_name = _latest_knowledge_contract(state.get("messages") or [])
        if payload is None:
            results = list(state.get("worker_results") or [])
            payload = results[-1] if results else None
        if not isinstance(payload, dict) or not payload.get("web_fallback"):
            return {}
        if payload.get("status") == "accepted":
            return {}
        request, handoff_id = _knowledge_request(state)
        plan = _resolve_knowledge_plan(state)
        query = plan["query"] or request
        plan_call_id = plan["plan_call_id"] or f"{handoff_id}:plan"
        context = runtime.context
        try:
            writer = get_stream_writer()
            writer({"kind": "stage", "stage": "正在检查联网搜索政策..."})
        except RuntimeError:
            pass
        try:
            intent = IntentAnalysis.from_state(state.get("intent_decision"))
            fallback_policy = decide_web_fallback(intent)
            approved = False
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
            if not approved:
                return {}
            results = web_search_executor(query, context)
            if web_rag_executor is None:
                # 直接调用该模块时仍允许测试注入旧的确定性 executor；编译后的
                # knowledge_worker 会显式传入严格 RAG executor。
                searched_answer = _format_web_results(results)
                web_payload = _contract_payload(
                    _accepted_web_payload(query, searched_answer, results),
                    web_fallback=False,
                )
            else:
                web_payload = web_rag_executor(query, context, results)
                web_payload = _contract_payload(web_payload, web_fallback=False)
            return {
                "messages": [
                    _knowledge_tool_message(
                        web_payload,
                        "web_search",
                        f"{plan_call_id}:web",
                        "completed",
                    )
                ],
                "worker_results": [web_payload],
            }
        except GraphInterrupt:
            raise
        except Exception as exc:
            logger.exception("Knowledge web fallback failed")
            failed = _contract_payload(
                {
                    "status": "failed",
                    "answer": "",
                    "evidence": [],
                    "uncertainties": [],
                    "error_code": RagErrorCode.FAILED_RETRIEVAL.value,
                    "error_message": public_rag_error_message(RagErrorCode.FAILED_RETRIEVAL),
                },
                web_fallback=False,
            )
            return {
                "messages": [
                    _knowledge_tool_message(
                        failed,
                        "web_search",
                        f"{plan_call_id}:web",
                        "failed",
                    )
                ],
                "worker_results": [failed],
            }

    return run


def _knowledge_workflow(
    knowledge_executor,
    structured_executor,
    *,
    web_search_executor=_default_web_search_executor,
):
    """Compose retrieve + fallback for tests that invoke the pipeline directly."""

    retrieve = _knowledge_retrieve(knowledge_executor, structured_executor)
    fallback = _knowledge_fallback(web_search_executor)

    def run(state: PersonaWorkflowState, runtime: Runtime[PersonaAgentContext]) -> dict:
        after_retrieve = _merge_knowledge_updates(dict(state), retrieve(state, runtime))
        after_fallback = _merge_knowledge_updates(after_retrieve, fallback(after_retrieve, runtime))
        original_messages = list(state.get("messages") or [])
        return {
            "messages": list(after_fallback.get("messages") or [])[len(original_messages):],
            "worker_results": list(after_fallback.get("worker_results") or []),
        }

    return run


def _knowledge_subgraph(
    model,
    knowledge_executor,
    structured_executor,
    web_search_executor,
    web_rag_executor=run_persona_web_grounded_search,
):
    builder = StateGraph(PersonaWorkflowState, context_schema=PersonaAgentContext)
    builder.add_node("knowledge_planner", _knowledge_planner(model))
    builder.add_node(
        "knowledge_retrieve",
        _knowledge_retrieve(knowledge_executor, structured_executor),
    )
    builder.add_node(
        "knowledge_fallback",
        _knowledge_fallback(web_search_executor, web_rag_executor),
    )
    builder.add_edge(START, "knowledge_planner")
    builder.add_edge("knowledge_planner", "knowledge_retrieve")
    builder.add_edge("knowledge_retrieve", "knowledge_fallback")
    builder.add_edge("knowledge_fallback", END)
    return builder.compile(name="knowledge_worker")

