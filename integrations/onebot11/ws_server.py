import asyncio
import logging
from collections import deque
from collections.abc import Callable
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from extensions.events import EVENT_MESSAGE, EventBus, MessageEvent
from integrations.onebot11.parser import parse_message_event


logger = logging.getLogger(__name__)
router = APIRouter()


class OneBotConnectionManager:
    def __init__(self, config_provider: Callable[[], dict]) -> None:
        self._config_provider = config_provider
        self._connections: list[WebSocket] = []
        self._tasks: set[asyncio.Task] = set()
        self._error: str | None = None
        self._last_error_at: str | None = None
        self._connected_at: str | None = None
        self._last_event_at: str | None = None
        self._last_action_error: str | None = None
        self._bot_uin: str | None = None
        self._pending_actions: dict[str, asyncio.Future] = {}
        self._send_locks: dict[str, asyncio.Lock] = {}
        self._recent_messages: deque[dict] = deque(maxlen=50)

    def config(self) -> dict:
        return self._config_provider()

    async def config_changed(self, config: dict) -> None:
        if not config.get("enabled"):
            connections = list(self._connections)
            if connections:
                await asyncio.gather(
                    *(
                        websocket.close(code=1008, reason="integration disabled")
                        for websocket in connections
                    ),
                    return_exceptions=True,
                )

    def status(self) -> dict:
        config = self.config()
        return {
            "connected": bool(config.get("enabled")) and bool(self._connections),
            "client_count": len(self._connections),
            "error": self._error,
            "bot_uin": self._bot_uin,
            "connected_at": self._connected_at,
            "last_event_at": self._last_event_at,
            "last_error_at": self._last_error_at,
            "last_action_error": self._last_action_error,
            "recent_messages": list(self._recent_messages),
        }

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    def send_action(self, action: str, params: dict) -> None:
        payload = {"action": action, "params": params, "echo": ""}
        for websocket in list(self._connections):
            self._spawn(websocket.send_json(payload))

    async def request_action(self, action: str, params: dict, timeout: float = 15) -> dict:
        if not self._connections:
            raise RuntimeError("NapCat 尚未连接")
        echo = f"yumeno-{uuid4().hex}"
        future = asyncio.get_running_loop().create_future()
        self._pending_actions[echo] = future
        try:
            await self._connections[0].send_json({"action": action, "params": params, "echo": echo})
            return await asyncio.wait_for(future, timeout=timeout)
        except asyncio.TimeoutError as exc:
            self._last_action_error = f"OneBot 请求超时: {action}"
            self._last_error_at = self._now()
            raise RuntimeError(self._last_action_error) from exc
        finally:
            self._pending_actions.pop(echo, None)

    async def _handle_action_response(self, payload: dict) -> None:
        echo = str(payload.get("echo") or "")
        future = self._pending_actions.get(echo)
        if future is None or future.done():
            return
        if payload.get("status") == "ok" and int(payload.get("retcode") or 0) == 0:
            future.set_result(payload.get("data") or {})
            return
        message = str(payload.get("message") or payload.get("wording") or "OneBot 请求失败")
        self._last_action_error = message
        self._last_error_at = self._now()
        future.set_exception(RuntimeError(message))

    def _send_lock(self, target_type: str, target_id: str) -> asyncio.Lock:
        return self._send_locks.setdefault(f"{target_type}:{target_id}", asyncio.Lock())

    def record_text_message(
        self, target_type: str, target_id: str, content: str, source: str = "manual"
    ) -> None:
        content = str(content or "").strip()
        if not content:
            return
        self._recent_messages.appendleft({
            "target_type": str(target_type),
            "target_id": str(target_id),
            "content": content,
            "source": str(source or "manual"),
        })

    def clear_recent_messages(self) -> None:
        self._recent_messages.clear()

    async def send_message(self, target_type: str, target_id: str, segments: list[dict]) -> dict:
        if target_type not in {"private", "group"}:
            raise RuntimeError("目标类型必须是 private 或 group")
        normalized_id = str(target_id or "").strip()
        if not normalized_id.isdigit() or int(normalized_id) <= 0:
            raise RuntimeError("目标 ID 无效")
        if not isinstance(segments, list) or not segments:
            raise RuntimeError("消息内容不能为空")
        for segment in segments:
            if not isinstance(segment, dict) or segment.get("type") not in {"text", "record"}:
                raise RuntimeError("仅支持文字和语音消息")
            data = segment.get("data") or {}
            if not str(data.get("text") or data.get("file") or "").strip():
                raise RuntimeError("消息内容不能为空")
        params = {
            ("user_id" if target_type == "private" else "group_id"): int(normalized_id),
            "message": segments,
        }
        async with self._send_lock(target_type, normalized_id):
            return await self.request_action(
                "send_private_msg" if target_type == "private" else "send_group_msg",
                params,
            )

    async def send_text(self, target_type: str, target_id: str, text: str) -> dict:
        if not str(text or "").strip():
            raise RuntimeError("消息内容不能为空")
        result = await self.send_message(target_type, target_id, [{
            "type": "text", "data": {"text": str(text).strip()}
        }])
        self.record_text_message(target_type, target_id, text, "manual")
        return result

    async def send_record(self, target_type: str, target_id: str, file: str) -> dict:
        if not str(file or "").strip():
            raise RuntimeError("语音文件不能为空")
        return await self.send_message(target_type, target_id, [{
            "type": "record", "data": {"file": str(file).strip()}
        }])

    def _spawn(self, coro) -> None:
        task = asyncio.create_task(coro)
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    def _token_ok(self, websocket: WebSocket) -> bool:
        token = str(self.config().get("access_token") or "")
        if not token:
            return True
        header = websocket.headers.get("authorization") or ""
        if header == f"Bearer {token}":
            return True
        return websocket.query_params.get("access_token") == token

    async def handle_connection(self, websocket: WebSocket, event_bus: EventBus) -> None:
        if not self.config().get("enabled"):
            await websocket.close(code=1008, reason="integration disabled")
            return
        if not self._token_ok(websocket):
            await websocket.close(code=1008, reason="invalid access token")
            return
        await websocket.accept()
        self._connections.append(websocket)
        self._error = None
        self._connected_at = self._now()
        try:
            while True:
                payload = await websocket.receive_json()
                self._bot_uin = str(payload.get("self_id") or self._bot_uin or "") or None
                self._last_event_at = self._now()
                await self._publish_event(payload, event_bus)
        except WebSocketDisconnect:
            pass
        except Exception as exc:
            self._error = str(exc)
            self._last_error_at = self._now()
            logger.exception("onebot websocket error")
        finally:
            if websocket in self._connections:
                self._connections.remove(websocket)
            if not self._connections:
                self._connected_at = None

    async def _publish_event(self, payload: dict, event_bus: EventBus) -> None:
        if isinstance(payload, dict) and payload.get("echo"):
            await self._handle_action_response(payload)
            return
        message = parse_message_event(payload)
        if message is None:
            return

        def reply(text: str) -> None:
            self.record_text_message(
                message.message_type,
                message.group_id or message.user_id,
                text,
                "auto",
            )
            if message.message_type == "group":
                self.send_action(
                    "send_group_msg",
                    {"group_id": int(message.group_id), "message": text},
                )
            else:
                self.send_action(
                    "send_private_msg",
                    {"user_id": int(message.user_id), "message": text},
                )

        def reply_record(file: str) -> None:
            self._spawn(self.send_record(message.message_type, message.group_id or message.user_id, file))

        event = MessageEvent(
            platform="onebot11",
            chat_type=message.message_type,
            chat_id=message.group_id or message.user_id,
            user_id=message.user_id,
            content=message.text.strip(),
            raw_content=message.text,
            reply=reply,
            reply_record=reply_record,
            is_at=message.is_at,
        )
        await event_bus.publish(EVENT_MESSAGE, event)


@router.websocket("/api/onebot/ws")
async def onebot_ws(websocket: WebSocket) -> None:
    manager = websocket.app.state.onebot
    await manager.handle_connection(websocket, websocket.app.state.event_bus)
