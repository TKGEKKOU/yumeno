from dataclasses import replace
import gc
import threading
import weakref

from ingestion import embeddings
from settings import Settings


def test_managed_local_provider_uses_local_adapter(tmp_path, monkeypatch):
    settings = replace(
        Settings.load(tmp_path),
        embedding_provider="managed_local",
        embedding_model="Qwen/Qwen3-Embedding-0.6B",
        embedding_device="auto",
    )
    marker = object()
    monkeypatch.setattr(embeddings, "get_managed_embeddings", lambda *args: marker)

    assert embeddings.get_embedding_model(settings) is marker


def test_cloud_provider_keeps_openai_embeddings_factory(tmp_path, monkeypatch):
    settings = replace(
        Settings.load(tmp_path),
        embedding_provider="qwen",
        embedding_model="text-embedding-v4",
        embedding_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    marker = object()
    monkeypatch.setattr(embeddings, "_build_embedding_model", lambda *args: marker)

    assert embeddings.get_embedding_model(settings) is marker


def test_shutdown_embedding_workers_closes_all_instances(monkeypatch):
    from ingestion.local_embedding import client

    closed: list[str] = []

    class FakeEmbeddings:
        def __init__(self, name):
            self.name = name

        def close(self):
            closed.append(self.name)

    client._EMBEDDING_INSTANCES.extend(
        [FakeEmbeddings("a"), FakeEmbeddings("b")]
    )
    try:
        client.shutdown_embedding_workers()
        assert closed == ["a", "b"]
    finally:
        client._EMBEDDING_INSTANCES.clear()


def test_shutdown_embedding_workers_clears_cached_closed_instances(tmp_path):
    from ingestion.local_embedding import client

    first = client.get_managed_embeddings(str(tmp_path), "demo/model", "cpu")
    client.shutdown_embedding_workers()
    second = client.get_managed_embeddings(str(tmp_path), "demo/model", "cpu")

    try:
        assert second is not first
        assert client._EMBEDDING_INSTANCES == [second]
    finally:
        client.shutdown_embedding_workers()


def test_regular_shutdown_reopens_cache_after_application_shutdown(tmp_path):
    """普通清理应恢复可创建状态，避免一次 lifespan 污染后续应用或测试。"""

    from ingestion.local_embedding import client

    client.begin_embedding_shutdown()
    client.shutdown_embedding_workers()
    instance = client.get_managed_embeddings(str(tmp_path), "demo/model", "cpu")

    try:
        assert instance in client._EMBEDDING_INSTANCES
    finally:
        client.shutdown_embedding_workers()


def test_managed_embedding_cache_retires_lru_eviction_until_shutdown(tmp_path, monkeypatch):
    from ingestion.local_embedding import client

    class FakeEmbeddings:
        def __init__(self, project_root, model_id, device):
            self.key = (str(project_root), model_id, device)
            self.closed = False

        def close(self):
            self.closed = True

    client.shutdown_embedding_workers()
    monkeypatch.setattr(client, "ManagedLocalEmbeddings", FakeEmbeddings)
    instances = [
        client.get_managed_embeddings(str(tmp_path), f"model-{index}", "cpu")
        for index in range(5)
    ]

    try:
        assert all(instance.closed is False for instance in instances)
        assert client._EMBEDDING_INSTANCES == instances[1:]
        assert list(client._EMBEDDING_RETIRED) == [instances[0]]
    finally:
        client.shutdown_embedding_workers()
    assert all(instance.closed is True for instance in instances)


def test_managed_embedding_lru_eviction_does_not_close_existing_reference(tmp_path, monkeypatch):
    """淘汰缓存只移除索引，不能关闭仍被 Milvus 等调用方持有的对象。"""

    from ingestion.local_embedding import client

    class FakeEmbeddings:
        def __init__(self, project_root, model_id, device):
            self.closed = False
            self.value = (str(project_root), model_id, device)

        def close(self):
            self.closed = True

        def embed_query(self, text):
            if self.closed:
                raise RuntimeError("closed")
            return [text]

    client.shutdown_embedding_workers()
    monkeypatch.setattr(client, "ManagedLocalEmbeddings", FakeEmbeddings)
    first = client.get_managed_embeddings(str(tmp_path), "model-0", "cpu")
    for index in range(1, 6):
        client.get_managed_embeddings(str(tmp_path), f"model-{index}", "cpu")

    try:
        assert first.embed_query("still-used") == ["still-used"]
        assert first.closed is False
    finally:
        client.shutdown_embedding_workers()


def test_retired_embedding_does_not_keep_an_unreferenced_worker_alive(tmp_path, monkeypatch):
    """retired 只跟踪外部仍持有的对象，不能成为无上限强引用池。"""

    from ingestion.local_embedding import client

    original = client.ManagedLocalEmbeddings
    closed: list[str] = []

    class TrackedEmbeddings(original):
        def close(self):
            closed.append(self.model_id)
            super().close()

    client.shutdown_embedding_workers()
    monkeypatch.setattr(client, "ManagedLocalEmbeddings", TrackedEmbeddings)
    first = client.get_managed_embeddings(str(tmp_path), "model-0", "cpu")
    first_ref = weakref.ref(first)
    del first
    for index in range(1, 5):
        client.get_managed_embeddings(str(tmp_path), f"model-{index}", "cpu")
    gc.collect()

    try:
        assert first_ref() is None
        assert "model-0" in closed
    finally:
        client.shutdown_embedding_workers()


def test_regular_shutdown_blocks_new_instances_until_drain_finishes(monkeypatch):
    from ingestion.local_embedding import client

    close_started = threading.Event()
    allow_close = threading.Event()

    class BlockingEmbeddings:
        def close(self):
            close_started.set()
            allow_close.wait(timeout=2)

    client.shutdown_embedding_workers()
    client._EMBEDDING_INSTANCES.append(BlockingEmbeddings())
    shutdown_thread = threading.Thread(target=client.shutdown_embedding_workers)
    shutdown_thread.start()
    assert close_started.wait(timeout=1)

    try:
        try:
            client.get_managed_embeddings("project", "model", "cpu")
        except RuntimeError as exc:
            assert "正在关闭" in str(exc)
        else:
            raise AssertionError("shutdown drain 期间不应创建新实例")
    finally:
        allow_close.set()
        shutdown_thread.join(timeout=2)
        client.shutdown_embedding_workers()


def test_warm_managed_embedding_runs_one_probe(monkeypatch, tmp_path):
    from dataclasses import replace

    import ingestion.embeddings as embeddings_module
    from settings import Settings

    calls = []

    class FakeEmbedding:
        def embed_query(self, text):
            calls.append(text)
            return [0.0]

    settings = replace(Settings.load(tmp_path), embedding_provider="managed_local")
    monkeypatch.setattr(embeddings_module, "get_embedding_model", lambda active: FakeEmbedding())

    assert embeddings_module.warm_managed_embedding(settings) is True
    assert calls == ["模型预热"]
