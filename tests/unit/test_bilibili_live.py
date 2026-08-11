import asyncio
import sys
from types import SimpleNamespace

from integrations.bilibili.events import normalize_event, normalize_history_event
from integrations.bilibili.client import BlivedmClient
from integrations.bilibili.queue import LiveEventQueue
from integrations.bilibili.manager import BilibiliLiveManager


class ControlledClient:
    instances = []

    def __init__(self, room_id, ingest, update_source_status, cookie=""):
        self.room_id = room_id
        self.ingest = ingest
        self.update_source_status = update_source_status
        self.cookie = cookie
        self.started = asyncio.Event()
        self.stopped = False
        self._stop = asyncio.Event()
        self.__class__.instances.append(self)

    async def run(self):
        self.started.set()
        await self._stop.wait()

    async def stop(self):
        self.stopped = True
        self._stop.set()


def make_manager(config, process_event=None, clear_conversation=None):
    ControlledClient.instances = []
    return BilibiliLiveManager(
        lambda: config,
        process_event=process_event,
        clear_conversation=clear_conversation,
        client_factory=ControlledClient,
    )


def test_normalize_danmaku_event():
    event = normalize_event({"cmd": "DANMU_MSG", "info": [[0, 0, 0, 0], ["hello"], ["Alice"]]}, 12)
    assert event is not None
    assert event.kind == "danmaku"
    assert event.content == "hello"
    assert event.username == "Alice"
    assert event.room_id == 12


def test_normalize_enter_event():
    event = normalize_event({"cmd": "INTERACT_WORD", "data": {"uname": "Bob", "roomid": 12}}, 12)
    assert event is not None
    assert event.kind == "enter"
    assert event.content == "Bob进入了直播间"


def test_normalize_history_event_from_offline_room():
    event = normalize_history_event(
        {"nickname": "Alice", "text": "offline hello", "timeline": "2026-08-09 12:00:01"},
        22798888,
    )
    assert event is not None
    assert event.kind == "danmaku"
    assert event.username == "Alice"
    assert event.content == "offline hello"
    assert event.room_id == 22798888
    assert event.source_id == "2026-08-09 12:00:01|Alice|offline hello"


def test_queue_is_fifo_and_clearable():
    async def scenario():
        queue = LiveEventQueue()
        await queue.put("first")
        await queue.put("second")
        assert queue.qsize() == 2
        assert await queue.get() == "first"
        queue.clear()
        assert queue.qsize() == 0

    asyncio.run(scenario())


def test_polling_failure_without_realtime_marks_channel_unavailable():
    class Response:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            pass

        async def json(self, content_type=None):
            return {"code": -1, "message": "blocked"}

    class Session:
        def get(self, url):
            return Response()

    async def scenario():
        statuses = []

        async def record_status(status):
            statuses.append(status)

        client = BlivedmClient(100, lambda payload: None, record_status)
        client._session = Session()
        client._websocket_attempted = True
        await client._poll_history(initial=False)
        assert client.mode == "unavailable"
        assert "均不可用" in client.warning

    asyncio.run(scenario())


def test_source_status_reports_entry_events_only_for_realtime():
    async def scenario():
        statuses = []

        async def record_status(status):
            statuses.append(status)

        client = BlivedmClient(100, lambda payload: None, record_status)
        client._websocket_attempted = True
        client._polling_available = True
        await client._refresh_channel_status()

        assert statuses[-1]["mode"] == "polling"
        assert statuses[-1]["danmaku_available"] is True
        assert statuses[-1]["enter_available"] is False
        assert "进场消息" in statuses[-1]["warning"]

        client._realtime_available = True
        await client._refresh_channel_status()
        assert statuses[-1]["mode"] == "realtime"
        assert statuses[-1]["danmaku_available"] is True
        assert statuses[-1]["enter_available"] is True

    asyncio.run(scenario())


def test_websocket_maintainer_retries_after_connection_exits():
    async def scenario():
        client = BlivedmClient(100, lambda payload: None)
        attempts = []

        async def run_once():
            attempts.append(len(attempts) + 1)
            if len(attempts) == 3:
                client._stopped.set()
            return False

        client._run_websocket_once = run_once
        client._retry_delays = (0, 0, 0)
        await client._maintain_websocket()

        assert attempts == [1, 2, 3]

    asyncio.run(scenario())


def test_websocket_backoff_resets_immediately_after_a_successful_connection(monkeypatch):
    async def scenario():
        client = BlivedmClient(100, lambda payload: None)
        outcomes = iter([False, False, True, False])
        delays = []

        async def run_once():
            return next(outcomes)

        async def record_wait(awaitable, timeout):
            delays.append(timeout)
            if len(delays) == 4:
                client._stopped.set()
                return await awaitable
            awaitable.close()
            raise asyncio.TimeoutError

        client._run_websocket_once = run_once
        monkeypatch.setattr("integrations.bilibili.client.asyncio.wait_for", record_wait)
        await client._maintain_websocket()

        assert delays == [1, 2, 1, 1]

    asyncio.run(scenario())


def test_failed_websocket_attempt_closes_client(monkeypatch):
    instances = []

    class BaseHandler:
        pass

    class FailedClient:
        def __init__(self, room_id, session=None):
            self.is_running = False
            self.closed = False
            instances.append(self)

        def add_handler(self, handler):
            pass

        def start(self):
            pass

        async def stop_and_close(self):
            self.closed = True

    async def no_sleep(delay):
        pass

    monkeypatch.setitem(sys.modules, "blivedm", SimpleNamespace(BaseHandler=BaseHandler, BLiveClient=FailedClient))
    monkeypatch.setattr("integrations.bilibili.client.asyncio.sleep", no_sleep)

    async def scenario():
        client = BlivedmClient(100, lambda payload: None)
        client._session = object()
        connected = await client._run_websocket_once()

        assert connected is False
        assert instances[0].closed is True
        assert client._client is None

    asyncio.run(scenario())


def test_manager_channel_error_clears_when_a_source_recovers():
    async def scenario():
        manager = BilibiliLiveManager(lambda: {})
        await manager.update_source_status({"mode": "unavailable", "warning": "数据通道均不可用"})
        assert manager.status()["error"] == "数据通道均不可用"

        await manager.update_source_status({"mode": "polling", "warning": "已切换到轮询"})
        assert manager.status()["error"] is None

    asyncio.run(scenario())


def test_audio_done_releases_current_waiter():
    async def scenario():
        manager = BilibiliLiveManager(lambda: {})
        waiter = asyncio.get_running_loop().create_future()
        manager._audio_waiters["event-1"] = waiter
        manager.audio_done("event-1")
        assert waiter.done()

    asyncio.run(scenario())


def test_connect_switches_room_and_stops_previous_client():
    async def scenario():
        config = {"room_id": "100", "auto_voice": False}
        manager = make_manager(config)

        await manager.connect()
        first = ControlledClient.instances[0]
        await first.started.wait()
        assert manager.status()["active_room_id"] == 100
        manager.events.appendleft({"id": "old-room-event"})
        manager.processed_count = 4

        config["room_id"] = "200"
        await manager.connect()
        second = ControlledClient.instances[1]
        await second.started.wait()

        assert first.stopped is True
        assert second.room_id == 200
        assert manager.status()["active_room_id"] == 200
        assert manager.status()["events"] == []
        assert manager.status()["processed_count"] == 0
        await manager.disconnect()

    asyncio.run(scenario())


def test_ingest_uses_active_room_until_switch_completes():
    async def scenario():
        config = {"room_id": "100", "auto_voice": False}
        manager = make_manager(config)
        await manager.connect()
        await ControlledClient.instances[0].started.wait()

        config["room_id"] = "200"
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "still old", [1, "Alice"]]})

        assert manager.status()["events"][0]["room_id"] == 100
        await manager.disconnect()

    asyncio.run(scenario())


def test_pause_keeps_events_queued_and_resume_preserves_fifo():
    async def scenario():
        config = {"room_id": "100", "auto_voice": False}
        processed = []

        async def process_event(event, conversation_id):
            processed.append(event.content)
            return {"answer": event.content}

        manager = make_manager(config, process_event)
        await manager.connect()
        await manager.pause()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "first", [1, "Alice"]]})
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "second", [2, "Bob"]]})
        await asyncio.sleep(0)

        assert manager.status()["state"] == "paused"
        assert manager.status()["queue_size"] == 2
        assert processed == []

        await manager.resume()
        async def wait_until_processed():
            while len(processed) < 2:
                await asyncio.sleep(0)

        await asyncio.wait_for(wait_until_processed(), timeout=1)
        assert processed == ["first", "second"]
        await manager.disconnect()

    asyncio.run(scenario())


def test_disconnect_clears_pending_work_and_audio_waiters():
    async def scenario():
        config = {"room_id": "100", "auto_voice": False}
        manager = make_manager(config)
        await manager.connect()
        await manager.pause()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "pending", [1, "Alice"]]})
        waiter = asyncio.get_running_loop().create_future()
        manager._audio_waiters["event-1"] = waiter
        client = ControlledClient.instances[0]

        await manager.disconnect()

        status = manager.status()
        assert client.stopped is True
        assert status["state"] == "disconnected"
        assert status["active_room_id"] is None
        assert status["queue_size"] == 0
        assert status["current"] is None
        assert manager._worker_task is None
        assert manager._audio_waiters == {}
        assert waiter.cancelled() or waiter.done()

    asyncio.run(scenario())


def test_disconnect_waits_for_current_reply_but_skips_new_audio_wait():
    async def scenario():
        config = {"room_id": "100", "auto_voice": True}
        processing_started = asyncio.Event()
        allow_reply = asyncio.Event()
        reply_broadcast = asyncio.Event()

        async def process_event(event, conversation_id):
            processing_started.set()
            await allow_reply.wait()
            while manager._client_task is not None:
                await asyncio.sleep(0)
            return {"answer": "finished safely"}

        class ClientSocket:
            async def send_json(self, message):
                if message.get("type") == "reply":
                    reply_broadcast.set()

        manager = make_manager(config, process_event)
        manager.clients.add(ClientSocket())
        await manager.connect()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "current", [1, "Alice"]]})
        await processing_started.wait()

        disconnect_task = asyncio.create_task(manager.disconnect())
        await asyncio.sleep(0)
        assert disconnect_task.done() is False
        allow_reply.set()
        await reply_broadcast.wait()
        assert manager._audio_waiters == {}
        await asyncio.wait_for(disconnect_task, timeout=1)

        assert manager.status()["state"] == "disconnected"
        assert manager._audio_waiters == {}

    asyncio.run(scenario())


def test_clear_session_rotates_generation_and_discards_inflight_reply():
    async def scenario():
        config = {
            "room_id": "100",
            "default_persona_id": "persona-1",
            "auto_voice": True,
        }
        processing_started = asyncio.Event()
        allow_reply = asyncio.Event()
        cleanup_calls = []
        broadcasts = []

        async def process_event(event, conversation_id):
            processing_started.set()
            await allow_reply.wait()
            return {"answer": "must be discarded"}

        async def clear_conversation(persona_id, conversation_id):
            cleanup_calls.append((persona_id, conversation_id))

        class ClientSocket:
            async def send_json(self, message):
                broadcasts.append(message)

        manager = make_manager(config, process_event, clear_conversation)
        manager.clients.add(ClientSocket())
        await manager.connect()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "current", [1, "Alice"]]})
        await processing_started.wait()
        old_conversation_id = manager.conversation_id
        manager.events.appendleft({"id": "old-event"})
        manager.processed_count = 7
        manager.error = "old session failure"

        await manager.clear_session()

        status = manager.status()
        assert manager.conversation_id != old_conversation_id
        assert status["state"] == "running"
        assert status["active_room_id"] == 100
        assert status["queue_size"] == 0
        assert status["current"] is None
        assert status["events"] == []
        assert status["processed_count"] == 0
        assert status["error"] is None
        assert cleanup_calls == [("persona-1", old_conversation_id)]

        allow_reply.set()

        async def wait_for_final_cleanup():
            while len(cleanup_calls) < 2:
                await asyncio.sleep(0)

        await asyncio.wait_for(wait_for_final_cleanup(), timeout=1)
        assert cleanup_calls == [
            ("persona-1", old_conversation_id),
            ("persona-1", old_conversation_id),
        ]
        assert not any(message.get("type") == "reply" for message in broadcasts)
        assert manager.status()["processed_count"] == 0
        await manager.disconnect()

    asyncio.run(scenario())


def test_clear_session_preserves_paused_state_and_removes_pending_item():
    async def scenario():
        config = {"room_id": "100", "default_persona_id": "persona-1", "auto_voice": False}
        manager = make_manager(config, clear_conversation=lambda persona_id, conversation_id: None)
        await manager.connect()
        await manager.pause()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "pending", [1, "Alice"]]})
        await asyncio.sleep(0)

        await manager.clear_session()

        assert manager.status()["state"] == "paused"
        assert manager.status()["queue_size"] == 0
        assert manager.status()["current"] is None
        await manager.disconnect()

    asyncio.run(scenario())


def test_clear_session_discards_inflight_error_without_polluting_new_session():
    async def scenario():
        config = {"room_id": "100", "default_persona_id": "persona-1", "auto_voice": False}
        processing_started = asyncio.Event()
        fail_reply = asyncio.Event()
        broadcasts = []
        cleanup_calls = []

        async def process_event(event, conversation_id):
            processing_started.set()
            await fail_reply.wait()
            raise RuntimeError("old session failure")

        async def clear_conversation(persona_id, conversation_id):
            cleanup_calls.append((persona_id, conversation_id))

        class ClientSocket:
            async def send_json(self, message):
                broadcasts.append(message)

        manager = make_manager(config, process_event, clear_conversation)
        manager.clients.add(ClientSocket())
        await manager.connect()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "current", [1, "Alice"]]})
        await processing_started.wait()
        await manager.clear_session()
        fail_reply.set()

        async def wait_for_final_cleanup():
            while len(cleanup_calls) < 2:
                await asyncio.sleep(0)

        await asyncio.wait_for(wait_for_final_cleanup(), timeout=1)
        assert manager.status()["error"] is None
        assert not any(message.get("type") == "error" for message in broadcasts)
        await manager.disconnect()

    asyncio.run(scenario())


def test_clear_session_during_audio_wait_keeps_consumer_alive():
    async def scenario():
        config = {"room_id": "100", "default_persona_id": "persona-1", "auto_voice": True}
        processed = []
        first_reply = asyncio.Event()

        async def process_event(event, conversation_id):
            processed.append(event.content)
            return {"answer": event.content}

        class ClientSocket:
            async def send_json(self, message):
                if message.get("type") == "reply" and message["event"]["content"] == "first":
                    first_reply.set()

        manager = make_manager(config, process_event)
        manager.clients.add(ClientSocket())
        await manager.connect()
        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "first", [1, "Alice"]]})
        await first_reply.wait()

        async def wait_for_audio_waiter():
            while not manager._audio_waiters:
                await asyncio.sleep(0)

        await asyncio.wait_for(wait_for_audio_waiter(), timeout=1)
        await manager.clear_session()
        assert manager._worker_task.done() is False

        await manager.ingest({"cmd": "DANMU_MSG", "info": [[0], "second", [2, "Bob"]]})

        async def wait_for_second_event():
            while processed != ["first", "second"]:
                await asyncio.sleep(0)

        await asyncio.wait_for(wait_for_second_event(), timeout=1)
        await manager.disconnect()

    asyncio.run(scenario())
