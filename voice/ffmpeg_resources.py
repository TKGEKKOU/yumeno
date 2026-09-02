from __future__ import annotations

import shutil
from pathlib import Path


class FFmpegResourceManager:
    """管理供音视频前处理使用的独立 ffmpeg 可执行文件。"""

    def __init__(self, project_root: Path) -> None:
        self.project_root = Path(project_root).resolve()
        self.root = self.project_root / "runtime" / "ffmpeg"
        self.binary = self.root / ("ffmpeg.exe" if __import__("os").name == "nt" else "ffmpeg")
        self.error = ""
        self.installing = False

    def status(self) -> dict:
        managed = self.binary if self.binary.is_file() else None
        system = shutil.which("ffmpeg")
        return {
            "ready": bool(managed or system),
            "installed": managed is not None,
            "installing": self.installing,
            "managed_path": str(managed or ""),
            "system_path": system or "",
            "path": str(managed or system or ""),
            "error": self.error,
            "note": "用于视频抽音频、格式转换和 GPT-SoVITS 前处理；RVC 不依赖文字转写。",
        }

    def install(self) -> dict:
        if self.installing:
            return self.status()
        self.installing = True
        self.error = ""
        try:
            try:
                from imageio_ffmpeg import get_ffmpeg_exe
            except ImportError as exc:
                raise RuntimeError("当前环境缺少 imageio-ffmpeg，请先安装项目依赖") from exc
            source = Path(get_ffmpeg_exe())
            self.root.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, self.binary)
        except Exception as exc:
            self.error = str(exc)
        finally:
            self.installing = False
        return self.status()

    def remove(self) -> dict:
        self.binary.unlink(missing_ok=True)
        return self.status()

    def directory(self) -> dict:
        self.root.mkdir(parents=True, exist_ok=True)
        return {**self.status(), "directory": str(self.root)}
