from pathlib import Path
import sys
import time
from types import SimpleNamespace

import pytest

from desktop.launcher_api import LauncherApi


@pytest.fixture(autouse=True)
def _do_not_open_real_browser(monkeypatch):
    monkeypatch.setattr("desktop.launcher_api.open_app", lambda url: None)


class FakeDocker:
    def __init__(self, ready=True):
        self.ready = ready
        self.docker = "docker"
        self.actions = []

    def is_ready(self):
        return self.ready

    def _run(self, command):
        return type("R", (), {"returncode": 0, "stdout": "abc\n"})()

    def ensure_ready(self):
        self.actions.append("ensure_ready")
        if not self.ready:
            raise RuntimeError("Docker unavailable")

    def compose_up(self):
        self.actions.append("compose_up")

    def compose_stop(self):
        self.actions.append("stop")

    def compose_down(self):
        self.actions.append("down")


class FakeServer:
    def __init__(self, running=False):
        self.running = running
        self.settings = type(
            "S",
            (),
            {"app_port": 17000, "milvus_uri": "http://127.0.0.1:17002"},
        )()
        self.url = "http://127.0.0.1:17000"
        self.app = None
        self.started = False
        self.stop_calls = 0
        self.wait_calls = 0

    def is_running(self):
        return self.running

    def start(self):
        self.started = True
        self.app = type("A", (), {})()
        self.app.state = type("St", (), {})()

    def stop(self):
        self.stop_calls += 1
        self.started = False

    def wait(self):
        self.wait_calls += 1


def test_status_reports_components(tmp_path: Path):
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(False))
    status = api.status()
    assert status["docker_ready"] is True
    assert status["containers_up"] is True
    assert status["service_running"] is False
    assert status["port"] == 17000


def test_existing_service_still_runs_dependency_validation(tmp_path: Path, monkeypatch):
    api = LauncherApi(tmp_path, FakeDocker(False), FakeServer(True))
    starts: list[bool] = []
    monkeypatch.setattr(
        api,
        "start",
        lambda: (starts.append(True) or {"ok": True, "starting": True}),
    )

    api.auto_start_if_needed()

    assert starts == [True]
    assert api.progress()["done"] is False


def test_desktop_window_always_opens_onboarding_first(tmp_path: Path, monkeypatch):
    from desktop import launcher

    opened_urls: list[str] = []

    class Event:
        def __iadd__(self, callback):
            return self

    class Window:
        events = SimpleNamespace(closing=Event(), closed=Event())

    class Api:
        keep_services_after_close = False

        def __init__(self, root, docker, server):
            self.server = server

        def onboarding_url(self):
            return str(tmp_path / "onboarding.html")

        def bind_window(self, window):
            pass

        def auto_start_if_needed(self):
            pass

        def on_closing(self):
            return False

        def on_closed(self):
            pass

    fake_webview = SimpleNamespace(
        create_window=lambda title, url, **kwargs: (opened_urls.append(url) or Window()),
        start=lambda **kwargs: None,
    )
    running_server = FakeServer(True)
    monkeypatch.setitem(sys.modules, "webview", fake_webview)
    monkeypatch.setattr(launcher, "DockerManager", lambda root: FakeDocker(True))
    monkeypatch.setattr(launcher, "ServerManager", lambda factory: running_server)
    monkeypatch.setattr(launcher, "LauncherApi", Api)
    monkeypatch.setattr(launcher, "ensure_local_env", lambda root: None)
    monkeypatch.setattr(launcher, "shutdown_asr_workers", lambda: None)

    assert launcher.run(tmp_path) == 0
    assert opened_urls == [str(tmp_path / "onboarding.html")]


def test_running_detail_refresh_does_not_reset_elapsed(tmp_path: Path):
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(False))
    api._set_step("containers", "running", "正在准备环境…")
    first = api._step_started["containers"]
    # 模拟容器状态定时刷新：仅更新 detail，不得重置计时
    api._set_step("containers", "running", "MySQL 启动中 · etcd 启动中 · MinIO 启动中")
    assert api._step_started["containers"] == first
    api._set_step("containers", "ok", "容器已创建")
    assert "containers" not in api._step_started


def test_start_skips_docker_for_embedded_milvus(tmp_path: Path):
    """默认 milvus-lite 启动 Desktop 时不应依赖 Docker/Compose。"""
    server = FakeServer(False)
    server.settings.milvus_uri = "./data/milvus_local.db"
    docker = FakeDocker(False)
    api = LauncherApi(tmp_path, docker, server)
    api._wait_http = lambda timeout=15: True

    result = api.start()
    assert result["ok"] is True
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline and not api.progress()["done"]:
        time.sleep(0.02)

    progress = api.progress()
    assert progress["done"] is True
    assert progress["ok"] is True
    assert server.started is True
    assert docker.actions == []
    assert {step["key"] for step in progress["steps"]}.isdisjoint({"docker", "containers", "milvus", "attu"})


def test_start_boots_server_and_registers_shutdown_callback(tmp_path: Path):
    server = FakeServer(False)
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    api._wait_port = lambda port, timeout=120, on_tick=None: True  # fake ports as ready
    api._wait_http = lambda timeout=15: True  # fake service health as ready
    result = api.start()
    assert result["ok"] is True
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline and not api.progress()["done"]:
        time.sleep(0.02)
    progress = api.progress()
    assert progress["done"] is True
    assert progress["ok"] is True
    assert all(step["state"] == "ok" for step in progress["steps"])
    assert server.started is True
    assert callable(server.app.state.shutdown_callback)


def test_start_skips_reranker_when_model_is_not_downloaded(tmp_path: Path, monkeypatch):
    monkeypatch.setattr("ingestion.local_reranker.resources.LocalRerankerResourceManager.status", lambda self: {"installed": False, "ready": False})
    server = FakeServer(False)
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    api._wait_port = lambda port, timeout=120, on_tick=None: True
    api._wait_http = lambda timeout=15: True

    api.start()
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline and not api.progress()["done"]:
        time.sleep(0.02)

    assert all(item["key"] != "reranker" for item in api.progress()["steps"])


def test_start_warms_downloaded_reranker_without_blocking_on_failure(tmp_path: Path, monkeypatch):
    monkeypatch.setattr("ingestion.local_reranker.resources.LocalRerankerResourceManager.status", lambda self: {"installed": True, "ready": True})
    server = FakeServer(False)
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    api._wait_port = lambda port, timeout=120, on_tick=None: True
    api._wait_http = lambda timeout=15: True
    monkeypatch.setattr("ingestion.local_reranker.client.warm_managed_reranker", lambda settings: False)

    api.start()
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline and not api.progress()["done"]:
        time.sleep(0.02)

    step = next(item for item in api.progress()["steps"] if item["key"] == "reranker")
    assert step["state"] == "ok"
    assert "RRF" in step["detail"]


def test_do_exit_cleans_up_even_when_step_throws(tmp_path, monkeypatch):
    """do_exit 任一步抛错时，后续清理与窗口销毁仍必须执行。"""

    from desktop.launcher_api import LauncherApi

    server = FakeServer(True)
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    calls: list[str] = []
    destroyed: list[bool] = []

    def boom():
        raise RuntimeError("boom")

    class FakeWindow:
        def destroy(self):
            destroyed.append(True)

    monkeypatch.setattr(api, "_apply_exit_policy", boom)
    monkeypatch.setattr(api, "server", type("S", (), {"stop": boom})())
    monkeypatch.setattr(api, "_stop_tts_worker", lambda: calls.append("tts"))
    monkeypatch.setattr(
        "voice.asr.local_worker.shutdown_asr_workers", lambda: calls.append("asr")
    )
    monkeypatch.setattr(
        "ingestion.local_embedding.client.shutdown_embedding_workers",
        lambda: calls.append("embedding"),
    )
    api._window = FakeWindow()

    api.do_exit()

    assert calls == ["tts", "asr", "embedding"]
    assert destroyed == [True]


def test_do_exit_pause_policy_stops_containers(tmp_path: Path):
    docker = FakeDocker(True)
    server = FakeServer(True)
    api = LauncherApi(tmp_path, docker, server)
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "docker_settings.json").write_text('{"on_exit": "pause"}', encoding="utf-8")
    api._window = type("W", (), {"destroy": lambda self: None})()
    api.do_exit()
    assert docker.actions == ["stop"]
    assert api._exiting is True


def test_do_exit_stops_server_before_docker_policy(tmp_path: Path, monkeypatch):
    """FastAPI lifespan must finish before Milvus containers are stopped."""
    docker = FakeDocker(True)
    server = FakeServer(True)
    api = LauncherApi(tmp_path, docker, server)
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "docker_settings.json").write_text('{"on_exit": "pause"}', encoding="utf-8")
    order: list[str] = []

    monkeypatch.setattr(api, "_stop_tts_worker", lambda: order.append("tts"))
    monkeypatch.setattr(api, "_stop_gpt_sovits", lambda: order.append("gpt"))
    monkeypatch.setattr("voice.asr.local_worker.shutdown_asr_workers", lambda: order.append("asr"))
    monkeypatch.setattr("ingestion.local_embedding.client.shutdown_embedding_workers", lambda: order.append("embedding"))

    original_stop = server.stop
    def stop_server():
        order.append("server")
        original_stop()
    server.stop = stop_server
    original_compose_stop = docker.compose_stop
    def stop_docker():
        order.append("docker")
        original_compose_stop()
    docker.compose_stop = stop_docker
    api._window = type("W", (), {"destroy": lambda self: None})()

    api.do_exit()

    assert order.index("server") < order.index("docker")


def test_do_exit_remove_policy_runs_down(tmp_path: Path):
    docker = FakeDocker(True)
    server = FakeServer(True)
    api = LauncherApi(tmp_path, docker, server)
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "docker_settings.json").write_text('{"on_exit": "remove"}', encoding="utf-8")
    api._window = type("W", (), {"destroy": lambda self: None})()
    api.do_exit()
    assert docker.actions == ["down"]


def test_do_exit_keep_policy_only_closes_window_and_preserves_services(
    tmp_path: Path, monkeypatch
):
    docker = FakeDocker(True)
    server = FakeServer(True)
    api = LauncherApi(tmp_path, docker, server)
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "docker_settings.json").write_text(
        '{"on_exit": "keep"}', encoding="utf-8"
    )
    stopped: list[str] = []
    destroyed: list[bool] = []
    api._window = type(
        "W", (), {"destroy": lambda self: destroyed.append(True)}
    )()
    monkeypatch.setattr(api, "_stop_tts_worker", lambda: stopped.append("tts"))
    monkeypatch.setattr(api, "_stop_gpt_sovits", lambda: stopped.append("gpt_sovits"))
    monkeypatch.setattr(
        "voice.asr.local_worker.shutdown_asr_workers",
        lambda: stopped.append("asr"),
    )
    monkeypatch.setattr(
        "ingestion.local_embedding.client.shutdown_embedding_workers",
        lambda: stopped.append("embedding"),
    )

    api.do_exit()
    api.on_closed()

    assert api.keep_services_after_close is True
    assert server.stop_calls == 0
    assert docker.actions == []
    assert stopped == []
    assert destroyed == [True]


def test_desktop_host_waits_for_owned_services_after_keep_exit(
    tmp_path: Path, monkeypatch
):
    from desktop import launcher

    class Event:
        def __iadd__(self, callback):
            return self

    class Window:
        events = SimpleNamespace(closing=Event(), closed=Event())

    class Api:
        keep_services_after_close = True

        def __init__(self, root, docker, server):
            self.server = server

        def onboarding_url(self):
            return str(tmp_path / "onboarding.html")

        def bind_window(self, window):
            pass

        def auto_start_if_needed(self):
            pass

        def on_closing(self):
            return False

        def on_closed(self):
            pass

    fake_webview = SimpleNamespace(
        create_window=lambda title, url, **kwargs: Window(),
        start=lambda **kwargs: None,
    )
    running_server = FakeServer(True)
    monkeypatch.setitem(sys.modules, "webview", fake_webview)
    monkeypatch.setattr(launcher, "DockerManager", lambda root: FakeDocker(True))
    monkeypatch.setattr(launcher, "ServerManager", lambda factory: running_server)
    monkeypatch.setattr(launcher, "LauncherApi", Api)
    monkeypatch.setattr(launcher, "ensure_local_env", lambda root: None)
    monkeypatch.setattr(launcher, "shutdown_asr_workers", lambda: None)

    assert launcher.run(tmp_path) == 0
    assert running_server.wait_calls == 1


def test_keep_exit_does_not_navigate_destroyed_window(tmp_path: Path):
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(True))
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "docker_settings.json").write_text(
        '{"on_exit": "keep"}', encoding="utf-8"
    )

    class Window:
        def destroy(self):
            pass

        def load_url(self, url):
            raise AssertionError("destroyed window must not be reused")

    api._window = Window()
    api.do_exit()
    api.show_launcher()


def test_on_closing_blocks_until_exit_confirmed(tmp_path: Path):
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(True))
    assert api.on_closing() is False
    api._exiting = True
    assert api.on_closing() is True
