import os
import shutil
import subprocess
import time
from pathlib import Path
from typing import Callable


class DesktopStartupError(RuntimeError):
    pass


_ENGINE_MISSING = (
    "未检测到 Docker 引擎。请安装 Docker Desktop，并从系统托盘启动引擎；"
    "本程序不会打开 Docker 仪表板。"
)
_ENGINE_NOT_RUNNING = (
    "Docker 引擎未运行。请从系统托盘启动 Docker（本程序不会打开 Docker 仪表板）。"
    "建议开启「登录时启动 Docker」，并关闭「启动时打开仪表板」。"
)


class DockerManager:
    def __init__(
        self,
        project_root: Path,
        runner: Callable = subprocess.run,
        docker_executable: str | None = None,
    ) -> None:
        self.project_root = project_root.resolve()
        self.runner = runner
        self.docker = shutil.which("docker") if docker_executable is None else docker_executable

    def _run(self, command: list[str], check: bool = False) -> subprocess.CompletedProcess:
        return self.runner(
            command,
            cwd=self.project_root,
            capture_output=True,
            text=True,
            check=check,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )

    def is_ready(self) -> bool:
        if not self.docker:
            return False
        return self._run([self.docker, "info"]).returncode == 0

    @staticmethod
    def desktop_candidates() -> list[Path]:
        return [
            Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Docker" / "Docker" / "Docker Desktop.exe",
            Path(os.environ.get("LOCALAPPDATA", "")) / "Docker" / "Docker Desktop.exe",
        ]

    def ensure_ready(self, timeout: int = 120) -> None:
        if not self.docker:
            raise DesktopStartupError(_ENGINE_MISSING)
        if self.is_ready():
            return
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self.is_ready():
                return
            time.sleep(2)
        raise DesktopStartupError(_ENGINE_NOT_RUNNING)

    def compose_up(self) -> None:
        compose = self.project_root / "docker-compose.yml"
        if not compose.is_file():
            raise DesktopStartupError("缺少 docker-compose.yml。")
        try:
            self._run([self.docker, "compose", "-f", str(compose), "up", "-d"], check=True)
        except subprocess.CalledProcessError as exc:
            detail = (exc.stderr or exc.stdout or "").strip()
            raise DesktopStartupError(f"Docker 服务启动失败：{detail}") from exc

    def compose_stop(self) -> None:
        """暂停容器（不删除），数据卷保留；下次 compose start/up -d 快速恢复。"""
        compose = self.project_root / "docker-compose.yml"
        if not compose.is_file():
            raise DesktopStartupError("缺少 docker-compose.yml。")
        try:
            self._run([self.docker, "compose", "-f", str(compose), "stop"], check=True)
        except subprocess.CalledProcessError as exc:
            detail = (exc.stderr or exc.stdout or "").strip()
            raise DesktopStartupError(f"Docker 服务停止失败：{detail}") from exc

    def compose_down(self) -> None:
        """删除容器（数据卷保留），下次 up -d 需重建容器。"""
        compose = self.project_root / "docker-compose.yml"
        if not compose.is_file():
            raise DesktopStartupError("缺少 docker-compose.yml。")
        try:
            self._run([self.docker, "compose", "-f", str(compose), "down"], check=True)
        except subprocess.CalledProcessError as exc:
            detail = (exc.stderr or exc.stdout or "").strip()
            raise DesktopStartupError(f"Docker 服务清理失败：{detail}") from exc
