"""统一声音 Worker 工具。

旧的语音克隆工具仍保留在 ``voice_clone`` 模块中，以维持工具名和历史导入兼容；
这里把它们与 TTS、ASR、Voice Asset、Voice Studio、训练状态等查询能力统一导出，
由 registry 作为 canonical ``voice`` Worker 的单一工具集合。
"""
from __future__ import annotations

from typing import Any

from langchain.tools import ToolRuntime, tool
from sqlalchemy import select

from agents.context import PersonaAgentContext
from agents.tools.voice_clone import (
    analyze_voice_material,
    bind_trained_voice,
    check_training_progress,
    request_file_upload,
    request_training_confirmation,
    start_voice_clone_session,
    start_voice_training,
)


def _session(context: PersonaAgentContext):
    if context.session_factory is None:
        raise RuntimeError("Database session is unavailable")
    return context.session_factory()


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
    app = getattr(getattr(runtime, "request", None), "app", None)
    state = getattr(app, "state", None)
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
    manager = getattr(getattr(getattr(runtime, "request", None), "app", None), "state", None)
    manager = getattr(manager, "voice_studio", None)
    if manager is None or not callable(getattr(manager, "list_sessions", None)):
        return {"status": "unavailable", "items": []}
    try:
        return {"status": "ok", "items": list(manager.list_sessions())}
    except Exception as exc:
        return {"status": "failed", "items": [], "reason": str(exc)}


@tool("get_voice_studio_session")
def get_voice_studio_session(session_id: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """查询一个 Voice Studio 会话的状态。"""
    manager = getattr(getattr(getattr(runtime, "request", None), "app", None), "state", None)
    manager = getattr(manager, "voice_studio", None)
    if manager is None or not callable(getattr(manager, "session_state", None)):
        return {"status": "unavailable", "session_id": session_id}
    try:
        value = manager.session_state(session_id)
        return {"status": "ok" if value is not None else "not_found", "session": value, "session_id": session_id}
    except Exception as exc:
        return {"status": "failed", "session_id": session_id, "reason": str(exc)}


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
        return {"status": "ok", "persona_id": persona.id, "binding": binding}
    finally:
        session.close()


__all__ = [
    "start_voice_clone_session",
    "request_file_upload",
    "analyze_voice_material",
    "request_training_confirmation",
    "start_voice_training",
    "check_training_progress",
    "bind_trained_voice",
    "list_voice_assets",
    "get_voice_system_status",
    "list_voice_studio_sessions",
    "get_voice_studio_session",
    "get_voice_training_status",
    "get_persona_voice_binding",
]
