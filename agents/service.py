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
from agents.contracts import resolve_error_fields
from agents.workflows import workflow_from_task
from agents.intent_funnel import IntentAnalysis, analyze_intents, analyze_message_history
from agents.observability import RunRecorder
from agents import registry as tool_registry
from agents.registry import capability_summary, specialist_for_tool, tool_specs
from agents.supervisor import Specialist
from agents.workflow import WORKERS, build_persona_workflow
from agents.graph.state import canonicalize_worker_name
from rag.llm import LLM_UNAVAILABLE_MESSAGE, get_llm, is_transient_provider_error
from settings import Settings


logger = logging.getLogger(__name__)

# HTTP/API 仍使用旧的四值 specialist，避免打断 resume 契约。
# 图内 Worker 名称在对外返回前映射到该集合。
_PUBLIC_SPECIALIST_BY_WORKER = {
    "knowledge": "conversation",
    "memory": "memory",
    "document": "management",
    "profile": "management",
    "voice": "management",
    "rvc_worker": "management",
    "live2d": "management",
    # 读取旧 checkpoint / 旧客户端状态时兼容旧 canonical 名称。
    "voice_clone": "management",
    "config": "management",
    "web": "web",
    "management": "management",
    "conversation": "conversation",
}
_WEB_CONFIRMATION_TOOLS = {"web_search", "web_search_confirmation"}

EXECUTION_DEGRADED_MESSAGE = "请求处理超时或暂时失败，请稍后重试。"


def _execution_error_message(error: Exception) -> str:
    if isinstance(error, TimeoutError) or error.__class__.__name__.lower().endswith("timeout"):
        return "请求处理超时，请稍后重试。"
    return EXECUTION_DEGRADED_MESSAGE


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
    if "KEY FACTS:" in value and "SOURCES:" in value:
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


_STAGE_BY_NODE = {
    "persona_supervisor": "正在组织回复…",
    "knowledge_worker": "知识检索 · 正在搜索资料和网络信息…",
    "memory_worker": "记忆管理 · 正在读写角色记忆…",
    "document_worker": "文档管理 · 正在处理知识文档…",
    "profile_worker": "档案管理 · 正在更新角色档案…",
    "voice_worker": "声音系统 · 正在准备处理…",
    "rvc_worker": "RVC 音频生产 · 正在准备处理…",
    "live2d_worker": "Live2D · 正在准备处理…",
    # 旧节点只用于读取历史 trace，不再由新图生成。
    "voice_clone_worker": "声音系统 · 正在准备处理…",
    "config_worker": "配置管理 · 正在修改系统设置…",
    "finalize_knowledge": "知识检索完成，整理结果中…",
    "finalize_memory": "记忆操作完成，整理结果中…",
    "finalize_document": "文档操作完成，整理结果中…",
    "finalize_profile": "档案操作完成，整理结果中…",
    "finalize_voice": "声音任务已完成，整理结果中…",
    "finalize_live2d": "Live2D 任务已完成，整理结果中…",
    "finalize_voice_clone": "声音任务已完成，整理结果中…",
    "finalize_config": "配置修改完成，整理结果中…",
}


def _stage_from_update(update: dict) -> str | None:
    """把 LangGraph 节点更新映射为阶段文案；无匹配返回 None。"""
    for key in update:
        for node, label in _STAGE_BY_NODE.items():
            if node in str(key):
                return label
    return None


_STAGE_ORDER = {
    node: index
    for index, node in enumerate(_STAGE_BY_NODE)
}


def _initial_stage(intent) -> str:
    """返回 Core Agent 接管前的中立阶段文案。

    意图漏斗只作为 Agent 的内部提示/安全门禁，不能在 Agent 尚未完成
    supervisor → worker handoff 前把用户请求直接标成某个专项任务，尤其不能
    让前端据此提前创建 RVC 工作区。
    """
    labels = {
        "web": "已识别为联网查询，正在准备搜索...",
        "knowledge": "已识别为资料查询，正在准备检索...",
        "memory": "已识别为记忆请求，正在检查记忆...",
        "management": "已识别为管理请求，正在检查操作权限...",
        "voice": "已识别为声音系统请求，正在准备会话...",
        # RVC 必须先经过 Core Agent 的 supervisor → worker handoff；
        # 在此之前不向客户端暴露专项识别结果。
        "rvc_worker": "正在分析请求...",
        "live2d": "已识别为 Live2D 请求，正在准备处理...",
        "voice_clone": "已识别为声音系统请求，正在准备会话...",
    }
    return labels.get(intent.primary, "正在分析请求...")


_CAPABILITY_SELF_INSPECTION_PATTERNS = (
    re.compile(r"(?:你|您)(?:有哪(?:些|些)|具备哪些|拥有哪些).*(?:工具|tools?|能力|技能|功能)"),
    re.compile(r"(?:你|您)(?:具备|拥有|有什么).*(?:能力|技能|功能)"),
    re.compile(r"(?:你|您)(?:能|可以|会|可否).*(?:调用|使用).*(?:工具|能力|技能)"),
    re.compile(r"(?:有哪些|有什么).*(?:工具|能力|技能).*(?:可以|能)?(?:调用|使用)?$"),
)

def is_capability_question(question: str) -> bool:
    normalized = question.strip().lower()
    return any(pattern.search(normalized) for pattern in _CAPABILITY_SELF_INSPECTION_PATTERNS)


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
    # Runtime shared result contract fields.
    artifacts: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    citations: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    uncertainties: tuple[str, ...] = field(default_factory=tuple)
    error: dict[str, Any] | None = None
    worker: str | None = None
    # Legacy API compatibility fields.
    error_code: str | None = None
    error_message: str | None = None
    worker_results: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    workflow: dict[str, Any] | None = None
    # 结构化 Core→Supervisor→Worker 合同的公开只读摘要。
    task_type: str | None = None
    input_refs: dict[str, Any] = field(default_factory=dict)
    selected_options: dict[str, Any] = field(default_factory=dict)
    waiting_inputs: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    result_refs: tuple[dict[str, Any], ...] = field(default_factory=tuple)
    task_id: str | None = None


def _find_rvc_task_payload(value: Any) -> dict[str, Any] | None:
    """从 LangGraph update/custom 载荷中提取 RVC 的公开任务摘要。"""

    if isinstance(value, ToolMessage):
        return _find_rvc_task_payload(PersonaAgentService._tool_payload(value.content))
    if isinstance(value, (list, tuple)):
        for item in reversed(value):
            found = _find_rvc_task_payload(item)
            if found is not None:
                return found
        return None
    if not isinstance(value, dict):
        return None
    nested_task = value.get("task")
    if isinstance(nested_task, dict) and value.get("worker") == "rvc_worker":
        merged = {**value, **nested_task, "worker": "rvc_worker"}
        if merged.get("task_id") or merged.get("id"):
            merged["task_id"] = merged.get("task_id") or merged.get("id")
            return merged
    if value.get("worker") == "rvc_worker" and value.get("task_id"):
        return value
    for child in value.values():
        found = _find_rvc_task_payload(child)
        if found is not None:
            return found
    return None


def _is_rvc_workflow_event(event: Any) -> bool:
    """Return whether an intermediate public event belongs to the RVC worker.

    RVC workflow metadata is intentionally withheld from graph update/custom
    streams. The HTTP/WebSocket routers publish it only from the final result,
    after the Core Agent has completed the worker handoff contract.
    """

    flow = event.get("flow") if isinstance(event, dict) else None
    return isinstance(flow, dict) and str(flow.get("worker") or "").strip().lower() == "rvc_worker"


def _workflow_update_event(payload: Any) -> dict[str, Any] | None:
    """将 RVC 工具的公开任务摘要转换为 workflow_update。"""

    task = _find_rvc_task_payload(payload)
    if task is None:
        return None
    flow = workflow_from_task(
        "rvc_worker",
        task,
        status=str(task.get("state") or task.get("status") or "running"),
        phase=task.get("phase"),
        progress=task.get("progress", task.get("progress_percent", 0)),
    )
    if flow is None:
        return None
    return {"kind": "workflow_update", "task_id": str(task["task_id"]), "flow": flow}


class PersonaAgentService:
    """LangGraph 的应用层入口，负责线程隔离、暂停确认和结果归一化。"""

    def __init__(
        self,
        checkpointer: BaseCheckpointSaver,
        model: BaseChatModel | None = None,
        runtime: Any | None = None,
    ) -> None:
        self.checkpointer = checkpointer
        self.model = model
        # Runtime 是可选的适配层；旧调用方仍直接使用 query/stream_query/resume。
        self.runtime = runtime
        self._workflow = None
        self._workflow_registry_revision = tool_registry.tool_registry_revision()
        # 注入 model 的服务不会受全局 Settings 刷新影响；预先记录指纹，
        # 也兼容测试/宿主在构造后直接注入自定义 workflow 的旧用法。
        self._workflow_llm_signature = ("injected", id(model)) if model is not None else None

    def attach_runtime(self, runtime: Any) -> None:
        """在应用启动完成后注入 Runtime，避免构造期循环依赖。"""

        self.runtime = runtime

    @staticmethod
    def thread_id(context: PersonaAgentContext, specialist: Specialist) -> str:
        # 所有 Worker 共享同一条角色会话线程，确保 handoff、interrupt 和 resume
        # 都能恢复到同一份父图检查点。specialist 参数仅为兼容旧接口保留。
        del specialist
        return f"{context.persona_id}:{context.conversation_id}"

    def _graph(self):
        revision = tool_registry.tool_registry_revision()
        # Settings API 保存后，LLM 客户端虽然可以清缓存，但已编译的 LangGraph
        # 仍可能持有旧 model。每次新 turn 比较轻量配置指纹，确保下一次全局请求
        # 使用新 Key/Base URL/模型；正在执行的 turn 不被强制打断。
        if self.model is None:
            active = Settings.load()
            llm_signature = (active.openai_api_key, active.openai_base_url, active.openai_model)
            model = get_llm(active)
        else:
            llm_signature = ("injected", id(self.model))
            model = self.model
        # 兼容宿主/测试在构造后直接注入 workflow：首次使用时把当前 Settings
        # 作为基线，不覆盖已经注入的自定义执行器；之后配置变化仍会触发重建。
        if self._workflow is not None and self._workflow_llm_signature is None:
            self._workflow_llm_signature = llm_signature
        needs_rebuild = (
            self._workflow is None
            or self._workflow_registry_revision != revision
            or self._workflow_llm_signature != llm_signature
        )
        if needs_rebuild:
            self._workflow = build_persona_workflow(model, self.checkpointer)
            self._workflow_registry_revision = revision
            self._workflow_llm_signature = llm_signature
        return self._workflow

    def _config(self, context: PersonaAgentContext) -> dict:
        return {"configurable": {"thread_id": self.thread_id(context, "conversation")}}

    def _previous_intent(self, graph, context: PersonaAgentContext) -> IntentAnalysis | None:
        """Restore the last turn's funnel result so elliptical follow-ups keep web policy."""
        try:
            snapshot = graph.get_state(self._config(context))
        except Exception:
            return None
        values = getattr(snapshot, "values", None) or {}
        stored = values.get("intent_decision")
        if stored:
            previous = IntentAnalysis.from_state(stored)
            if previous.primary not in {None, "ui"}:
                return previous
        messages = list(values.get("messages") or [])
        if not messages:
            return None
        previous = analyze_message_history(messages)
        if previous.primary in {None, "ui"}:
            return None
        return previous

    def _intent_for_question(self, graph, context: PersonaAgentContext, question: str) -> IntentAnalysis:
        return analyze_intents(question, self._previous_intent(graph, context))

    def query(self, question: str, context: PersonaAgentContext) -> AgentTurnResult:
        graph = self._graph()
        started = time.perf_counter()
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_started", "开始处理", status="started")
        context = replace(context, telemetry=recorder)
        # 已暂停的写操作必须先由用户处理；不能用新问题绕过上一次确认。
        pending = self._find_pending(graph, context)
        if pending is not None:
            is_waiting_input = pending.status == "waiting_input"
            recorder.event(
                "system",
                "input_required" if is_waiting_input else "confirmation_required",
                "等待补充输入" if is_waiting_input else "等待确认",
                status="waiting_input" if is_waiting_input else "pending",
                details={"waiting_inputs": list(pending.waiting_inputs)} if is_waiting_input else None,
            )
            recorder.finish(status="waiting_input" if is_waiting_input else "pending_confirmation")
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
            initial_loaded_skills = []
            intent = self._intent_for_question(graph, context, question)
            result = graph.invoke(
                {
                    "messages": [{"role": "user", "content": question}],
                    "active_worker": None,
                    "loaded_skills": initial_loaded_skills,
                    "intent_decision": intent.to_state(),
                    "worker_results": [],
                    "handoff_count": 0,
                    "conversation_id": context.conversation_id,
                    "input_refs": {"attachment_ids": list(context.attachment_ids)},
                    "selected_options": {},
                    "waiting_inputs": [],
                    "result_refs": [],
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
        # graph.invoke 在 interrupt 场景返回的是已提交的节点值，
        # interrupt 本身保存在 checkpoint；因此必须再读一次 checkpoint，
        # 否则 API 会把“等待上传/选择”误报成普通完成。
        pending_after = self._find_pending(graph, context)
        if pending_after is not None:
            is_waiting_input = pending_after.status == "waiting_input"
            recorder.event(
                "system",
                "input_required" if is_waiting_input else "confirmation_required",
                "等待补充输入" if is_waiting_input else "等待确认",
                status="waiting_input" if is_waiting_input else "pending",
                details={"waiting_inputs": list(pending_after.waiting_inputs)} if is_waiting_input else None,
            )
            recorder.finish(status="waiting_input" if is_waiting_input else "pending_confirmation")
            return replace(pending_after, events=recorder.events(), metrics=recorder.metrics())
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
            is_waiting_input = pending.status == "waiting_input"
            recorder.event(
                "system",
                "input_required" if is_waiting_input else "confirmation_required",
                "等待补充输入" if is_waiting_input else "等待确认",
                status="waiting_input" if is_waiting_input else "pending",
                details={"waiting_inputs": list(pending.waiting_inputs)} if is_waiting_input else None,
            )
            recorder.finish(status="waiting_input" if is_waiting_input else "pending_confirmation")
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
        intent = self._intent_for_question(graph, context, question)
        last_stage: str | None = _initial_stage(intent)
        last_stage_node: str | None = None
        visible_stream = _VisibleTextStream()
        yield {"kind": "stage", "stage": last_stage}
        try:
            initial_loaded_skills = []
            for _namespace, mode, payload in graph.stream(
                {
                    "messages": [{"role": "user", "content": question}],
                    "active_worker": None,
                    "loaded_skills": initial_loaded_skills,
                    "intent_decision": intent.to_state(),
                    "worker_results": [],
                    "handoff_count": 0,
                    "conversation_id": context.conversation_id,
                    "input_refs": {"attachment_ids": list(context.attachment_ids)},
                    "selected_options": {},
                    "waiting_inputs": [],
                    "result_refs": [],
                },
                config,
                stream_mode=["messages", "updates", "custom"],
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
                    workflow_event = _workflow_update_event(payload)
                    # RVC 专项工作区只能在最终 AgentTurnResult 明确完成
                    # Core Agent -> rvc_worker handoff 后由路由层公开。图的
                    # updates/custom 流里可能先出现 Worker 工具返回值；如果
                    # 在这里转发，会让前端在“正在分析请求…”阶段提前创建卡片，
                    # 既绕过 Agent 可见交接，也会让 waiting_input 时序卡住。
                    if workflow_event is not None and not _is_rvc_workflow_event(workflow_event):
                        yield workflow_event
                    stage_node = next((node for node in _STAGE_BY_NODE if node in str(payload)), None)
                    stage = _STAGE_BY_NODE.get(stage_node) if stage_node else None
                    if stage_node and stage and not emitted_tokens and (
                        last_stage_node is None
                        or _STAGE_ORDER[stage_node] >= _STAGE_ORDER[last_stage_node]
                    ) and stage != last_stage:
                        last_stage_node = stage_node
                        last_stage = stage
                        recorder.event(
                            "agent", "workflow_stage", stage, status="completed"
                        )
                        yield {"kind": "stage", "stage": stage}
                elif mode == "custom" and isinstance(payload, dict):
                    workflow_event = _workflow_update_event(payload)
                    # RVC 专项工作区只能在最终 AgentTurnResult 明确完成
                    # Core Agent -> rvc_worker handoff 后由路由层公开。图的
                    # updates/custom 流里可能先出现 Worker 工具返回值；如果
                    # 在这里转发，会让前端在“正在分析请求…”阶段提前创建卡片，
                    # 既绕过 Agent 可见交接，也会让 waiting_input 时序卡住。
                    if workflow_event is not None and not _is_rvc_workflow_event(workflow_event):
                        yield workflow_event
                    if payload.get("kind") == "workflow_update":
                        continue
                    if payload.get("kind") == "clone_session":
                        yield dict(payload)
                        continue
                    stage = str(payload.get("stage") or "").strip()
                    if payload.get("kind") == "stage" and stage and not emitted_tokens and stage != last_stage:
                        last_stage = stage
                        event = {"kind": "stage", "stage": stage}
                        if payload.get("details"):
                            event["details"] = payload["details"]
                        yield event
        except Exception as exc:
            if is_transient_provider_error(exc):
                logger.warning("Agent 流式查询时 LLM 服务瞬时故障，返回降级提示：%s", exc)
                answer = LLM_UNAVAILABLE_MESSAGE
            else:
                logger.exception("Agent 流式查询执行失败，返回可见降级结果")
                answer = _execution_error_message(exc)
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
                    status="degraded",
                    answer=answer,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                ),
            }
            return
        state = graph.get_state(config)
        state_values = state.values or {}
        # 将 checkpoint 中的 interrupt 一并交给结果归一化，确保
        # Supervisor 的 waiting_input 在 SSE 与同步 API 中使用同一合同。
        if state.interrupts:
            state_values = {**state_values, "__interrupt__": state.interrupts}
        result = self._result(
            state_values, time.perf_counter() - started, recorder=recorder
        )
        if result.status in {"pending_confirmation", "waiting_input"}:
            yield {
                "kind": "result",
                "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
            }
            return
        if not emitted_tokens and result.answer:
            recorder.mark_first_token()
            emitted_tokens = True
            yield {"kind": "token", "text": result.answer}
        yield {
            "kind": "result",
            "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
        }

    @staticmethod
    def _waiting_input_update(state: dict[str, Any], resume_value: dict[str, Any]) -> dict[str, Any]:
        """把结构化补充输入合并回待派发任务，不把输入伪装成自然语言消息。"""
        pending = state.get("dispatch_request") or state.get("pending_task") or {}
        request = dict(pending) if isinstance(pending, dict) else {}
        # finalize_worker persists the managed RVC session in state.input_refs,
        # while older checkpoints only keep the attachment in dispatch_request.
        # Start from both sources so a button that sends only ``action`` still
        # resumes the exact uploaded session.
        input_refs = dict(state.get("input_refs") or {})
        request_refs = dict(request.get("input_refs") or {}) if isinstance(request.get("input_refs"), dict) else {}
        request_refs.update(input_refs)
        input_refs = request_refs
        selected_options = dict(state.get("selected_options") or {})
        input_values = resume_value.get("input_values") or {}
        if isinstance(input_values, dict):
            options = dict(request.get("options") or {})
            reference_keys = {
                "model_id", "index_id", "audio_file_id", "input_file_id",
                "document_file_id", "session_id", "rvc_session_id",
                "source_file_id", "task_id",
            }
            # ``input_refs`` above is the authoritative merge of the current
            # checkpoint and the pending request.  Rebuilding from the stale
            # request here used to drop the managed RVC session when the UI
            # resumed with only ``{action: ...}``.
            request_refs = dict(input_refs)
            for key, value in input_values.items():
                if key in reference_keys:
                    input_refs[key] = value
                    request_refs[key] = value
                else:
                    selected_options[key] = value
                    options[key] = value
            # Keep RVC session aliases synchronized. The worker tools consume
            # session_id, while older clients use rvc_session_id.
            session_id = request_refs.get("session_id") or request_refs.get("rvc_session_id")
            if session_id:
                request_refs["session_id"] = str(session_id)
                request_refs["rvc_session_id"] = str(session_id)
                input_refs["session_id"] = str(session_id)
                input_refs["rvc_session_id"] = str(session_id)
            request["input_refs"] = request_refs
            request["options"] = options
        attachments = resume_value.get("attachment_ids") or []
        if attachments:
            input_refs["attachment_ids"] = list(attachments)
            request["input_refs"] = {**(request.get("input_refs") or {}), "attachment_ids": list(attachments)}
        if resume_value.get("worker"):
            request["worker"] = resume_value["worker"]
        if resume_value.get("task_id"):
            request["task_id"] = resume_value["task_id"]
        # A waiting worker result has already completed the handoff. Restore
        # the same worker and send the resumed contract directly through the
        # deterministic dispatch node; do not ask the LLM to rediscover the
        # handoff from a ToolMessage.
        worker = request.get("worker") or state.get("active_worker")
        if worker:
            request["worker"] = worker
        request.setdefault("input_refs", input_refs)
        request.setdefault("options", selected_options)
        return {
            "dispatch_request": request,
            "pending_task": request,
            "task_type": request.get("task_type") or state.get("task_type"),
            "input_refs": input_refs,
            "selected_options": selected_options,
            "active_worker": worker,
            "waiting_inputs": [],
            "dispatch_status": "pending",
            "route_node": "persona_supervisor",
        }

    def stream_resume(
        self,
        context: PersonaAgentContext,
        specialist: Specialist,
        approved: bool | None = None,
        *,
        worker: str | None = None,
        task_id: str | None = None,
        attachment_ids: tuple[str, ...] = (),
        input_values: dict[str, Any] | None = None,
    ):
        """流式恢复被中断的确认回合，事件格式与 stream_query 一致。"""
        graph = self._graph()
        config = self._config(context)
        started = time.perf_counter()
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_resumed", "继续处理", status="started")
        context = replace(context, telemetry=recorder)
        resume_value = (
            {
                "approved": approved,
                "worker": worker,
                "task_id": task_id,
                "attachment_ids": list(attachment_ids),
                "input_values": dict(input_values or {}),
            }
            if worker or task_id or attachment_ids or input_values
            else {"approved": approved}
        )
        snapshot = graph.get_state(config)
        checkpoint_refs = (snapshot.values or {}).get("input_refs") or {}
        checkpoint_attachment_ids = checkpoint_refs.get("attachment_ids") if isinstance(checkpoint_refs, dict) else ()
        if checkpoint_attachment_ids:
            selected_ids = set(context.attachment_ids) | {str(item) for item in checkpoint_attachment_ids}
            manifest = tuple(
                {**item, "selected": str(item.get("file_id")) in selected_ids}
                for item in context.attachment_manifest
            )
            context = replace(
                context,
                attachment_ids=tuple(
                    str(item.get("file_id")) for item in manifest if item.get("selected")
                ),
                attachment_manifest=manifest,
            )
        if snapshot.interrupts:
            command = Command(resume=resume_value)
        elif snapshot.values and (
            snapshot.values.get("dispatch_status") in {"waiting_input", "accepted", "queued", "running"}
            or snapshot.values.get("waiting_inputs")
        ):
            command = Command(
                update=self._waiting_input_update(snapshot.values, resume_value),
                goto="supervisor_dispatch",
            )
        else:
            yield {
                "kind": "result",
                "result": self._result(
                    snapshot.values or {}, time.perf_counter() - started, recorder=recorder
                ),
            }
            return
        failed = False
        emitted_tokens = False
        last_stage: str | None = "正在恢复确认..."
        visible_stream = _VisibleTextStream()
        yield {"kind": "stage", "stage": last_stage}
        try:
            for _namespace, mode, payload in graph.stream(
                command,
                config,
                stream_mode=["messages", "updates", "custom"],
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
                    workflow_event = _workflow_update_event(payload)
                    # RVC 专项工作区只能在最终 AgentTurnResult 明确完成
                    # Core Agent -> rvc_worker handoff 后由路由层公开。图的
                    # updates/custom 流里可能先出现 Worker 工具返回值；如果
                    # 在这里转发，会让前端在“正在分析请求…”阶段提前创建卡片，
                    # 既绕过 Agent 可见交接，也会让 waiting_input 时序卡住。
                    if workflow_event is not None and not _is_rvc_workflow_event(workflow_event):
                        yield workflow_event
                    stage_node = next((node for node in _STAGE_BY_NODE if node in str(payload)), None)
                    stage = _STAGE_BY_NODE.get(stage_node) if stage_node else None
                    if stage and not emitted_tokens and stage != last_stage:
                        last_stage = stage
                        recorder.event(
                            "agent", "workflow_stage", stage, status="completed"
                        )
                        yield {"kind": "stage", "stage": stage}
                elif mode == "custom" and isinstance(payload, dict):
                    workflow_event = _workflow_update_event(payload)
                    # RVC 专项工作区只能在最终 AgentTurnResult 明确完成
                    # Core Agent -> rvc_worker handoff 后由路由层公开。图的
                    # updates/custom 流里可能先出现 Worker 工具返回值；如果
                    # 在这里转发，会让前端在“正在分析请求…”阶段提前创建卡片，
                    # 既绕过 Agent 可见交接，也会让 waiting_input 时序卡住。
                    if workflow_event is not None and not _is_rvc_workflow_event(workflow_event):
                        yield workflow_event
                    if payload.get("kind") == "workflow_update":
                        continue
                    stage = str(payload.get("stage") or "").strip()
                    if payload.get("kind") == "stage" and stage and not emitted_tokens and stage != last_stage:
                        last_stage = stage
                        event = {"kind": "stage", "stage": stage}
                        if payload.get("details"):
                            event["details"] = payload["details"]
                        yield event
        except Exception as exc:
            if is_transient_provider_error(exc):
                logger.warning("Agent 流式恢复时 LLM 服务瞬时故障，返回降级提示：%s", exc)
                answer = LLM_UNAVAILABLE_MESSAGE
            else:
                logger.exception("Agent 流式恢复执行失败，返回可见降级结果")
                answer = _execution_error_message(exc)
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
                    status="degraded",
                    answer=answer,
                    specialist="conversation",
                    duration_seconds=time.perf_counter() - started,
                    events=recorder.events(),
                    metrics=recorder.metrics(),
                ),
            }
            return
        state = graph.get_state(config)
        state_values = state.values or {}
        result = self._result(
            state_values, time.perf_counter() - started, recorder=recorder
        )
        if result.status == "pending_confirmation":
            yield {
                "kind": "result",
                "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
            }
            return
        if not emitted_tokens and result.answer:
            recorder.mark_first_token()
            emitted_tokens = True
            yield {"kind": "token", "text": result.answer}
        yield {
            "kind": "result",
            "result": replace(result, events=recorder.events(), metrics=recorder.metrics()),
        }

    def _find_pending(self, graph, context: PersonaAgentContext) -> AgentTurnResult | None:
        """恢复当前线程中尚未完成的确认或补充输入状态。

        `interrupts` 表示需要用户确认；Supervisor 的 `waiting_inputs`/
        `dispatch_status=waiting_input` 表示需要用户补充结构化输入。两者
        都必须在新问题执行前被恢复，避免新问题绕过旧的暂停状态。
        """
        snapshot = graph.get_state(self._config(context))
        state = snapshot.values or {}
        if snapshot.interrupts:
            action = snapshot.interrupts[0].value
            is_waiting_input = isinstance(action, dict) and action.get("kind") == "waiting_input"
            waiting_inputs = tuple(
                item for item in (((action or {}).get("required") if isinstance(action, dict) else ()) or ())
                if isinstance(item, dict)
            )
            return AgentTurnResult(
                status="waiting_input" if is_waiting_input else "pending_confirmation",
                answer="",
                specialist=self._specialist_for_state(state, action),
                worker=self._worker_for_state(state, action if isinstance(action, dict) else None),
                pending_action=action,
                workflow=workflow_from_task(
                    self._worker_for_state(state, action if isinstance(action, dict) else None),
                    action if isinstance(action, dict) else {},
                    status="waiting_input" if is_waiting_input else "waiting_input",
                ) if is_waiting_input else None,
                task_type=state.get("task_type") or (action.get("task_type") if isinstance(action, dict) else None),
                input_refs=dict(state.get("input_refs") or {}),
                selected_options=dict(state.get("selected_options") or {}),
                waiting_inputs=waiting_inputs,
                result_refs=tuple(item for item in (state.get("result_refs") or ()) if isinstance(item, dict)),
                task_id=str(state.get("task_id")) if state.get("task_id") else None,
            )

        waiting_inputs = tuple(
            item for item in (state.get("waiting_inputs") or ())
            if isinstance(item, dict)
        )
        if state.get("dispatch_status") == "waiting_input" or waiting_inputs:
            action = state.get("pending_task") or state.get("dispatch_request")
            if not isinstance(action, dict):
                action = {"kind": "waiting_input"}
            action = {
                **action,
                "kind": "waiting_input",
                "required": list(waiting_inputs),
            }
            worker = self._worker_for_state(state, action)
            return AgentTurnResult(
                status="waiting_input",
                answer="",
                specialist=self._specialist_for_state(state, action),
                worker=worker,
                pending_action=action,
                workflow=workflow_from_task(
                    worker,
                    {**action, "waiting_inputs": list(waiting_inputs)},
                    status="waiting_input",
                ),
                task_type=state.get("task_type") or action.get("task_type"),
                input_refs=dict(state.get("input_refs") or {}),
                selected_options=dict(state.get("selected_options") or {}),
                waiting_inputs=waiting_inputs,
                result_refs=tuple(
                    item for item in (state.get("result_refs") or ())
                    if isinstance(item, dict)
                ),
                task_id=str(state.get("task_id")) if state.get("task_id") else None,
            )
        return None

    def resume(
        self,
        context: PersonaAgentContext,
        specialist: Specialist,
        approved: bool | None = None,
        *,
        worker: str | None = None,
        task_id: str | None = None,
        attachment_ids: tuple[str, ...] = (),
        input_values: dict[str, Any] | None = None,
    ) -> AgentTurnResult:
        started = time.perf_counter()
        del specialist
        graph = self._graph()
        if worker or task_id or attachment_ids or input_values:
            # 结构化恢复值会与旧 approved 字段并存，供等待中的 Supervisor/Worker 使用。
            resume_value = {
                "approved": approved,
                "worker": worker,
                "task_id": task_id,
                "attachment_ids": list(attachment_ids),
                "input_values": dict(input_values or {}),
            }
        else:
            resume_value = {"approved": approved}
        config = self._config(context)
        recorder = RunRecorder(source="api")
        recorder.event("agent", "turn_resumed", "继续处理", status="started")
        context = replace(context, telemetry=recorder)
        snapshot = graph.get_state(config)
        checkpoint_refs = (snapshot.values or {}).get("input_refs") or {}
        checkpoint_attachment_ids = checkpoint_refs.get("attachment_ids") if isinstance(checkpoint_refs, dict) else ()
        if checkpoint_attachment_ids:
            selected_ids = set(context.attachment_ids) | {str(item) for item in checkpoint_attachment_ids}
            manifest = tuple(
                {**item, "selected": str(item.get("file_id")) in selected_ids}
                for item in context.attachment_manifest
            )
            context = replace(
                context,
                attachment_ids=tuple(
                    str(item.get("file_id")) for item in manifest if item.get("selected")
                ),
                attachment_manifest=manifest,
            )
        if snapshot.interrupts:
            command = Command(resume=resume_value)
        elif snapshot.values and (
            snapshot.values.get("dispatch_status") == "waiting_input"
            or snapshot.values.get("waiting_inputs")
        ):
            command = Command(
                update=self._waiting_input_update(snapshot.values, resume_value),
                goto="persona_supervisor",
            )
        else:
            return self._result(
                snapshot.values or {}, time.perf_counter() - started, recorder=recorder
            )
        # interrupt 使用 resume；Supervisor waiting_input 使用结构化 state update
        # 重新进入 persona_supervisor，不新增自然语言消息，也不重跑已完成 Worker。
        try:
            result = graph.invoke(
                command,
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
    def _public_specialist(name: str | None, action: dict | None = None) -> Specialist:
        tool_name = str((action or {}).get("tool") or "")
        if tool_name in _WEB_CONFIRMATION_TOOLS:
            return "web"
        mapped = _PUBLIC_SPECIALIST_BY_WORKER.get(canonicalize_worker_name(str(name or "")) or "")
        if mapped in {"conversation", "web", "memory", "management"}:
            return mapped  # type: ignore[return-value]
        return "conversation"

    @staticmethod
    def _specialist_for_state(state: dict, action: dict | None = None) -> Specialist:
        worker = state.get("active_worker")
        if worker:
            return PersonaAgentService._public_specialist(str(worker), action)
        if action:
            return PersonaAgentService._public_specialist(
                specialist_for_tool(str(action.get("tool", ""))),
                action,
            )
        return "conversation"

    @staticmethod
    def _worker_for_state(state: dict, action: dict | None = None) -> str | None:
        """从运行状态恢复 canonical Worker，避免被旧 specialist 映射覆盖。"""

        active_worker = canonicalize_worker_name(str(state.get("active_worker") or "")) or ""
        if active_worker in WORKERS:
            return active_worker

        # worker_results 是历史审计记录，不能作为下一轮对话的活动 worker。
        # 只有仍处于派发/等待状态时，才允许从它恢复 worker；否则上一轮
        # RVC 结果会污染普通新对话，使前端误以为 Agent 又创建了 RVC 工作流。
        dispatch_status = str(state.get("dispatch_status") or "").lower()
        has_active_dispatch = dispatch_status in {"accepted", "queued", "running", "waiting_input", "pending_confirmation"}
        if has_active_dispatch:
            for payload in reversed(state.get("worker_results") or []):
                if not isinstance(payload, dict):
                    continue
                worker = canonicalize_worker_name(str(payload.get("worker") or payload.get("specialist") or "")) or ""
                if worker in WORKERS:
                    return worker

        if action:
            tool_name = str(action.get("tool") or "")
            specialist = canonicalize_worker_name(specialist_for_tool(tool_name))
            if specialist in WORKERS:
                return specialist
        # Legacy result-only callers (and old checkpoints) may not carry a
        # dispatch marker. Preserve their non-RVC worker metadata, while never
        # reviving a stale RVC worker into a new ordinary chat turn.
        for payload in reversed(state.get("worker_results") or []):
            if not isinstance(payload, dict):
                continue
            worker = canonicalize_worker_name(str(payload.get("worker") or payload.get("specialist") or "")) or ""
            if worker in WORKERS and worker != "rvc_worker":
                return worker
        return None

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
            action = interrupts[0].value
            is_waiting_input = isinstance(action, dict) and action.get("kind") == "waiting_input"
            waiting_inputs = tuple(
                item for item in (((action or {}).get("required") if isinstance(action, dict) else ()) or ())
                if isinstance(item, dict)
            )
            if recorder is not None:
                recorder.finish(status="waiting_input" if is_waiting_input else "pending_confirmation")
            worker = PersonaAgentService._worker_for_state(state, action if isinstance(action, dict) else None)
            return AgentTurnResult(
                status="waiting_input" if is_waiting_input else "pending_confirmation",
                answer="",
                specialist=PersonaAgentService._specialist_for_state(state, action),
                worker=worker,
                pending_action=action,
                workflow=workflow_from_task(
                    worker,
                    action if isinstance(action, dict) else {},
                    status="waiting_input" if is_waiting_input else "waiting_input",
                ) if is_waiting_input else None,
                task_type=state.get("task_type") or (action.get("task_type") if isinstance(action, dict) else None),
                input_refs=dict(state.get("input_refs") or {}),
                selected_options=dict(state.get("selected_options") or {}),
                waiting_inputs=waiting_inputs,
                result_refs=tuple(item for item in (state.get("result_refs") or ()) if isinstance(item, dict)),
                task_id=str(state.get("task_id")) if state.get("task_id") else None,
            )
        messages = _latest_turn_messages(list(state.get("messages") or []))
        answer = ""
        tool_calls: list[dict[str, Any]] = []
        evidence: list[dict[str, Any]] = []
        artifacts: list[dict[str, Any]] = []
        citations: list[dict[str, Any]] = []
        uncertainties: list[str] = []
        trace: list[dict[str, Any]] = []
        tool_failures: list[dict[str, Any]] = []
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
            if isinstance(payload, dict):
                payload_status = str(payload.get("status") or payload.get("state") or "").lower()
                if payload_status in {"failed", "error", "denied"}:
                    public_error = payload.get("error") if isinstance(payload.get("error"), dict) else None
                    if public_error is None:
                        failure_message = payload.get("message") or payload.get("reason") or "专项任务执行失败"
                        public_error = {"code": "worker_failed", "message": str(failure_message)}
                    tool_failures.append(public_error)
                # 统一收集 Worker 产生的公开附件/任务，不把内部路径带出。
                payload_artifacts = payload.get("artifacts")
                if isinstance(payload_artifacts, list):
                    artifacts.extend(item for item in payload_artifacts if isinstance(item, dict))
                attachment = payload.get("attachment")
                if isinstance(attachment, dict) and attachment.get("file_id"):
                    artifacts.append({"type": "attachment", **attachment})
                for item in payload.get("attachments") or ():
                    if isinstance(item, dict) and item.get("file_id"):
                        artifacts.append({"type": "attachment", **item})
                task_payload = _find_rvc_task_payload(payload)
                if task_payload is not None:
                    task_artifact = {
                        "type": "task",
                        "worker": "rvc_worker",
                        "engine": "rvc",
                        "task_id": str(task_payload["task_id"]),
                        "status_url": payload.get("status_url"),
                        "message": payload.get("message") or "RVC 任务已提交",
                    }
                    for key in (
                        "status", "state", "phase", "progress", "progress_percent",
                        "mix_instrumental", "separate_vocals", "skip_separation",
                        "skip_mix", "index_id", "has_index", "index_rate",
                    ):
                        if task_payload.get(key) is not None:
                            task_artifact[key] = task_payload[key]
                    artifacts.append(task_artifact)
            if message.name == "search_persona_knowledge" and isinstance(payload, dict):
                evidence = list(payload.get("evidence") or [])
                # 知识检索的既有 artifacts 与 Worker 产物合并，而不是相互覆盖。
                artifacts.extend(item for item in (payload.get("artifacts") or []) if isinstance(item, dict))
                citations = list(payload.get("citations") or [])
                uncertainties = list(payload.get("uncertainties") or [])
                trace = list(payload.get("trace") or [])
        waiting_inputs = tuple(
            item for item in (state.get("waiting_inputs") or ())
            if isinstance(item, dict)
        )
        is_waiting_input = state.get("dispatch_status") == "waiting_input" or bool(waiting_inputs)
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
                status="waiting_input" if is_waiting_input else "completed",
                handoff_count=int(state.get("handoff_count") or 0),
            )
        worker_results = tuple(
            payload
            for payload in list(state.get("worker_results") or [])[-8:]
            if isinstance(payload, dict)
        )
        latest_error = next(
            (
                payload.get("error")
                for payload in reversed(worker_results)
                if isinstance(payload.get("error"), dict)
                and payload.get("error", {}).get("code")
            ),
            None,
        )
        if latest_error is None and tool_failures:
            latest_error = tool_failures[-1]
        error_code, error_message = resolve_error_fields(latest_error)
        dispatch_failed = state.get("dispatch_status") == "failed"
        result_status = (
            "waiting_input"
            if is_waiting_input
            else (
                "failed"
                if dispatch_failed or (error_code and error_code != "insufficient")
                else "completed"
            )
        )
        task_payload = next(
            (item for item in reversed(artifacts) if isinstance(item, dict) and item.get("task_id")),
            {},
        )
        # 终态结果优先使用本轮任务自身携带的 worker。不能从历史
        # worker_results 推断，否则上一轮 rvc_worker 会污染下一轮普通对话。
        task_worker = canonicalize_worker_name(
            str(task_payload.get("worker") or task_payload.get("specialist") or "")
        ) or ""
        worker_name = task_worker if task_worker in WORKERS else PersonaAgentService._worker_for_state(state)
        task_status = str(
            task_payload.get("state")
            or task_payload.get("status")
            or state.get("dispatch_status")
            or result_status
        )
        task_progress = task_payload.get("progress", task_payload.get("progress_percent", 0))
        workflow_source = {
            **task_payload,
            "waiting_inputs": list(waiting_inputs),
        }
        latest_worker_payload = next(
            (item for item in reversed(worker_results)
             if isinstance(item, dict) and str(item.get("worker") or "").strip()),
            {},
        )
        latest_session = latest_worker_payload.get("session")
        if isinstance(latest_session, dict):
            session_identifier = latest_session.get("session_id") or latest_session.get("id")
            if session_identifier:
                workflow_source.setdefault("session_id", str(session_identifier))
                workflow_source.setdefault("rvc_session_id", str(session_identifier))
        for key in ("rvc_session_id", "source_file_id", "session_id"):
            if workflow_source.get(key) is None and latest_worker_payload.get(key) is not None:
                workflow_source[key] = latest_worker_payload[key]
        # Waiting-input turns often have no task artifact yet. Carry the managed
        # handoff identifiers from checkpoint/result state so the public workflow
        # remains resumable without exposing local paths or making the UI guess.
        for key in ("rvc_session_id", "source_file_id", "session_id", "task_id"):
            if workflow_source.get(key) is None and state.get(key) is not None:
                workflow_source[key] = state.get(key)
        if not workflow_source.get("task_id") and state.get("task_id"):
            workflow_source["task_id"] = state.get("task_id")
        checkpoint_refs = state.get("input_refs")
        if isinstance(checkpoint_refs, dict):
            workflow_source.setdefault("input_refs", checkpoint_refs)
            if not workflow_source.get("attachment_ids") and isinstance(checkpoint_refs.get("attachment_ids"), list):
                workflow_source["attachment_ids"] = checkpoint_refs["attachment_ids"]
        workflow_payload = workflow_from_task(
            worker_name,
            workflow_source,
            status=task_status,
            phase=task_payload.get("phase") or state.get("phase"),
            progress=task_progress,
        )
        return AgentTurnResult(
            status=result_status,
            answer=answer,
            specialist=PersonaAgentService._specialist_for_state(state),
            worker=PersonaAgentService._worker_for_state(state),
            tool_calls=tuple(tool_calls[-8:]),
            worker_results=worker_results,
            workflow=workflow_payload,
            evidence=tuple(evidence),
            artifacts=tuple(artifacts),
            citations=tuple(citations),
            uncertainties=tuple(uncertainties),
            trace=tuple(trace),
            duration_seconds=duration_seconds,
            loaded_skills=tuple(loaded_skills),
            events=recorder.events() if recorder is not None else (),
            metrics=recorder.metrics() if recorder is not None else {},
            error=latest_error,
            error_code=error_code,
            error_message=error_message,
            task_type=state.get("task_type"),
            input_refs=dict(state.get("input_refs") or {}),
            selected_options=dict(state.get("selected_options") or {}),
            waiting_inputs=waiting_inputs,
            pending_action=(
                {
                    **(
                        state.get("pending_task")
                        or state.get("dispatch_request")
                        or {}
                    ),
                    "kind": "waiting_input",
                    "required": list(waiting_inputs),
                }
                if is_waiting_input
                else None
            ),
            result_refs=tuple(item for item in (state.get("result_refs") or ()) if isinstance(item, dict)),
            task_id=str(task_payload.get("task_id")) if task_payload.get("task_id") else None,
        )

    @staticmethod
    def _tool_payload(content: Any) -> Any:
        if not isinstance(content, str):
            return content
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return content
