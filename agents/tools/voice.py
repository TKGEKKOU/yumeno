"""统一声音 Worker 工具。

旧的语音克隆工具仍保留在 ``voice_clone`` 模块中，以维持工具名和历史导入兼容；
这里把它们与 TTS、ASR、Voice Asset、Voice Studio、训练状态等查询能力统一导出，
由 registry 作为 canonical ``voice`` Worker 的单一工具集合。
"""
from __future__ import annotations

import asyncio
import shutil
import inspect
from pathlib import Path
from typing import Any

from langchain.tools import ToolRuntime, tool
from sqlalchemy import select

from agents.context import PersonaAgentContext
from app.attachments import create_attachment, public_attachment, resolve_attachment
from agents.tools.voice_clone import (
    _dispatch_refs,
    _first_id,
    _public_session,
    analyze_voice_material,
    bind_trained_voice,
    cancel_voice_studio_session,
    check_training_progress,
    request_file_upload,
    request_training_confirmation,
    start_voice_clone_session,
    start_voice_training,
    train_voice_from_studio,
    upload_voice_studio_segments,
)



def _app_state(runtime: ToolRuntime[PersonaAgentContext]):
    app = getattr(getattr(runtime, "request", None), "app", None)
    state = getattr(app, "state", None)
    if state is not None:
        return state
    context = getattr(runtime, "context", None)
    agent_runtime = getattr(context, "agent_runtime", None)
    return getattr(agent_runtime, "app_state", None)


def _session(context: PersonaAgentContext):
    if context.session_factory is None:
        raise RuntimeError("Database session is unavailable")
    return context.session_factory()




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


def _first_id(*values: Any) -> str | None:
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return None


def _project_root(runtime) -> Path | None:
    state = _app_state(runtime)
    for attr in ("voice_studio", "gpt_sovits_training"):
        owner = getattr(state, attr, None) if state is not None else None
        root = getattr(owner, "project_root", None)
        if root:
            return Path(root)
    return None


def _bound_voice_asset_id(runtime: ToolRuntime[PersonaAgentContext]) -> str | None:
    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return None
    from app.models import Persona

    session = context.session_factory()
    try:
        scalar = getattr(session, "scalar", None)
        if not callable(scalar):
            return None
        persona = scalar(
            select(Persona).where(
                Persona.id == context.persona_id,
                Persona.workspace_id == context.workspace_id,
            )
        )
        profile = getattr(persona, "profile_json", None)
        if not isinstance(profile, dict):
            return None
        tts = profile.get("tts") if isinstance(profile.get("tts"), dict) else {}
        voice = profile.get("voice") if isinstance(profile.get("voice"), dict) else {}
        return _first_id(
            tts.get("voice_asset_id"),
            voice.get("voice_asset_id"),
            voice.get("asset_id"),
        )
    except Exception:
        return None
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


def _asset_payload(asset) -> dict[str, Any]:
    return {
        "id": asset.id,
        "name": asset.name,
        "engine": asset.engine,
        "status": asset.status,
        "training_stage": asset.training_stage,
        "reference_language": asset.reference_language,
        "has_reference_audio": bool(asset.refer_audio_path),
        "has_preview_audio": bool(asset.preview_audio_path),
        "error_message": asset.error_message,
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
        "updated_at": asset.updated_at.isoformat() if asset.updated_at else None,
    }


@tool("list_voice_assets")
def list_voice_assets(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """列出当前工作区的 Voice Asset，不返回其他工作区的资源路径。"""
    from app.models import VoiceAsset

    session = _session(runtime.context)
    try:
        assets = session.scalars(
            select(VoiceAsset)
            .where(
                VoiceAsset.workspace_id == runtime.context.workspace_id,
                # 角色声音工具只暴露 GPT-SoVITS 资产；RVC 结果属于独立音频生产文件。
                VoiceAsset.engine == "gpt_sovits",
            )
            .order_by(VoiceAsset.updated_at.desc(), VoiceAsset.id.desc())
        ).all()
        return {"status": "ok", "items": [_asset_payload(asset) for asset in assets]}
    finally:
        session.close()


@tool("get_voice_system_status")
def get_voice_system_status(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询 TTS、ASR、GPT-SoVITS 和 Voice Studio 的当前状态。"""
    state = _app_state(runtime)
    if state is None:
        return {"status": "unavailable", "reason": "应用运行时不可用"}

    result: dict[str, Any] = {"status": "ok", "systems": {}}
    for name, attr in (
        ("tts", "tts_synthesis"),
        ("gpt_sovits", "gpt_sovits"),
        ("asr", "asr_resources"),
        ("voice_studio", "voice_studio"),
    ):
        service = getattr(state, attr, None)
        if service is None:
            result["systems"][name] = {"available": False}
            continue
        status_fn = getattr(service, "status", None)
        if callable(status_fn):
            try:
                value = status_fn()
                result["systems"][name] = {"available": True, **(value if isinstance(value, dict) else {"value": value})}
            except Exception as exc:
                result["systems"][name] = {"available": False, "error": str(exc)}
        else:
            result["systems"][name] = {"available": True}
    return result


@tool("list_voice_studio_sessions")
def list_voice_studio_sessions(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """列出 Voice Studio 会话及其处理阶段。"""
    manager = getattr(_app_state(runtime), "voice_studio", None)
    if manager is None or not callable(getattr(manager, "list_sessions", None)):
        return {"status": "unavailable", "items": []}
    try:
        return {"status": "ok", "items": list(manager.list_sessions())}
    except Exception as exc:
        return {"status": "failed", "items": [], "reason": str(exc)}


@tool("get_voice_studio_session")
def get_voice_studio_session(session_id: str | None = None, runtime: ToolRuntime[PersonaAgentContext] | None = None) -> dict[str, Any]:
    """查询一个 Voice Studio 会话的状态。"""
    refs = _dispatch_refs(runtime) if runtime is not None else {}
    session_id = _first_id(session_id, refs.get("session_id"), refs.get("voice_session_id"))
    state = _app_state(runtime) if runtime is not None else None
    manager = getattr(state, "voice_studio", None)
    if manager is None or not callable(getattr(manager, "session_state", None)):
        return {"status": "unavailable", "worker": "voice_worker", "session_id": session_id}
    if not session_id:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "action": "session_status",
            "waiting_inputs": [{
                "kind": "configuration",
                "input_id": "session_id",
                "label": "请重新开始",
                "required": True,
            }],
        }
    try:
        value = manager.session_state(session_id)
        if value is None:
            return {"status": "not_found", "worker": "voice_worker", "session_id": session_id}
        snapshot = _public_session(value if isinstance(value, dict) else {})
        phase = str(snapshot.get("phase") or "").lower()
        running = bool(snapshot.get("running"))
        payload = {
            "worker": "voice_worker",
            "action": "session_status",
            "session_id": session_id,
            "voice_session_id": session_id,
            "session": snapshot,
        }
        if phase == "failed":
            payload["status"] = "failed"
            payload["reason"] = snapshot.get("error")
        elif phase == "cancelled":
            payload["status"] = "cancelled"
        elif phase == "segments":
            payload["status"] = "waiting_input"
            payload["waiting_inputs"] = [{
                "kind": "configuration",
                "input_id": "segment_indices",
                "label": "选择片段",
                "required": True,
            }]
        elif phase == "reference":
            payload["status"] = "waiting_input"
            payload["waiting_inputs"] = [{
                "kind": "confirmation",
                "input_id": "save_voice",
                "action": "save_voice",
                "label": "保存音色",
                "required": True,
            }]
        elif running or phase in {"queued", "convert", "separating", "audio_ready"}:
            payload["status"] = "running"
        else:
            payload["status"] = "ok"
        return payload
    except Exception as exc:
        return {"status": "failed", "worker": "voice_worker", "session_id": session_id, "reason": str(exc)}


@tool("get_voice_training_status")
def get_voice_training_status(asset_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询一个 Voice Asset 的训练状态和进度。"""
    from app.models import VoiceAsset

    session = _session(runtime.context)
    try:
        asset = session.scalar(
            select(VoiceAsset).where(
                VoiceAsset.id == asset_id,
                VoiceAsset.workspace_id == runtime.context.workspace_id,
            )
        )
        if asset is None:
            return {"status": "not_found", "asset_id": asset_id}
        result = _asset_payload(asset)
        result["asset_id"] = asset_id
        if asset.status == "processing" and asset.dataset_dir:
            # TrainingService 的 status 只提供全局聚合信息，资产字段仍是权威状态。
            result["progress"] = None
        return result
    finally:
        session.close()


@tool("get_persona_voice_binding")
def get_persona_voice_binding(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询当前角色的人设档案中配置的音色绑定。"""
    from app.models import Persona

    session = _session(runtime.context)
    try:
        persona = session.scalar(
            select(Persona).where(
                Persona.id == runtime.context.persona_id,
                Persona.workspace_id == runtime.context.workspace_id,
            )
        )
        if persona is None:
            return {"status": "not_found", "persona_id": runtime.context.persona_id}
        profile = persona.profile_json or {}
        binding = profile.get("voice") or profile.get("voice_id") or profile.get("voice_asset")
        tts = profile.get("tts") if isinstance(profile.get("tts"), dict) else {}
        return {"status": "ok", "persona_id": persona.id, "binding": binding, "tts_voice_asset_id": tts.get("voice_asset_id")}
    finally:
        session.close()


@tool("get_gpt_sovits_engine_status")
def get_gpt_sovits_engine_status(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询 GPT-SoVITS 引擎与安装状态；安装/卸载仍归 config_worker。"""
    state = _app_state(runtime)
    if state is None:
        return {"status": "unavailable", "worker": "voice_worker", "reason": "应用运行时不可用"}
    engine = getattr(state, "gpt_sovits", None)
    installer = getattr(state, "gpt_sovits_install", None)
    payload: dict[str, Any] = {"status": "ok", "worker": "voice_worker"}
    if engine is None or not callable(getattr(engine, "status", None)):
        payload["engine"] = {"available": False}
    else:
        try:
            value = engine.status()
            payload["engine"] = {"available": True, **(value if isinstance(value, dict) else {"value": value})}
        except Exception as exc:
            payload["engine"] = {"available": False, "error": str(exc)}
    if installer is not None and callable(getattr(installer, "status", None)):
        try:
            install = installer.status()
            payload["install"] = install if isinstance(install, dict) else {"value": install}
        except Exception as exc:
            payload["install"] = {"error": str(exc)}
    engine_info = payload.get("engine") or {}
    if engine_info.get("installed") is False or engine_info.get("available") is False:
        payload["handoff"] = "config_worker"
        payload["guidance"] = "GPT-SoVITS 运行环境未就绪时，请交 config_worker 安装，不要由 voice_worker 下载。"
    return payload


@tool("control_gpt_sovits_service")
def control_gpt_sovits_service(
    action: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict[str, Any]:
    """启动或停止已安装的 GPT-SoVITS 推理服务，不负责安装或卸载。"""
    normalized = str(action or "").strip().lower()
    if normalized not in {"start", "stop"}:
        return {"status": "failed", "worker": "voice_worker", "reason": "action 只能是 start 或 stop"}
    state = _app_state(runtime)
    engine = getattr(state, "gpt_sovits", None) if state is not None else None
    if engine is None:
        return {"status": "unavailable", "worker": "voice_worker", "reason": "GPT-SoVITS 引擎不可用", "handoff": "config_worker"}
    try:
        if normalized == "start":
            ensure = getattr(engine, "ensure_service", None)
            if not callable(ensure):
                return {"status": "unavailable", "worker": "voice_worker", "reason": "引擎不支持启动服务"}
            ensure()
        else:
            stop = getattr(engine, "stop_service", None)
            if not callable(stop):
                return {"status": "unavailable", "worker": "voice_worker", "reason": "引擎不支持停止服务"}
            stop()
        status = engine.status() if callable(getattr(engine, "status", None)) else {}
        return {
            "status": "completed",
            "worker": "voice_worker",
            "action": normalized,
            "engine": status if isinstance(status, dict) else {"value": status},
        }
    except Exception as exc:
        from voice.gpt_sovits import GPTSoVITSNotInstalled
        if isinstance(exc, GPTSoVITSNotInstalled):
            return {
                "status": "unavailable",
                "worker": "voice_worker",
                "action": normalized,
                "reason": str(exc),
                "handoff": "config_worker",
            }
        return {"status": "failed", "worker": "voice_worker", "action": normalized, "reason": str(exc)}


@tool("synthesize_voice_asset")
def synthesize_voice_asset(
    text: str | None = None,
    asset_id: str | None = None,
    text_lang: str = "auto",
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """用 GPT-SoVITS Voice Asset 合成语音，并把结果登记为当前会话附件。"""
    from app.models import VoiceAsset
    from voice.gpt_sovits import GPTSoVITSNotInstalled
    from voice.gpt_sovits.language import normalize_language
    from voice.gpt_sovits.synthesis import SynthesisAssetInvalid

    refs = _dispatch_refs(runtime)
    options = _dispatch_options(runtime)
    text = str(text or options.get("text") or "").strip()
    if not text:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "waiting_inputs": [
                {
                    "kind": "text",
                    "input_id": "tts_text",
                    "label": "输入文本",
                    "required": True,
                }
            ],
        }
    asset_id = _first_id(
        asset_id,
        refs.get("asset_id"),
        refs.get("voice_asset_id"),
        options.get("asset_id"),
    )
    if not asset_id and runtime is not None:
        asset_id = _bound_voice_asset_id(runtime)
    if not asset_id:
        return {
            "status": "waiting_input",
            "worker": "voice_worker",
            "reason": "需要 Voice Asset ID，或先绑定角色 TTS 音色",
            "waiting_inputs": [
                {
                    "kind": "configuration",
                    "input_id": "asset_id",
                    "label": "选择音色",
                    "required": True,
                }
            ],
        }

    context = getattr(runtime, "context", None)
    if context is None or not getattr(context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少数据库上下文"}
    if not getattr(context, "conversation_id", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少会话上下文，无法保存合成音频"}

    state = _app_state(runtime)
    synthesis = getattr(state, "tts_synthesis", None) if state is not None else None
    if synthesis is None or not callable(getattr(synthesis, "synthesize", None)):
        return {"status": "unavailable", "worker": "voice_worker", "reason": "TTS 合成服务不可用"}

    root = _project_root(runtime)
    if root is None:
        return {"status": "failed", "worker": "voice_worker", "reason": "缺少受管项目根目录"}

    session = context.session_factory()
    try:
        asset = session.scalar(
            select(VoiceAsset).where(
                VoiceAsset.id == asset_id,
                VoiceAsset.workspace_id == context.workspace_id,
                VoiceAsset.engine == "gpt_sovits",
            )
        )
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        default_language = None if str(text_lang or "auto") == "auto" else normalize_language(text_lang)
        audio = synthesis.synthesize(asset, text, default_language=default_language)
        item = create_attachment(
            session,
            root,
            context.conversation_id,
            f"{asset.name or 'voice'}.wav",
            "audio/wav",
            audio,
            workspace_id=context.workspace_id,
            source="voice_worker",
        )
        session.commit()
        attachment = public_attachment(item)
        return {
            "status": "completed",
            "worker": "voice_worker",
            "asset_id": asset_id,
            "result_refs": [attachment.get("file_id")],
            "attachment": attachment,
        }
    except GPTSoVITSNotInstalled as exc:
        session.rollback()
        return {
            "status": "unavailable",
            "worker": "voice_worker",
            "asset_id": asset_id,
            "reason": str(exc),
            "handoff": "config_worker",
        }
    except SynthesisAssetInvalid as exc:
        session.rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    except Exception as exc:
        session.rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        session.close()



def _waiting(input_id: str, label: str, kind: str = "text", extra: dict[str, Any] | None = None) -> dict[str, Any]:
    item = {"kind": kind, "input_id": input_id, "label": label, "required": True}
    if extra:
        item.update(extra)
    return {"status": "waiting_input", "worker": "voice_worker", "waiting_inputs": [item]}


def _load_gpt_sovits_asset(session, runtime: ToolRuntime[PersonaAgentContext], asset_id: str):
    from app.models import VoiceAsset
    return session.scalar(
        select(VoiceAsset).where(
            VoiceAsset.id == asset_id,
            VoiceAsset.workspace_id == runtime.context.workspace_id,
            VoiceAsset.engine == "gpt_sovits",
        )
    )


@tool("create_voice_asset")
def create_voice_asset(
    name: str | None = None,
    reference_language: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Create a workspace-scoped GPT-SoVITS Voice Asset record."""
    from app.models import VoiceAsset
    from voice.gpt_sovits.language import normalize_language

    options = _dispatch_options(runtime)
    name = str(name or options.get("name") or options.get("asset_name") or "").strip()
    if not name:
        return _waiting("asset_name", "给音色起个名字")
    if runtime is None or getattr(runtime, "context", None) is None or not getattr(runtime.context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "database context missing"}
    language = reference_language or options.get("reference_language")
    session = runtime.context.session_factory()
    try:
        asset = VoiceAsset(
            name=name,
            engine="gpt_sovits",
            workspace_id=runtime.context.workspace_id,
            reference_language=normalize_language(str(language)) if language else None,
        )
        session.add(asset)
        session.commit()
        refresh = getattr(session, "refresh", None)
        if callable(refresh):
            refresh(asset)
        return {"status": "completed", "worker": "voice_worker", "asset": _asset_payload(asset)}
    except Exception as exc:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


@tool("update_voice_asset")
def update_voice_asset(
    asset_id: str | None = None,
    name: str | None = None,
    reference_language: str | None = None,
    gpt_weights_path: str | None = None,
    sovits_weights_path: str | None = None,
    refer_audio_path: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Rename or update language for a Voice Asset; ignore weight/file paths."""
    from voice.gpt_sovits.language import normalize_language

    del gpt_weights_path, sovits_weights_path, refer_audio_path
    options = _dispatch_options(runtime)
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"), options.get("asset_id"))
    if not asset_id:
        return _waiting("asset_id", "选择要更新的音色", "configuration")
    if runtime is None or getattr(runtime, "context", None) is None or not getattr(runtime.context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "database context missing"}
    session = runtime.context.session_factory()
    try:
        asset = _load_gpt_sovits_asset(session, runtime, asset_id)
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        new_name = str(name or options.get("name") or "").strip()
        if new_name:
            asset.name = new_name
        language = reference_language or options.get("reference_language")
        if language:
            asset.reference_language = normalize_language(str(language))
        session.commit()
        refresh = getattr(session, "refresh", None)
        if callable(refresh):
            refresh(asset)
        return {"status": "completed", "worker": "voice_worker", "asset": _asset_payload(asset)}
    except Exception as exc:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


@tool("delete_voice_asset")
def delete_voice_asset(
    asset_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Delete the Voice Asset database record only; never delete model files."""
    options = _dispatch_options(runtime)
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"), options.get("asset_id"))
    if not asset_id:
        return _waiting("asset_id", "选择要删除的音色", "configuration")
    if runtime is None or getattr(runtime, "context", None) is None or not getattr(runtime.context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "database context missing"}
    session = runtime.context.session_factory()
    try:
        asset = _load_gpt_sovits_asset(session, runtime, asset_id)
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        session.delete(asset)
        session.commit()
        return {"status": "completed", "worker": "voice_worker", "asset_id": asset_id}
    except Exception as exc:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


def _asr_provider(runtime: ToolRuntime[PersonaAgentContext]):
    state = _app_state(runtime)
    factory = getattr(state, "asr_provider_factory", None) if state is not None else None
    if factory is None or not callable(factory):
        return None
    try:
        return factory()
    except TypeError:
        from settings import Settings
        return factory(Settings.load())


@tool("transcribe_voice_attachment")
def transcribe_voice_attachment(
    attachment_id: str | None = None,
    file_id: str | None = None,
    file_path: str | None = None,
    input_path: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Transcribe a conversation audio attachment with ASR; never accept local paths."""
    if file_path or input_path:
        return {
            "status": "failed",
            "worker": "voice_worker",
            "reason": "local file paths are not accepted; use conversation attachment_id",
        }
    refs = _dispatch_refs(runtime)
    attachment_id = _first_id(
        attachment_id,
        file_id,
        refs.get("source_file_id"),
        refs.get("source_attachment_id"),
        refs.get("audio_file_id"),
        refs.get("attachment_id"),
        *((refs.get("attachment_ids") or [None])[:1] if isinstance(refs.get("attachment_ids"), list) else (None,)),
    )
    if not attachment_id:
        return _waiting(
            "audio_attachment",
            "上传要识别的音频",
            "attachment",
            extra={"accepted_file_types": ["audio/*"]},
        )
    if runtime is None or getattr(runtime, "context", None) is None:
        return {"status": "failed", "worker": "voice_worker", "reason": "conversation context missing"}
    context = runtime.context
    if not getattr(context, "session_factory", None) or not getattr(context, "conversation_id", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "attachment context missing"}
    provider = _asr_provider(runtime)
    if provider is None or not callable(getattr(provider, "transcribe", None)):
        return {
            "status": "unavailable",
            "worker": "voice_worker",
            "reason": "ASR is unavailable",
            "handoff": "config_worker",
        }
    root = _project_root(runtime)
    if root is None:
        return {"status": "failed", "worker": "voice_worker", "reason": "managed project root missing"}
    session = context.session_factory()
    try:
        item = resolve_attachment(
            session,
            root,
            context.conversation_id,
            attachment_id,
            workspace_id=context.workspace_id,
        )
        audio = Path(item.storage_path).read_bytes()
        text = provider.transcribe(item.name, item.mime_type, audio)
        if inspect.isawaitable(text):
            text = asyncio.run(text)
        return {
            "status": "completed",
            "worker": "voice_worker",
            "attachment_id": attachment_id,
            "text": text,
        }
    except FileNotFoundError:
        return {"status": "failed", "worker": "voice_worker", "reason": "attachment not found in current conversation"}
    except Exception as exc:
        return {"status": "failed", "worker": "voice_worker", "attachment_id": attachment_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


_AUDIO_SUFFIXES = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".webm"}


def _reject_local_path(file_path: str | None, input_path: str | None) -> dict[str, Any] | None:
    if file_path or input_path:
        return {
            "status": "failed",
            "worker": "voice_worker",
            "reason": "local file paths are not accepted; use conversation attachment_id",
        }
    return None


def _resolve_attachment_id(*values: Any, refs: dict[str, Any] | None = None) -> str | None:
    refs = refs or {}
    extra = None
    ids = refs.get("attachment_ids")
    if isinstance(ids, list) and ids:
        extra = ids[0]
    return _first_id(
        *values,
        refs.get("source_file_id"),
        refs.get("source_attachment_id"),
        refs.get("audio_file_id"),
        refs.get("attachment_id"),
        extra,
    )


@tool("get_voice_asset")
def get_voice_asset(
    asset_id: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Query one workspace-scoped GPT-SoVITS Voice Asset without exposing disk paths."""
    options = _dispatch_options(runtime)
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"), options.get("asset_id"))
    if not asset_id:
        return _waiting("asset_id", "选择音色", "configuration")
    if runtime is None or getattr(runtime, "context", None) is None or not getattr(runtime.context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "database context missing"}
    session = runtime.context.session_factory()
    try:
        asset = _load_gpt_sovits_asset(session, runtime, asset_id)
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        return {"status": "ok", "worker": "voice_worker", "asset": _asset_payload(asset)}
    except Exception as exc:
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()



@tool("bind_voice_asset_to_persona")
def bind_voice_asset_to_persona(
    asset_id: str | None = None,
    output_language: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Bind a workspace GPT-SoVITS Voice Asset to the current persona TTS profile."""
    from app.models import Persona
    from sqlalchemy.orm.attributes import flag_modified
    from voice.gpt_sovits.language import normalize_language

    options = _dispatch_options(runtime)
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"), options.get("asset_id"))
    if not asset_id:
        return _waiting("asset_id", "选择要使用的音色", "configuration")
    if runtime is None or getattr(runtime, "context", None) is None or not getattr(runtime.context, "session_factory", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "database context missing"}
    language = output_language or options.get("output_language") or options.get("reference_language")
    session = runtime.context.session_factory()
    try:
        asset = _load_gpt_sovits_asset(session, runtime, asset_id)
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        persona = session.scalar(
            select(Persona).where(
                Persona.id == runtime.context.persona_id,
                Persona.workspace_id == runtime.context.workspace_id,
            )
        )
        if persona is None:
            return {"status": "not_found", "worker": "voice_worker", "persona_id": runtime.context.persona_id}
        profile = dict(persona.profile_json or {})
        tts = dict(profile.get("tts") or {}) if isinstance(profile.get("tts"), dict) else {}
        tts["voice_asset_id"] = asset.id
        tts["enabled"] = True
        if language:
            tts["output_language"] = normalize_language(str(language))
        profile["tts"] = tts
        persona.profile_json = profile
        try:
            flag_modified(persona, "profile_json")
        except Exception:
            persona.profile_json = profile
        session.commit()
        return {
            "status": "completed",
            "worker": "voice_worker",
            "asset_id": asset.id,
            "persona_id": persona.id,
            "binding": {"voice_asset_id": asset.id, "output_language": tts.get("output_language")},
            "asset": _asset_payload(asset),
        }
    except Exception as exc:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


@tool("set_voice_asset_reference_audio")
def set_voice_asset_reference_audio(
    asset_id: str | None = None,
    attachment_id: str | None = None,
    file_id: str | None = None,
    file_path: str | None = None,
    input_path: str | None = None,
    runtime: ToolRuntime[PersonaAgentContext] | None = None,
) -> dict[str, Any]:
    """Copy a conversation audio attachment into the managed Voice Asset directory as reference audio."""
    rejected = _reject_local_path(file_path, input_path)
    if rejected:
        return rejected
    options = _dispatch_options(runtime)
    refs = _dispatch_refs(runtime)
    asset_id = _first_id(asset_id, refs.get("asset_id"), refs.get("voice_asset_id"), options.get("asset_id"))
    if not asset_id:
        return _waiting("asset_id", "选择音色", "configuration")
    attachment_id = _resolve_attachment_id(attachment_id, file_id, refs=refs)
    if not attachment_id:
        return _waiting(
            "audio_attachment",
            "上传参考音频",
            "attachment",
            extra={"accepted_file_types": ["audio/*"]},
        )
    if runtime is None or getattr(runtime, "context", None) is None:
        return {"status": "failed", "worker": "voice_worker", "reason": "conversation context missing"}
    context = runtime.context
    if not getattr(context, "session_factory", None) or not getattr(context, "conversation_id", None):
        return {"status": "failed", "worker": "voice_worker", "reason": "attachment context missing"}
    root = _project_root(runtime)
    if root is None:
        return {"status": "failed", "worker": "voice_worker", "reason": "managed project root missing"}
    session = context.session_factory()
    try:
        asset = _load_gpt_sovits_asset(session, runtime, asset_id)
        if asset is None:
            return {"status": "not_found", "worker": "voice_worker", "asset_id": asset_id}
        item = resolve_attachment(
            session,
            root,
            context.conversation_id,
            attachment_id,
            workspace_id=context.workspace_id,
        )
        kind = str(getattr(item, "kind", "") or "").lower()
        mime = str(getattr(item, "mime_type", "") or "").lower()
        if kind == "video" or mime.startswith("video/"):
            return {
                "status": "failed",
                "worker": "voice_worker",
                "reason": "reference audio must be an audio attachment, not video",
            }
        suffix = Path(getattr(item, "name", "") or "").suffix.lower()
        if suffix not in _AUDIO_SUFFIXES:
            suffix = ".wav"
        asset_dir = Path(root) / "data" / "gpt_sovits" / "voices" / str(asset.id)
        asset_dir.mkdir(parents=True, exist_ok=True)
        target = asset_dir / f"refer{suffix}"
        shutil.copy2(item.storage_path, target)
        asset.refer_audio_path = str(target)
        session.commit()
        refresh = getattr(session, "refresh", None)
        if callable(refresh):
            refresh(asset)
        return {
            "status": "completed",
            "worker": "voice_worker",
            "asset_id": asset_id,
            "attachment_id": attachment_id,
            "asset": _asset_payload(asset),
        }
    except FileNotFoundError:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "reason": "attachment not found in current conversation"}
    except Exception as exc:
        rollback = getattr(session, "rollback", None)
        if callable(rollback):
            rollback()
        return {"status": "failed", "worker": "voice_worker", "asset_id": asset_id, "reason": str(exc)}
    finally:
        closer = getattr(session, "close", None)
        if callable(closer):
            closer()


__all__ = [
    "start_voice_clone_session",
    "request_file_upload",
    "analyze_voice_material",
    "request_training_confirmation",
    "start_voice_training",
    "train_voice_from_studio",
    "check_training_progress",
    "bind_trained_voice",
    "list_voice_assets",
    "get_voice_system_status",
    "get_gpt_sovits_engine_status",
    "control_gpt_sovits_service",
    "list_voice_studio_sessions",
    "get_voice_studio_session",
    "get_voice_training_status",
    "get_persona_voice_binding",
    "synthesize_voice_asset",
    "create_voice_asset",
    "update_voice_asset",
    "delete_voice_asset",
    "transcribe_voice_attachment",
    "get_voice_asset",
    "set_voice_asset_reference_audio",
    "bind_voice_asset_to_persona",
    "upload_voice_studio_segments",
    "cancel_voice_studio_session",
]
