from __future__ import annotations

from pathlib import Path
import threading
import time
from typing import Any

from langchain.tools import ToolRuntime, tool

from agents.context import PersonaAgentContext
from app.attachments import create_attachment_from_path, public_attachment, resolve_attachment
from app.models import ConversationAttachment
from sqlalchemy import select


def _state(runtime: ToolRuntime[PersonaAgentContext]):
    # graph.invoke/stream 创建的 ToolRuntime 通常没有 Starlette request。
    # 优先兼容 request，缺失时回退到上下文注入的 AgentRuntime.app_state，
    # 确保 worker 与 HTTP RVC 页面共享同一个 manager。
    app = getattr(getattr(runtime, "request", None), "app", None)
    state = getattr(app, "state", None)
    if state is not None:
        return state
    context = getattr(runtime, "context", None)
    agent_runtime = getattr(context, "agent_runtime", None)
    return getattr(agent_runtime, "app_state", None)


def _adapter(runtime):
    state = _state(runtime)
    return getattr(state, "rvc_adapter", None) if state else None


def _sessions(runtime):
    state = _state(runtime)
    return getattr(state, "rvc_sessions", None) if state else None


def _sessions_project_root(runtime):
    sessions = _sessions(runtime)
    return getattr(sessions, "project_root", None) if sessions else None


def _tasks(runtime):
    state = _state(runtime)
    return getattr(state, "rvc_tasks", None) if state else None


def _unavailable(message: str = "RVC 运行时不可用") -> dict[str, Any]:
    return {"status": "unavailable", "worker": "rvc_worker", "engine": "rvc", "reason": message}


def _dispatch_request(runtime) -> dict[str, Any]:
    state = getattr(runtime, "state", None) or {}
    request = state.get("dispatch_request") or state.get("pending_task") or {}
    return request if isinstance(request, dict) else {}


def _dispatch_refs(runtime) -> dict[str, Any]:
    request = _dispatch_request(runtime)
    refs = request.get("input_refs")
    return dict(refs) if isinstance(refs, dict) else {}


def _dispatch_options(runtime) -> dict[str, Any]:
    request = _dispatch_request(runtime)
    options = request.get("options")
    return dict(options) if isinstance(options, dict) else {}


def _dispatch_action(runtime) -> str | None:
    request = _dispatch_request(runtime)
    options = request.get("options") if isinstance(request.get("options"), dict) else {}
    action = request.get("action") or options.get("action")
    return str(action).strip().lower() if action is not None else None


def _require_action(runtime, *allowed: str) -> dict[str, Any] | None:
    action = _dispatch_action(runtime)
    if action is not None and action not in allowed:
        return {"status": "denied", "worker": "rvc_worker", "engine": "rvc", "action": action, "code": "rvc_action_mismatch", "reason": f"当前 RVC action 不允许调用此工具：{action}"}
    return None


def _session_phase(runtime, session_id: str, allowed: set[str], action: str) -> dict[str, Any] | None:
    sessions = _sessions(runtime)
    if sessions is None:
        return _unavailable("RVC 会话运行时不可用")
    state = sessions.state(session_id)
    phase = str(state.get("phase") or "")
    # 旧替身/旧会话可能没有 phase；真实新会话有 phase 时严格门禁。
    if phase and phase not in allowed:
        return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": action, "session_id": session_id, "phase": phase, "code": "invalid_rvc_phase", "reason": f"当前阶段 {phase} 不允许执行 {action}"}
    return None


def _task_for_context(task_manager, task_id: str, context, *, session_id: str | None = None):
    """按 Agent 上下文读取任务；旧测试替身没有 owner API 时保持兼容。"""
    if context is not None and hasattr(task_manager, "get_for_owner"):
        return task_manager.get_for_owner(
            task_id,
            workspace_id=getattr(context, "workspace_id", None),
            conversation_id=getattr(context, "conversation_id", None),
            session_id=session_id,
        )
    return task_manager.get(task_id)


def _task_owned_by_context(task_manager, task_id: str, context, *, session_id: str | None = None) -> bool:
    if context is not None and hasattr(task_manager, "owner_matches"):
        return task_manager.owner_matches(
            task_id,
            workspace_id=getattr(context, "workspace_id", None),
            conversation_id=getattr(context, "conversation_id", None),
            session_id=session_id,
        )
    return True


_PRIVATE_PATH_KEYS = {
    "path", "storage_path", "input_path", "output_path", "output_file",
    "project_root", "source_root", "managed_root", "runtime_root", "core_root",
    "assets_root", "weights_dir", "indices_dir", "directory",
}


def _public_payload(value: Any) -> Any:
    """递归移除 Agent 不应看到的本地路径字段。"""
    if isinstance(value, dict):
        public = {}
        for key, item in value.items():
            normalized = str(key).lower()
            if normalized in _PRIVATE_PATH_KEYS or normalized.endswith("_path"):
                continue
            public[key] = _public_payload(item)
        return public
    if isinstance(value, list):
        return [_public_payload(item) for item in value]
    if isinstance(value, tuple):
        return tuple(_public_payload(item) for item in value)
    return value


def _public_session_state(state: dict[str, Any]) -> dict[str, Any]:
    """只向 Agent 暴露会话文件的 file_id/元数据，绝不暴露本地路径。"""
    return _public_payload(dict(state or {}))


def _wait_rvc_session(sessions, session_id: str, targets: set[str], timeout: float = 300.0) -> dict[str, Any]:
    """等待共享 RVC session 的后台线程落到明确终态。

    start_extract/start_separation 是异步 API。Worker 若只返回 accepted，模型很容易
    在真正的 FFmpeg/分离结果出来前生成“已完成”文案，前端也会再次提交同一个操作。
    将等待收敛到 worker 工具层，保证 Agent 看到的结果与真实 session 一致。
    """
    deadline = time.monotonic() + timeout
    while True:
        snapshot = sessions.state(session_id)
        phase = str(snapshot.get("phase") or "").lower()
        if phase in targets or phase in {"failed", "cancelled"}:
            return snapshot
        if time.monotonic() >= deadline:
            return {**snapshot, "phase": "failed", "error": "RVC 会话等待超时", "message": "RVC 处理超过允许等待时间"}
        time.sleep(0.5)


def _register_output_attachment(task_manager, context, task_id: str, output_file_id: str) -> dict:
    if not _task_owned_by_context(task_manager, task_id, context):
        raise ValueError("RVC 任务不属于当前对话")
    task = task_manager.get(task_id)
    if not task or task.get("state") != "succeeded":
        raise ValueError("RVC 任务尚未成功完成")
    output = task_manager.output_item(task_id, output_file_id)
    if not output:
        raise ValueError("指定的 RVC 输出不存在")
    source_path = Path(output["path"]).resolve()
    source_path.relative_to(Path(task_manager.tasks_root).resolve())
    with context.session_factory() as db:
        candidates = db.scalars(
            select(ConversationAttachment).where(
                ConversationAttachment.workspace_id == context.workspace_id,
                ConversationAttachment.conversation_id == context.conversation_id,
                ConversationAttachment.source == "rvc",
                ConversationAttachment.status == "ready",
            )
        ).all()
        existing = next(
            (item for item in candidates if (item.metadata_json or {}).get("task_id") == task_id
             and (item.metadata_json or {}).get("output_file_id") == output_file_id),
            None,
        )
        if existing is None:
            display_name = f"RVC-{task_id}-{output.get('name') or output_file_id + '.wav'}"
            existing = create_attachment_from_path(
                db, task_manager.project_root, context.conversation_id, source_path,
                workspace_id=context.workspace_id, filename=display_name, mime_type="audio/wav",
                source="rvc", metadata={"task_id": task_id, "output_file_id": output_file_id, "engine": "rvc"},
            )
            db.commit()
            db.refresh(existing)
        return public_attachment(existing)


def _watch_and_register(task_manager, context, task_id: str, output_file_id: str, timeout: int = 1800) -> None:
    if context is None or not context.session_factory:
        return
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        task = task_manager.get(task_id)
        if not task or task.get("state") in {"failed", "cancelled"}:
            return
        if task.get("state") == "succeeded" and task_manager.output_item(task_id, output_file_id):
            try:
                _register_output_attachment(task_manager, context, task_id, output_file_id)
            except Exception:
                pass
            return
        time.sleep(1)


@tool("get_rvc_status")
def get_rvc_status(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询 RVC 本地音色转换资源、运行时和模型状态。"""
    adapter = _adapter(runtime)
    if adapter is None:
        return _unavailable()
    try:
        return {"status": "ok", "worker": "rvc_worker", "engine": "rvc", "rvc": _public_payload(adapter.status())}
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "reason": str(exc)}


@tool("list_rvc_models")
def list_rvc_models(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """列出资源管理器发现的 RVC 音色模型和可选 Index。"""
    adapter = _adapter(runtime)
    if adapter is None:
        return {**_unavailable(), "models": [], "indices": []}
    try:
        return {
            "status": "ok",
            "worker": "rvc_worker",
            "engine": "rvc",
            "models": [_public_payload(item) for item in adapter.list_models()],
            "indices": [_public_payload(item) for item in adapter.list_indices()],
        }
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "models": [], "indices": [], "reason": str(exc)}


@tool("validate_rvc_model")
def validate_rvc_model(model: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """验证指定 RVC 模型是否由受管资源管理器发现。"""
    adapter = _adapter(runtime)
    if adapter is None:
        return _unavailable()
    try:
        path = adapter.resolve_model(model)
        return {"status": "valid", "worker": "rvc_worker", "engine": "rvc", "model": path.name}
    except Exception as exc:
        return {"status": "invalid", "worker": "rvc_worker", "engine": "rvc", "model": model, "reason": str(exc)}


@tool("create_rvc_session")
def create_rvc_session(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """创建受管 RVC 音频处理会话。"""
    sessions = _sessions(runtime)
    if sessions is None: return _unavailable("RVC 会话运行时不可用")
    try:
        # 创建/挂载只允许发生在初始素材阶段；确认处理时必须进入
        # prepare_rvc_source，避免 Worker 重新创建 session 后又返回确认卡。
        if _dispatch_action(runtime) is not None:
            return {"status": "denied", "worker": "rvc_worker", "engine": "rvc", "code": "rvc_stage_mismatch", "reason": "当前阶段只允许准备已有 RVC 会话"}
        session = _public_session_state(sessions.create())
        return {"status": "accepted", "worker": "rvc_worker", "engine": "rvc", "session_id": session.get("session_id"), "rvc_session_id": session.get("session_id"), "session": session}
    except Exception as exc: return {"status": "failed", "worker": "rvc_worker", "reason": str(exc)}


@tool("attach_file_to_rvc_session")
def attach_file_to_rvc_session(session_id: str, file_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """将当前对话中的受管附件复制到 RVC 会话。"""
    sessions = _sessions(runtime); context = getattr(runtime, "context", None)
    if sessions is None or context is None or not context.session_factory: return _unavailable("RVC 会话运行时不可用")
    # attach 是初始上传阶段动作。若当前 dispatch 已经是确认处理、分离或转换，
    # 严禁重新挂载并返回 waiting_input，避免确认按钮闪回原卡片。
    if _dispatch_action(runtime) is not None:
        return {"status": "denied", "worker": "rvc_worker", "engine": "rvc", "code": "rvc_stage_mismatch", "reason": "当前阶段不允许重新挂载源文件"}
    try:
        with context.session_factory() as db:
            item = resolve_attachment(db, sessions.project_root, context.conversation_id, file_id, workspace_id=context.workspace_id)
            path = sessions.upload_source(session_id, item.name, Path(item.storage_path).read_bytes())
        return {"status": "accepted", "worker": "rvc_worker", "engine": "rvc", "action": "attach", "session_id": session_id, "file_id": path.get("file_id"), "name": path.get("name")}
    except Exception as exc: return {"status": "failed", "worker": "rvc_worker", "reason": str(exc)}


@tool("prepare_rvc_source")
def prepare_rvc_source(session_id: str | None = None, attachment_id: str | None = None, file_id: str | None = None, runtime: ToolRuntime[PersonaAgentContext] = None) -> dict[str, Any]:
    """标准化 RVC 会话中的音频或视频源。"""
    sessions = _sessions(runtime)
    if sessions is None: return _unavailable("RVC 会话运行时不可用")
    if (blocked := _require_action(runtime, "prepare_and_separate")):
        return blocked
    # 与 RVC 页面保持同一条文件链路：attachment_id 由 worker 在服务端解析，
    # 复制进受管 session 后再启动异步处理。这样即使模型没有先显式调用
    # create/attach，也不会把“会话附件已存在”误当成 RVC session 已就绪。
    refs = _dispatch_refs(runtime)
    attachment_id = attachment_id or file_id or refs.get("source_file_id") or refs.get("source_attachment_id") or refs.get("audio_file_id")
    session_id = session_id or refs.get("session_id") or refs.get("rvc_session_id")
    try:
        context = getattr(runtime, "context", None)
        if not session_id:
            session = sessions.create()
            session_id = session.get("session_id")
        # 文件链路的唯一事实来源是 RVC session。确认处理时 worker
        # 可能再次把 attachment_id 带回，但不能因此把已经上传的源文件
        # 重置为 uploaded；只有没有 source 的新 session 才允许复制附件。
        current = sessions.state(session_id)
        if attachment_id and not current.get("source"):
            if context is None or not context.session_factory:
                raise ValueError("缺少会话附件上下文")
            with context.session_factory() as db:
                item = resolve_attachment(db, sessions.project_root, context.conversation_id, attachment_id, workspace_id=context.workspace_id)
                sessions.upload_source(session_id, item.name, Path(item.storage_path).read_bytes())
        # 这是幂等的“启动准备”动作：Worker 可能在一次模型回合里
        # 先后调用 prepare / separate / status。任何已在后台运行的会话都
        # 必须返回当前事实，而不是把重复调用判成失败，避免 UI 闪回确认卡。
        current = sessions.state(session_id)
        current_phase = str(current.get("phase") or "").lower()
        if current_phase in {"extracting", "normalizing", "separating", "separated"}:
            snapshot = _public_session_state(current)
        elif current_phase == "ready":
            snapshot = _public_session_state(sessions.start_separation(session_id))
        else:
            if current_phase not in {"uploaded", "idle"}:
                return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": "prepare", "session_id": session_id, "session": _public_session_state(current), "reason": f"当前阶段 {current_phase} 不允许准备音频"}
            # 这里只负责启动共享 RVC session；绝不在 Agent 回合内等待 FFmpeg
            # 或分离器结束。长时间同步等待会阻塞 resume，最终表现为 0% 卡住。
            snapshot = _public_session_state(sessions.start_extract(session_id, then_separate=True))
        phase = str(snapshot.get("phase") or "").lower()
        if phase in {"failed", "cancelled"}:
            return {"status": phase, "worker": "rvc_worker", "engine": "rvc", "action": "prepare", "session_id": session_id, "session": _public_session_state(snapshot), "reason": snapshot.get("error") or snapshot.get("message") or "RVC 音频处理失败"}
        return {"status": "accepted", "worker": "rvc_worker", "engine": "rvc", "action": "prepare", "session_id": session_id, "rvc_session_id": session_id, "session": _public_session_state(snapshot)}
    except Exception as exc: return {"status": "failed", "worker": "rvc_worker", "session_id": session_id, "rvc_session_id": session_id, "reason": str(exc)}


@tool("separate_rvc_vocals")
def separate_rvc_vocals(session_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """对 RVC 会话源执行人声分离。"""
    sessions = _sessions(runtime)
    if sessions is None: return _unavailable("RVC 会话运行时不可用")
    if (blocked := _require_action(runtime, "prepare_and_separate", "separate_vocals")):
        return blocked
    try:
        current = sessions.state(session_id)
        phase = str(current.get("phase") or "").lower()
        if phase in {"extracting", "normalizing", "separating"}:
            # prepare_and_separate 已经启动后台链路；不要重复启动或报错。
            snapshot = current
        elif phase == "separated":
            snapshot = current
        elif phase == "ready":
            snapshot = sessions.start_separation(session_id)
        else:
            return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": "separate", "session_id": session_id, "session": _public_session_state(current), "reason": f"当前阶段 {phase} 不允许分离人声"}
        return {"status": "waiting_input" if phase == "separated" else "running", "worker": "rvc_worker", "engine": "rvc", "action": "separate", "session_id": session_id, "rvc_session_id": session_id, "session": _public_session_state(snapshot)}
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "reason": str(exc)}


@tool("get_rvc_session")
def get_rvc_session(session_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询 RVC 会话及其受管文件状态。"""
    sessions = _sessions(runtime)
    if sessions is None: return _unavailable("RVC 会话运行时不可用")
    if (blocked := _require_action(runtime, "session_status", "prepare_and_separate", "separate_vocals")):
        return blocked
    try:
        snapshot = _public_session_state(sessions.state(session_id))
        phase = str(snapshot.get("phase") or "").lower()
        status = ("failed" if phase == "failed" else "cancelled" if phase == "cancelled" else "waiting_input" if phase == "separated" else "running")
        return {"status": status, "worker": "rvc_worker", "engine": "rvc", "action": "session_status", "session_id": session_id, "rvc_session_id": session_id, "session": snapshot, "reason": snapshot.get("error") if phase == "failed" else None}
    except Exception as exc: return {"status": "failed", "worker": "rvc_worker", "action": "session_status", "reason": str(exc)}


@tool("convert_audio_with_rvc")
def convert_audio_with_rvc(
    input_file_id: str | None = None,
    model: str = "",
    session_id: str | None = None,
    index: str | None = None,
    model_id: str | None = None,
    index_id: str | None = None,
    speaker_id: int = 0,
    pitch: int = 0,
    f0_method: str = "rmvpe",
    index_rate: float = 0.75,
    protect: float = 0.33,
    resample_sr: int = 0,
    rms_mix_rate: float = 1.0,
    runtime: ToolRuntime[PersonaAgentContext] = None,
) -> dict[str, Any]:
    """使用受管 file_id 或 session_id 提交 RVC 音频到音频任务。"""
    adapter = _adapter(runtime)
    task_manager = _tasks(runtime)
    if adapter is None or task_manager is None:
        return _unavailable("RVC 任务运行时不可用")
    try:
        if (blocked := _require_action(runtime, "convert")):
            return blocked
        context = getattr(runtime, "context", None)
        # 结构化 Core/Supervisor 合同使用 model_id/index_id；保留旧的
        # model/index 参数兼容页面和既有调用方。
        model = model or model_id or ""
        index = index or index_id
        if not model:
            raise ValueError("必须选择 RVC 音色模型")
        if session_id:
            sessions = _sessions(runtime)
            if sessions is None:
                raise ValueError("RVC 会话不存在")
            phase_error = _session_phase(runtime, session_id, {"separated"}, "convert")
            if phase_error:
                return phase_error
            session_state = sessions.state(session_id)
            selected_input = session_state.get("selected_input")
            if not selected_input:
                raise ValueError("RVC 会话尚未准备好可用的人声音频")
            source = sessions.input_path(session_id, selected_input)
        elif input_file_id:
            if context is None or not context.session_factory:
                raise ValueError("缺少会话上下文")
            with context.session_factory() as db:
                item = resolve_attachment(db, adapter.resources.project_root, context.conversation_id, input_file_id, workspace_id=context.workspace_id)
                if item.kind != "audio":
                    raise ValueError("视频附件必须先创建 RVC 会话并完成音频准备")
                source = adapter.validate_input(Path(item.storage_path))
        else:
            # 不接受浏览器路径或未绑定的本地输入；Agent 只能使用受管附件或已准备的 RVC session。
            return {
                "status": "rejected",
                "worker": "rvc_worker",
                "engine": "rvc",
                "action": "convert",
                "reason": "input_file_id \u6216 session_id",
            }
        adapter.resolve_model(model)
        if index:
            adapter.resolve_index(index)
        task_id = task_manager.start(
            source,
            model=model,
            index=index,
            speaker_id=speaker_id,
            pitch=pitch,
            f0_method=f0_method,
            index_rate=index_rate,
            protect=protect,
            resample_sr=resample_sr,
            rms_mix_rate=rms_mix_rate,
            owner_workspace_id=getattr(context, "workspace_id", None),
            owner_conversation_id=getattr(context, "conversation_id", None),
            owner_session_id=session_id,
        )
        threading.Thread(
            target=_watch_and_register,
            args=(task_manager, context, task_id, "rvc_vocal"),
            daemon=True,
            name=f"rvc-attachment-{task_id}",
        ).start()
        return {
            "status": "accepted",
            "worker": "rvc_worker",
            "engine": "rvc",
            "task_id": task_id,
            "status_url": f"/api/voice/rvc/tasks/{task_id}",
            "result_refs": [],
            "workflow": _public_payload((task_manager.public_get(task_id) if hasattr(task_manager, "public_get") else task_manager.get(task_id) or {}).get("workflow")),
            "message": "RVC 音色转换任务已提交",
        }
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": "convert", "reason": str(exc)}


@tool("get_rvc_task_status")
def get_rvc_task_status(task_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询 RVC 变声任务状态。"""
    task_manager = _tasks(runtime)
    if task_manager is None:
        return _unavailable("RVC 任务运行时不可用")
    context = getattr(runtime, "context", None)
    result = _task_for_context(task_manager, task_id, context)
    if result is None:
        return {"status": "not_found", "worker": "rvc_worker", "task_id": task_id}
    public = _public_payload(result)
    if isinstance(public, dict) and not public.get("workflow"):
        public["workflow"] = _public_payload((task_manager.public_get(task_id) if hasattr(task_manager, "public_get") else {}).get("workflow"))
    return {"status": "ok", "worker": "rvc_worker", "task": public}


@tool("mix_rvc_instrumental")
def mix_rvc_instrumental(
    task_id: str,
    session_id: str | None = None,
    instrumental_file_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] = None,
) -> dict[str, Any]:
    """将已完成的 RVC 人声与受管 Instrumental 或音频附件合并。"""
    task_manager = _tasks(runtime)
    context = getattr(runtime, "context", None)
    if task_manager is None or context is None:
        return _unavailable("RVC 任务运行时不可用")
    try:
        if not _task_owned_by_context(task_manager, task_id, context, session_id=session_id):
            raise ValueError("RVC 任务不属于当前对话")
        if instrumental_file_id:
            if not context.session_factory:
                raise ValueError("缺少会话上下文")
            with context.session_factory() as db:
                item = resolve_attachment(db, task_manager.project_root, context.conversation_id, instrumental_file_id, workspace_id=context.workspace_id)
                if item.kind != "audio":
                    raise ValueError("Instrumental 必须是音频附件")
                instrumental = Path(item.storage_path)
        elif session_id:
            sessions = _sessions(runtime)
            if sessions is None:
                raise ValueError("RVC 会话不存在")
            state = sessions.state(session_id)
            item = state.get("instrumental")
            if not item or not item.get("file_id"):
                raise ValueError("当前 RVC 会话没有可用的 Instrumental")
            instrumental = sessions.file_path(session_id, item["file_id"])
        else:
            raise ValueError("必须提供 session_id 或 instrumental_file_id")
        result = task_manager.mix(task_id, instrumental)
        if result is None:
            raise ValueError("RVC 任务尚未完成或不存在")
        threading.Thread(
            target=_watch_and_register,
            args=(task_manager, context, task_id, "mixed", 600),
            daemon=True,
            name=f"rvc-mixed-attachment-{task_id}",
        ).start()
        return {"status": "accepted", "worker": "rvc_worker", "task_id": task_id, "message": "已开始合并 Instrumental"}
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "task_id": task_id, "reason": str(exc)}


@tool("register_rvc_result_attachment")
def register_rvc_result_attachment(
    task_id: str,
    output_file_id: str = "rvc_vocal",
    runtime: ToolRuntime[PersonaAgentContext] = None,
) -> dict[str, Any]:
    """将完成的 RVC 输出复制并登记为当前对话附件。"""
    task_manager = _tasks(runtime)
    context = getattr(runtime, "context", None)
    if task_manager is None or context is None or not context.session_factory:
        return _unavailable("缺少 RVC 任务或会话上下文")
    try:
        attachment = _register_output_attachment(task_manager, context, task_id, output_file_id)
        return {"status": "ok", "worker": "rvc_worker", "task_id": task_id, "result_refs": [attachment.get("file_id") or attachment.get("id")], "attachment": attachment}
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "task_id": task_id, "reason": str(exc)}


@tool("inspect_rvc_status")
def inspect_rvc_status(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """兼容协议名称：查询 RVC 运行时和资源状态。"""
    return get_rvc_status.invoke({}, runtime=runtime)


@tool("validate_voice_model")
def validate_voice_model(model: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """兼容协议名称：校验受管 RVC 音色模型。"""
    return validate_rvc_model.invoke({"model": model}, runtime=runtime)


@tool("preview_voice_asset")
def preview_voice_asset(model: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """返回可试听的受管 RVC 资产信息；实际试听由声音工作台负责。"""
    result = validate_rvc_model.invoke({"model": model}, runtime=runtime)
    if result.get("status") != "valid":
        return result
    adapter = _adapter(runtime)
    item = next((item for item in adapter.list_models() if item.get("name") == result.get("model")), None)
    return {**result, "preview_available": bool(item and item.get("preview_audio_path")), "asset": _public_payload(item or {})}


@tool("get_rvc_task")
def get_rvc_task(task_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """兼容协议名称：查询 RVC 任务。"""
    return get_rvc_task_status.invoke({"task_id": task_id}, runtime=runtime)


@tool("cancel_rvc_task")
def cancel_rvc_task(
    task_id: str | None = None,
    session_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] = None,
) -> dict[str, Any]:
    """取消 RVC task，并在提供 session_id 时同步终止输入准备会话。"""
    if (blocked := _require_action(runtime, "cancel")):
        return blocked
    task_manager = _tasks(runtime)
    sessions = _sessions(runtime)
    if task_manager is None and sessions is None:
        return _unavailable("RVC 任务运行时不可用")
    try:
        context = getattr(runtime, "context", None)
        if task_id and task_manager:
            if not _task_owned_by_context(task_manager, task_id, context, session_id=session_id):
                return {"status": "denied", "worker": "rvc_worker", "engine": "rvc", "action": "cancel", "task_id": task_id, "code": "owner_mismatch"}
            if not task_manager.get(task_id):
                return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": "cancel", "task_id": task_id, "code": "task_not_found"}
        cancelled_task = bool(task_manager.cancel(task_id)) if task_id and task_manager else False
        cancelled_session = False
        if session_id and sessions is not None and hasattr(sessions, "cancel"):
            sessions.cancel(session_id)
            cancelled_session = True
        cancelled = cancelled_task or cancelled_session
        return {"status": "completed" if cancelled else "failed", "worker": "rvc_worker", "engine": "rvc", "action": "cancel", "task_id": task_id, "session_id": session_id, "cancelled": cancelled, "code": None if cancelled else "nothing_to_cancel"}
    except Exception as exc:
        return {"status": "failed", "worker": "rvc_worker", "engine": "rvc", "action": "cancel", "task_id": task_id, "session_id": session_id, "reason": str(exc)}


__all__ = [
    "get_rvc_status",
    "list_rvc_models",
    "validate_rvc_model",
    "convert_audio_with_rvc",
    "get_rvc_task_status",
    "inspect_rvc_status",
    "validate_voice_model",
    "preview_voice_asset",
    "get_rvc_task",
    "cancel_rvc_task",
    "create_rvc_session", "attach_file_to_rvc_session", "prepare_rvc_source",
    "separate_rvc_vocals", "get_rvc_session",
    "mix_rvc_instrumental", "register_rvc_result_attachment",
]


