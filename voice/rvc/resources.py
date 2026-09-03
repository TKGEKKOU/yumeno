from __future__ import annotations

import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path


class RVCInstallCancelled(RuntimeError):
    pass


class RVCResourceManager:
    """Detect and provision an isolated RVC inference runtime."""

    HUBERT_FILES = ("config.json", "preprocessor_config.json", "pytorch_model.bin")
    DOWNLOADS = (
        ("hubert_base/config.json", "https://hf-mirror.com/lj1995/VoiceConversionWebUI/resolve/main/hubert_base/config.json", 100),
        ("hubert_base/preprocessor_config.json", "https://hf-mirror.com/lj1995/VoiceConversionWebUI/resolve/main/hubert_base/preprocessor_config.json", 100),
        ("hubert_base/pytorch_model.bin", "https://hf-mirror.com/lj1995/VoiceConversionWebUI/resolve/main/hubert_base/pytorch_model.bin", 1_000_000),
        ("rmvpe/rmvpe.pt", "https://hf-mirror.com/lj1995/VoiceConversionWebUI/resolve/main/rmvpe.pt", 1_000_000),
    )

    def __init__(self, project_root: Path, source_root: Path | None = None) -> None:
        self.project_root = Path(project_root).resolve()
        self._custom_source = source_root is not None
        configured = source_root or os.getenv("YUMENO_RVC_SOURCE_DIR", "E:/Retrieval-based-Voice-Conversion-WebUI-main")
        self.source_root = Path(configured).expanduser().resolve()
        configured_models = os.getenv("YUMENO_RVC_MODEL_DIR") if source_root is None else None
        self.external_model_root = Path(configured_models or "D:/Music/RVC/HatsuneMiku").expanduser().resolve() if source_root is None else Path("__disabled__")
        # 推理核心随 YUMENO 交付，外部 RVC 仓库只作为兼容的资源来源与参考。
        self.core_root = self.project_root / "voice" / "rvc" / "vendor"
        self.managed_root = self.project_root / "data" / "providers" / "rvc"
        self.assets_root = self.managed_root / "assets"
        self.runtime_root = self.project_root / "runtime" / "rvc"
        self.venv_dir = self.runtime_root / ".venv"
        self.runner_path = self.runtime_root / "runner.py"
        self.runtime_probe_path = self.runtime_root / "runtime-ready.json"
        self.manifest_path = self.managed_root / "manifest.json"
        self.weights_dir = self.assets_root / "weights"
        self.indices_dir = self.assets_root / "indices"
        self._lock = threading.RLock()
        self._state = {"installing": False, "cancelling": False, "phase": "idle", "progress_percent": 0, "detail": "", "error": "", "started_at": None, "current_file": "", "downloaded_bytes": 0, "total_bytes": 0, "speed_bytes_per_second": 0, "eta_seconds": None}
        self._cancel = threading.Event()
        self._process: subprocess.Popen | None = None

    @property
    def cli_path(self) -> Path:
        return self.source_root / "infer" / "cli.py"

    @property
    def core_cli_path(self) -> Path:
        return self.core_root / "infer" / "cli.py"

    def python_path(self) -> Path:
        return self.venv_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

    def _source_assets(self, name: str) -> Path:
        return self.source_root / "assets" / name

    def managed_assets(self, name: str) -> Path:
        return self.assets_root / name

    def asset_candidates(self, name: str) -> list[Path]:
        return [self.managed_assets(name), self._source_assets(name)]

    def hubert_dir(self) -> Path | None:
        for root in self.asset_candidates("hubert_base"):
            if all((root / name).is_file() for name in self.HUBERT_FILES):
                return root
        return None

    def rmvpe_dir(self) -> Path | None:
        for root in self.asset_candidates("rmvpe"):
            if (root / "rmvpe.pt").is_file():
                return root
        return None

    def hubert_ready(self) -> bool:
        return self.hubert_dir() is not None

    def rmvpe_ready(self) -> bool:
        return self.rmvpe_dir() is not None

    def requirements_file(self) -> Path | None:
        """Return the YUMENO-owned inference dependency manifest.

        The bundled core must not select the external RVC WebUI requirements:
        those install Gradio/server/training dependencies and are tied to the
        source checkout rather than this process boundary.
        """
        override = os.getenv("YUMENO_RVC_REQUIREMENTS")
        if override:
            path = Path(override).expanduser().resolve()
            return path if path.is_file() else None
        # 默认优先使用 YUMENO 自带的 CUDA 推理清单；只有明确指定 cpu
        # 或没有 CUDA 清单时才回退 CPU。外部 RVC 的完整 requirements
        # 包含 Gradio/服务端/训练依赖，不应被 YUMENO 运行时直接使用。
        device = os.getenv("YUMENO_RVC_DEVICE", "cuda").strip().lower()
        cuda = self.core_root / "requirements-inference-cu128.txt"
        cpu = self.core_root / "requirements-inference-cpu.txt"
        if device in {"cuda", "gpu", "auto"} and cuda.is_file():
            return cuda
        if cpu.is_file():
            return cpu
        # 仅为显式注入的旧版 RVC 源码目录保留兼容探测；生产安装不
        # 使用原版完整 requirements，避免把 WebUI/训练依赖带入运行时。
        if self._custom_source:
            legacy_names = []
            if device in {"cuda", "gpu", "auto"}:
                legacy_names.extend(["requirments_cu128_py312.txt", "requirements_cu128_py312.txt"])
            if device == "cpu":
                legacy_names.extend(["requirments_cpu_py312.txt", "requirements_cpu_py312.txt"])
            for name in legacy_names:
                legacy = self.source_root / name
                if legacy.is_file():
                    return legacy
        return None

    def status(self) -> dict:
        source_ok = self.source_root.is_dir()
        external_cli_ok = self.cli_path.is_file()
        cli_ok = self.core_cli_path.is_file()
        source_component_ready = cli_ok or (source_ok and external_cli_ok)
        runtime_ready = (not self._state.get("installing", False)) and self.python_path().is_file() and self.runner_path.is_file() and self.runtime_probe_path.is_file()
        source_weights = list(self._source_assets("weights").rglob("*.pth")) if self._source_assets("weights").is_dir() else []
        managed_weights = list(self.weights_dir.rglob("*.pth")) if self.weights_dir.is_dir() else []
        external_weights = list(self.external_model_root.rglob("*.pth")) if self.external_model_root.is_dir() else []
        models = sorted({str(p.resolve()) for p in source_weights + managed_weights + external_weights})
        hubert = self.hubert_dir()
        rmvpe = self.rmvpe_dir()
        with self._lock:
            state = dict(self._state)
        probe = {}
        if self.runtime_probe_path.is_file():
            try:
                probe = json.loads(self.runtime_probe_path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                probe = {}
        missing = []
        # YUMENO 已内置 infer 核心后，不应要求用户额外保留原版仓库；\n        # 外部源码只用于兼容资源发现，不能成为可用性门槛。\n        if not source_component_ready: missing.append("rvc_source")
        if not cli_ok: missing.append("infer_cli")
        if not runtime_ready: missing.append("runtime")
        selected_device = os.getenv("YUMENO_RVC_DEVICE", "cuda").strip().lower()
        if runtime_ready and selected_device in {"cuda", "gpu"} and not bool(probe.get("cuda_available")):
            missing.append("cuda")
        if hubert is None: missing.append("hubert")
        if rmvpe is None: missing.append("rmvpe")
        if not models: missing.append("voice_model")
        indices = self.index_paths()
        components = {
            "source": {"ready": source_component_ready, "label": "YUMENO 内置 RVC 核心", "path": str(self.core_root)},
            "runtime": {"ready": runtime_ready, "label": "RVC 运行环境", "path": str(self.runtime_root)},
            "hubert": {"ready": hubert is not None, "label": "Hubert", "path": str(hubert) if hubert else ""},
            "rmvpe": {"ready": rmvpe is not None, "label": "RMVPE", "path": str(rmvpe) if rmvpe else ""},
            "voice_models": {"ready": bool(models), "label": ".pth 音色模型", "count": len(models), "path": str(self.weights_dir)},
            "indices": {"ready": bool(indices), "label": ".index（可选）", "count": len(indices), "path": str(self.indices_dir)},
        }
        runtime_device = probe.get("device", "unknown")
        runtime_cuda = bool(probe.get("cuda_available", False))
        return {
            **state,
            "device": runtime_device,
            "cuda_available": runtime_cuda,
            "torch_version": probe.get("torch_version", ""),
            "cuda_version": probe.get("cuda_version", ""),
            "ready": not missing,
            "installed": runtime_ready,
            "source_configured": source_ok,
            "source_root": str(self.source_root),
            "core_root": str(self.core_root),
            "cli_path": str(self.core_cli_path),
            "runtime_dir": str(self.runtime_root),
            "managed_root": str(self.managed_root),
            "external_model_root": str(self.external_model_root),
            "model_count": len(models),
            "models": models,
            "hubert_ready": hubert is not None,
            "hubert_dir": str(hubert) if hubert else "",
            "rmvpe_ready": rmvpe is not None,
            "rmvpe_dir": str(rmvpe) if rmvpe else "",
            "missing": missing,
            "components": components,
            "requirements_file": str(self.requirements_file()) if self.requirements_file() else "",
            "note": "RVC 首期仅支持本地音频变声；训练和实时转换尚未接入。",
        }

    def model_paths(self) -> list[Path]:
        return [Path(p) for p in self.status()["models"]]

    def index_paths(self) -> list[Path]:
        roots = [self.indices_dir, self._source_assets("indices"), self.source_root / "logs", self.external_model_root]
        paths: list[Path] = []
        for root in roots:
            if root.is_dir():
                paths.extend(root.rglob("*.index"))
        return sorted({p.resolve() for p in paths})

    def _set(self, **changes) -> None:
        with self._lock:
            self._state.update(changes)

    def start_install(self) -> dict:
        with self._lock:
            if self._state["installing"]:
                return self.status()
            self._state.update({"installing": True, "cancelling": False, "phase": "preparing", "progress_percent": 0, "detail": "准备 RVC 独立运行时", "error": "", "started_at": time.time(), "current_file": "", "downloaded_bytes": 0, "total_bytes": 0, "speed_bytes_per_second": 0, "eta_seconds": None})
            self._cancel.clear()
            self.runtime_probe_path.unlink(missing_ok=True)
        threading.Thread(target=self._install, daemon=True, name="yumeno-rvc-install").start()
        return self.status()

    def cancel_install(self) -> dict:
        self._cancel.set()
        self._set(cancelling=True, detail="正在取消")
        with self._lock:
            process = self._process
        if process is not None and process.poll() is None:
            process.kill()
        return self.status()

    def remove_managed(self) -> dict:
        """安全卸载 YUMENO 自己创建的 RVC 运行时，不触碰外部源码和用户资源。"""
        with self._lock:
            if self._state.get("installing"):
                raise RuntimeError("请先取消安装")
            process = self._process
        if process is not None and process.poll() is None:
            raise RuntimeError("RVC 运行时仍在使用中，请稍后重试")
        runtime_root = self.runtime_root.resolve()
        expected_parent = (self.project_root / "runtime").resolve()
        if runtime_root.parent != expected_parent or runtime_root.name != "rvc":
            raise RuntimeError("拒绝清理异常的 RVC 运行时路径")
        shutil.rmtree(runtime_root, ignore_errors=True)
        self._cancel.clear()
        self._process = None
        self._set(installing=False, cancelling=False, phase="idle", progress_percent=0,
                  detail="RVC 运行时已卸载", error="", started_at=None, current_file="",
                  downloaded_bytes=0, total_bytes=0, speed_bytes_per_second=0, eta_seconds=None)
        return self.status()

    def _check_cancelled(self) -> None:
        if self._cancel.is_set():
            raise RVCInstallCancelled()

    def _run(self, command: list[str], timeout: int) -> str:
        # pip/venv 安装可能持续数分钟；必须把最后一行输出反馈给前端，避免界面看起来卡死。
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
        with self._lock:
            self._process = process
        output_queue: queue.Queue[str] = queue.Queue()
        output_lines: list[str] = []
        def drain_output() -> None:
            if process.stdout is None:
                return
            for line in process.stdout:
                output_queue.put(line.strip())
        threading.Thread(target=drain_output, daemon=True, name="yumeno-rvc-install-output").start()
        started = time.monotonic()
        last_feedback = started
        try:
            while process.poll() is None:
                self._check_cancelled()
                now = time.monotonic()
                if now - started > timeout:
                    process.kill()
                    raise TimeoutError(f"命令执行超过 {timeout} 秒")
                try:
                    line = output_queue.get(timeout=0.5)
                except queue.Empty:
                    line = ""
                if line:
                    output_lines.append(line)
                    progress = re.search(r"(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*(GB|MB|kB)", line, re.I)
                    if progress and self._state.get("phase") == "dependencies":
                        current = float(progress.group(1)); total = max(float(progress.group(2)), 1.0)
                        self._set(progress_percent=min(47, 25 + int(current / total * 22)), detail=f"安装依赖：{line[-220:]}")
                    else:
                        self._set(detail=line[-240:])
                    last_feedback = now
                elif now - last_feedback > 15:
                    self._set(detail="正在安装依赖，网络或磁盘较慢，请继续等待或取消")
                    last_feedback = now
            process.wait(timeout=10)
            # 读取退出前残余输出，保留失败时的可诊断信息。
            tail = ""
            while True:
                try:
                    tail = output_queue.get_nowait() or tail
                    if tail:
                        output_lines.append(tail)
                except queue.Empty:
                    break
            if process.returncode != 0:
                raise RuntimeError(f"命令执行失败，退出码 {process.returncode}：{tail[-180:]}")
        finally:
            with self._lock:
                self._process = None
        return "\n".join(output_lines)

    def _write_runner(self) -> None:
        self.runtime_root.mkdir(parents=True, exist_ok=True)
        self.runner_path.write_text(
            "from pathlib import Path\n"
            "import os, sys\n"
            "requested = os.environ.get('YUMENO_RVC_DEVICE', 'cuda').strip().lower()\n"
            "if requested in {'cuda', 'gpu'}:\n"
            "    import torch\n"
            "    if not torch.cuda.is_available():\n"
            "        raise RuntimeError('YUMENO_RVC_DEVICE=cuda but CUDA is unavailable; refusing CPU fallback')\n"
            "core = Path(os.environ['YUMENO_RVC_CORE_DIR']).resolve()\n"
            "os.chdir(core)\n"
            "sys.path.insert(0, str(core))\n"
            "from infer import hubert\n"
            "hubert.HUBERT_MODEL_PATH = Path(os.environ['YUMENO_RVC_HUBERT_DIR']).resolve()\n"
            "from infer.cli import main\n"
            "raise SystemExit(main())\n",
            encoding="utf-8",
        )

    @staticmethod
    def _download_urls(url: str) -> list[str]:
        """按原版 RVC 的 Hugging Face 仓库组织下载，并提供可切换镜像回退。"""
        configured = os.getenv("YUMENO_RVC_HF_ENDPOINT", "").strip().rstrip("/")
        urls = [url]
        if configured and "/resolve/" in url:
            suffix = url.split("/resolve/", 1)[1]
            urls.insert(0, f"{configured}/lj1995/VoiceConversionWebUI/resolve/{suffix}")
        if "hf-mirror.com/" in url:
            urls.append(url.replace("https://hf-mirror.com/", "https://huggingface.co/"))
        elif "huggingface.co/" in url:
            urls.append(url.replace("https://huggingface.co/", "https://hf-mirror.com/"))
        return list(dict.fromkeys(urls))

    def _download(self, relative: str, url: str, minimum_size: int, ordinal: int) -> dict:
        target = self.assets_root / relative
        if target.is_file() and target.stat().st_size >= minimum_size:
            return {"path": str(target), "size": target.stat().st_size, "url": url}
        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_suffix(target.suffix + ".part")
        last_error: Exception | None = None
        for candidate_url in self._download_urls(url):
            partial.unlink(missing_ok=True)
            try:
                request = urllib.request.Request(candidate_url, headers={"User-Agent": "YUMENO-RVC/1.0"})
                with urllib.request.urlopen(request, timeout=60) as response, partial.open("wb") as output:
                    total = int(response.headers.get("Content-Length") or 0)
                    received = 0
                    started = time.monotonic()
                    self._set(current_file=relative, downloaded_bytes=0, total_bytes=total, speed_bytes_per_second=0, eta_seconds=None, detail=f"连接资源：{relative}")
                    while True:
                        self._check_cancelled()
                        chunk = response.read(1024 * 1024)
                        if not chunk:
                            break
                        output.write(chunk)
                        received += len(chunk)
                        elapsed = max(time.monotonic() - started, 0.001)
                        speed = received / elapsed
                        eta = max(0, (total - received) / speed) if total and speed else None
                        within = (received / total) if total else 0
                        self._set(
                            progress_percent=min(84, 55 + int(((ordinal + within) / len(self.DOWNLOADS)) * 29)),
                            current_file=relative,
                            downloaded_bytes=received,
                            total_bytes=total,
                            speed_bytes_per_second=speed,
                            eta_seconds=eta,
                            detail=f"下载 {relative}：{received / 1024 / 1024:.1f} MB" + (f" / {total / 1024 / 1024:.1f} MB" if total else ""),
                        )
                if partial.stat().st_size < minimum_size:
                    raise RuntimeError(f"下载资源校验失败：{relative}")
                partial.replace(target)
                return {"path": str(target), "size": target.stat().st_size, "url": candidate_url}
            except RVCInstallCancelled:
                partial.unlink(missing_ok=True)
                raise
            except (OSError, urllib.error.URLError, urllib.error.HTTPError, RuntimeError) as exc:
                last_error = exc
                partial.unlink(missing_ok=True)
                self._set(detail=f"资源下载失败，准备切换下载源：{relative}", error=str(exc))
        raise RuntimeError(f"无法下载 RVC 资源 {relative}：{last_error or '未知错误'}")

    def _install(self) -> None:
        try:
            self.managed_root.mkdir(parents=True, exist_ok=True)
            self.weights_dir.mkdir(parents=True, exist_ok=True)
            self.indices_dir.mkdir(parents=True, exist_ok=True)
            self.runtime_root.mkdir(parents=True, exist_ok=True)
            self._check_cancelled()
            if not self.core_cli_path.is_file():
                raise RuntimeError(f"YUMENO 内置 RVC 推理核心不完整：{self.core_cli_path}")
            if not self.python_path().is_file():
                self._set(phase="runtime", progress_percent=10, detail="创建独立 Python 运行时")
                self._run([sys.executable, "-m", "venv", str(self.venv_dir)], 600)
            self._check_cancelled()
            requirements = self.requirements_file()
            if requirements:
                self._set(phase="dependencies", progress_percent=25, detail=f"安装独立依赖：{requirements.name}")
                pip = [str(self.python_path()), "-m", "pip", "install", "--disable-pip-version-check"]
                name = requirements.name.lower()
                if "cu128" in name or "cu118" in name:
                    cuda = "cu128" if "cu128" in name else "cu118"
                    torch_index = f"https://download.pytorch.org/whl/{cuda}"
                    self._run(pip + ["torch==2.7.1+" + cuda, "torchaudio==2.7.1+" + cuda, "--index-url", torch_index, "--extra-index-url", "https://pypi.org/simple"], 7200)
                self._run(pip + ["-r", str(requirements)], 7200)
            else:
                raise RuntimeError("未找到 RVC requirements 文件")
            self._check_cancelled()
            self._set(phase="verify", progress_percent=48, detail="验证独立推理依赖")
            probe_code = ("import json, torch; "
                "import torchaudio, numpy, scipy, librosa, soundfile, faiss, transformers; "
                "print(json.dumps({'torch_version': torch.__version__, 'cuda_available': bool(torch.cuda.is_available()), "
                "'cuda_version': torch.version.cuda, 'device': 'cuda' if torch.cuda.is_available() else 'cpu'}))")
            probe_output = self._run([str(self.python_path()), "-c", probe_code], 600)
            device = os.getenv("YUMENO_RVC_DEVICE", "cuda").strip().lower()
            try:
                probe = json.loads((probe_output or "").strip().splitlines()[-1])
            except (ValueError, IndexError):
                probe = {"device": "unknown", "cuda_available": False}
            if device in {"cuda", "gpu"} and not probe.get("cuda_available"):
                raise RuntimeError("已选择 GPU 模式，但独立环境未检测到 CUDA；请检查 NVIDIA 驱动和 CUDA Torch")
            self.runtime_probe_path.write_text(json.dumps({"verified_at": time.time(), "requirements": str(requirements), **probe}, ensure_ascii=False), encoding="utf-8")
            self._set(phase="resources", progress_percent=55, detail="准备 Hubert 与 RMVPE")
            manifest = {"source_root": str(self.source_root), "updated_at": time.time(), "files": []}
            for ordinal, item in enumerate(self.DOWNLOADS):
                manifest["files"].append(self._download(*item, ordinal))
            self.manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
            self._write_runner()
            self._set(phase="verify", progress_percent=90, detail="校验 RVC 推理资源")
            if not self.hubert_ready() or not self.rmvpe_ready() or not self.runner_path.is_file():
                raise RuntimeError("RVC 推理资源校验失败")
            detail = "RVC 运行时与基础资源已准备；请添加 .pth 音色模型" if not self.model_paths() else "RVC 已就绪"
            self._set(installing=False, phase="done", progress_percent=100, detail=detail, error="", cancelling=False, eta_seconds=0)
        except RVCInstallCancelled:
            for partial in self.assets_root.rglob("*.part") if self.assets_root.exists() else []:
                partial.unlink(missing_ok=True)
            self._set(installing=False, phase="cancelled", detail="安装已取消", cancelling=False, eta_seconds=None)
        except Exception as exc:
            self._set(installing=False, phase="failed", error=str(exc), detail="RVC 运行时准备失败", cancelling=False)
