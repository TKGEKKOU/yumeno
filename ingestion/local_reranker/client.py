"""Main-process adapter for the managed reranker worker."""

import json
import subprocess
import threading
from collections import OrderedDict
from pathlib import Path

from ingestion.local_embedding.client import worker_environment
from ingestion.local_reranker.resources import LocalRerankerResourceManager


_CACHE: OrderedDict[tuple[str, str, str], "ManagedLocalReranker"] = OrderedDict()
_LOCK = threading.Lock()
_ACCEPTING_NEW = True


class ManagedLocalReranker:
    def __init__(self, project_root: Path, model_id: str, device: str) -> None:
        self.resources = LocalRerankerResourceManager(project_root)
        self.model_id = model_id
        self.device = device
        self._process = None
        self._request_lock = threading.Lock()
        self._lifecycle_lock = threading.Lock()
        self._closed = False

    def _start(self):
        with self._lifecycle_lock:
            if self._closed:
                raise RuntimeError("Local reranker worker is closed")
        directory = self.resources.model_directory(self.model_id)
        if not (directory / "config.json").is_file():
            raise RuntimeError("Local reranker model is not installed")
        if not self.resources.runtime_python.is_file():
            raise RuntimeError("Local reranker runtime is not installed")
        process = subprocess.Popen(
            [str(self.resources.runtime_python), str(self.resources.worker_script), str(directory), self.device],
            cwd=self.resources.project_root, env=worker_environment(), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, text=True, encoding="utf-8", bufsize=1,
        )
        with self._lifecycle_lock:
            if self._closed:
                self._stop_process(process)
                raise RuntimeError("Local reranker worker is closed")
            self._process = process
        line = process.stdout.readline() if process.stdout else ""
        try:
            ready = json.loads(line)
        except json.JSONDecodeError as exc:
            detail = process.stderr.read() if process.stderr and process.poll() is not None else line
            self._discard_process(process)
            raise RuntimeError(f"Local reranker worker failed to start: {detail[-2000:]}") from exc
        if not ready.get("ok"):
            self._discard_process(process)
            raise RuntimeError(str(ready.get("error") or "Local reranker worker failed to start"))
        return process

    def _request(self, query: str, documents: list[str]) -> list[float]:
        with self._request_lock:
            with self._lifecycle_lock:
                if self._closed:
                    raise RuntimeError("Local reranker worker is closed")
                process = self._process
            if process is None or process.poll() is not None:
                process = self._start()
            assert process.stdin is not None and process.stdout is not None
            process.stdin.write(json.dumps({"operation": "score_pairs", "query": query, "documents": documents}, ensure_ascii=False) + "\n")
            process.stdin.flush()
            line = process.stdout.readline()
            if not line:
                self._discard_process(process)
                raise RuntimeError("Local reranker worker exited unexpectedly")
            result = json.loads(line)
            if not result.get("ok"):
                raise RuntimeError(str(result.get("error") or "Local reranker inference failed"))
            return [float(value) for value in result["scores"]]

    def score_pairs(self, query: str, documents: list[str]) -> list[float]:
        return self._request(query, documents)

    def close(self) -> None:
        with self._lifecycle_lock:
            self._closed = True
            process, self._process = self._process, None
        self._stop_process(process)

    def _discard_process(self, process=None) -> None:
        with self._lifecycle_lock:
            target = self._process if process is None else process
            if self._process is target:
                self._process = None
        self._stop_process(target)

    @staticmethod
    def _stop_process(process) -> None:
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=1)


def get_managed_reranker(project_root: str, model_id: str, device: str) -> ManagedLocalReranker:
    key = (project_root, model_id, device)
    with _LOCK:
        if not _ACCEPTING_NEW:
            raise RuntimeError("Local reranker workers are shutting down")
        instance = _CACHE.pop(key, None)
        if instance is None:
            instance = ManagedLocalReranker(Path(project_root), model_id, device)
        _CACHE[key] = instance
        while len(_CACHE) > 2:
            _CACHE.popitem(last=False)[1].close()
        return instance


def begin_reranker_shutdown() -> None:
    global _ACCEPTING_NEW
    with _LOCK:
        _ACCEPTING_NEW = False
        instances = list(_CACHE.values())
        _CACHE.clear()
    for instance in instances:
        instance.close()


def resume_reranker_workers() -> None:
    global _ACCEPTING_NEW
    with _LOCK:
        _ACCEPTING_NEW = True


def warm_managed_reranker(settings) -> bool:
    try:
        get_managed_reranker(str(settings.project_root.resolve()), settings.reranker_model, settings.reranker_device).score_pairs("warmup", ["warmup"])
        return True
    except Exception:
        return False
