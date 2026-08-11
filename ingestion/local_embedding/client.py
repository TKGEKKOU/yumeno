"""主应用侧的 LangChain Embeddings 适配器。"""

import json
import os
import subprocess
import threading
from collections import OrderedDict
from pathlib import Path
from weakref import WeakSet

from langchain_core.embeddings import Embeddings

from ingestion.local_embedding.resources import LocalEmbeddingResourceManager


_EMBEDDING_INSTANCES: list["ManagedLocalEmbeddings"] = []
_EMBEDDING_RETIRED: WeakSet["ManagedLocalEmbeddings"] = WeakSet()
_EMBEDDING_CACHE: OrderedDict[
    tuple[str, str, str], "ManagedLocalEmbeddings"
] = OrderedDict()
_EMBEDDING_CACHE_LOCK = threading.Lock()
_EMBEDDING_CACHE_SIZE = 4
_EMBEDDING_ACCEPTING_NEW = True


def _drain_embedding_workers() -> None:
    """Close and forget every active or retired embedding adapter."""

    with _EMBEDDING_CACHE_LOCK:
        instances = list(
            dict.fromkeys([*_EMBEDDING_INSTANCES, *_EMBEDDING_RETIRED])
        )
        _EMBEDDING_INSTANCES.clear()
        _EMBEDDING_RETIRED.clear()
        _EMBEDDING_CACHE.clear()
    for instance in instances:
        try:
            instance.close()
        except Exception:
            pass


def shutdown_embedding_workers() -> None:
    """终止全部 worker，并恢复普通调用可再次按需创建的状态。"""

    global _EMBEDDING_ACCEPTING_NEW
    with _EMBEDDING_CACHE_LOCK:
        _EMBEDDING_ACCEPTING_NEW = False
    _drain_embedding_workers()
    with _EMBEDDING_CACHE_LOCK:
        _EMBEDDING_ACCEPTING_NEW = True


def begin_embedding_shutdown() -> None:
    """Reject late cache creation and stop every worker during app teardown."""

    global _EMBEDDING_ACCEPTING_NEW
    with _EMBEDDING_CACHE_LOCK:
        _EMBEDDING_ACCEPTING_NEW = False
    _drain_embedding_workers()


def resume_embedding_workers() -> None:
    """Open the process pool for a newly started application lifespan."""

    global _EMBEDDING_ACCEPTING_NEW
    with _EMBEDDING_CACHE_LOCK:
        _EMBEDDING_ACCEPTING_NEW = True


def worker_environment() -> dict[str, str]:
    """为独立推理进程固定 UTF-8，避免 Windows GBK 破坏中文 JSON。"""
    environment = os.environ.copy()
    environment["PYTHONIOENCODING"] = "utf-8"
    environment["PYTHONUTF8"] = "1"
    return environment


class ManagedLocalEmbeddings(Embeddings):
    """本地 Embedding 的 LangChain 适配器。

    设计选择：推理放在独立子进程（worker.py）里，通过 stdin/stdout 按行传 JSON。
    原因：1) 模型权重常驻子进程内存，批量请求不重复加载；2) 推理崩溃只影响子进程，
    主服务可自动重启恢复；3) 子进程可单独指定 Python 运行时/设备（CPU/GPU），
    与主进程依赖隔离。
    """

    def __init__(self, project_root: Path, model_id: str, device: str) -> None:
        self.resources = LocalEmbeddingResourceManager(project_root)
        self.model_id = model_id
        self.device = device
        self._process: subprocess.Popen | None = None
        self._lock = threading.Lock()
        self._lifecycle_lock = threading.Lock()
        self._closed = False

    def _start(self) -> subprocess.Popen:
        with self._lifecycle_lock:
            if self._closed:
                raise RuntimeError("本地 Embedding 工作进程已关闭")
        directory = self.resources.model_directory(self.model_id)
        if not (directory / "config.json").is_file():
            raise RuntimeError("本地 Embedding 模型尚未下载，请先在设置页完成安装")
        if not self.resources.runtime_python.is_file():
            raise RuntimeError("本地 Embedding 运行环境尚未安装")
        # 拉起独立推理进程，并等待它输出第一行 JSON 握手（{"ok": true}），
        # 握手成功才算启动完成；启动失败时读 stderr 尾部作为错误详情。
        process = subprocess.Popen(
            [str(self.resources.runtime_python), str(self.resources.worker_script), str(directory), self.device],
            cwd=self.resources.project_root,
            env=worker_environment(),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            bufsize=1,
        )
        # Popen itself can overlap application shutdown. Re-check the lifecycle
        # state before publishing the process so a late child cannot escape.
        with self._lifecycle_lock:
            if self._closed:
                should_stop = True
            else:
                self._process = process
                should_stop = False
        if should_stop:
            self._stop_process(process)
            raise RuntimeError("本地 Embedding 工作进程已关闭")
        ready_line = process.stdout.readline() if process.stdout else ""
        try:
            ready = json.loads(ready_line)
        except json.JSONDecodeError as exc:
            detail = process.stderr.read() if process.stderr and process.poll() is not None else ready_line
            self._discard_process(process)
            raise RuntimeError(f"本地 Embedding 工作进程启动失败：{detail[-2000:]}") from exc
        if not ready.get("ok"):
            self._discard_process(process)
            raise RuntimeError(str(ready.get("error") or "本地 Embedding 工作进程启动失败"))
        return process

    def _request(self, operation: str, texts: list[str]) -> list[list[float]]:
        with self._lock:
            with self._lifecycle_lock:
                if self._closed:
                    raise RuntimeError("本地 Embedding 工作进程已关闭")
                process = self._process
            if process is None or process.poll() is not None:
                # 进程未启动或已退出（崩溃）时自动拉起新进程，对调用方透明。
                process = self._start()
            assert process.stdin is not None and process.stdout is not None
            # 行协议：主进程写一条 JSON 请求，读一条 JSON 响应；加锁保证串行，
            # 因为一个子进程同一时刻只处理一条请求。
            process.stdin.write(json.dumps({"operation": operation, "texts": texts}, ensure_ascii=False) + "\n")
            process.stdin.flush()
            line = process.stdout.readline()
            if not line:
                # 读取失败说明子进程已经退出，先关掉旧句柄，下次调用会重新拉起。
                self._discard_process(process)
                raise RuntimeError("本地 Embedding 工作进程意外退出")
            result = json.loads(line)
            if not result.get("ok"):
                raise RuntimeError(str(result.get("error") or "本地 Embedding 推理失败"))
            return result["vectors"]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        # LangChain Embeddings 接口：批量嵌入待检索文档（入库时调用）。
        return self._request("embed_documents", texts)

    def embed_query(self, text: str) -> list[float]:
        # LangChain Embeddings 接口：单条查询向量（检索时调用）。
        return self._request("embed_query", [text])[0]

    def close(self) -> None:
        with self._lifecycle_lock:
            self._closed = True
            process = self._process
            self._process = None
        self._stop_process(process)

    def __del__(self) -> None:
        # Retired adapters are tracked weakly. Once the last real owner (for
        # example a cached Milvus store) releases one, reclaim its subprocess.
        try:
            self.close()
        except Exception:
            pass

    def _discard_process(self, process: subprocess.Popen | None = None) -> None:
        """Release a failed worker without permanently closing the adapter."""

        with self._lifecycle_lock:
            target = self._process if process is None else process
            if self._process is target:
                self._process = None
        self._stop_process(target)

    @staticmethod
    def _stop_process(process: subprocess.Popen | None) -> None:
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=1)


def get_managed_embeddings(project_root: str, model_id: str, device: str) -> ManagedLocalEmbeddings:
    key = (project_root, model_id, device)
    with _EMBEDDING_CACHE_LOCK:
        if not _EMBEDDING_ACCEPTING_NEW:
            raise RuntimeError("本地 Embedding 工作进程正在关闭")
        instance = _EMBEDDING_CACHE.pop(key, None)
        if instance is not None:
            _EMBEDDING_CACHE[key] = instance
            return instance
        instance = ManagedLocalEmbeddings(Path(project_root), model_id, device)
        _EMBEDDING_CACHE[key] = instance
        _EMBEDDING_INSTANCES.append(instance)
        if len(_EMBEDDING_CACHE) > _EMBEDDING_CACHE_SIZE:
            _, evicted = _EMBEDDING_CACHE.popitem(last=False)
            if evicted in _EMBEDDING_INSTANCES:
                _EMBEDDING_INSTANCES.remove(evicted)
            # A Milvus store can keep using the returned embedding object after
            # it leaves this lookup cache. Retire it for shutdown instead of
            # turning a still-valid external reference into use-after-close.
            _EMBEDDING_RETIRED.add(evicted)
    return instance
