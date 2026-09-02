from pathlib import Path
import re
import time

from desktop.launcher_api import LauncherApi
from tests.unit.test_launcher_api import FakeDocker, FakeServer


ROOT = Path(__file__).resolve().parents[2]
HOST_HINT = "\u5173\u95ed\u6b64\u7a97\u53e3\u5c06\u505c\u6b62\u672c\u5730\u670d\u52a1"
TRAY_HINT = "\u7cfb\u7edf\u6258\u76d8"


def _patch_open_app(monkeypatch):
    opened = []
    monkeypatch.setattr("desktop.launcher_api.open_app", lambda url: opened.append(url))
    return opened


def test_show_main_opens_browser_instead_of_webview(tmp_path, monkeypatch):
    loaded = []
    opened = _patch_open_app(monkeypatch)
    server = FakeServer(True)
    server.settings.openai_api_key = "sk-test"
    server.settings.openai_base_url = "https://api.example/v1"
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    api._window = type("W", (), {"load_url": lambda self, url: loaded.append(url)})()

    api.show_main()

    assert loaded == []
    assert opened == ["http://127.0.0.1:17000/static/index.html"]


def test_show_main_routes_new_users_to_providers(tmp_path, monkeypatch):
    opened = _patch_open_app(monkeypatch)
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(True))
    api.show_main()
    assert opened == ["http://127.0.0.1:17000/static/index.html#providers"]


def test_show_main_is_idempotent(tmp_path, monkeypatch):
    opened = _patch_open_app(monkeypatch)
    api = LauncherApi(tmp_path, FakeDocker(True), FakeServer(True))
    api.show_main()
    api.show_main()
    assert len(opened) == 1


def test_successful_start_opens_browser_workbench(tmp_path, monkeypatch):
    opened = _patch_open_app(monkeypatch)
    server = FakeServer(False)
    api = LauncherApi(tmp_path, FakeDocker(True), server)
    api._wait_port = lambda port, timeout=120, on_tick=None: True
    api._wait_http = lambda timeout=15: True
    api.start()
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline and not api.progress()["done"]:
        time.sleep(0.02)
    assert api.progress()["ok"] is True
    assert opened == ["http://127.0.0.1:17000/static/index.html#providers"]


def test_start_script_uses_the_current_web_and_desktop_launch_contract():
    text = (ROOT / "scripts" / "start.ps1").read_text(encoding="utf-8-sig")
    assert "[switch]$Desktop" in text
    assert "[switch]$NoBrowser" in text

    launch = text.split("# ---- 4. 启动", 1)[1]
    desktop_part, web_part = launch.split('Write-Host "[4/4] 启动 Web 工作台"', 1)

    # 默认 Web 路径由 main.py 提供服务，desktop.browser 仅等待健康检查并打开浏览器。
    assert "& $venvPy -B main.py" in web_part
    assert 'ArgumentList @("-B", "-m", "desktop.browser")' in web_part
    assert "if (-not $NoBrowser)" in web_part
    assert "desktop_main.py" not in web_part

    # -Desktop 只进入 desktop_main.py；宿主程序负责窗口和服务生命周期。
    assert "& $venvPy -B desktop_main.py" in desktop_part
    assert "& $venvPy -B main.py" not in desktop_part

    # 脚本不得自动拉起 Docker Desktop 或 compose 基础设施。
    assert "Docker Desktop.exe" not in text
    assert not re.search(r"(?im)^\s*&\s*docker\s+compose\s+up\b", text)
    assert not re.search(r"(?im)Start-Process[^\r\n]*Docker", text)
    assert "requirements-desktop.txt" in text

def test_desktop_entry_point_exists_for_installer():
    source = (ROOT / "desktop_main.py").read_text(encoding="utf-8")
    assert "from desktop.launcher import run" in source


def test_splash_keeps_host_window_instead_of_loading_app():
    html = (ROOT / "resources" / "onboarding.html").read_text(encoding="utf-8")
    assert "location.replace(`${BASE}/static/index.html`)" not in html
    assert HOST_HINT in html


def test_web_guide_tells_users_to_use_start_script():
    html = (ROOT / "static" / "onboarding.html").read_text(encoding="utf-8")
    assert ".\\scripts\\start.ps1" in html or "scripts/start.ps1" in html
    assert TRAY_HINT in html


def test_shell_shows_setup_cue_when_llm_is_missing():
    common = (ROOT / "static" / "js" / "common.js").read_text(encoding="utf-8")
    index = (ROOT / "static" / "index.html").read_text(encoding="utf-8")
    assert 'id="setup-cue"' in index
    assert "function renderSetupCue" in common
    assert "providers" in common

