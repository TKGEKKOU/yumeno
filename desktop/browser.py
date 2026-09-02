import os
import subprocess
import time
import webbrowser
from collections.abc import Callable
from pathlib import Path


def app_url(host: str = "127.0.0.1", port: int = 17000, fragment: str = "") -> str:
    url = f"http://{host}:{port}/static/index.html"
    if fragment:
        return f"{url}#{fragment.lstrip('#')}"
    return url


def health_url(host: str = "127.0.0.1", port: int = 17000) -> str:
    return f"http://{host}:{port}/api/health"


def setup_fragment(api_key: str = "", base_url: str = "") -> str:
    if str(api_key or "").strip() and str(base_url or "").strip():
        return ""
    return "providers"


def edge_candidates(environ: dict[str, str] | None = None) -> list[Path]:
    env = environ if environ is not None else os.environ
    return [
        Path(env.get("ProgramFiles", r"C:\Program Files")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(env.get("ProgramFiles(x86)", r"C:\Program Files (x86)")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(env.get("LOCALAPPDATA", "")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
    ]


def open_app(
    url: str,
    *,
    runner: Callable = subprocess.Popen,
    webbrowser_open: Callable[[str], object] = webbrowser.open,
    exists: Callable[[Path], bool] = Path.is_file,
    environ: dict[str, str] | None = None,
) -> None:
    for candidate in edge_candidates(environ):
        if exists(candidate):
            runner([str(candidate), url])
            return
    webbrowser_open(url)


def wait_and_open(
    *,
    host: str = "127.0.0.1",
    port: int = 17000,
    timeout: float = 60,
    pause: float = 0.4,
    fragment: str = "",
    health_get: Callable | None = None,
    opener: Callable[[str], object] | None = None,
) -> bool:
    target = app_url(host=host, port=port, fragment=fragment)
    health = health_url(host=host, port=port)
    getter = health_get
    if getter is None:
        import httpx

        def getter(url: str, timeout: float = 1):
            return httpx.get(url, timeout=timeout, trust_env=False)

    deadline = time.monotonic() + timeout
    while True:
        try:
            response = getter(health, timeout=1)
            if getattr(response, "is_success", False) or getattr(response, "status_code", 0) == 200:
                (opener or open_app)(target)
                return True
        except Exception:
            pass
        if time.monotonic() >= deadline:
            return False
        if pause:
            time.sleep(pause)


if __name__ == "__main__":
    from settings import Settings

    settings = Settings.load()
    ok = wait_and_open(
        port=settings.app_port,
        fragment=setup_fragment(settings.openai_api_key, settings.openai_base_url),
    )
    raise SystemExit(0 if ok else 1)
