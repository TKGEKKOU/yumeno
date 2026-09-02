from ingestion.markdown_parser import DocumentScope
from ingestion.milvus_store import MilvusRagStore, document_filter


def test_document_filter_contains_complete_server_scope():
    scope = DocumentScope("local-default", "space-a", "doc-a")

    expression = document_filter(scope, scope.document_id)

    assert 'workspace_id == "local-default"' in expression
    assert 'knowledge_space_id == "space-a"' in expression
    assert 'document_id == "doc-a"' in expression


def test_hash_query_and_delete_use_the_same_scoped_filter(monkeypatch):
    calls = []

    class FakeClient:
        def list_collections(self):
            return [store.settings.collection_name]

        def load_collection(self, **kwargs):
            calls.append(("load", kwargs))

        def query(self, **kwargs):
            calls.append(("query", kwargs))
            return [{"source_hash": "hash-a"}]

        def delete(self, **kwargs):
            calls.append(("delete", kwargs))

    store = MilvusRagStore()
    fake_client = FakeClient()
    monkeypatch.setattr(fake_client, "list_collections", lambda: [store.settings.collection_name])
    monkeypatch.setattr(store, "client", lambda: fake_client)
    scope = DocumentScope("local-default", "space-a", "doc-a")

    assert store.indexed_hashes(scope, "doc-a") == {"hash-a"}
    store.delete_document(scope, "doc-a")

    filters = [kwargs["filter"] for action, kwargs in calls if action in {"query", "delete"}]
    assert filters[0] == filters[1]
    assert 'knowledge_space_id == "space-a"' in filters[0]


def test_close_releases_shared_client_and_langchain_clients(monkeypatch):
    from ingestion import milvus_store

    closed = []

    class FakeClient:
        def __init__(self, name):
            self.name = name

        def close(self):
            closed.append(self.name)

    settings = milvus_store.Settings.load()
    store = milvus_store.MilvusRagStore(settings)
    shared = FakeClient("shared")
    sync_wrapper = FakeClient("wrapper-sync")
    async_wrapper = FakeClient("wrapper-async")
    monkeypatch.setitem(milvus_store._CLIENTS, milvus_store._client_key(settings), shared)
    store.vector_store = type(
        "VectorStore", (), {
            "_milvus_client": sync_wrapper,
            "_async_milvus_client": async_wrapper,
        }
    )()

    store.close()

    assert closed == ["wrapper-sync", "wrapper-async"]
    assert milvus_store._client_key(settings) in milvus_store._CLIENTS


def test_close_milvus_connections_releases_shared_clients(monkeypatch):
    from ingestion import milvus_store

    closed = []

    class FakeClient:
        def close(self):
            closed.append("shared")

    settings = milvus_store.Settings.load()
    key = milvus_store._client_key(settings)
    monkeypatch.setitem(milvus_store._CLIENTS, key, FakeClient())

    milvus_store.close_milvus_connections()

    assert closed == ["shared"]
    assert key not in milvus_store._CLIENTS


def test_create_existing_collection_loads_it_for_native_queries(monkeypatch):
    from ingestion import milvus_store

    calls = []

    class FakeClient:
        def list_collections(self):
            return [milvus_store.Settings.load().collection_name]

        def load_collection(self, **kwargs):
            calls.append(kwargs)

    store = milvus_store.MilvusRagStore()
    monkeypatch.setattr(store, "client", lambda: FakeClient())
    monkeypatch.setattr(store, "validate_collection_dimensions", lambda client=None: None)

    store.create_collection(reset=False)

    assert calls == [{"collection_name": store.settings.collection_name}]
