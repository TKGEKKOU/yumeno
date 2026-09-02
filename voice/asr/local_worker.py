from __future__ import annotations

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from typing import TYPE_CHECKING

import httpx

from voice.asr.base import STTConfigurationError, STTEmptyResultError, STTProvider, STTUpstreamError
from voice.asr.install import STTResourceManager

if TYPE_CHECKING:
    from settings import Settings


WORKER_URL = "http://127.0.0.1:17004"
_managers: dict[Path, "LocalSTTManager"] = {}


class LocalSTTManager:
    def __init__(self, project_root: Path, worker_url: str = WORKER_URL) -> None:
        self.project_root = project_root
        self.worker_url = worker_url
        self.runtime_dir = project_root / ".asr-venv"
        self.requirements = project_root / "voice" / "asr" / "requirements-local.txt"
        self.resources = STTResourceManager(project_root)
        self.process: subprocess.Popen | None = None
        self.watchdog: subprocess.Popen | None = None
        self._lock = asyncio.Lock()

    @property
    def python(self) -> Path:
        return self.resources.resolve().python or self.runtime_python

    @property
    def runtime_python(self) -> Path:
        return self.runtime_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

    async def ensure_ready(self) -> None:
        async with self._lock:
            if await self._healthy():
                return
            await asyncio.to_thread(self._ensure_runtime)
            resolved = self.resources.resolve()
            env = os.environ.copy()
            env["HF_HOME"] = str(self.project_root / "data" / "models")
            env["YUMENO_STT_MODEL"] = str(resolved.model)
            if resolved.ffmpeg:
                env["PATH"] = f"{resolved.ffmpeg.parent}{os.pathsep}{env.get('PATH', '')}"
            self.process = subprocess.Popen(
                [str(self.python), "-B", "-m", "voice.asr.worker_server"],
                cwd=self.project_root,
                env=env,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
            self._spawn_watchdog()
            for _ in range(180):
                if await self._healthy():
                    return
                await asyncio.sleep(1)
            raise STTUpstreamError("Local STT worker did not become ready")

    def _spawn_watchdog(self) -> None:
        """父进程退出后自动结束 ASR worker，防止遗留孤儿进程。"""
        try:
            if self.watchdog is not None and self.watchdog.poll() is None:
                self.watchdog.terminate()
            watchdog_script = self.project_root / "voice" / "child_watchdog.py"
            if not watchdog_script.is_file() or self.process is None:
                self.watchdog = None
                return
            self.watchdog = subprocess.Popen(
                [
                    str(self.python),
                    "-B",
                    str(watchdog_script),
                    "--parent",
                    str(os.getpid()),
                    "--child",
                    str(self.process.pid),
                ],
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
        except Exception:  # pragma: no cover - 守护失败不影响主流程
            self.watchdog = None

    async def _healthy(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=1, trust_env=False) as client:
                return (await client.get(f"{self.worker_url}/health")).is_success
        except httpx.HTTPError:
            return False

    def _ensure_runtime(self) -> None:
        status = self.resources.status()
        if not status["enabled"]:
            raise STTConfigurationError("Local STT is disabled")
        if not status["ready"]:
            raise STTConfigurationError("Local STT is not installed")


class LocalQwenSTT(STTProvider):
    def __init__(
        self,
        manager: LocalSTTManager | None = None,
        client: httpx.AsyncClient | None = None,
        worker_url: str = WORKER_URL,
    ) -> None:
        self.manager = manager
        self.client = client
        self.worker_url = worker_url

    async def transcribe(self, filename: str, content_type: str, audio: bytes) -> str:
        if self.manager is not None:
            await self.manager.ensure_ready()
        headers = {"Content-Type": content_type, "X-Audio-Filename": Path(filename).name}
        try:
            if self.client is not None:
                response = await self.client.post("/transcribe", content=audio, headers=headers)
            else:
                async with httpx.AsyncClient(timeout=120, trust_env=False) as client:
                    response = await client.post(f"{self.worker_url}/transcribe", content=audio, headers=headers)
        except httpx.HTTPError as exc:
            raise STTUpstreamError("Local STT worker request failed") from exc
        if not response.is_success:
            raise STTUpstreamError(f"Local STT worker returned HTTP {response.status_code}")
        try:
            text = response.json().get("text", "").strip()
        except (ValueError, AttributeError) as exc:
            raise STTUpstreamError("Local STT worker returned an invalid response") from exc
        if not text:
            raise STTEmptyResultError("No speech was recognized")
        return text


def build_local_stt_provider(settings: Settings) -> LocalQwenSTT:
    root = settings.project_root.resolve()
    manager = _managers.setdefault(root, LocalSTTManager(root))
    return LocalQwenSTT(manager=manager)


def shutdown_stt_workers() -> None:
    for manager in _managers.values():
        watchdog = manager.watchdog
        if watchdog is not None and watchdog.poll() is None:
            watchdog.terminate()
        manager.watchdog = None
        process = manager.process
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        manager.process = None


def build_stt_provider(settings: Settings):
    """按全局 Provider 配置构造实际 STT 运行时。"""
    provider_id = getattr(settings, "stt_provider", "local_stt")
    if provider_id == "mimo_stt":
        from voice.asr.http_provider import MiMoSTT
        return MiMoSTT(settings.stt_api_key, settings.stt_base_url, settings.stt_model, settings.project_root)
    if provider_id in {"whisper_api", "xinference_stt"}:
        from voice.asr.http_provider import OpenAICompatibleSTT
        return OpenAICompatibleSTT(settings.stt_api_key, settings.stt_base_url, settings.stt_model)
    if provider_id != "local_stt":
        raise STTConfigurationError(f"未接入的 STT Provider: {provider_id}")
    return build_local_stt_provider(settings)


# 兼容旧入口。
build_asr_provider = build_stt_provider
shutdown_asr_workers = shutdown_stt_workers


# 兼容旧类名。
LocalASRManager = LocalSTTManager
LocalQwenASR = LocalQwenSTT
