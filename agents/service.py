import json
import logging
import re
import time
from dataclasses import dataclass, field, replace
from typing import Any

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.types import Command

from agents.context import PersonaAgentContext
from agents.observability import RunRecorder
from agents import registry as tool_registry
from agents.registry import capability_summary, specialist_for_tool, tool_specs
from agents.supervisor import Specialist
from agents.workflow import build_persona_workflow
from rag.llm import LLM_UNAVAILABLE_MESSAGE, get_llm, is_transient_provider_error


logger = logging.getLogger(__name__)


_DSML_PROTOCOL_PATTERN = re.compile(
    r"</\s*(?:[|｜]\s*){2}DSML\s*(?:[|｜]\s*){2}"
    r"(?:parameter|invoke|tool_calls)\s*>",
    re.IGNORECASE,
)


def _visible_text(text: str) -> str:
    match = _DSML_PROTOCOL_PATTERN.search(text)
    return text[: match.start()].rstrip() if match else text


def _sanitize_answer(text: str) -> str:
    """Drop tool protocol payloads and control errors from user-visible text."""

    value = _visible_text(str(text or "")).strip()
    if not value:
        return ""
    lowered = value.lower()
    if "not a valid tool" in lowered or "invalid tool" in lowered:
        return ""
    if value.startswith("{") or value.startswith("["):
        try:
            parsed = json.loads(value)
        except (TypeError, ValueError, json.JSONDecodeError):
            parsed = None
        if isinstance(parsed, (dict, list)):
            return ""
    if value.startswith("# Search:") or value.startswith("# Research:"):
        return ""
    return value


class _VisibleTextStream:
    """Hold an unfinished tag so DSML markers cannot leak across chunks."""

    def __init__(self) -> None:
        self._buffer = ""
        self._stopped = False

    def feed(self, text: str) -> str:
        if self._stopped:
            return ""
        self._buffer += text
        stripped = self._buffer.lstrip()
        lowered = stripped.lower()
        if stripped.startswith(("{", "[")):
            self._buffer = ""
            self._stopped = True
            return ""
        internal_prefixes = ("error:", "# search:", "# research:")
        if any(prefix.startswith(lowered) for prefix in internal_prefixes):
            return ""
        if any(lowered.startswith(prefix) for prefix in internal_prefixes):
            self._buffer = ""
            self._stopped = True
            return ""
        match = _DSML_PROTOCOL_PATTERN.search(self._buffer)
        if match:
            visible = self._buffer[: match.start()].rstrip()
            self._buffer = ""
            self._stopped = True
            return visible
        last_open = self._buffer.rfind("<")
        if last_open > self._buffer.rfind(">"):
            visible = self._buffer[:last_open]
            self._buffer = self._buffer[last_open:]
            return visible
        visible = self._buffer
        self._buffer = ""
        return visible

    def finish(self) -> str:
        if self._stopped:
            return ""
        visible = self._buffer
        self._buffer = ""
        return visible


CAPABILITY_QUESTION_SIGNALS = (
    "tool",
    "工具",
    "有哪些能力",
    "有什么能力",
    "你会什么",
    "会调用什么",
    "会调用哪些",
    "能调用什么",
    "能调用哪些",
    "可以调用什么",
    "可以调用哪些",
)


_STAGE_BY_NODE = {
    "persona_supervisor": "正在思考…",
    "knowledge_worker": "知识agent · 正在检索角色资料…",
    "web_worker": "联网agent · 正在搜索…",
    "memory_worker": "记忆agent · 正在读取记忆…",
    "management_worker": "管理agent · 正在处理角色资料…",
}


def _stage_from_update(update: dict) -> str | None:
    """把 LangGraph 节点更新映射为阶段文案；无匹配返回 None。"""
    for key in update:
        for node, label in _STAGE_BY_NODE.items():
            if node in str(key):
                return label
    return None


_CAPABILITY_SELF_INSPECTION_PATTERNS = (
    re.compile(r"(?:你|您)(?:有哪(?:些|些)|具备哪些|拥有哪些).*(?:工具|tools?|能力|技能|功能)"),
    re.compile(r"(?:你|您)(?:具备|拥有|有什么).*(?:能力|技能|功能)"),
    re.compile(r"(?:你|您)(?:能|可以|会|可否).*(?:调用|使用).*(?:工具|能力|技能)"),
    re.compile(r"(?:有哪些|有什么).*(?:工具|能力|技能).*(?:可以|能)?(?:调用|使用)?$"),
)

_EXPLICIT_WEB_SEARCH_PATTERNS = (
    re.compile(r"(?:搜索|搜一下|联网查|上网查|查网页|查网络)"),
)
_WEB_FRESHNESS_SIGNALS = ("今天", "现在", "最新", "当前", "最近")
_EXTERNAL_FACT_OBJECTS = (
    "天气", "新闻", "价格", "汇率", "股价", "赛事", "票价", "交通", "开放时间",
)


def is_capability_question(question: str) -> bool:
    normalized = question.strip().lower()
    return any(pattern.search(normalized) for pattern in _CAPABILITY_SELF_INSPECTION_PATTERNS)


def is_explicit_web_search_question(question: str) -> bool:
    """Return True only for explicit web requests or clear external fresh facts."""

    normalized = question.strip().lower()
    if any(pattern.search(normalized) for pattern in _EXPLICIT_WEB_SEARCH_PATTERNS):
        return True
    return (
        any(signal in normalized for signal in _WEB_FRESHNESS_SIGNALS)
        and any(subject in normalized for subject in _EXTERNAL_FACT_OBJECTS)
    )


def _latest_turn_messages(messages: list) -> list:
    """Return the current turn while preserving all messages if no user marker exists."""

    for index in range(len(messages) - 1, -1, -1):
        if isinstance(messages[index], HumanMessage):
            return messages[index:]
    return messages


@dataclass(frozen=True)
class AgentTurnResult:
    status: str
    answer: str
    specialist: Specialist
    pending_action: dict[str, Any] | None = None
    tool_calls: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    evidence: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    trace: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    duration_seconds: float = 0.0
    loaded_skills: tuple[str, ...] = field(default_factory=tuple)
    events: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    metrics: dict[str, Any] = field(default_factory=dict)


class PersonaAgentService:
    """LangGraph 的应用层入口，负责线程隔离、暂停确认和结果归一化。"""

    def __init__(
        self,
        checkpointer: BaseCheckpointSaver,
        model: BaseChatModel | None = None,
    ) -> None:
        self.checkpointer = checkpointer
        self.model = model
        self._workflow = None
        self._workflow_registry_revision = tool_registry.tool_registry_revision()

    @staticmethod
    def thread_id(context: PersonaAgentContext, specialist: Specialist) -> str:
        # 所有 Worker 共享同一条角色会话线程，确保 handoff、interrupt 和 resume
        # 都能恢复到同一份父图检查点。specialist 参数仅为兼容旧接口保留。
        del specialist
        return f"{context.persona_id}:{context.conversation_id}"

    def _graph(self):
        revision = tool_registry.tool_registry_revision()
        if self._workflow is None or self._workflow_registry_revision != revision:
            self._workflow = build_persona_workflow(
                self.model or get_llm(),
                self.checkpointer,
            )
            self._workflow_registry_revision = revision
        return self._workflow

    def _config(self, context: PersonaAgentContext) -> dict:
        return {"configurable": {"thread_id": self.thread_id(context, "conversation")}}

    def query(self, question: str, context: PersonaAgentContext) -> AgentTurnResult:
        graph = self._graph()
        started = time.perf_counter()
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_started", "开始处理", status="started")
        context = replace(context, telemetry=recorder)
        # 已暂停的写操作必须先由用户处理；不能用新问题绕过上一次确认。
        pending = self._find_pending(graph, context)
        if pending is not None:
            recorder.event("system", "confirmation_required", "等待确认", status="pending")
            recorder.finish(status="pending_confirmation")
            return replace(pending, events=recorder.events(), metrics=recorder.metrics())
        if is_capability_question(question):
            recorder.event("agent", "capability_summary", "读取能力清单")
            recorder.finish(status="completed")
            return AgentTurnResult(
                status="completed",
                answer=capability_summary(),
                specialist="conversation",
                events=recorder.events(),
                metrics=recorder.metrics(),
            )
        try:
            initial_loaded_skills = ["web-research"] if is_explicit_web_search_question(question) else []
            result = graph.invoke(
                {
                    "messages": [{"role": "user", "content": question}],
                    "active_worker": None,
                    "loaded_skills": initial_loaded_skills,
                    "web_search_authorized": bool(initial_loaded_skills),
                    "worker_results": [],
                    "handoff_count": 0,
                },
                self._config(context),
                context=context,
            )
        except Exception as exc:
            # 模型服务瞬时不可用（429/5xx）时返回统一降级提示，避免整个请求 500；
            # 其他异常仍然上抛，便于定位真实故障。
            if is_transient_provider_error(exc):
                logger.warning("Agent LLM 服务瞬时故障，返回降级提示：%s", exc)
                recorder.event("agent", "provider_degraded", "模型服务降级", status="failed")
                recorder.finish(status="degraded")
                return AgentTurnResult(
                    status="completed",
                    answer=LLM_UNAVAILABLE_MESSAGE,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                )
            raise
        return self._result(result, time.perf_counter() - started, recorder=recorder)

    def stream_query(
        self,
        question: str,
        context: PersonaAgentContext,
    ):
        """流式查询：边生成边产出 token 事件，最后产出完整结果事件。

        事件格式：
          {"kind": "token", "text": "<增量文本>"}
          {"kind": "result", "result": AgentTurnResult}

        只转发 persona_supervisor（唯一对用户可见的节点）的模型输出，
        Worker 子图的内部生成会被过滤，避免内部交接文本泄漏到对话页。
        """
        graph = self._graph()
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_started", "开始处理", status="started")
        context = replace(context, telemetry=recorder)
        pending = self._find_pending(graph, context)
        if pending is not None:
            recorder.event("system", "confirmation_required", "等待确认", status="pending")
            recorder.finish(status="pending_confirmation")
            yield {
                "kind": "result",
                "result": replace(pending, events=recorder.events(), metrics=recorder.metrics()),
            }
            return
        if is_capability_question(question):
            recorder.event("agent", "capability_summary", "读取能力清单")
            recorder.finish(status="completed")
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed",
                    answer=capability_summary(),
                    specialist="conversation",
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                ),
            }
            return
        config = self._config(context)
        started = time.perf_counter()
        failed = False
        emitted_tokens = False
        last_stage: str | None = None
        visible_stream = _VisibleTextStream()
        try:
            initial_loaded_skills = ["web-research"] if is_explicit_web_search_question(question) else []
            for _namespace, mode, payload in graph.stream(
                {
                    "messages": [{"role": "user", "content": question}],
                    "active_worker": None,
                    "loaded_skills": initial_loaded_skills,
                    "web_search_authorized": bool(initial_loaded_skills),
                    "worker_results": [],
                    "handoff_count": 0,
                },
                config,
                stream_mode=["messages", "updates"],
                subgraphs=True,
                context=context,
            ):
                if mode == "messages":
                    chunk, metadata = payload
                    if metadata.get("lc_agent_name") != "persona_supervisor":
                        continue
                    content = getattr(chunk, "content", None)
                    if isinstance(content, str) and content:
                        visible = visible_stream.feed(content)
                        if visible:
                            recorder.mark_first_token()
                            emitted_tokens = True
                            yield {"kind": "token", "text": visible}
                elif mode == "updates":
                    stage = _stage_from_update(payload)
                    if stage and stage != last_stage:
                        last_stage = stage
                        recorder.event(
                            "agent", "workflow_stage", stage, status="completed"
                        )
                        yield {"kind": "stage", "stage": stage}
        except Exception as exc:
            if not is_transient_provider_error(exc):
                raise
            logger.warning("Agent 流式查询时 LLM 服务瞬时故障，返回降级提示：%s", exc)
            failed = True
        trailing = visible_stream.finish()
        if trailing:
            emitted_tokens = True
            yield {"kind": "token", "text": trailing}
        if failed:
            recorder.event("agent", "provider_degraded", "模型服务降级", status="failed")
            recorder.finish(status="degraded")
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed",
                    answer=LLM_UNAVAILABLE_MESSAGE,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                ),
            }
            return
        state = graph.get_state(config)
        state_values = state.values or {}
        if not emitted_tokens:
            for message in reversed(list(state_values.get("messages") or [])):
                content = getattr(message, "content", None)
                if isinstance(message, AIMessage) and content:
                    fallback = _sanitize_answer(str(content))
                    if fallback:
                        recorder.mark_first_token()
                        emitted_tokens = True
                        yield {"kind": "token", "text": fallback}
                    break
        result = self._result(
            state_values, time.perf_counter() - started, recorder=recorder
        )
        yield {
            "kind": "result",
            "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
        }

    def stream_resume(
        self,
        context: PersonaAgentContext,
        specialist: Specialist,
        approved: bool,
    ):
        """流式恢复被中断的确认回合，事件格式与 stream_query 一致。"""
        graph = self._graph()
        config = self._config(context)
        started = time.perf_counter()
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_resumed", "继续处理", status="started")
        context = replace(context, telemetry=recorder)
        snapshot = graph.get_state(config)
        if not snapshot.interrupts:
            yield {
                "kind": "result",
                "result": self._result(
                    snapshot.values or {}, time.perf_counter() - started, recorder=recorder
                ),
            }
            return
        failed = False
        emitted_tokens = False
        last_stage: str | None = None
        visible_stream = _VisibleTextStream()
        try:
            for _namespace, mode, payload in graph.stream(
                Command(resume={"approved": approved}),
                config,
                stream_mode=["messages", "updates"],
                subgraphs=True,
                context=context,
            ):
                if mode == "messages":
                    chunk, metadata = payload
                    if metadata.get("lc_agent_name") != "persona_supervisor":
                        continue
                    content = getattr(chunk, "content", None)
                    if isinstance(content, str) and content:
                        visible = visible_stream.feed(content)
                        if visible:
                            recorder.mark_first_token()
                            emitted_tokens = True
                            yield {"kind": "token", "text": visible}
                elif mode == "updates":
                    stage = _stage_from_update(payload)
                    if stage and stage != last_stage:
                        last_stage = stage
                        recorder.event(
                            "agent", "workflow_stage", stage, status="completed"
                        )
                        yield {"kind": "stage", "stage": stage}
        except Exception as exc:
            if not is_transient_provider_error(exc):
                raise
            logger.warning("Agent 流式恢复时 LLM 服务瞬时故障，返回降级提示：%s", exc)
            failed = True
        trailing = visible_stream.finish()
        if trailing:
            emitted_tokens = True
            yield {"kind": "token", "text": trailing}
        if failed:
            recorder.event("agent", "provider_degraded", "模型服务降级", status="failed")
            recorder.finish(status="degraded")
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed",
                    answer=LLM_UNAVAILABLE_MESSAGE,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                ),
            }
            return
        state = graph.get_state(config)
        state_values = state.values or {}
        if not emitted_tokens:
            for message in reversed(list(state_values.get("messages") or [])):
                content = getattr(message, "content", None)
                if isinstance(message, AIMessage) and content:
                    fallback = _sanitize_answer(str(content))
                    if fallback:
                        recorder.mark_first_token()
                        emitted_tokens = True
                        yield {"kind": "token", "text": fallback}
                    break
        result = self._result(
            state_values, time.perf_counter() - started, recorder=recorder
        )
        yield {
            "kind": "result",
            "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
        }

    def _find_pending(self, graph, context: PersonaAgentContext) -> AgentTurnResult | None:
        snapshot = graph.get_state(self._config(context))
        if snapshot.interrupts:
            action = snapshot.interrupts[0].value
            return AgentTurnResult(
                status="pending_confirmation",
                answer="",
                specialist=self._specialist_for_state(snapshot.values or {}, action),
                pending_action=action,
            )
        return None

    def resume(
        self,
        context: PersonaAgentContext,
        specialist: Specialist,
        approved: bool,
    ) -> AgentTurnResult:
        started = time.perf_counter()
        del specialist
        graph = self._graph()
        config = self._config(context)
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_resumed", "继续处理", status="started")
        context = replace(context, telemetry=recorder)
        snapshot = graph.get_state(config)
        if not snapshot.interrupts:
            return self._result(
                snapshot.values or {}, time.perf_counter() - started, recorder=recorder
            )
        # Command(resume=...) 从 checkpointer 中恢复 interrupt 所在节点，不会重跑
        # 用户消息之前已经完成的 Worker 步骤。
        try:
            result = graph.invoke(
                Command(resume={"approved": approved}),
                config,
                context=context,
            )
        except Exception as exc:
            if is_transient_provider_error(exc):
                logger.warning("Agent 恢复会话时 LLM 服务瞬时故障，返回降级提示：%s", exc)
                recorder.event("agent", "provider_degraded", "模型服务降级", status="failed")
                recorder.finish(status="degraded")
                return AgentTurnResult(
                    status="completed",
                    answer=LLM_UNAVAILABLE_MESSAGE,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                )
            raise
        return self._result(result, time.perf_counter() - started, recorder=recorder)

    @staticmethod
    def _specialist_for_state(state: dict, action: dict | None = None) -> Specialist:
        worker = state.get("active_worker")
        if worker == "knowledge":
            return "conversation"
        if worker in {"web", "memory", "management"}:
            return worker
        if action:
            return specialist_for_tool(str(action.get("tool", "")))
        return "conversation"

    @staticmethod
    def _result(
        state: dict,
        duration_seconds: float = 0.0,
        *,
        recorder: RunRecorder | None = None,
    ) -> AgentTurnResult:
        """只暴露注册工具的结果，过滤内部 handoff ToolMessage。"""

        interrupts = state.get("__interrupt__") or ()
        if interrupts:
            if recorder is not None:
                recorder.finish(status="pending_confirmation")
            return AgentTurnResult(
                status="pending_confirmation",
                answer="",
                specialist=PersonaAgentService._specialist_for_state(state, interrupts[0].value),
                pending_action=interrupts[0].value,
            )
        messages = _latest_turn_messages(list(state.get("messages") or []))
        answer = ""
        tool_calls: list[dict[str, Any]] = []
        evidence: list[dict[str, Any]] = []
        trace: list[dict[str, Any]] = []
        loaded_skills = list(state.get("loaded_skills") or [])
        visible_tools = {spec.name for spec in tool_specs()}
        for message in messages:
            if isinstance(message, AIMessage) and message.content:
                candidate = _sanitize_answer(str(message.content))
                if candidate:
                    answer = candidate
            if not isinstance(message, ToolMessage):
                continue
            payload = PersonaAgentService._tool_payload(message.content)
            if message.name not in visible_tools:
                continue
            tool_calls.append({"name": message.name, "result": payload})
            if recorder is not None:
                payload_status = payload.get("status") if isinstance(payload, dict) else None
                event_status = (
                    "failed"
                    if getattr(message, "status", None) == "error"
                    or payload_status in {"failed", "error", "denied"}
                    else "completed"
                )
                recorder.event(
                    "tool",
                    message.name or "tool",
                    f"调用 {message.name or '工具'}",
                    status=event_status,
                    details={"status": payload_status} if payload_status else None,
                )
            if message.name == "search_persona_knowledge" and isinstance(payload, dict):
                evidence = list(payload.get("evidence") or [])
                trace = list(payload.get("trace") or [])
        if recorder is not None:
            for step in trace:
                node = str(step.get("node") or "rag_step")
                recorder.event(
                    "rag",
                    node,
                    str(step.get("label") or node),
                    status="completed",
                    details={
                        "candidate_count": step.get("candidate_count"),
                        "result_count": step.get("result_count"),
                        "query_rewritten": step.get("query_rewritten"),
                        "corrected": step.get("corrected"),
                        "refused": step.get("refused"),
                    },
                )
            recorder.finish(
                status="completed",
                handoff_count=int(state.get("handoff_count") or 0),
            )
        return AgentTurnResult(
            status="completed",
            answer=answer,
            specialist=PersonaAgentService._specialist_for_state(state),
            tool_calls=tuple(tool_calls[-8:]),
            evidence=tuple(evidence),
            trace=tuple(trace),
            duration_seconds=duration_seconds,
            loaded_skills=tuple(loaded_skills),
            events=recorder.events() if recorder is not None else (),
            metrics=recorder.metrics() if recorder is not None else {},
        )

    @staticmethod
    def _tool_payload(content: Any) -> Any:
        if not isinstance(content, str):
            return content
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return content
