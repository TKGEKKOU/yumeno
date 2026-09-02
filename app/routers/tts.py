import asyncio
import audioop
import base64
import hashlib
import io
import json
import wave
from datetime import date, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Path as FastAPIPath,
    Request,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import ConversationMessage, Persona, VoiceAsset
from app.routers.messages import message_response
from app.routers.personas import local_persona_or_404
from app.routers.settings import require_local
from persona.service import LOCAL_WORKSPACE_ID
from settings import Settings
from voice.gpt_sovits.synthesis import merge_wavs


router = APIRouter(prefix="/api/tts", tags=["tts"])
AUDIO_ROOT = Settings.load().project_root / "data" / "audio"
VOICE_ROOT = Settings.load().project_root / "data" / "gpt_sovits" / "references"
REFERENCE_RATE = 24000
MAX_REFERENCE_SECONDS = 30


def normalize_reference_wavs(payloads: list[bytes]) -> bytes:
    """Normalize extracted reference clips for later GPT-SoVITS training."""

    frames = bytearray()
    frame_limit = REFERENCE_RATE * MAX_REFERENCE_SECONDS * 2
    for payload in payloads:
        try:
            with wave.open(io.BytesIO(payload), "rb") as source:
                channels = source.getnchannels()
                width = source.getsampwidth()
                rate = source.getframerate()
                if channels not in (1, 2) or width not in (1, 2, 3, 4):
                    raise ValueError("不支持的 WAV 格式")
                audio = source.readframes(source.getnframes())
        except (wave.Error, EOFError) as exc:
            raise ValueError("无效的 WAV 文件") from exc
        if width == 1:
            audio = audioop.bias(audio, 1, -128)
        if channels == 2:
            audio = audioop.tomono(audio, width, 0.5, 0.5)
        if width != 2:
            audio = audioop.lin2lin(audio, width, 2)
        if rate != REFERENCE_RATE:
            audio, _ = audioop.ratecv(audio, 2, 1, rate, REFERENCE_RATE, None)
        frames.extend(audio[: max(0, frame_limit - len(frames))])
        if len(frames) >= frame_limit:
            break
    output = io.BytesIO()
    with wave.open(output, "wb") as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(REFERENCE_RATE)
        target.writeframes(frames)
    return output.getvalue()


class TTSSynthesisRequest(BaseModel):
    text: str


def _json_default(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def protected(request: Request, header: str) -> None:
    require_local(request)
    if header != "web":
        raise HTTPException(status_code=403, detail="Missing same-origin request header")


def persona_voice_asset(persona: Persona, session: Session) -> VoiceAsset | None:
    asset_id = ((persona.profile_json or {}).get("tts") or {}).get("voice_asset_id")
    if not asset_id:
        return None
    asset = session.get(VoiceAsset, asset_id)
    if (
        asset is not None
        and asset.status == "ready"
        and asset.reference_language
        and asset.gpt_weights_path
        and asset.sovits_weights_path
    ):
        return asset
    return None


def persona_output_language(persona: Persona) -> str | None:
    config = (persona.profile_json or {}).get("tts") or {}
    value = str(config.get("output_language") or config.get("voice_lang") or "").strip()
    return None if value in {"", "auto"} else value


def _audio_directory(conversation_id: str) -> Path:
    directory = AUDIO_ROOT / hashlib.sha256(conversation_id.encode("utf-8")).hexdigest()[:32]
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _persist_audio(
    session_factory,
    directory: Path,
    persona_id: str,
    conversation_id: str,
    text: str,
    audio: bytes,
) -> dict:
    output = directory / f"{uuid4()}.wav"
    output.write_bytes(audio)
    db = session_factory()
    try:
        message = ConversationMessage(
            workspace_id=LOCAL_WORKSPACE_ID,
            persona_id=persona_id,
            conversation_id=conversation_id,
            role="assistant",
            kind="audio",
            content=text,
            audio_path=str(output.relative_to(AUDIO_ROOT)),
            audio_content_type="audio/wav",
            status="completed",
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message_response(message)
    finally:
        db.close()


@router.get("/status")
def get_status(request: Request):
    require_local(request)
    current = request.app.state.gpt_sovits.status()
    return {
        **current,
        "engine": "gpt_sovits",
        "ready": bool(current.get("installed")),
        "install": request.app.state.gpt_sovits_install.status(),
    }


@router.post(
    "/personas/{persona_id}/conversations/{conversation_id}/synthesize",
    status_code=status.HTTP_201_CREATED,
)
def synthesize(
    persona_id: str,
    conversation_id: str,
    payload: TTSSynthesisRequest,
    request: Request,
    x_yumeno_request: str = Header(default=""),
    session: Session = Depends(get_session),
):
    protected(request, x_yumeno_request)
    persona = local_persona_or_404(session, persona_id)
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="TTS 文本不能为空")
    asset = persona_voice_asset(persona, session)
    active_provider = Settings.load().tts_provider
    if asset is None and active_provider in {"", "gsv_tts_local"}:
        raise HTTPException(status_code=409, detail="角色未绑定可用的 GPT-SoVITS 音色")
    try:
        audio = request.app.state.tts_synthesis.synthesize(
            asset,
            text,
            default_language=persona_output_language(persona),
        )
        result = _persist_audio(
            request.app.state.session_factory,
            _audio_directory(conversation_id),
            persona_id,
            conversation_id,
            text,
            audio,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return result


@router.post("/personas/{persona_id}/conversations/{conversation_id}/synthesize/stream")
def synthesize_stream(
    persona_id: str,
    conversation_id: str,
    payload: TTSSynthesisRequest,
    request: Request,
    x_yumeno_request: str = Header(default=""),
    session: Session = Depends(get_session),
):
    protected(request, x_yumeno_request)
    persona = local_persona_or_404(session, persona_id)
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="TTS 文本不能为空")
    asset = persona_voice_asset(persona, session)
    active_provider = Settings.load().tts_provider
    if asset is None and active_provider in {"", "gsv_tts_local"}:
        raise HTTPException(status_code=409, detail="角色未绑定可用的 GPT-SoVITS 音色")
    directory = _audio_directory(conversation_id)

    def event_source():
        try:
            segments = request.app.state.tts_synthesis.synthesize_segments(
                asset,
                text,
                default_language=persona_output_language(persona),
            )
            for index, segment in enumerate(segments):
                yield json.dumps(
                    {
                        "type": "segment",
                        "index": index,
                        "text": segment.text,
                        "language": segment.language,
                        "audio": base64.b64encode(segment.audio).decode("ascii"),
                    },
                    ensure_ascii=False,
                ) + "\n"
            message = _persist_audio(
                request.app.state.session_factory,
                directory,
                persona_id,
                conversation_id,
                text,
                merge_wavs([segment.audio for segment in segments]),
            )
            yield json.dumps(
                {"type": "done", "message": message},
                ensure_ascii=False,
                default=_json_default,
            ) + "\n"
        except Exception as exc:
            yield json.dumps({"type": "error", "message": str(exc)}, ensure_ascii=False) + "\n"

    return StreamingResponse(event_source(), media_type="application/x-ndjson")


@router.websocket("/personas/{persona_id}/conversations/{conversation_id}/synthesize/ws")
async def synthesize_ws(
    websocket: WebSocket,
    persona_id: str,
    conversation_id: str = FastAPIPath(min_length=1, max_length=255),
) -> None:
    await websocket.accept()
    try:
        with websocket.app.state.session_factory() as db:
            persona = local_persona_or_404(db, persona_id)
            asset = persona_voice_asset(persona, db)
    except HTTPException as exc:
        await websocket.send_json({"type": "error", "message": str(exc.detail)})
        await websocket.close()
        return
    if asset is None:
        await websocket.send_json(
            {"type": "error", "message": "角色未绑定可用的 GPT-SoVITS 音色"}
        )
        await websocket.close()
        return
    parts: list[bytes] = []
    texts: list[str] = []
    try:
        while True:
            try:
                message = await websocket.receive_json()
            except WebSocketDisconnect:
                return
            message_type = message.get("type") if isinstance(message, dict) else None
            if message_type == "done":
                break
            if message_type != "text":
                await websocket.send_json(
                    {"type": "error", "message": f"unexpected message type: {message_type}"}
                )
                continue
            line = str(message.get("text") or "").strip()
            if not line:
                continue
            try:
                audio = await asyncio.to_thread(
                    websocket.app.state.tts_synthesis.synthesize,
                    asset,
                    line,
                    persona_output_language(persona),
                )
            except Exception as exc:
                await websocket.send_json({"type": "error", "message": str(exc)})
                return
            texts.append(line)
            parts.append(audio)
            await websocket.send_json(
                {
                    "type": "segment",
                    "index": len(parts) - 1,
                    "text": line,
                    "audio": base64.b64encode(audio).decode("ascii"),
                }
            )
        if not parts:
            await websocket.send_json({"type": "error", "message": "TTS 文本不能为空"})
            return
        message = _persist_audio(
            websocket.app.state.session_factory,
            _audio_directory(conversation_id),
            persona_id,
            conversation_id,
            "".join(texts),
            merge_wavs(parts),
        )
        await websocket.send_text(
            json.dumps(
                {"type": "done", "message": message},
                ensure_ascii=False,
                default=_json_default,
            )
        )
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass
