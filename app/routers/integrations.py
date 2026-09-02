import asyncio
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect

from app.routers.settings import require_local
from app.routers.personas import local_persona_or_404
from app.routers.tts import persona_output_language, persona_voice_asset
from app.routers.tts import AUDIO_ROOT
from app.schemas import (
    BilibiliConfigUpdate,
    NapCatConversationClearPayload,
    NapCatSendPayload,
    OneBotConfigUpdate,
    OneBotObservationUpdate,
)
from app.conversation_cleanup import clear_im_window_data
from integrations.config import bilibili_config, load_integrations, onebot_config, save_integrations
from settings import Settings


router = APIRouter(prefix="/api/integrations", tags=["integrations"])
INTEGRATIONS_PATH = Settings.load().project_root / "data" / "integrations.json"


def _onebot_manager(request: Request):
    return getattr(request.app.state, "onebot", None)




def _bilibili_manager(request):
    return getattr(request.app.state, "bilibili", None)


def _onebot_response(request: Request) -> dict:
    config = onebot_config(load_integrations(INTEGRATIONS_PATH))
    manager = _onebot_manager(request)
    status = manager.status() if manager is not None else {
        "connected": False, "client_count": 0, "error": None
    }
    return {
        "enabled": config["enabled"],
        "access_token_configured": bool(config["access_token"]),
        "group_trigger": config["group_trigger"],
        "prefix": config["prefix"],
        "default_persona_id": config["default_persona_id"],
        "auto_reply_enabled": config["auto_reply_enabled"],
        "auto_voice_reply": config["auto_voice_reply"],
        "voice_only": config["voice_only"],
        "chinese_text": config["chinese_text"],
        "reply_mode": config["reply_mode"],
        "spontaneous_reply_probability": float(config.get("spontaneous_reply_probability", 0.05) or 0),
        "authorized_group_ids": [str(item) for item in (config.get("authorized_group_ids") or [])],
        "ws_path": "/api/onebot/ws",
        "connected": status.get("connected", False),
        "client_count": status.get("client_count", 0),
        "error": status.get("error"),
        "bot_uin": status.get("bot_uin"),
        "connected_at": status.get("connected_at"),
        "last_event_at": status.get("last_event_at"),
        "last_error_at": status.get("last_error_at"),
        "last_action_error": status.get("last_action_error"),
        "recent_messages": status.get("recent_messages", []),
    }




@router.get("")
def get_integrations(request: Request) -> dict:
    require_local(request)
    return {
        "onebot11": _onebot_response(request),
        "bilibili": _bilibili_manager(request).status(),
    }


@router.get("/bilibili")
def get_bilibili(request: Request) -> dict:
    require_local(request)
    return _bilibili_manager(request).status()


@router.put("/bilibili/config")
def update_bilibili(payload: BilibiliConfigUpdate, request: Request) -> dict:
    require_local(request)
    data = load_integrations(INTEGRATIONS_PATH)
    current = bilibili_config(data)
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("cookie") in (None, ""):
        updates.pop("cookie", None)
    current.update(updates)
    data["bilibili"] = current
    save_integrations(INTEGRATIONS_PATH, data)
    manager = _bilibili_manager(request)
    manager.config_changed(current)
    return manager.status()


@router.post("/bilibili/connect")
async def connect_bilibili(request: Request) -> dict:
    require_local(request)
    await _bilibili_manager(request).connect()
    return _bilibili_manager(request).status()


@router.post("/bilibili/disconnect")
async def disconnect_bilibili(request: Request) -> dict:
    require_local(request)
    await _bilibili_manager(request).disconnect()
    return _bilibili_manager(request).status()


@router.post("/bilibili/pause")
async def pause_bilibili(request: Request) -> dict:
    require_local(request)
    manager = _bilibili_manager(request)
    await manager.pause()
    return manager.status()


@router.post("/bilibili/resume")
async def resume_bilibili(request: Request) -> dict:
    require_local(request)
    manager = _bilibili_manager(request)
    await manager.resume()
    return manager.status()


@router.post("/bilibili/queue/clear")
async def clear_bilibili_queue(request: Request) -> dict:
    require_local(request)
    manager = _bilibili_manager(request)
    manager.clear_queue()
    await manager.broadcast({"type": "status", "status": manager.status()})
    return manager.status()


@router.post("/bilibili/session/clear")
async def clear_bilibili_session(request: Request) -> dict:
    require_local(request)
    manager = _bilibili_manager(request)
    await manager.clear_session()
    return manager.status()


@router.websocket("/bilibili/events/ws")
async def bilibili_events(websocket: WebSocket) -> None:
    await websocket.accept()
    manager = getattr(websocket.app.state, "bilibili")
    manager.clients.add(websocket)
    await websocket.send_json({"type": "status", "status": manager.status()})
    try:
        while True:
            message = await websocket.receive_json()
            if message.get("type") == "audio.done":
                manager.audio_done(str(message.get("event_id") or ""))
    except WebSocketDisconnect:
        manager.clients.discard(websocket)


@router.put("/onebot11")
async def update_onebot(payload: OneBotConfigUpdate, request: Request) -> dict:
    require_local(request)
    data = load_integrations(INTEGRATIONS_PATH)
    current = onebot_config(data)
    updates = payload.model_dump(exclude_unset=True)
    current.update({key: value for key, value in updates.items() if value is not None})
    if "reply_mode" not in updates and (
        "auto_voice_reply" in updates or "voice_only" in updates
    ):
        current["reply_mode"] = (
            "voice_only" if current.get("voice_only") else
            "text_voice" if current.get("auto_voice_reply") else "text"
        )
    data["onebot11"] = current
    save_integrations(INTEGRATIONS_PATH, data)
    manager = _onebot_manager(request)
    if manager is not None:
        await manager.config_changed(current)
    return _onebot_response(request)


@router.get("/onebot11")
def get_onebot(request: Request) -> dict:
    require_local(request)
    return _onebot_response(request)


@router.put("/onebot11/observation")
def update_onebot_observation(
    payload: OneBotObservationUpdate, request: Request
) -> dict:
    require_local(request)
    data = load_integrations(INTEGRATIONS_PATH)
    current = onebot_config(data)
    groups = {str(group_id) for group_id in (current.get("authorized_group_ids") or [])}
    if payload.enabled:
        groups.add(payload.target_id)
    else:
        groups.discard(payload.target_id)
    current["authorized_group_ids"] = sorted(groups)
    data["onebot11"] = current
    save_integrations(INTEGRATIONS_PATH, data)
    return _onebot_response(request)


@router.get("/onebot11/targets")
async def get_onebot_targets(request: Request) -> dict:
    require_local(request)
    manager = _onebot_manager(request)
    try:
        friends, groups = await asyncio.gather(
            manager.request_action("get_friend_list", {}),
            manager.request_action("get_group_list", {}),
        )
    except RuntimeError as exc:
        return {"friends": [], "groups": [], "available": False, "error": str(exc)}
    return {"friends": friends or [], "groups": groups or [], "available": True, "error": None}


@router.post("/onebot11/test")
async def test_onebot_connection(request: Request) -> dict:
    require_local(request)
    manager = _onebot_manager(request)
    if manager is None or not manager.status().get("connected"):
        raise HTTPException(status_code=409, detail="NapCat 尚未建立 WebSocket 连接")
    try:
        return await manager.request_action("get_login_info", {})
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/onebot11/disconnect")
async def disconnect_onebot(request: Request) -> dict:
    require_local(request)
    data = load_integrations(INTEGRATIONS_PATH)
    current = onebot_config(data)
    current["enabled"] = False
    data["onebot11"] = current
    save_integrations(INTEGRATIONS_PATH, data)
    manager = _onebot_manager(request)
    if manager is not None:
        await manager.config_changed(current)
    return _onebot_response(request)


@router.post("/onebot11/conversation/clear")
def clear_onebot_conversation(
    payload: NapCatConversationClearPayload, request: Request
) -> dict:
    require_local(request)
    with request.app.state.session_factory() as session:
        cleared = clear_im_window_data(
            session,
            request.app.state.agent_service.checkpointer,
            "onebot11",
            payload.target_type,
            payload.target_id,
            AUDIO_ROOT,
        )
    return {"cleared": True, "target_type": payload.target_type,
            "target_id": payload.target_id, "persona_count": cleared}


@router.post("/onebot11/recent/clear")
def clear_onebot_recent_messages(request: Request) -> dict:
    require_local(request)
    manager = _onebot_manager(request)
    if manager is not None:
        manager.clear_recent_messages()
    return {"cleared": True, "recent_messages": []}


@router.delete("/onebot11/token")
async def clear_onebot_token(request: Request) -> dict:
    require_local(request)
    data = load_integrations(INTEGRATIONS_PATH)
    current = onebot_config(data)
    current["access_token"] = ""
    data["onebot11"] = current
    save_integrations(INTEGRATIONS_PATH, data)
    manager = _onebot_manager(request)
    await manager.config_changed(current)
    return _onebot_response(request)


@router.post("/napcat/send")
async def send_napcat(payload: NapCatSendPayload, request: Request) -> dict:
    require_local(request)
    manager = _onebot_manager(request)
    if manager is None or not manager.status().get("connected"):
        raise HTTPException(status_code=409, detail="NapCat 尚未连接")
    if not payload.text and not payload.record_path:
        raise HTTPException(status_code=422, detail="至少提供文字或语音文件")
    sent = {"text": False, "record": False}
    result: dict = {}
    try:
        if payload.text:
            result = await manager.send_text(payload.target_type, payload.target_id, payload.text)
            sent["text"] = True
        record_path = payload.record_path
        if payload.voice and payload.text and payload.persona_id and not record_path:
            with request.app.state.session_factory() as session:
                persona = local_persona_or_404(session, payload.persona_id)
                asset = persona_voice_asset(persona, session)
                if asset is None:
                    raise HTTPException(status_code=409, detail="角色未绑定可用的 GPT-SoVITS 音色")
                audio = await asyncio.to_thread(
                    request.app.state.tts_synthesis.synthesize,
                    asset,
                    payload.text,
                    default_language=persona_output_language(persona),
                )
            output = AUDIO_ROOT / "napcat"
            output.mkdir(parents=True, exist_ok=True)
            record_path = str(output / f"{uuid4().hex}.wav")
            Path(record_path).write_bytes(audio)
        if record_path:
            result = await manager.send_record(payload.target_type, payload.target_id, record_path)
            sent["record"] = True
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"ok": True, "sent": sent, "result": result}
