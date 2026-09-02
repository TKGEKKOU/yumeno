import asyncio
from collections import deque
import inspect
import time
from uuid import uuid4

from .client import BlivedmClient
from .events import normalize_event
from .queue import LiveEventQueue


class BilibiliLiveManager:
    def __init__(self, config_loader, process_event=None, clear_conversation=None,
                 client_factory=BlivedmClient) -> None:
        self.config_loader = config_loader
        self._config_override = None
        self.process_event = process_event
        self.clear_conversation = clear_conversation
        self.client_factory = client_factory
        self.queue = LiveEventQueue()
        self.events = deque(maxlen=100)
        self.clients = set()
        self.state = "disconnected"
        self.active_room_id = None
        self.connected = False
        self.paused = False
        self.error = None
        self.current = None
        self.processed_count = 0
        self._client = None
        self._client_task = None
        self._worker_task = None
        self._consume_gate = asyncio.Event()
        self._consume_gate.set()
        self._shutdown_requested = False
        self._pending_event = None
        self._audio_waiters = {}
        self._recent_events = {}
        self._source_unavailable = False
        self.source_status = {
            "mode": "idle",
            "live_status": None,
            "room_title": "",
            "warning": None,
            "danmaku_available": False,
            "enter_available": False,
        }
        self.conversation_id = f"bilibili-{uuid4()}"
        self._generation = 0

    def status(self) -> dict:
        cfg = self.config()
        public_config = {key: cfg.get(key) for key in ("room_id", "default_persona_id", "danmaku_enabled", "enter_enabled", "auto_voice")}
        pending_count = 1 if self._pending_event is not None else 0
        return {**public_config, "state": self.state, "active_room_id": self.active_room_id,
                "connected": self.connected, "paused": self.paused,
                "session_id": self.conversation_id,
                "queue_size": self.queue.qsize() + pending_count, "current": self.current,
                "processed_count": self.processed_count, "error": self.error,
                "events": list(self.events), **self.source_status,
                "cookie_configured": bool(cfg.get("cookie"))}

    async def connect(self) -> None:
        room_id = int(self.config().get("room_id") or 0)
        if room_id <= 0:
            raise ValueError("请先填写有效的直播间号")
        client_running = self._client_task is not None and not self._client_task.done()
        if client_running and self.active_room_id == room_id:
            return
        if client_running or self.active_room_id is not None:
            self.state = "switching"
            await self.broadcast({"type": "status", "status": self.status()})
            await self._stop_session()
            self.conversation_id = f"bilibili-{uuid4()}"
            self.events.clear()
            self.processed_count = 0
            self._recent_events.clear()

        self.error = None
        self._source_unavailable = False
        self.paused = False
        self._consume_gate.set()
        self._shutdown_requested = False
        self.active_room_id = room_id
        self.state = "connecting"
        self._client = self.client_factory(room_id, self.ingest, self.update_source_status,
                                           self.config().get("cookie") or "")
        self._client_task = asyncio.create_task(self._run_client())
        self._worker_task = asyncio.create_task(self._consume())
        await self.broadcast({"type": "status", "status": self.status()})

    async def _run_client(self) -> None:
        try:
            self.connected = True
            if self.state == "connecting":
                self.state = "running"
            await self.broadcast({"type": "status", "status": self.status()})
            await self._client.run()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            self.error = str(exc)
            self.state = "error"
        finally:
            self.connected = False
            await self.broadcast({"type": "status", "status": self.status()})

    async def reconnect(self) -> dict:
        await self.disconnect()
        await self.connect()
        return self.status()

    async def disconnect(self) -> None:
        if self.state == "disconnected" and self._client_task is None and self._worker_task is None:
            return
        self.state = "disconnecting"
        await self.broadcast({"type": "status", "status": self.status()})
        await self._stop_session()
        self.active_room_id = None
        self.state = "disconnected"
        self.error = None
        self.current = None
        self.source_status.update({
            "mode": "idle", "live_status": None, "room_title": "", "warning": None,
            "danmaku_available": False, "enter_available": False,
        })
        await self.broadcast({"type": "status", "status": self.status()})

    async def _stop_session(self) -> None:
        self._shutdown_requested = True
        self.paused = False
        self._consume_gate.set()

        if self._client:
            await self._client.stop()
        task = self._client_task
        if task and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        self._client = None
        self._client_task = None
        self.connected = False

        self.queue.clear()
        for waiter in self._audio_waiters.values():
            if not waiter.done():
                waiter.cancel()
        self._audio_waiters.clear()

        worker = self._worker_task
        if worker and not worker.done():
            await asyncio.sleep(0)
            if self.current is None:
                worker.cancel()
            try:
                await worker
            except asyncio.CancelledError:
                pass
        self._worker_task = None
        self._pending_event = None
        self.current = None
        self.source_status.update({"mode": "idle", "warning": None})

    async def pause(self) -> None:
        if self.state not in {"running", "connecting"}:
            return
        self.paused = True
        self.state = "paused"
        self._consume_gate.clear()
        await self.broadcast({"type": "status", "status": self.status()})

    async def resume(self) -> None:
        if self.state != "paused":
            return
        self.paused = False
        self.state = "running" if self.connected else "connecting"
        self._consume_gate.set()
        await self.broadcast({"type": "status", "status": self.status()})

    async def ingest(self, payload: dict) -> None:
        room_id = self.active_room_id or int(self.config().get("room_id") or 0)
        event = normalize_event(payload, room_id)
        if event is None:
            return
        cfg = self.config()
        if event.kind == "danmaku" and not cfg.get("danmaku_enabled", True):
            return
        if event.kind == "enter" and not cfg.get("enter_enabled", True):
            return
        fingerprint = f"{event.kind}|{event.username}|{event.content}"
        now = time.monotonic()
        if now - self._recent_events.get(fingerprint, 0) < 3:
            return
        self._recent_events[fingerprint] = now
        self._recent_events = {key: value for key, value in self._recent_events.items() if now - value < 30}
        self.events.appendleft(event.to_dict())
        await self.queue.put(event)
        await self.broadcast({"type": "event", "event": event.to_dict(), "queue_size": self.queue.qsize()})

    async def _consume(self) -> None:
        while True:
            event = await self.queue.get()
            generation = self._generation
            conversation_id = self.conversation_id
            persona_id = self.config().get("default_persona_id")
            self._pending_event = event
            await self._consume_gate.wait()
            if self._shutdown_requested:
                self._pending_event = None
                self.queue.task_done()
                break
            if generation != self._generation:
                self._pending_event = None
                self.queue.task_done()
                continue
            self._pending_event = None
            self.current = event.to_dict()
            await self.broadcast({"type": "processing", "event": self.current, "queue_size": self.queue.qsize()})
            try:
                if self.process_event:
                    result = await self.process_event(event, conversation_id)
                    if generation != self._generation:
                        await self._clear_conversation(persona_id, conversation_id)
                        continue
                    await self.broadcast({"type": "reply", "event": self.current, "result": result})
                    if (not self._shutdown_requested and self.config().get("auto_voice", True)
                            and self.clients and result.get("answer")):
                        waiter = asyncio.get_running_loop().create_future()
                        self._audio_waiters[event.id] = waiter
                        try:
                            await asyncio.wait_for(waiter, timeout=120)
                        except asyncio.TimeoutError:
                            self.error = "语音播放确认超时，已继续处理下一条"
                        finally:
                            self._audio_waiters.pop(event.id, None)
                if generation == self._generation:
                    self.processed_count += 1
            except Exception as exc:
                if generation != self._generation:
                    await self._clear_conversation(persona_id, conversation_id)
                else:
                    self.error = str(exc)
                    await self.broadcast({"type": "error", "message": self.error})
            finally:
                self.current = None
                self.queue.task_done()
                await self.broadcast({"type": "status", "status": self.status()})
            if self._shutdown_requested:
                break

    async def broadcast(self, message: dict) -> None:
        stale = []
        for websocket in self.clients:
            try:
                await websocket.send_json(message)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.clients.discard(websocket)

    def clear_queue(self) -> None:
        self.queue.clear()

    async def clear_session(self) -> None:
        old_conversation_id = self.conversation_id
        persona_id = self.config().get("default_persona_id")
        self._generation += 1
        self.conversation_id = f"bilibili-{uuid4()}"
        self.queue.clear()
        self._pending_event = None
        self.current = None
        self.events.clear()
        self.processed_count = 0
        self._recent_events.clear()
        self.error = self.source_status.get("warning") if self._source_unavailable else None
        for waiter in self._audio_waiters.values():
            if not waiter.done():
                waiter.set_result(None)
        self._audio_waiters.clear()
        await self._clear_conversation(persona_id, old_conversation_id)
        await self.broadcast({"type": "session.cleared", "status": self.status()})
        await self.broadcast({"type": "status", "status": self.status()})

    async def _clear_conversation(self, persona_id, conversation_id) -> None:
        if not self.clear_conversation or not persona_id or not conversation_id:
            return
        result = self.clear_conversation(str(persona_id), str(conversation_id))
        if inspect.isawaitable(result):
            await result

    def audio_done(self, event_id: str) -> None:
        waiter = self._audio_waiters.get(event_id)
        if waiter is not None and not waiter.done():
            waiter.set_result(None)

    async def update_source_status(self, status: dict) -> None:
        self.source_status.update(status)
        if status.get("mode") == "unavailable":
            self._source_unavailable = True
            self.error = status.get("warning") or "B 站数据通道不可用"
            self.state = "error"
        elif self._source_unavailable:
            self._source_unavailable = False
            self.error = None
            self.state = "paused" if self.paused else ("running" if self.connected else "connecting")
        await self.broadcast({"type": "status", "status": self.status()})

    def config(self) -> dict:
        return dict(self._config_override if self._config_override is not None else self.config_loader())

    def config_changed(self, config: dict) -> None:
        self._config_override = dict(config)
