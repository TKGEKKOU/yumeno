"""语音克隆 Worker 工具：对接 VoiceStudioManager 与会话附件。

历史工具名保持不变，供 registry 与旧导入兼容。真正处理走 Voice Studio 会话
与 GPT-SoVITS TrainingService，不引入不存在的 service 层，也不接受浏览器临时路径。
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from shutil import copy2
from typing import Any, Literal
from uuid import uuid4

from langchain.tools import ToolRuntime, tool
from langgraph.config import get_stream_writer
from sqlalchemy.orm.attributes import flag_modified

from agents.context import PersonaAgentContext
from app.attachments import resolve_attachment
from voice.studio import VoiceStudioError

logger = logging.getLogger(__name__)

_VIDEO_SUFFIXES = {".mp4", ".mkv", ".webm", ".mov", ".avi"}
_PRIVATE_PATH_KEYS = {"path", "storage_path", "audio_path", "video_path", "file_path", "local_path"}


def _app_state(runtime: ToolRuntime[PersonaAgentContext]):
    app = getattr(getattr(runtime, "request", None), "app", None)
    state = getattr(app, "state", None)
    if state is not None:
        return state
    context = getattr(runtime, "context", None)
    agent_runtime = getattr(context, "agent_runtime", None)
    return getattr(agent_runtime, "app_state", None)


def _studio(runtime: ToolRuntime[PersonaAgentContext]):
    state = _app_state(runtime)
    manager = getattr(state, "voice_studio", None) if state is not None else None
    if manager is None or not callable(getattr(manager, "create_session", None)):
        return None
    return manager


def _training(runtime: ToolRuntime[PersonaAgentContext]):
    state = _app_state(runtime)
    return getattr(state, "gpt_sovits_training", None) if state is not None else None


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


def _public_payload(value: Any) -> Any:
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


def _public_session(state: dict[str, Any] | None) -> dict[str, Any]:
    return _public_payload(dict(state or {}))


def _looks_like_path(value: str) -> bool:
    text = str(value or "").strip()
    if not text:
        return False
    return "\\" in text or "/" in text or (len(text) >= 2 and text[1] == ":")


def _first_id(*values: Any) -> str | None:
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return None


def _unavailable(reason: str = "Voice Studio 运行时不可用") -> dict[str, Any]:
    return {"status": "unavailable", "worker": "voice_worker", "reason": reason}


def _waiting_attachment(session_id: str | None = None) -> dict[str, Any]:
    return {
        "status": "waiting_input",
        "worker": "voice_worker",
        "session_id": session_id,
        "next_step": "request_file_upload",
        "waiting_inputs": [
            {
                "kind": "attachment",
                "input_id": "voice_material",
                "label": "上传素材",
                "required": True,
                "accepted_file_types": ["audio/*", "video/*"],
            }
        ],
        "guidance": "请通过对话附件上传音频或视频，不要使用本地临时路径。",
    }


def _stage_attachment(manager, session_id: str, item) -> Path:
    source = Path(item.storage_path)
    session_dir = getattr(manager, "_session_dir", None)
    if not callable(session_dir):
        return source
    uploads = session_dir(session_id) / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    suffix = Path(getattr(item, "name", "") or source.name).suffix.lower() or source.suffix.lower()
    target = uploads / f"{uuid4().hex}{suffix}"
    copy2(source, target)
    return target


def _is_video(item) -> bool:
    kind = str(getattr(item, "kind", "") or "").lower()
    suffix = Path(getattr(item, "name", "") or "").suffix.lower()
    if kind == "video" or suffix in _VIDEO_SUFFIXES:
        return True
    return False



def _studio_session_dir(manager, session_id: str) -> Path | None:
    sessions_dir = getattr(manager, "sessions_dir", None)
    if sessions_dir:
        return Path(sessions_dir) / session_id
    session_dir_fn = getattr(manager, "_session_dir", None)
    if callable(session_dir_fn):
        return Path(session_dir_fn(session_id))
    return None


def _start_runtime_task(runtime, *, action: str, metadata: dict[str, Any] | None = None) -> str | None:
    context = getattr(runtime, "context", None)
    agent_runtime = getattr(context, "agent_runtime", None) if context is not None else None
    starter = getattr(agent_runtime, "start_task", None)
    if not callable(starter):
        return None
    try:
        run = starter(
            action=action,
            workspace_id=getattr(context, "workspace_id", None),
            persona_id=getattr(context, "persona_id", None),
            conversation_id=getattr(context, "conversation_id", None),
            worker="voice_worker",
            current_step=action,
            status_text=action,
            metadata=dict(metadata or {}),
        )
        return getattr(run, "run_id", None)
    except Exception:
        return None


@tool
def start_voice_clone_session(
    runtime: ToolRuntime[PersonaAgentContext],
    voice_description: str = "待上传素材后确认",
) -> dict[str, Any]:
    """为角色创建 Voice Studio 克隆会话。"""
    del voice_description
    persona_id = getattr(getattr(runtime, "context", None), "persona_id", None)
    if not persona_id:
        return {"status": "denied", "worker": "voice_worker", "reason": "未识别当前角色，无法创建语音克隆会话"}

    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    try:
        session = manager.create_session(origin="chat")
        session_id = session.get("session_id") if isinstance(session, dict) else None
        logger.info("Created voice clone session %s for persona %s", session_id, persona_id)
        try:
            get_stream_writer()({
                "kind": "clone_session",
                "action": "voice_session_created",
                "session_id": session_id,
            })
        except RuntimeError:
            pass
        return {
            "status": "created",
            "worker": "voice_worker",
            "session_id": session_id,
            "session": _public_session(session if isinstance(session, dict) else None),
            "next_step": "request_file_upload",
            "guidance": "请通过对话附件上传视频或音频。素材建议单人说话、无背景音乐和明显噪音。",
        }
    except Exception as exc:
        logger.error("Failed to create voice clone session: %s", exc)
        return {"status": "failed", "worker": "voice_worker", "reason": str(exc)}


@tool
def request_file_upload(
    purpose: Literal["voice_material", "reference_text", "knowledge_document"],
    description: str,
    session_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """请求用户通过会话附件上传文件，不创建浏览器临时路径。"""
    del runtime
    accepted = {
        "voice_material": ["audio/*", "video/*"],
        "reference_text": ["text/*", ".txt", ".srt"],
        "knowledge_document": [".pdf", ".docx", ".txt", ".md", ".csv", ".xlsx"],
    }
    return {
        "status": "waiting_input",
        "worker": "voice_worker",
        "action": "request_upload",
        "purpose": purpose,
        "description": description,
        "session_id": session_id,
        "waiting_inputs": [
            {
                "kind": "attachment",
                "input_id": purpose,
                "label": description,
                "required": True,
                "accepted_file_types": accepted[purpose],
            }
        ],
        "guidance": {
            "voice_material": "支持 mp3/wav/m4a/mp4/mkv 等格式，通过对话附件上传",
            "reference_text": "支持 txt/srt 文本格式",
            "knowledge_document": "支持 PDF/Word/Markdown/CSV/Excel",
        }[purpose],
    }


@tool
def analyze_voice_material(
    session_id: str | None = None,
    attachment_id: str | None = None,
    file_id: str | None = None,
    file_path: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """把当前会话附件交给 VoiceStudioManager 做异步素材处理。"""
    if file_path and _looks_like_path(file_path):
        return {
            "status": "failed",
            "worker": "voice_worker",
            "reason": "不接受本地文件路径，请使用会话 attachment_id",
        }
    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    refs = _dispatch_refs(runtime)
    attachment_id = _first_id(
        attachment_id,
        file_id,
        None if file_path and _looks_like_path(file_path) else file_path,
        refs.get("source_file_id"),
        refs.get("source_attachment_id"),
        refs.get("audio_file_id"),
        *((refs.get("attachment_ids") or [None])[:1] if isinstance(refs.get("attachment_ids"), list) else (None,)),
    )
    session_id = _first_id(session_id, refs.get("session_id"), refs.get("voice_session_id"))
    if not attachment_id:
        return _waiting_attachment(session_id)

    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少会话附件上下文"}

    try:
        if not session_id:
            session = manager.create_session(origin="chat")
            session_id = session.get("session_id")
        current = manager.session_state(session_id) or {}
        phase = str(current.get("phase") or "idle").lower()
        if current.get("running") or phase not in {"idle", "failed", "cancelled"}:
            snapshot = _public_session(current)
            status = "failed" if phase == "failed" else "cancelled" if phase == "cancelled" else "running"
            return {
                "status": status,
                "worker": "voice_worker",
                "action": "analyze",
                "session_id": session_id,
                "session": snapshot,
            }
        with context.session_factory() as db:
            item = resolve_attachment(
                db,
                manager.project_root,
                context.conversation_id,
                attachment_id,
                workspace_id=context.workspace_id,
            )
            staged = _stage_attachment(manager, session_id, item)
        if _is_video(item):
            snapshot = manager.start_video_task(session_id, staged)
        else:
            snapshot = manager.upload_audio_files(session_id, [staged])
        phase = str((snapshot or {}).get("phase") or "").lower()
        if phase == "audio_ready" and callable(getattr(manager, "start_separation", None)):
            snapshot = manager.start_separation(session_id)
            phase = str((snapshot or {}).get("phase") or "").lower()
        status = "failed" if phase == "failed" else "cancelled" if phase == "cancelled" else "accepted"
        return {
            "status": status,
            "worker": "voice_worker",
            "action": "analyze",
            "session_id": session_id,
            "attachment_id": attachment_id,
            "session": _public_session(snapshot),
            "next_step": "poll_session",
        }
    except FileNotFoundError:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": "附件不存在或不属于当前会话"}
    except VoiceStudioError as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    except Exception as exc:
        logger.error("Failed to analyze voice material: %s", exc)
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}


@tool
def request_training_confirmation(
    session_id: str,
    segment_indices: list[int] | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """按 Voice Studio 阶段请求用户确认片段或保存音色，不虚构训练服务。"""
    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    options = _dispatch_options(runtime)
    if segment_indices is None:
        raw = options.get("segment_indices") or options.get("indices")
        if isinstance(raw, list):
            segment_indices = [int(item) for item in raw]
    try:
        current = manager.session_state(session_id)
        if not current:
            return {"status": "not_found", "worker": "voice_worker", "session_id": session_id}
        phase = str(current.get("phase") or "").lower()
        if phase == "audio_ready" and not current.get("running") and callable(getattr(manager, "start_separation", None)):
            current = manager.start_separation(session_id)
            phase = str(current.get("phase") or "").lower()
        if phase in {"queued", "convert", "separating", "segments"} and current.get("running"):
            return {
                "status": "running",
                "worker": "voice_worker",
                "session_id": session_id,
                "session": _public_session(current),
            }
        if phase == "segments" and segment_indices:
            current = manager.select_segments(session_id, segment_indices)
            phase = str(current.get("phase") or "").lower()
        if phase == "segments":
            return {
                "status": "waiting_input",
                "worker": "voice_worker",
                "session_id": session_id,
                "session": _public_session(current),
                "waiting_inputs": [
                    {
                        "kind": "configuration",
                        "input_id": "segment_indices",
                        "label": "选择片段",
                        "required": True,
                    }
                ],
            }
        if phase == "reference":
            seconds = current.get("reference_seconds")
            return {
                "status": "waiting_input",
                "worker": "voice_worker",
                "session_id": session_id,
                "session": _public_session(current),
                "waiting_inputs": [
                    {
                        "kind": "confirmation",
                        "input_id": "save_voice",
                        "label": "保存音色",
                        "required": True,
                        "message": f"参考音色已就绪（约 {seconds} 秒）。确认后可命名并绑定到当前角色。",
                    }
                ],
            }
        return {
            "status": "running" if current.get("running") else "accepted",
            "worker": "voice_worker",
            "session_id": session_id,
            "session": _public_session(current),
        }
    except VoiceStudioError as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    except Exception as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}


@tool
def start_voice_training(
    session_id: str | None = None,
    asset_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """启动 GPT-SoVITS 资产训练。Voice Studio 克隆不是训练任务。"""
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"))
    session_id = _first_id(session_id, refs.get("session_id"))
    if not asset_id:
        return {
            "status": "failed",
            "worker": "voice_worker",
            "session_id": session_id,
            "reason": "GPT-SoVITS 训练需要 Voice Asset ID；Voice Studio 克隆请用 bind_trained_voice 保存参考音色",
        }
    service = _training(runtime)
    if service is None or not callable(getattr(service, "start_training", None)):
        return {"status": "unavailable", "worker": "voice_worker", "reason": "GPT-SoVITS 训练运行时不可用"}
    try:
        started = service.start_training(asset_id)
        if started is False:
            status = service.status() if callable(getattr(service, "status", None)) else {}
            return {
                "status": "running",
                "worker": "voice_worker",
                "asset_id": asset_id,
                "reason": "已有训练任务在进行",
                "training": status if isinstance(status, dict) else {"value": status},
            }
        run_id = _start_runtime_task(runtime, action="gpt_sovits_training", metadata={"asset_id": asset_id})
        return {
            "status": "accepted",
            "worker": "voice_worker",
            "asset_id": asset_id,
            "run_id": run_id,
            "next_step": "poll_training_status",
        }
    except Exception as exc:
        logger.error("Failed to start voice training: %s", exc)
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}


@tool
def check_training_progress(
    session_id: str | None = None,
    asset_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """查询 Voice Studio 会话进度或 GPT-SoVITS 资产训练状态。"""
    refs = _dispatch_refs(runtime)
    session_id = _first_id(session_id, refs.get("session_id"))
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"))
    if session_id:
        manager = _studio(runtime)
        if manager is None or not callable(getattr(manager, "session_state", None)):
            return _unavailable()
        try:
            current = manager.session_state(session_id)
            if not current:
                return {"status": "not_found", "worker": "voice_worker", "session_id": session_id}
            phase = str(current.get("phase") or "").lower()
            status = (
                "failed" if phase == "failed"
                else "cancelled" if phase == "cancelled"
                else "completed" if phase in {"reference", "done"}
                else "running"
            )
            return {
                "status": status,
                "worker": "voice_worker",
                "session_id": session_id,
                "progress": current.get("progress"),
                "session": _public_session(current),
            }
        except Exception as exc:
            return {"status": "query_failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}

    if not asset_id:
        return {"status": "failed", "worker": "voice_worker", "reason": "需要 session_id 或 asset_id"}

    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少数据库上下文"}
    from app.models import VoiceAsset
    from sqlalchemy import select

    session = context.session_factory()
    try:
        asset = session.scalar(
            select(VoiceAsset).where(
                VoiceAsset.id == asset_id,
                VoiceAsset.workspace_id == context.workspace_id,
            )
        )
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        training = _training(runtime)
        aggregate = training.status() if training is not None and callable(getattr(training, "status", None)) else {}
        return {
            "status": asset.status,
            "worker": "voice_worker",
            "asset_id": asset_id,
            "training_stage": asset.training_stage,
            "error": asset.error_message,
            "training": aggregate if isinstance(aggregate, dict) else {"value": aggregate},
        }
    except Exception as exc:
        return {"status": "query_failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        session.close()



@tool
def train_voice_from_studio(
    session_id: str | None = None,
    name: str | None = None,
    segment_indices: list[int] | None = None,
    language: str = "zh",
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Create a GPT-SoVITS Voice Asset from Voice Studio segments and start training."""
    from app.models import VoiceAsset
    from voice.gpt_sovits.language import normalize_language
    from voice.gpt_sovits.training import TrainingDataInvalid

    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    service = _training(runtime)
    if service is None or not callable(getattr(service, "prepare_dataset", None)):
        return {"status": "unavailable", "worker": "voice_worker", "reason": "GPT-SoVITS 训练运行时不可用"}
    refs = _dispatch_refs(runtime)
    options = _dispatch_options(runtime)
    session_id = _first_id(session_id, refs.get("session_id"), refs.get("voice_session_id"), options.get("session_id"))
    name = str(name or options.get("name") or options.get("voice_name") or "").strip()
    language = str(options.get("language") or language or "zh")
    if segment_indices is None:
        raw = options.get("segment_indices") or options.get("indices") or refs.get("segment_indices")
        if isinstance(raw, list):
            segment_indices = [int(item) for item in raw]
    if not session_id:
        return {"status": "failed", "worker": "voice_worker", "reason": "需要 Voice Studio session_id"}
    if not name:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "session_id": session_id,
            "waiting_inputs": [
                {
                    "kind": "text",
                    "input_id": "voice_name",
                    "label": "命名音色",
                    "required": True,
                }
            ],
        }
    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少数据库上下文"}
    current = manager.session_state(session_id) if callable(getattr(manager, "session_state", None)) else None
    if not current:
        session_dir = _studio_session_dir(manager, session_id)
        meta_path = session_dir / "meta.json" if session_dir is not None else None
        if meta_path is None or not meta_path.is_file():
            return {"status": "not_found", "worker": "voice_worker", "session_id": session_id}
        try:
            current = json.loads(meta_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    segments = list(current.get("segments") or [])
    if segment_indices is not None:
        wanted = set(segment_indices)
        segments = [item for item in segments if item.get("index") in wanted]
    if not segments:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "session_id": session_id,
            "reason": "没有可用的音频片段",
            "waiting_inputs": [
                {
                    "kind": "configuration",
                    "input_id": "segment_indices",
                    "label": "选择片段",
                    "required": True,
                }
            ],
        }
    session_dir = _studio_session_dir(manager, session_id)
    if session_dir is None:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": "无法定位 Voice Studio 会话目录"}
    paths = []
    for item in segments:
        filename = item.get("file") or item.get("filename")
        if not filename:
            continue
        path = session_dir / "segments" / str(filename)
        if path.is_file():
            paths.append(str(path))
    if not paths:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": "片段文件不存在"}
    db = context.session_factory()
    asset = None
    try:
        normalized_language = normalize_language(language)
        asset = VoiceAsset(
            name=name,
            engine="gpt_sovits",
            workspace_id=context.workspace_id,
            reference_language=normalized_language,
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        service.prepare_dataset(asset.id, paths, language=str(language).upper())
        if callable(getattr(service, "label_with_asr", None)):
            service.label_with_asr(asset.id, language=language)
        errors = service.validate_dataset(asset.id, language) if callable(getattr(service, "validate_dataset", None)) else []
        if errors:
            raise TrainingDataInvalid("；".join(str(item) for item in errors[:5]))
        started = service.start_training(asset.id)
        if not started:
            return {
                "status": "running",
                "worker": "voice_worker",
                "session_id": session_id,
                "asset_id": asset.id,
                "reason": "已有训练任务在进行",
            }
        run_id = _start_runtime_task(
            runtime,
            action="gpt_sovits_training",
            metadata={"asset_id": asset.id, "session_id": session_id},
        )
        return {
            "status": "accepted",
            "worker": "voice_worker",
            "session_id": session_id,
            "asset_id": asset.id,
            "name": asset.name,
            "run_id": run_id,
            "next_step": "poll_training_status",
        }
    except TrainingDataInvalid as exc:
        if asset is not None:
            asset.status = "needs_retraining"
            asset.error_message = str(exc)
            db.commit()
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "asset_id": getattr(asset, "id", None), "reason": str(exc)}
    except Exception as exc:
        logger.error("Failed to train from studio: %s", exc)
        if asset is not None:
            asset.status = "needs_retraining"
            asset.error_message = str(exc)
            db.commit()
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    finally:
        db.close()


@tool
def upload_voice_studio_segments(
    session_id: str | None = None,
    attachment_id: str | None = None,
    file_id: str | None = None,
    file_path: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Append conversation audio attachments as extra Voice Studio segments."""
    if file_path and _looks_like_path(file_path):
        return {
            "status": "failed",
            "worker": "voice_worker",
            "reason": "不接受本地文件路径，请使用会话 attachment_id",
        }
    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    refs = _dispatch_refs(runtime)
    options = _dispatch_options(runtime)
    session_id = _first_id(session_id, refs.get("session_id"), refs.get("voice_session_id"), options.get("session_id"))
    attachment_id = _first_id(
        attachment_id,
        file_id,
        refs.get("source_file_id"),
        refs.get("source_attachment_id"),
        refs.get("audio_file_id"),
        refs.get("attachment_id"),
        *((refs.get("attachment_ids") or [None])[:1] if isinstance(refs.get("attachment_ids"), list) else (None,)),
    )
    if not session_id:
        return {"status": "failed", "worker": "voice_worker", "reason": "需要 Voice Studio session_id"}
    if not attachment_id:
        return _waiting_attachment(session_id)
    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少会话附件上下文"}
    try:
        with context.session_factory() as db:
            item = resolve_attachment(
                db,
                manager.project_root,
                context.conversation_id,
                attachment_id,
                workspace_id=context.workspace_id,
            )
            if _is_video(item):
                return {
                    "status": "failed",
                    "worker": "voice_worker",
                    "session_id": session_id,
                    "reason": "训练片段必须是音频附件，不能使用视频",
                }
            staged = _stage_attachment(manager, session_id, item)
        snapshot = manager.upload_segments(session_id, [staged])
        return {
            "status": "completed",
            "worker": "voice_worker",
            "action": "upload_segments",
            "session_id": session_id,
            "attachment_id": attachment_id,
            "session": _public_session(snapshot),
        }
    except FileNotFoundError:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": "附件不存在或不属于当前会话"}
    except VoiceStudioError as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    except Exception as exc:
        logger.error("Failed to upload voice studio segments: %s", exc)
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}


@tool
def cancel_voice_studio_session(
    session_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Cancel a running Voice Studio job without deleting session files."""
    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    refs = _dispatch_refs(runtime)
    options = _dispatch_options(runtime)
    session_id = _first_id(session_id, refs.get("session_id"), refs.get("voice_session_id"), options.get("session_id"))
    if not session_id:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "waiting_inputs": [
                {
                    "kind": "configuration",
                    "input_id": "session_id",
                    "label": "请重新开始",
                    "required": True,
                }
            ],
        }
    cancel = getattr(manager, "cancel_session", None)
    if not callable(cancel):
        signal = getattr(manager, "_signal_cancel", None)
        if callable(signal):
            signal(session_id)
            current = manager.session_state(session_id) if callable(getattr(manager, "session_state", None)) else None
            return {
                "status": "cancelled",
                "worker": "voice_worker",
                "session_id": session_id,
                "session": _public_session(current),
            }
        return {"status": "unavailable", "worker": "voice_worker", "reason": "Voice Studio 不支持取消"}
    try:
        snapshot = cancel(session_id)
        return {
            "status": "cancelled",
            "worker": "voice_worker",
            "session_id": session_id,
            "session": _public_session(snapshot if isinstance(snapshot, dict) else None),
        }
    except VoiceStudioError as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    except Exception as exc:
        logger.error("Failed to cancel voice studio session: %s", exc)
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}


@tool
def bind_trained_voice(
    session_id: str,
    voice_name: str,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """将 Voice Studio 参考音色保存为命名音色，并写入当前角色档案。"""
    manager = _studio(runtime)
    if manager is None:
        return _unavailable()
    context = getattr(runtime, "context", None)
    persona_id = getattr(context, "persona_id", None)
    if not persona_id:
        return {"status": "denied", "worker": "voice_worker", "reason": "未识别当前角色"}
    try:
        current = manager.session_state(session_id) or {}
        phase = str(current.get("phase") or "").lower()
        if phase == "done" and current.get("voice_id"):
            voice = manager.list_voices_by_id(current["voice_id"]) if callable(getattr(manager, "list_voices_by_id", None)) else {
                "voice_id": current.get("voice_id"),
                "name": current.get("voice_name") or voice_name,
            }
        else:
            voice = manager.complete_session(session_id, voice_name)
        bound = False
        if context is not None and getattr(context, "session_factory", None):
            from app.models import Persona

            db = context.session_factory()
            try:
                persona = db.get(Persona, persona_id)
                if persona is not None and persona.workspace_id == context.workspace_id:
                    profile = dict(persona.profile_json or {})
                    profile["voice"] = {
                        "voice_id": voice.get("voice_id"),
                        "voice_name": voice.get("name") or voice_name,
                        "session_id": session_id,
                    }
                    persona.profile_json = profile
                    flag_modified(persona, "profile_json")
                    db.commit()
                    bound = True
            finally:
                db.close()
        return {
            "status": "completed",
            "worker": "voice_worker",
            "session_id": session_id,
            "voice_id": voice.get("voice_id"),
            "voice_name": voice.get("name") or voice_name,
            "bound": bound,
            "message": (
                f"音色「{voice.get('name') or voice_name}」已保存"
                + ("并绑定到当前角色。" if bound else "，但未能写入角色档案。")
            ),
        }
    except VoiceStudioError as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
    except Exception as exc:
        logger.error("Failed to bind voice: %s", exc)
        return {"status": "binding_failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}
