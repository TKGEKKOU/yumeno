import asyncio
from http.cookies import SimpleCookie

import aiohttp

from .events import normalize_history_event


class BlivedmClient:
    """Hybrid Bilibili listener: realtime websocket plus history polling fallback."""

    def __init__(self, room_id: int, on_event, on_status=None, cookie: str = "") -> None:
        self.room_id = room_id
        self.on_event = on_event
        self.on_status = on_status
        self.cookie = cookie
        self._client = None
        self._session = None
        self._stopped = asyncio.Event()
        self._history_seen = set()
        self._websocket_attempted = False
        self._realtime_available = False
        self._polling_available = False
        self.mode = "starting"
        self.live_status = None
        self.room_title = ""
        self.warning = None
        self._retry_delays = (1, 2, 5, 10, 20, 30)

    async def _status(self) -> None:
        if self.on_status:
            await self.on_status({"mode": self.mode, "live_status": self.live_status,
                                  "room_title": self.room_title, "warning": self.warning,
                                  "danmaku_available": self._realtime_available or self._polling_available,
                                  "enter_available": self._realtime_available})

    async def _refresh_channel_status(self, poll_error: str = "") -> None:
        if self._realtime_available:
            self.mode = "realtime"
            self.warning = None
        elif self._polling_available:
            self.mode = "polling" if self._websocket_attempted else "starting"
            self.warning = "普通弹幕可用；实时连接正在重试，当前无法获取进场消息。" if self._websocket_attempted else None
        elif self._websocket_attempted:
            self.mode = "unavailable"
            detail = f"：{poll_error}" if poll_error else ""
            self.warning = f"实时连接与弹幕轮询均不可用{detail}"
        await self._status()

    async def run(self) -> None:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0 Safari/537.36",
            "Referer": f"https://live.bilibili.com/{self.room_id}",
            "Origin": "https://live.bilibili.com",
            # blivedm pins Brotli 1.0.9, which is incompatible with aiohttp 3.14 HTTP decoding.
            "Accept-Encoding": "gzip, deflate",
        }
        jar = aiohttp.CookieJar(unsafe=True)
        if self.cookie:
            parsed = SimpleCookie(); parsed.load(self.cookie)
            jar.update_cookies({key: morsel.value for key, morsel in parsed.items()})
        async with aiohttp.ClientSession(headers=headers, cookie_jar=jar) as session:
            self._session = session
            await self._load_room_info()
            await self._poll_history(initial=True)
            websocket_task = asyncio.create_task(self._maintain_websocket())
            try:
                while not self._stopped.is_set():
                    await self._poll_history(initial=False)
                    try:
                        await asyncio.wait_for(self._stopped.wait(), timeout=2.5)
                    except asyncio.TimeoutError:
                        pass
            finally:
                if not websocket_task.done():
                    websocket_task.cancel()
                if self._client is not None:
                    await self._client.stop_and_close()
                self._session = None

    async def _load_room_info(self) -> None:
        url = f"https://api.live.bilibili.com/room/v1/Room/get_info?room_id={self.room_id}"
        async with self._session.get(url) as response:
            payload = await response.json(content_type=None)
        if payload.get("code") != 0:
            raise RuntimeError(payload.get("message") or "无法读取 B 站直播间信息")
        data = payload.get("data") or {}
        self.room_id = int(data.get("room_id") or self.room_id)
        self.live_status = int(data.get("live_status") or 0)
        self.room_title = str(data.get("title") or "")
        self.mode = "starting"
        await self._status()

    async def _maintain_websocket(self) -> None:
        retry_index = 0
        while not self._stopped.is_set():
            try:
                was_connected = await self._run_websocket_once()
            except asyncio.CancelledError:
                raise
            except Exception:
                was_connected = False
                self._realtime_available = False
                await self._refresh_channel_status()
            if self._stopped.is_set():
                break
            if was_connected:
                retry_index = 0
            delay = self._retry_delays[retry_index]
            if not was_connected:
                retry_index = min(retry_index + 1, len(self._retry_delays) - 1)
            try:
                await asyncio.wait_for(self._stopped.wait(), timeout=delay)
            except asyncio.TimeoutError:
                pass

    async def _run_websocket_once(self) -> bool:
        self._websocket_attempted = True
        try:
            import blivedm
        except ImportError:
            await self._refresh_channel_status()
            return False
        owner = self

        class Handler(blivedm.BaseHandler):
            async def handle(self, client, command):
                if str(command.get("cmd") or "").split(":", 1)[0] == "INTERACT_WORD":
                    await owner.on_event(command)
                    return
                await super().handle(client, command)

            async def _on_danmaku(self, client, message):
                await owner.on_event({"cmd": "DANMU_MSG", "info": [[], message.msg, [0, message.uname]]})

        client = blivedm.BLiveClient(self.room_id, session=self._session)
        self._client = client
        client.add_handler(Handler())
        client.start()
        await asyncio.sleep(2)
        if client.is_running:
            self._realtime_available = True
            await self._refresh_channel_status()
        else:
            await self._refresh_channel_status()
            await self._close_websocket_client(client)
            return False
        was_connected = True
        try:
            await client.join()
        finally:
            self._realtime_available = False
            await self._close_websocket_client(client)
            if not self._stopped.is_set():
                await self._refresh_channel_status()
        return was_connected

    async def _close_websocket_client(self, client) -> None:
        try:
            await client.stop_and_close()
        finally:
            if self._client is client:
                self._client = None

    async def _poll_history(self, initial: bool) -> None:
        url = f"https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid={self.room_id}"
        try:
            async with self._session.get(url) as response:
                payload = await response.json(content_type=None)
            if payload.get("code") != 0:
                raise RuntimeError(payload.get("message") or "弹幕历史接口不可用")
            records = list((payload.get("data") or {}).get("room") or [])
            self._polling_available = True
            new_events = []
            for record in records:
                event = normalize_history_event(record, self.room_id)
                if event is None or event.source_id in self._history_seen:
                    continue
                self._history_seen.add(event.source_id)
                if not initial:
                    new_events.append(event)
            if not initial:
                for event in reversed(new_events):
                    await self.on_event({"cmd": "DANMU_MSG", "info": [[], event.content, [0, event.username]],
                                         "data": {"msg_id": event.source_id}})
            await self._refresh_channel_status()
        except Exception as exc:
            self._polling_available = False
            await self._refresh_channel_status(str(exc))

    async def stop(self) -> None:
        self._stopped.set()
        if self._client is not None:
            await self._client.stop_and_close()
