"""Supervisor and LLM worker subgraphs, plus contract finalize."""

from __future__ import annotations

import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelRequest, dynamic_prompt
from langchain.messages import AIMessage, ToolMessage
from langchain.tools import ToolRuntime, tool
from langchain_core.language_models import BaseChatModel
from langgraph.config import get_stream_writer
from langgraph.types import Command, interrupt

from agents.context import PersonaAgentContext
from agents.graph.knowledge import _knowledge_specialist_result
from agents.graph.middleware import (
    _prompt_middleware,
    build_capability_guard_middleware,
    build_runtime_observability_middleware,
    build_worker_action_tool_middleware,
    build_single_search_visibility_middleware,
    build_skill_middleware,
)
from agents.graph.state import WORKERS, PersonaWorkflowState, SupervisorAgentState, Worker, worker_node_name
from agents.intent_funnel import IntentAnalysis, analyze_message_history
from agents.registry import tools_for_specialist, worker_manifest
from agents.runtime.models import AgentResult, validate_structured_handoff
from agents.skills import list_skills, load_skill, tools_for_skill
from agents.tools.structured_query import list_structured_tables_for_context
from agents.tools.memory import memories_for_context
from agents.tools.workspace_memory import workspace_memories_for_context
from rag.llm import get_llm


def worker_tools(worker: Worker):
    return tools_for_specialist(worker)


def _handoff_name(worker: Worker) -> str:
    return f"delegate_to_{worker}"


def _handoff_tool(worker: Worker):
    manifest = worker_manifest(worker)
    description = f"Delegate this task to the {manifest.name} worker. {manifest.description}"

    @tool(_handoff_name(worker), description=(
        f"{description} Provide a JSON object when possible with task_type, input_refs, "
        "options, and conversation_context. Use only managed file/model IDs; never provide paths, "
        "commands, shell, or Python code. A legacy plain-text request is accepted for compatibility."
    ))
    def handoff(request: str | dict, runtime: ToolRuntime[PersonaAgentContext]) -> Command:
        # create_agent 的工具运行在子图内；Command.PARENT 将控制权交回父图的
        # Worker 节点，而不是让主 Agent 在当前节点里继续生成答案。
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
        # 结构化交接是新合同；旧字符串只在边界处转换，避免 Worker 重新解析自由文本。
        if isinstance(request, dict):
            dispatch_request = dict(request)
        else:
            dispatch_request = {
                "task_type": "legacy_request",
                "input_refs": {"attachment_ids": list(runtime.context.attachment_ids)},
                "options": {"request": str(request)},
                "conversation_context": {
                    "conversation_id": runtime.context.conversation_id,
                    "workspace_id": runtime.context.workspace_id,
                    "persona_id": runtime.context.persona_id,
                },
            }
        dispatch_request["worker"] = worker
        dispatch_request = _normalize_dispatch_request(dispatch_request)
        # 服务端上下文是作用域的唯一权威来源，不能接受模型提交的同名覆盖值。
        dispatch_request["conversation_context"] = {
            "conversation_id": runtime.context.conversation_id,
            "workspace_id": runtime.context.workspace_id,
            "persona_id": runtime.context.persona_id,
        }
        dispatch_request.setdefault("input_refs", {})
        dispatch_request.setdefault("options", {})
        refs = dispatch_request["input_refs"]
        if isinstance(refs, dict):
            requested_ids = refs.get("attachment_ids")
            # 选中附件用于模型提示，作用域校验则覆盖当前会话中所有
            # ready 的受管附件，保证等待输入恢复时无需重复提交原附件 ID。
            allowed_ids = set(runtime.context.attachment_ids) | {
                str(item.get("file_id"))
                for item in (runtime.context.attachment_manifest or ())
                if isinstance(item, dict) and item.get("file_id")
            }
            if requested_ids is not None:
                if not isinstance(requested_ids, list) or any(str(item) not in allowed_ids for item in requested_ids):
                    return Command(update={"messages": [ToolMessage(
                        content=json.dumps({"status": "rejected", "code": "attachment_scope_denied", "message": "附件不属于当前会话"}, ensure_ascii=False),
                        tool_call_id=runtime.tool_call_id,
                    )]})
            elif allowed_ids:
                refs["attachment_ids"] = list(runtime.context.attachment_ids)

        # 发送状态通知
        try:
            writer = get_stream_writer()
            stage_names = {
                "knowledge_worker": "正在检索知识库",
                "memory_worker": "正在查询记忆",
                "document_worker": "正在管理文档",
                "profile_worker": "正在管理人设",
                "voice_worker": "正在准备声音系统流程",
                "rvc_worker": "正在准备 RVC 音频生产流程",
                "live2d_worker": "正在准备 Live2D 流程",
                "config_worker": "正在处理系统配置",
            }
            writer({"kind": "stage", "stage": stage_names.get(worker, f"正在调用 {worker}")})
        except RuntimeError:
            pass
        return Command(
            graph=Command.PARENT,
            goto="supervisor_dispatch",
            update={
                "active_worker": worker,
                "handoff_count": count + 1,
                "worker_request": str(request) if not isinstance(request, dict) else json.dumps(request, ensure_ascii=False),
                "worker_call_id": runtime.tool_call_id,
                "dispatch_request": dispatch_request,
                "pending_task": dispatch_request,
                "task_type": str(dispatch_request.get("task_type") or "legacy_request"),
                "input_refs": dispatch_request.get("input_refs") or {},
                "selected_options": dispatch_request.get("options") or {},
            },
        )

    return handoff


_TASK_TYPES_BY_WORKER = {
    "knowledge_worker": {"search_knowledge", "search_web", "query_structured_data", "legacy_request"},
    "memory_worker": {"save_memory", "recall_memory", "legacy_request"},
    "document_worker": {"ingest_document", "manage_document", "legacy_request"},
    "profile_worker": {"update_profile", "legacy_request"},
    "voice_worker": {"voice_asset", "voice_clone", "voice_status", "voice_training", "voice_synthesize", "voice_transcribe", "voice_reference", "legacy_request"},
    "rvc_worker": {"convert_audio_with_rvc", "mix_rvc_instrumental", "prepare_rvc_source", "separate_rvc_vocals", "cancel_rvc_task", "legacy_request"},
    "live2d_worker": {"manage_live2d", "legacy_request"},
    "config_worker": {"update_config", "resource_status", "resource_install", "legacy_request"},
}


_FORBIDDEN_DISPATCH_KEYS = frozenset({
    "input_path", "output_path", "path", "command", "cmd", "shell", "python", "python_file",
})

_RVC_ACTIONS = frozenset({"prepare_and_separate", "separate_vocals", "session_status", "convert", "cancel"})
_RVC_ACTION_ALIASES = {
    "prepare": "prepare_and_separate",
    "prepare_source": "prepare_and_separate",
    "confirm_processing": "prepare_and_separate",
    "separate": "separate_vocals",
    "conversion": "convert",
}

_RVC_REFERENCE_KEYS = frozenset({
    "session_id", "rvc_session_id", "source_file_id", "source_attachment_id", "task_id",
    "audio_file_id", "input_file_id", "model_id", "index_id",
})

_VOICE_ACTIONS = frozenset({
    "analyze", "session_status", "confirm_segments", "save_voice", "upload_segments",
    "synthesize", "transcribe", "bind", "train", "cancel",
})
_VOICE_ACTION_ALIASES = {
    "confirm_processing": "analyze",
    "prepare": "analyze",
    "segments": "confirm_segments",
    "tts": "synthesize",
    "asr": "transcribe",
}

_VOICE_REFERENCE_KEYS = frozenset({
    "session_id", "voice_session_id", "asset_id", "voice_asset_id", "audio_file_id",
    "source_file_id", "source_attachment_id", "attachment_id",
})


def _merge_rvc_refs(refs: dict[str, object], values: dict[str, object]) -> None:
    """Merge managed RVC identifiers without allowing aliases to diverge.

    The UI historically sent ``rvc_session_id`` in ``input_values`` while the
    tool contract requires ``session_id``.  Keep both public aliases for
    compatibility, but make ``session_id`` the canonical value consumed by the
    worker.
    """
    for key, value in values.items():
        if key in _RVC_REFERENCE_KEYS and value is not None:
            refs[key] = value
    session_id = refs.get("session_id") or refs.get("rvc_session_id")
    if session_id:
        refs["session_id"] = str(session_id)
        refs["rvc_session_id"] = str(session_id)


def _merge_voice_refs(refs: dict[str, object], values: dict[str, object]) -> None:
    """Keep voice session/asset aliases aligned without mixing RVC identifiers."""
    for key, value in values.items():
        if key in _VOICE_REFERENCE_KEYS and value is not None:
            refs[key] = value
    session_id = refs.get("session_id") or refs.get("voice_session_id")
    if session_id:
        refs["session_id"] = str(session_id)
        refs["voice_session_id"] = str(session_id)
    asset_id = refs.get("asset_id") or refs.get("voice_asset_id")
    if asset_id:
        refs["asset_id"] = str(asset_id)
        refs["voice_asset_id"] = str(asset_id)


def _rvc_action(request: dict[str, object]) -> str | None:
    options = request.get("options")
    options = options if isinstance(options, dict) else {}
    raw = request.get("action") or options.get("action")
    if raw is None:
        return None
    action = _RVC_ACTION_ALIASES.get(str(raw).strip().lower(), str(raw).strip().lower())
    return action


def _voice_action(request: dict[str, object]) -> str | None:
    options = request.get("options")
    options = options if isinstance(options, dict) else {}
    raw = request.get("action") or options.get("action")
    if raw is None:
        return None
    action = _VOICE_ACTION_ALIASES.get(str(raw).strip().lower(), str(raw).strip().lower())
    return action


def _normalize_dispatch_request(request: dict[str, object]) -> dict[str, object]:
    """将 RVC action 固定在受校验的 options 中，避免 Worker 从自由文本猜动作。"""
    normalized = dict(request)
    worker = str(normalized.get("worker") or "")
    if worker in {"rvc_worker", "voice_worker"}:
        options = dict(normalized.get("options") or {}) if isinstance(normalized.get("options"), dict) else {}
        action = _rvc_action(normalized) if worker == "rvc_worker" else _voice_action(normalized)
        if action is not None:
            options["action"] = action
            normalized["options"] = options
            normalized.pop("action", None)
    return normalized


def _dispatch_request_error(request: object, worker: str) -> str | None:
    """Validate only the graph-level safety contract; domain tools validate semantics."""
    if not isinstance(request, dict):
        return "结构化任务交接必须是对象"
    try:
        # 复用 Runtime 合同的递归安全校验，避免只检查已知的浅层字段。
        validate_structured_handoff({"dispatch_request": request})
    except ValueError as exc:
        return f"任务交接不安全：{exc}"
    if worker not in WORKERS:
        return f"未知 Worker：{worker}"
    for key in _FORBIDDEN_DISPATCH_KEYS:
        if key in request or key in (request.get("input_refs") or {}) or key in (request.get("options") or {}):
            return f"任务交接包含禁止字段：{key}"
    context = request.get("conversation_context")
    if not isinstance(context, dict):
        return "任务缺少 conversation_context"
    task_type = request.get("task_type")
    if not isinstance(task_type, str) or not task_type.strip():
        return "任务缺少 task_type"
    for key in ("input_refs", "options"):
        if not isinstance(request.get(key), dict):
            return f"任务字段 {key} 必须是对象"
    allowed_types = _TASK_TYPES_BY_WORKER.get(worker, set())
    if allowed_types and task_type not in allowed_types:
        return f"task_type {task_type} 不属于 Worker {worker}"
    if worker == "rvc_worker":
        action = _rvc_action(request)
        if action is not None and action not in _RVC_ACTIONS:
            return f"RVC 不支持 action={action}"
        if action == "convert":
            refs = request.get("input_refs") or {}
            if not isinstance(refs, dict) or not (refs.get("session_id") or refs.get("audio_file_id") or refs.get("input_file_id")):
                return "RVC convert 缺少 session_id 或输入文件引用"
        if action == "cancel":
            refs = request.get("input_refs") or {}
            if not isinstance(refs, dict) or not (refs.get("task_id") or refs.get("session_id")):
                return "RVC cancel 缺少 task_id 或 session_id"
    if worker == "voice_worker":
        action = _voice_action(request)
        if action is not None and action not in _VOICE_ACTIONS:
            return f"voice 不支持 action={action}"
        if action == "cancel":
            refs = request.get("input_refs") or {}
            if not isinstance(refs, dict) or not (refs.get("session_id") or refs.get("voice_session_id")):
                return "voice cancel 缺少 session_id"
    context_worker = context.get("worker")
    if context_worker is not None and str(context_worker) != worker:
        return "conversation_context 的 Worker 不匹配"
    return None


def _missing_dispatch_inputs(request: dict[str, object], worker: str) -> list[dict[str, object]]:
    """返回进入领域 Worker 前必须由用户补齐的结构化输入。"""

    refs = request.get("input_refs") or {}
    options = request.get("options") or {}
    if not isinstance(refs, dict) or not isinstance(options, dict):
        return [{"kind": "configuration", "input_id": "dispatch_contract", "label": "请补充任务信息", "required": True}]

    missing: list[dict[str, object]] = []
    if worker == "rvc_worker":
        attachment_ids = refs.get("attachment_ids") or []
        audio_file_id = refs.get("audio_file_id")
        if not audio_file_id and not attachment_ids:
            missing.append({
                "kind": "attachment", "input_id": "rvc_audio", "label": "上传音频或视频", "required": True,
                "accepted_file_types": ["audio/*", "video/*"],
            })
        # 交接阶段只收集启动 RVC session 所必需的源文件。模型、Index 和
        # 转换参数属于 rvc_worker 的业务状态，必须在 Agent 已完成 handoff、
        # 源文件准备/分离之后逐项询问；如果在这里一次性拦截，会让前端在
        # “正在分析请求…”阶段直接显示配置卡，并且永远进不到 worker。
    elif worker == "document_worker":
        # 只有入库/导入才强制附件或 URL；列表、删除、重命名不得在图层拦截成“请上传”。
        task_type = str(request.get("task_type") or "")
        has_source = bool(
            refs.get("attachment_ids")
            or refs.get("document_file_id")
            or refs.get("source_url")
            or options.get("source_url")
        )
        if task_type == "ingest_document" and not has_source:
            missing.append({
                "kind": "attachment",
                "input_id": "document_worker",
                "label": "上传文档或链接",
                "required": True,
                "accepted_file_types": ["application/pdf", "text/*"],
            })
    elif worker == "voice_worker":
        # 查询音色/系统状态不需要附件；只有明确的克隆任务才在图层收集素材。
        task_type = str(request.get("task_type") or "")
        has_source = bool(
            refs.get("attachment_ids")
            or refs.get("audio_file_id")
            or refs.get("source_file_id")
            or refs.get("source_attachment_id")
        )
        if task_type == "voice_clone" and not has_source:
            missing.append({
                "kind": "attachment",
                "input_id": "voice_material",
                "label": "上传素材",
                "required": True,
                "accepted_file_types": ["audio/*", "video/*"],
            })
        if task_type == "voice_transcribe" and not has_source:
            missing.append({
                "kind": "attachment",
                "input_id": "audio_attachment",
                "label": "上传音频",
                "required": True,
                "accepted_file_types": ["audio/*"],
            })
        if task_type == "voice_reference" and not has_source:
            missing.append({
                "kind": "attachment",
                "input_id": "audio_attachment",
                "label": "上传参考音频",
                "required": True,
                "accepted_file_types": ["audio/*"],
            })
    return missing


def _merge_resume_dispatch(request: dict[str, object], resume: object) -> dict[str, object]:
    """把 interrupt 恢复时用户选择的引用/选项合并回交接合同。"""

    # LangGraph 在恢复时把 interrupt 的返回值放回当前节点；旧 approved
    # 确认值不应改变任务合同。
    if not isinstance(resume, dict):
        return request
    merged = dict(request)
    refs = dict(merged.get("input_refs") or {}) if isinstance(merged.get("input_refs"), dict) else {}
    options = dict(merged.get("options") or {}) if isinstance(merged.get("options"), dict) else {}
    ids = resume.get("attachment_ids")
    if isinstance(ids, list):
        refs["attachment_ids"] = [str(item) for item in ids]
        if len(ids) == 1:
            refs.setdefault("audio_file_id", str(ids[0]))
    values = resume.get("input_values")
    ref_keys = _RVC_REFERENCE_KEYS | _VOICE_REFERENCE_KEYS | {"document_file_id"}
    if isinstance(values, dict):
        for key, value in values.items():
            if key in ref_keys:
                refs[key] = value
            else:
                options[key] = value
    for key in ref_keys:
        if resume.get(key) is not None:
            refs[key] = resume[key]
    # The confirmation button may only send an action. In that case retain the
    # session established by the previous worker turn instead of falling back
    # to the stale attachment-only contract.
    worker = str(merged.get("worker") or "")
    if worker == "voice_worker":
        _merge_voice_refs(refs, refs)
    elif worker == "rvc_worker":
        _merge_rvc_refs(refs, refs)
    merged["input_refs"] = refs
    merged["options"] = options
    return merged


def _supervisor_dispatch(state: PersonaWorkflowState) -> dict:
    """确定性 Dispatch：校验合同，缺输入时暂停而不是再次调用 Core。"""
    request = state.get("dispatch_request") or state.get("pending_task") or {}
    if not isinstance(request, dict):
        request = {}
    else:
        request = dict(request)
    # Worker results persist managed identifiers in state.input_refs. The
    # dispatch request itself may be an older attachment-only snapshot, so
    # merge the state refs before validating or resuming the action. This is
    # the critical bridge for a confirmation that sends only ``action``.
    state_refs = state.get("input_refs")
    request_refs = request.get("input_refs")
    worker = str(state.get("active_worker") or request.get("worker") or "")
    if isinstance(state_refs, dict):
        merged_refs = dict(request_refs) if isinstance(request_refs, dict) else {}
        merged_refs.update(state_refs)
        if worker == "voice_worker":
            _merge_voice_refs(merged_refs, merged_refs)
        elif worker == "rvc_worker":
            _merge_rvc_refs(merged_refs, merged_refs)
        request["input_refs"] = merged_refs
    request = _normalize_dispatch_request(request)
    worker = str(state.get("active_worker") or request.get("worker") or worker)
    error = _dispatch_request_error(request, worker)
    missing = _missing_dispatch_inputs(request, worker) if not error else []
    if error or missing:
        action = {
            "kind": "waiting_input",
            "worker": worker or None,
            "task_type": request.get("task_type"),
            "message": error or "还缺少执行任务所需的信息",
            "required": missing or [{"kind": "configuration", "input_id": "dispatch_contract", "label": error or "请补充任务信息", "required": True}],
        }
        # interrupt 会把状态稳定地交给 API/UI；不再 route 回 Core，避免
        # Core 重复 handoff 造成循环。恢复后本节点从头执行并重新校验。
        resume_value = interrupt(action)
        request = _merge_resume_dispatch(request, resume_value)
        error = _dispatch_request_error(request, worker)
        missing = _missing_dispatch_inputs(request, worker) if not error else []
        if error or missing:
            action = {
                **action,
                "message": error or "还缺少执行任务所需的信息",
                "required": missing or action["required"],
            }
            interrupt(action)
            return {"dispatch_status": "waiting_input", "waiting_inputs": action["required"]}
    options = request.get("options") if isinstance(request.get("options"), dict) else {}
    refs = request.get("input_refs") if isinstance(request.get("input_refs"), dict) else {}
    return {
        "dispatch_request": request,
        "pending_task": request,
        "task_id": str(request.get("task_id")) if request.get("task_id") else None,
        "task_type": str(request.get("task_type")) if request.get("task_type") else None,
        "input_refs": dict(refs),
        "selected_options": dict(options),
        "route_node": worker_node_name(worker),
        "dispatch_status": "accepted",
        "waiting_inputs": [],
    }


_ALLOWED_WORKER_RESULT_STATUSES = frozenset({
    "accepted", "queued", "running", "waiting_input", "completed",
    "insufficient", "failed", "error", "denied", "confirmation_required",
})
_TERMINAL_WORKER_RESULT_STATUSES = frozenset({"completed", "insufficient"})
_FAILED_WORKER_RESULT_STATUSES = frozenset({"failed", "error", "denied"})


def _validate_public_worker_result(result: dict[str, object], expected_worker: str | None) -> tuple[dict[str, object] | None, str | None]:
    """在 Worker → Supervisor 边界做确定性结果门禁。

    Worker 结果可以带异步任务和附件引用，但不能把本地路径、命令或
    未知 Worker 伪造字段带回 Core。校验失败时返回公开错误，不把异常细节
    泄漏到对话。
    """
    if not isinstance(result, dict):
        return None, "Worker 返回结果必须是对象"
    try:
        validate_structured_handoff({"dispatch_request": result})
        validated = AgentResult.model_validate(result).as_worker_dict()
    except (TypeError, ValueError) as exc:
        return None, f"Worker 结果合同无效：{exc}"
    worker = str(validated.get("worker") or validated.get("specialist") or "")
    if expected_worker and worker != expected_worker:
        return None, "Worker 结果归属不匹配"
    # RVC 旧工具仍返回 ok/rejected；在公共 Worker 合同边界统一，避免
    # 工具层兼容调用被误判为无效结果。
    status = str(validated.get("status") or "").lower()
    status_map = {"ok": "accepted", "rejected": "failed", "unavailable": "error", "not_found": "failed", "not_cancelled": "failed"}
    if status in status_map:
        status = status_map[status]
        validated["status"] = status
    if status not in _ALLOWED_WORKER_RESULT_STATUSES:
        return None, f"Worker 返回了不支持的状态：{status or '空'}"
    return validated, None


def _supervisor_collect(state: PersonaWorkflowState) -> dict:
    """确定性收束 Worker 输出，再把控制权交回 Core。"""
    raw_results = list(state.get("worker_results") or [])
    result = next((item for item in reversed(raw_results) if isinstance(item, dict)), None)
    expected_worker = str(state.get("active_worker") or "") or None
    if expected_worker is None:
        request = state.get("dispatch_request") or state.get("pending_task") or {}
        if isinstance(request, dict) and request.get("worker"):
            expected_worker = str(request["worker"])
    if result is None:
        failure = {"status": "failed", "worker": expected_worker, "error": {"code": "worker_empty_result", "message": "Worker 未返回结果"}}
        return {
            "dispatch_status": "failed",
            "route_node": "persona_supervisor",
            "worker_results": [failure],
            "messages": [ToolMessage(content=json.dumps(failure, ensure_ascii=False), name="supervisor_collect", tool_call_id="supervisor-collect")],
        }
    validated, error = _validate_public_worker_result(result, expected_worker)
    if error:
        failure = {
            "status": "failed",
            "worker": expected_worker,
            "answer": "专项任务结果校验失败。",
            "error": {"code": "invalid_worker_result", "message": error},
        }
        return {
            "dispatch_status": "failed",
            "route_node": "persona_supervisor",
            "worker_results": [failure],
            "result_refs": [],
            "messages": [ToolMessage(content=json.dumps(failure, ensure_ascii=False), name="supervisor_collect", tool_call_id="supervisor-collect")],
        }
    assert validated is not None
    status = str(validated.get("status") or "completed").lower()
    if status in _FAILED_WORKER_RESULT_STATUSES:
        dispatch_status = "failed"
    elif status in {"waiting_input", "confirmation_required"}:
        # This is a resumable input boundary, not a successful background task.
        # Keep it visible to the API/UI and do not let Core invent a success reply.
        dispatch_status = "waiting_input"
    elif status in {"accepted", "queued", "running"}:
        dispatch_status = status
    else:
        dispatch_status = "completed"
    update = {
        "dispatch_status": dispatch_status,
        "route_node": "persona_supervisor",
        "worker_results": [validated],
        "result_refs": list(validated.get("result_refs") or []),
    }
    if validated.get("workflow") is not None:
        update["workflow"] = validated["workflow"]
    if dispatch_status == "waiting_input":
        update["waiting_inputs"] = list(validated.get("waiting_inputs") or [])
    return update


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
                "delegate_to_knowledge_worker once. Its request must be a JSON string containing kind=structured, "
                "the original query, and one read-only SELECT as sql. Use physical identifiers and human-readable aliases. "
            )
    except Exception:
        structured_block = ""
    attachment_block = ""
    if context.attachment_manifest:
        attachments = [
            {
                "file_id": item.get("file_id"),
                "name": item.get("name"),
                "mime_type": item.get("mime_type"),
                "kind": item.get("kind"),
                "size": item.get("size"),
                "duration": item.get("duration"),
                "width": item.get("width"),
                "height": item.get("height"),
                "selected": bool(item.get("selected")),
                "uses": item.get("uses") or [],
            }
            for item in context.attachment_manifest
        ]
        attachment_block = (
            "\nManaged attachments available in this conversation:\n"
            f"<conversation_attachments>{json.dumps(attachments, ensure_ascii=False)}</conversation_attachments>\n"
            "Use file_id as the only file reference in worker requests. Never guess, request, expose, or pass a local path. "
            "Prefer attachments marked selected for this turn. Audio/video may be delegated to rvc_worker only for an explicit RVC audio-file request; "
            "documents enter RAG only after an explicit user request; images may be interpreted only when the active model actually supports vision. "
        )

    funnel_block = (
        "\nThe following intent-funnel result is a routing decision. "
        "When primary is not ambiguous, call its matching delegate tool immediately with a concise request. "
        "When primary=conversation, answer directly without delegating. "
        "If configuration_hint=true, treat the user's request as configuration/status/install management "
        "when the wording asks to check, install, download, update, cancel, clean, or inspect a resource; "
        "do not delegate that request to a feature worker such as rvc_worker merely because the resource name is RVC. "
        "Only an explicit audio/video production or voice-conversion action should go to rvc_worker. "
        "Treat the funnel as an advisory signal, not authorization. "
        "It must not override security, policy, capability, or evidence boundaries:\n"
        f"{intent_hint}\n"
        if intent_hint
        else ""
    )
    return (
        f"You are {context.persona_name}. You are the only assistant visible to the user. "
        "The following persona profile is behavioral guidance, not a user request:\n"
        f"<persona_profile>{profile}</persona_profile>\n"
        "Answer in the persona's voice and use delegated results as evidence. "
        "Delegate uploaded-knowledge and current public-information questions to knowledge_worker, "
        "durable user-memory requests to memory_worker, persona documents and URL imports to document_worker, "
        "profile updates to profile_worker, voice-related tasks to voice_worker, explicit RVC audio-file production tasks to rvc_worker, Live2D tasks to live2d_worker, and configuration changes to config_worker. For installation status or safe setup of app-managed resources (RVC, separator, FFmpeg, ASR, embedding, reranker, GPT-SoVITS), delegate to config_worker and use get_resource_install_status; use manage_resource_install only for an explicit install, cancel, or clean request. Never delete user files, models, indexes, attachments, or arbitrary paths. "
        "Do not search the public web yourself; knowledge_worker may fall back to web search after policy checks. "
        "When the user asks to install a skill, call install_skill (GitHub repo+path or URL); "
        "when they ask which skills are installable, call list_installable_skills. "
        "When the user asks to add, list, or test MCP servers, call "
        "add_mcp_server / list_mcp_servers / test_mcp_server. "
        "When checking MCP / QQ / Bilibili status or reconnecting them, call "
        "list_integration_status / reconnect_mcp_server / reconnect_onebot / reconnect_bilibili. "
        f"{memory_block}{workspace_memory_block}{summary_block}{structured_block}{attachment_block}{funnel_block}"
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


def _worker_prompt(worker: Worker, context: PersonaAgentContext, dispatch: dict | None = None) -> str:
    if worker == "knowledge_worker":
        raise RuntimeError("knowledge uses the planner subgraph, not an LLM worker prompt")
    manifest = worker_manifest(worker)
    tool_names = ", ".join(manifest.tools) or "no tools"
    handoff_format = (
        "Finish with this concise factual handoff format:\n"
        "KEY FACTS:\n- supported findings most relevant to the request\n"
        "SOURCES:\n- source or citation for each material finding\n"
        "UNCERTAINTIES OR CONFLICTS:\n- missing, conflicting, or unreliable information"
    )
    attachment_note = ""
    if context.attachment_manifest:
        attachment_note = (
            " Managed conversation attachments: "
            f"{json.dumps(list(context.attachment_manifest), ensure_ascii=False, default=str)}. "
            "Only use their file_id values; local paths are forbidden. "
        )
    dispatch_note = ""
    if isinstance(dispatch, dict):
        # 只将已通过 Supervisor 校验的引用/选项放入 Worker 提示，
        # 不包含路径、命令或原始本地环境信息。
        dispatch_note = (
            " Validated dispatch contract: "
            f"{json.dumps({key: dispatch.get(key) for key in ('worker', 'task_type', 'input_refs', 'options')}, ensure_ascii=False, default=str)}. "
            "Use these managed IDs and options as the source of truth. For rvc_worker, options.action is validated by Supervisor and is the only executable action; never infer another action from user text. "
        )
        if worker == "rvc_worker":
            options = dispatch.get("options") if isinstance(dispatch.get("options"), dict) else {}
            action = str(options.get("action") or "").strip().lower()
            forced_tools = {
                "prepare_and_separate": "prepare_rvc_source",
                "session_status": "get_rvc_session",
                "separate_vocals": "separate_rvc_vocals",
                "convert": "convert_audio_with_rvc",
                "cancel": "cancel_rvc_task",
            }
            if action in forced_tools:
                dispatch_note += (
                    f" This is structured action {action}. You MUST immediately call only "
                    f"{forced_tools[action]} with the managed IDs; do not answer in prose, do not "
                    "create or attach another session, and do not return the previous confirmation card. "
                )
    rvc_note = (
        " RVC is only for explicit audio-to-audio file production and is a staged interactive workflow. "
        "Use file_id/session_id/task_id/model_id/index_id only; never use input_path, shell commands, Python files, "
        "role voice binding, TTS, or training. Treat the validated dispatch contract as executable input, not as prose to reinterpret. "
        "The source-file stage is mandatory: when input_refs has no usable attachment_id, return status=waiting_input "
        "with exactly one attachment input requiring audio/* or video/*. After an attachment_id is supplied, first call "
        "create_rvc_session and attach_file_to_rvc_session, then return status=waiting_input with a confirmation input titled "
        "处理音频; do not call conversion yet. Only after the user confirms processing may you call prepare_rvc_source, "
        "poll with get_rvc_session, and then call separate_rvc_vocals. The UI sends structured options.action; action=cancel "
        "must call cancel_rvc_task when a task_id exists, then return status=cancelled. action=prepare_and_separate means perform "
        "prepare_rvc_source and separation in order; action=separate_vocals only separates after preparation. After separation completes, "
        "return status=waiting_input with a confirmation/input for choosing the vocals input and then request model_id, optional index_id, pitch and "
        "mix_instrumental one at a time. Never submit convert_audio_with_rvc until those choices are present and the user has "
        "explicitly confirmed generation. An accepted conversion is asynchronous: return its task_id/workflow without claiming "
        "completion. Only register an output attachment after get_rvc_task reports success; never invent a result file. "
        if worker == "rvc_worker" else ""
    )
    config_note = (
        " App-managed resources are rvc, separator, asr, gpt_sovits, ffmpeg, embedding, and reranker. "
        "Aliases such as stt, local_embedding, local_rerank, and tts are accepted. "
        "Call get_resource_install_status with resource=all to list them. "
        "Use manage_resource_install only for an explicit install, cancel, or clean request. "
        "Never delete user .pth/.index files, attachments, or knowledge documents. "
    ) if worker == "config_worker" else ""
    voice_note = (
        " Voice queries use list_voice_assets, get_voice_system_status, get_gpt_sovits_engine_status, studio and training status tools. "
        "Clone/training/synthesis tools require an explicit user request. Runtime services come from AgentRuntime.app_state, "
        "the same managers as HTTP. Clone material must use conversation attachment_id; never local file paths. "
        "Voice Studio processing is asynchronous via VoiceStudioManager. GPT-SoVITS training uses gpt_sovits_training and Voice Asset IDs. "
        "Use synthesize_voice_asset for GPT-SoVITS TTS; persist audio as a conversation attachment, never input_path. "
        "Use train_voice_from_studio for studio-segment training. control_gpt_sovits_service only starts/stops an installed engine. "
        "Use create_voice_asset, update_voice_asset and delete_voice_asset for GPT-SoVITS Voice Asset CRUD. "
        "delete_voice_asset removes the database record only and never deletes user model files. "
        "Use transcribe_voice_attachment with conversation attachment_id; never local file paths. "
        "Use get_voice_asset to query one GPT-SoVITS Voice Asset. "
        "Use set_voice_asset_reference_audio with conversation attachment_id to bind reference audio; never local file paths. "
        "Use bind_voice_asset_to_persona to write profile.tts.voice_asset_id for the current persona. "
        "Use upload_voice_studio_segments with conversation attachment_id to add extra clean audio clips. "
        "action=cancel or cancel_voice_studio_session stops a running Voice Studio job and must not delete session files. "
        "Environment download/install belongs to config_worker, not voice_worker. "
        "RVC file conversion belongs to rvc_worker. "
    ) if worker == "voice_worker" else ""
    document_note = (
        " Listing or deleting documents does not require an upload. ingest_document needs attachment_ids or a source URL. "
        "Use import_knowledge_from_url for URL import. Environment/embedding install belongs to config_worker. "
    ) if worker == "document_worker" else ""
    return (
        f"You are an internal {manifest.name} worker for {context.persona_name}. "
        f"Your boundary is: {manifest.description} "
        f"Only these registered tools are available: {tool_names}. "
        "Use only the provided tools. Do not roleplay, address the user, or claim a task succeeded "
        f"without a tool result.{attachment_note}{dispatch_note}{rvc_note}{config_note}{voice_note}{document_note} Return a concise result that can be normalized into the shared AgentResult "
        f"contract with worker={manifest.name}; do not expose hidden reasoning. {handoff_format}"
    )

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

def _supervisor_agent(model: BaseChatModel | None):
    # LangChain 1.0 的 create_agent 高阶入口：把「模型调用 -> 工具决策 -> 执行 -> 结果整合」
    # 闭环封装为 LangGraph 子图，开发者只需提供模型、工具和 system prompt。
    # 本项目的工具是 handoff（delegate_to_*）：Supervisor 不直接干活，
    # 而是把任务转交给对应 Worker 节点，由 Worker 用受限工具集或确定性管线执行后再交回。
    from agents.tools.skills import run_skill_script

    from agents.tools.skill_install import install_skill, list_installable_skills
    from agents.tools.mcp_admin import add_mcp_server, list_mcp_servers, test_mcp_server
    from agents.tools.integrations_admin import (
        list_integration_status,
        reconnect_bilibili,
        reconnect_mcp_server,
        reconnect_onebot,
    )

    base_tools = (
        [_handoff_tool(worker) for worker in WORKERS]
        + [load_skill, install_skill, list_installable_skills]
        + [add_mcp_server, list_mcp_servers, test_mcp_server]
        + [list_integration_status, reconnect_mcp_server, reconnect_onebot, reconnect_bilibili]
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
    # 每个受限工具 Worker 是独立的 create_agent，只挂自己那一类工具，
    # 从工具集层面强制最小权限，防止 Worker 越权调用其他领域能力。
    # knowledge 不走这条路径：它是 planner + 确定性 retrieve/fallback 子图。
    if worker == "knowledge_worker":
        raise RuntimeError("knowledge uses _knowledge_subgraph, not create_agent")
    manifest = worker_manifest(worker)

    @dynamic_prompt
    def worker_prompt(request: ModelRequest) -> str:
        dispatch = request.state.get("dispatch_request") or request.state.get("pending_task")
        return _worker_prompt(worker, request.runtime.context, dispatch if isinstance(dispatch, dict) else None)

    return create_agent(
        model=model or get_llm(),
        tools=worker_tools(worker),
        middleware=[
            worker_prompt,
            build_worker_action_tool_middleware(worker),
            build_single_search_visibility_middleware(),
            build_runtime_observability_middleware(),
            build_capability_guard_middleware(),
        ],
        context_schema=PersonaAgentContext,
        name=worker_node_name(manifest.name),
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

def _after_finalize_route(state: PersonaWorkflowState) -> str:
    """Keep RVC resumable/failed results structured; preserve legacy Core prose for others."""
    status = str(state.get("dispatch_status") or "completed").lower()
    request = state.get("dispatch_request") or state.get("pending_task") or {}
    worker = str(request.get("worker") or "").lower() if isinstance(request, dict) else ""
    # RVC UI consumes the worker contract directly. Returning to Core for these
    # states caused success hallucinations and a second handoff on the next
    # short reply (for example ``A``).
    if worker in {"rvc_worker", "voice_worker"} and status != "completed":
        return "rvc_wait_boundary"
    return "supervisor_collect"


def _finalize_worker(worker: Worker):
    def finalize(state: PersonaWorkflowState) -> dict:
        # 发送完成状态通知
        try:
            writer = get_stream_writer()
            complete_names = {
                "knowledge_worker": "知识检索完成",
                "memory_worker": "记忆查询完成",
                "document_worker": "文档管理完成",
                "profile_worker": "人设管理完成",
                "voice_worker": "声音任务已完成",
                "rvc_worker": "RVC 音频生产任务已完成，整理结果中…",
                "live2d_worker": "Live2D 任务已完成，整理结果中…",
                "config_worker": "配置处理完成",
            }
            writer({"kind": "stage", "stage": complete_names.get(worker, f"{worker} 完成")})
        except RuntimeError:
            pass
        messages = state.get("messages", [])
        if worker == "knowledge_worker":
            specialist_result = _knowledge_specialist_result(messages)
            worker_result = AgentResult.model_validate(
                {
                    **specialist_result,
                    "worker": worker,
                    "specialist": worker,
                }
            )
            # Supervisor 只接收门禁后的 JSON；未通过时只有不确定性，不包含答案草稿或弱证据。
            result_payload = worker_result.as_worker_dict()
        else:
            # Worker 的工具结果才是专项工作的事实来源。AIMessage 只保留为
            # 没有结构化工具结果时的兼容摘要，不能把 Worker 内部对话直接当作用户答复。
            worker_tool_names = {spec.name for spec in tools_for_specialist(worker)}
            structured_payloads: list[dict] = []
            for message in reversed(messages):
                if not isinstance(message, ToolMessage) or message.name not in worker_tool_names:
                    continue
                payload = message.content
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                if isinstance(payload, dict):
                    structured_payloads.append(payload)
            payload = structured_payloads[0] if structured_payloads else {}
            payload_status = str(payload.get("status") or payload.get("state") or "completed").lower()
            failure_reason = str(
                payload.get("message")
                or payload.get("reason")
                or ((payload.get("error") or {}).get("message") if isinstance(payload.get("error"), dict) else "")
                or "专项任务执行失败"
            ).strip()
            summary = str(payload.get("answer") or payload.get("message") or "").strip()
            # 兼容旧 Worker：早期 Worker 可能只返回一条普通 AIMessage，没有
            # 结构化 ToolMessage。此时取 handoff 后的第一条 Worker 文本，不能
            # 使用 finalize 之后的 Persona 回复，也不能把 RVC 纳入该回退路径。
            if not summary and not structured_payloads and worker != "rvc_worker":
                # 子图边界通常只把 Worker 自身的 AIMessage 带回父图，因此
                # handoff tool-call 不一定仍在 messages 中；优先按节点名取值，
                # 再退回到 handoff 后文本，兼容旧版图实现。
                for message in messages:
                    if (
                        isinstance(message, AIMessage)
                        and message.name == worker_node_name(worker)
                        and message.content
                        and not message.tool_calls
                    ):
                        summary = str(message.content).strip()
                        break
                if not summary:
                    handoff_seen = False
                    for message in messages:
                        if isinstance(message, AIMessage):
                            if any(call.get("name") == _handoff_name(worker) for call in (message.tool_calls or ())):
                                handoff_seen = True
                                continue
                            if handoff_seen and message.content and not message.tool_calls:
                                summary = str(message.content).strip()
                                break
            if payload_status in {"failed", "error", "denied"}:
                # 失败状态只能来自工具事实；绝不能回退到 Worker 的 AIMessage，
                # 否则会把“文件已就绪/分离完成”等旧式自然语言误报成成功。
                summary = failure_reason
            elif not summary:
                # accepted/waiting 等中间状态同样不使用自由生成文本，避免
                # 在异步任务尚未完成时提前宣称已完成。
                summary = {
                    "waiting_input": "",
                    "accepted": "任务已提交，正在处理。",
                    "queued": "任务已排队，正在处理。",
                    "running": "任务正在处理。",
                }.get(payload_status, "专项任务已完成。")
            result_data = {
                "worker": worker,
                "specialist": worker,
                "status": str(payload.get("status") or "completed"),
                "answer": summary,
                "artifacts": [item for item in (payload.get("artifacts") or []) if isinstance(item, dict)],
                "evidence": [item for item in (payload.get("evidence") or []) if isinstance(item, dict)],
                "citations": [item for item in (payload.get("citations") or []) if isinstance(item, dict)],
                "uncertainties": [str(item) for item in (payload.get("uncertainties") or [])],
                "error": payload.get("error") if isinstance(payload.get("error"), dict) else None,
                "requires_approval": bool(payload.get("requires_approval")),
            }
            result_refs = payload.get("result_refs")
            if isinstance(result_refs, list):
                result_data["result_refs"] = [
                    item if isinstance(item, dict) else {"file_id": str(item)}
                    for item in result_refs
                ]
            waiting_inputs = payload.get("waiting_inputs")
            if isinstance(waiting_inputs, list):
                result_data["waiting_inputs"] = [
                    item for item in waiting_inputs if isinstance(item, dict)
                ]
            if payload.get("task_id") is not None:
                result_data["task_id"] = str(payload["task_id"])
            # 工具返回的任务/附件摘要保留在统一 artifacts 中，供 Core、SSE
            # 和对话卡片继续消费；不把工具调用细节暴露成自然语言。
            for key in (
                "task", "attachment", "attachments", "workflow", "session",
                "rvc_session_id", "source_file_id", "source_attachment_id", "session_id", "task_id",
                "attachment_ids", "input_refs",
            ):
                if payload.get(key) is not None:
                    result_data[key] = payload[key]
            # RVC session tools return the managed identifier inside the public
            # session snapshot. Promote it so the chat can continue polling
            # after the worker returns a waiting_input result.
            session_payload = result_data.get("session")
            if isinstance(session_payload, dict):
                session_identifier = session_payload.get("session_id") or session_payload.get("id")
                if session_identifier and not result_data.get("session_id"):
                    result_data["session_id"] = str(session_identifier)
                if worker == "rvc_worker" and session_identifier and not result_data.get("rvc_session_id"):
                    result_data["rvc_session_id"] = str(session_identifier)
                if worker == "voice_worker" and session_identifier and not result_data.get("voice_session_id"):
                    result_data["voice_session_id"] = str(session_identifier)
                # RVC tools may return ``accepted`` after starting the shared
                # session job. The public boundary must derive the next user
                # action from the authoritative session phase, not from an LLM
                # summary. This prevents the false "已分好" message.
                if worker == "rvc_worker":
                    session_phase = str(session_payload.get("phase") or "").lower()
                    action = str(payload.get("action") or "").lower()
                    if session_phase == "separated" and not result_data.get("waiting_inputs"):
                        result_data["status"] = "waiting_input"
                        result_data["answer"] = ""
                        result_data["waiting_inputs"] = [{
                            "kind": "choice",
                            "input_id": "rvc_input",
                            "label": "选择音轨",
                            "options": [
                                {"value": "vocals", "label": "人声"},
                                {"value": "instrumental", "label": "伴奏"},
                            ],
                            "required": True,
                        }]
                    elif action in {"create", "attach"} and session_phase in {"uploaded", "awaiting_source"}:
                        result_data["status"] = "waiting_input"
                        result_data["answer"] = ""
                        result_data["waiting_inputs"] = [{
                            "kind": "confirmation",
                            "input_id": "rvc_prepare",
                            "action": "prepare_and_separate",
                            "label": "开始分离",
                            "required": True,
                        }]
                elif worker == "voice_worker":
                    session_phase = str(session_payload.get("phase") or "").lower()
                    if session_phase == "segments" and not result_data.get("waiting_inputs"):
                        result_data["status"] = "waiting_input"
                        result_data["answer"] = ""
                        result_data["waiting_inputs"] = [{
                            "kind": "configuration",
                            "input_id": "segment_indices",
                            "label": "选择片段",
                            "required": True,
                        }]
                    elif session_phase == "reference" and not result_data.get("waiting_inputs"):
                        result_data["status"] = "waiting_input"
                        result_data["answer"] = ""
                        result_data["waiting_inputs"] = [{
                            "kind": "confirmation",
                            "input_id": "save_voice",
                            "action": "save_voice",
                            "label": "保存音色",
                            "required": True,
                        }]
            worker_result = AgentResult.model_validate(result_data)
            result_payload = worker_result.as_worker_dict()
            result_payload["summary"] = summary
        result = json.dumps(result_payload, ensure_ascii=False, sort_keys=True)
        call_id = _handoff_call_id(messages, worker) or str(state.get("worker_call_id") or "")
        worker_status = str(result_payload.get("status") or "completed").lower()
        worker_waiting_inputs = [
            item for item in (result_payload.get("waiting_inputs") or [])
            if isinstance(item, dict)
        ]
        # Persist the worker's managed references in graph state.  A later
        # confirmation often contains only ``action``; without this promotion
        # the checkpoint keeps only attachment_ids and the worker cannot find
        # the uploaded session, leaving it in phase=uploaded forever.
        input_refs = dict(state.get("input_refs") or {})
        dispatch_refs = (state.get("dispatch_request") or {}).get("input_refs") if isinstance(state.get("dispatch_request"), dict) else {}
        if isinstance(dispatch_refs, dict):
            input_refs.update(dispatch_refs)
        result_refs = result_payload.get("input_refs")
        if isinstance(result_refs, dict):
            input_refs.update(result_refs)
        for key in ("session_id", "rvc_session_id", "voice_session_id", "source_file_id", "source_attachment_id", "task_id", "audio_file_id", "input_file_id", "model_id", "index_id", "asset_id", "voice_asset_id", "attachment_id"):
            if result_payload.get(key) is not None:
                input_refs[key] = result_payload[key]
        if worker == "voice_worker":
            _merge_voice_refs(input_refs, input_refs)
        elif worker == "rvc_worker":
            _merge_rvc_refs(input_refs, input_refs)
        persisted_request = dict(state.get("dispatch_request") or state.get("pending_task") or {})
        if isinstance(persisted_request, dict):
            persisted_request["input_refs"] = dict(input_refs)
        if worker_status in {"waiting_input", "confirmation_required"} or worker_waiting_inputs:
            dispatch_status = "waiting_input"
        elif worker_status in {"failed", "error", "denied"}:
            dispatch_status = "failed"
        elif worker_status in {"accepted", "queued", "running"}:
            dispatch_status = worker_status
        else:
            dispatch_status = "completed"
        updates: dict = {
            "active_worker": None,
            "worker_results": [result_payload],
            "dispatch_request": persisted_request,
            "pending_task": persisted_request,
            "input_refs": input_refs,
            "result_refs": list(result_payload.get("result_refs") or []),
            "waiting_inputs": worker_waiting_inputs,
            "dispatch_status": dispatch_status,
            "worker_request": "",
            "worker_call_id": "",
        }
        if call_id:
            # 用 ToolMessage 回填原始 handoff tool_call_id，保持 LLM 工具调用协议闭合；
            # 主 Agent 下一轮会把该消息当作证据，而不是直接展示 Worker 原文。
            updates["messages"] = [
                ToolMessage(
                    content=f"{worker} specialist result:\n{result}",
                    name=worker_node_name(worker),
                    tool_call_id=call_id,
                )
            ]
        return updates

    return finalize
