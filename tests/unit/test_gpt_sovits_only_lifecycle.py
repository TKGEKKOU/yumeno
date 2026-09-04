import asyncio
import threading
import time

from app.main import create_app
from fastapi.testclient import TestClient


def test_app_registers_only_gpt_sovits_tts():
    app = create_app(initialize_database=False)

    assert hasattr(app.state, "tts_synthesis")
    assert hasattr(app.state, "gpt_sovits")
    assert not hasattr(app.state, "tts_worker")
    assert not hasattr(app.state, "tts_resources")
    assert not hasattr(app.state, "tts_factory")
    assert not hasattr(app.state, "voice_similarity")
    assert "/api/voice-studio/sessions/{session_id}/reference/preview" not in {
        getattr(route, "path", None) for route in app.routes
    }


def test_lightweight_app_does_not_start_embedding_warmup(monkeypatch):
    warmup_started = []
    monkeypatch.setattr(
        "app.startup.lifespan.warm_managed_embedding",
        lambda settings: warmup_started.append(settings),
    )

    with TestClient(create_app(initialize_database=False)):
        pass

    assert warmup_started == []


def test_app_awaits_mcp_connect_cancellation_before_manager_close(monkeypatch):
    connect_started = threading.Event()
    events = []

    class FakeMCPManager:
        def __init__(self, *args, **kwargs):
            del args, kwargs

        async def connect_all(self, register=True):
            del register
            connect_started.set()
            try:
                await asyncio.Event().wait()
            finally:
                await asyncio.sleep(0.05)
                events.append("connect_cancelled")

        def close(self):
            events.append("manager_closed")

    monkeypatch.setattr("app.startup.lifespan.MCPManager", FakeMCPManager)

    with TestClient(create_app(initialize_database=False)):
        assert connect_started.wait(timeout=1)

    assert events == ["connect_cancelled", "manager_closed"]


def test_app_waits_for_embedding_warmup_thread_before_worker_shutdown(monkeypatch):
    started = threading.Event()
    release = threading.Event()
    completed = threading.Event()

    def blocked_warmup(_settings):
        started.set()
        release.wait(timeout=2)
        completed.set()

    monkeypatch.setattr("app.startup.lifespan.warm_managed_embedding", blocked_warmup)
    timer = threading.Timer(0.05, release.set)
    timer.start()
    with TestClient(create_app(initialize_database=True)):
        assert started.wait(timeout=1)
    timer.join(timeout=1)

    assert completed.is_set()
