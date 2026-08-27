"""Installation and status management for the local reranker."""

import json
import os
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

from ingestion.local_embedding.resources import validate_model_id
from settings import DEFAULT_LOCAL_RERANKER_MODEL, Settings
from voice.resource_directory import open_resource_directory


class RerankerInstallCancelled(RuntimeError):
    pass


class LocalRerankerResourceManager:
    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root.resolve()
        self.models_root = self.project_root / "models"
        self.local_settings_path = self.project_root / "data" / "local_settings.json"
        # Embedding and reranking use the same PyTorch/Transformers stack. Sharing
        # the managed runtime avoids downloading several GB of duplicate wheels.
        self.runtime_dir = self.project_root / "runtime" / "embedding"
        self.requirements = self.project_root / "ingestion" / "local_reranker" / "requirements-local.txt"
        self.worker_script = self.project_root / "ingestion" / "local_reranker" / "worker.py"
        self._installing = False
        self._cancel_requested = threading.Event()
        self._process = None
        self._error = ""
        self._phase = "idle"
        self._current_file = ""
        self._started_at = None
        self._lock = threading.Lock()

    @property
    def runtime_python(self) -> Path:
        return self.runtime_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

    def model_directory(self, model_id: str) -> Path:
        safe_id = validate_model_id(model_id)
        directory = (self.models_root / safe_id.replace("/", "--")).resolve()
        if directory.parent != self.models_root.resolve():
            raise ValueError("Reranker model directory escapes project models root")
        return directory

    def _active(self):
        settings = Settings.load(self.project_root)
        model_id = settings.reranker_model or DEFAULT_LOCAL_RERANKER_MODEL
        return settings, self.model_directory(model_id)

    def status(self) -> dict:
        settings, directory = self._active()
        elapsed = time.monotonic() - self._started_at if self._started_at else 0
        installed = (directory / "config.json").is_file()
        return {
            "model_id": settings.reranker_model or DEFAULT_LOCAL_RERANKER_MODEL,
            "source": settings.reranker_model_source,
            "device": settings.reranker_device,
            "installed": installed,
            "ready": installed and self.runtime_python.is_file(),
            "installing": self._installing,
            "cancelling": self._installing and self._cancel_requested.is_set(),
            "phase": self._phase,
            "current_file": self._current_file,
            "elapsed_seconds": round(elapsed),
            "error": self._error,
            "model_dir": str(directory if directory.is_dir() else ""),
            "models_root": str(self.models_root),
        }

    def configure(self, model_id: str, source: str, device: str) -> dict:
        validate_model_id(model_id)
        if source not in {"modelscope", "huggingface"} or device not in {"auto", "cuda", "cpu"}:
            raise ValueError("Invalid local reranker configuration")
        try:
            values = json.loads(self.local_settings_path.read_text(encoding="utf-8")) if self.local_settings_path.is_file() else {}
        except (OSError, json.JSONDecodeError):
            values = {}
        values.update({"reranker_model": model_id, "reranker_model_source": source, "reranker_device": device})
        self.local_settings_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.local_settings_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        os.replace(temporary, self.local_settings_path)
        return self.status()

    def start_install(self, model_id: str, source: str, device: str) -> bool:
        self.configure(model_id, source, device)
        with self._lock:
            if self._installing:
                return False
            self._installing = True
            self._cancel_requested.clear()
            self._error = ""
            self._phase = "preparing"
            self._current_file = model_id
            self._started_at = time.monotonic()
        threading.Thread(target=self._install, args=(model_id, source, device), daemon=True, name="reranker-install").start()
        return True

    def cancel_install(self) -> bool:
        with self._lock:
            if not self._installing:
                return False
            self._cancel_requested.set()
            self._phase = "cancelling"
            process = self._process
        if process and process.poll() is None:
            process.terminate()
        return True

    def _run(self, command: list[str], env=None):
        if self._cancel_requested.is_set():
            raise RerankerInstallCancelled()
        process = subprocess.Popen(command, cwd=self.project_root, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")
        with self._lock:
            self._process = process
        stdout, stderr = process.communicate()
        with self._lock:
            self._process = None
        if self._cancel_requested.is_set():
            raise RerankerInstallCancelled()
        if process.returncode:
            raise RuntimeError((stderr or stdout or "Reranker subprocess failed")[-3000:])
        return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)

    def _install_runtime(self) -> None:
        self._phase = "runtime"
        self._current_file = "正在检查共享 AI 运行环境（阿里云镜像）"
        if not self.runtime_python.is_file():
            subprocess.run([sys.executable, "-m", "venv", str(self.runtime_dir)], check=True)
        marker = self.runtime_dir / ".reranker-requirements-ready"
        if marker.is_file():
            return
        probe = [
            str(self.runtime_python),
            "-c",
            "import torch, transformers, modelscope, huggingface_hub",
        ]
        try:
            self._run(probe)
        except RuntimeError:
            pass
        else:
            marker.write_text("ready\n", encoding="ascii")
            return
        pypi = os.getenv("YUMENO_PYPI_INDEX", "https://mirrors.aliyun.com/pypi/simple/")
        pytorch = os.getenv("YUMENO_PYTORCH_INDEX", "https://mirrors.aliyun.com/pytorch-wheels/cu128/")
        command = [str(self.runtime_python), "-m", "pip", "install", "--timeout", "60", "--retries", "2", "--index-url", pypi, "--extra-index-url", pytorch, "-r", str(self.requirements)]
        try:
            self._run(command)
        except RuntimeError as domestic_error:
            raise RuntimeError(
                f"Reranker 运行依赖从国内镜像安装失败，未切换境外源：{domestic_error}"
            ) from domestic_error
        marker.write_text("ready\n", encoding="ascii")

    def _install(self, model_id: str, source: str, device: str) -> None:
        directory = self.model_directory(model_id)
        try:
            self._install_runtime()
            self._phase = "model"
            directory.mkdir(parents=True, exist_ok=True)
            code = ("from modelscope import snapshot_download; snapshot_download(%r, local_dir=%r)" if source == "modelscope" else "from huggingface_hub import snapshot_download; snapshot_download(repo_id=%r, local_dir=%r)") % (model_id, str(directory))
            env = os.environ.copy()
            env["MODELSCOPE_CACHE"] = str(self.project_root / "runtime" / "modelscope-cache")
            env["HF_HOME"] = str(self.project_root / "runtime" / "huggingface-cache")
            self._run([str(self.runtime_python), "-c", code], env=env)
            self._phase = "loading"
            probe = self._run([str(self.runtime_python), str(self.worker_script), "--probe", str(directory), device])
            result = json.loads(probe.stdout.strip().splitlines()[-1])
            if not result.get("ok"):
                raise RuntimeError(str(result.get("error") or "Reranker probe failed"))
            self._phase = "complete"
        except RerankerInstallCancelled:
            self._error, self._phase = "", "idle"
        except Exception as exc:
            self._error, self._phase = str(exc), "error"
        finally:
            with self._lock:
                self._installing = False
                self._process = None
            self._cancel_requested.clear()
            self._started_at = None

    def remove_model(self) -> dict:
        if self._installing:
            raise RuntimeError("Cancel the active reranker installation first")
        _, directory = self._active()
        if directory.is_dir():
            shutil.rmtree(directory)
        self._error, self._phase = "", "idle"
        return self.status()

    def open_model_directory(self) -> dict:
        _, directory = self._active()
        target = directory if directory.is_dir() else self.models_root
        return {**self.status(), "opened_directory": open_resource_directory(target)}
