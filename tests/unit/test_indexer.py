from ingestion.indexer import ingest_markdown_file
from ingestion.markdown_parser import DocumentScope
from sqlalchemy.orm.exc import StaleDataError


class FakeStore:
    def __init__(self):
        self.hashes = {"old-hash"}
        self.deleted = []
        self.added = []

    def indexed_hashes(self, scope, document_id):
        return self.hashes

    def delete_document(self, scope, document_id):
        self.deleted.append((scope, document_id))

    def add_documents(self, documents):
        self.added.extend(documents)


def test_changed_document_deletes_only_same_space(tmp_path):
    path = tmp_path / "guide.md"
    path.write_text("# Guide\n\nNew content.", encoding="utf-8")
    scope = DocumentScope("local-default", "space-a", "doc-a")
    store = FakeStore()

    inserted = ingest_markdown_file(path, scope, store=store)

    assert inserted > 0
    assert store.deleted == [(scope, "doc-a")]
    assert {doc.metadata["knowledge_space_id"] for doc in store.added} == {"space-a"}


def test_explicit_chunking_preset_uses_semantic_chunks(tmp_path, monkeypatch):
    path = tmp_path / "guide.md"
    path.write_text("# Guide\n\n第一段内容。" * 30, encoding="utf-8")
    scope = DocumentScope("local-default", "space-a", "doc-a")
    store = FakeStore()

    monkeypatch.setattr("ingestion.indexer.get_embedding_model", lambda settings: None)
    inserted = ingest_markdown_file(path, scope, store=store, chunking_preset="knowledge_base")

    assert inserted == len(store.added)
    assert store.added
    assert all(doc.metadata["chunking_preset"] == "knowledge_base" for doc in store.added)
    assert all("previous_chunk_id" in doc.metadata for doc in store.added)


class _CleanupStore:
    def __init__(self):
        self.deleted = []

    def delete_document(self, scope, document_id):
        self.deleted.append((scope, document_id))


def _make_job(markdown_path):
    class Job:
        id = "job-1"
        workspace_id = "local-default"
        knowledge_space_id = "space-a"
        document_id = "doc-a"
        status = "indexing"
        indexed_at = None
        error_message = None
        original_filename = "guide.md"

    job = Job()
    job.markdown_path = str(markdown_path)
    job.source_path = str(markdown_path)
    return job


def test_index_job_commits_status_when_row_still_exists(tmp_path, monkeypatch):
    from ingestion.document_jobs import index_document_job

    markdown = tmp_path / "preview.md"
    markdown.write_text("# Guide\n\nBody.", encoding="utf-8")

    class OkSession:
        def __init__(self, job):
            self.job = job
            self.commit_count = 0

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def get(self, model, job_id):
            return self.job if job_id == self.job.id else None

        def rollback(self):
            raise AssertionError("rollback should not happen on success")

        def commit(self):
            self.commit_count += 1

    job = _make_job(markdown)
    store = _CleanupStore()
    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", lambda path, scope, **kwargs: 1)

    index_document_job("job-1", lambda: OkSession(job), store=store)

    assert job.status == "indexed"
    assert job.indexed_at is not None
    assert job.error_message is None
    assert store.deleted == []


def test_index_job_cleans_orphan_vectors_when_row_deleted_during_indexing(tmp_path, monkeypatch):
    from ingestion.document_jobs import index_document_job

    markdown = tmp_path / "preview.md"
    markdown.write_text("# Guide\n\nBody.", encoding="utf-8")

    class StaleSession:
        def __init__(self, job):
            self.job = job
            self.rolled_back = False

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def get(self, model, job_id):
            return self.job if job_id == self.job.id else None

        def rollback(self):
            self.rolled_back = True

        def commit(self):
            raise StaleDataError(
                "UPDATE statement on table 'document_jobs' expected to update 1 row(s); 0 were matched."
            )

    store = _CleanupStore()
    session = StaleSession(_make_job(markdown))
    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", lambda path, scope, **kwargs: 1)

    index_document_job("job-1", lambda: session, store=store)

    assert session.rolled_back is True
    assert store.deleted == [(DocumentScope("local-default", "space-a", "doc-a"), "doc-a")]


def test_index_job_routes_csv_to_sqlite_and_indexes_only_schema_card(tmp_path, monkeypatch):
    from agents.context import PersonaAgentContext
    from agents.tools.structured_query import list_structured_tables_for_context
    from ingestion.document_jobs import index_document_job

    source = tmp_path / "sales.csv"
    source.write_text("region,amount\nNorth,10\nSouth,20\n", encoding="utf-8")
    markdown = tmp_path / "preview.md"
    markdown.write_text("raw converted rows", encoding="utf-8")
    job = _make_job(markdown)
    job.original_filename = "sales.csv"
    job.source_path = str(source)
    captured = {}

    def fake_ingest(path, scope):
        captured["text"] = path.read_text(encoding="utf-8")
        captured["scope"] = scope
        return 1

    class Session:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def get(self, model, job_id):
            return job

        def commit(self):
            return None

    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", fake_ingest)
    index_document_job("job-1", Session, structured_root=tmp_path)

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )
    tables = list_structured_tables_for_context(context, root=tmp_path)
    assert tables[0]["row_count"] == 2
    assert "Structured data schema" in captured["text"]
    assert "North" not in captured["text"]
    assert job.markdown_preview == captured["text"]


def test_index_job_removes_structured_import_when_vector_indexing_fails(tmp_path, monkeypatch):
    from agents.context import PersonaAgentContext
    from agents.tools.structured_query import list_structured_tables_for_context
    from ingestion.document_jobs import index_document_job

    source = tmp_path / "sales.csv"
    source.write_text("region,amount\nNorth,10\n", encoding="utf-8")
    markdown = tmp_path / "preview.md"
    markdown.write_text("raw", encoding="utf-8")
    job = _make_job(markdown)
    job.original_filename = "sales.csv"
    job.source_path = str(source)

    class Session:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def get(self, model, job_id):
            return job

        def commit(self):
            return None

    monkeypatch.setattr(
        "ingestion.document_jobs.ingest_markdown_file",
        lambda path, scope: (_ for _ in ()).throw(RuntimeError("milvus unavailable")),
    )
    index_document_job("job-1", Session, structured_root=tmp_path)

    context = PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="local-default",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Alpha",
        persona_type="character",
    )
    assert list_structured_tables_for_context(context, root=tmp_path) == []
    assert job.status == "index_failed"

def test_index_job_forwards_explicit_store_to_ingester(tmp_path, monkeypatch):
    from ingestion.document_jobs import index_document_job

    markdown = tmp_path / "preview.md"
    markdown.write_text("# Guide\n\nBody.", encoding="utf-8")
    job = _make_job(markdown)
    store = _CleanupStore()
    captured = {}

    def fake_ingest(path, scope, **kwargs):
        captured.update(kwargs)
        return 1

    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", fake_ingest)

    outcome = index_document_job("job-1", lambda: type("Session", (), {
        "__enter__": lambda self: self,
        "__exit__": lambda self, *args: False,
        "get": lambda self, model, job_id: job if job_id == job.id else None,
        "commit": lambda self: None,
    })(), store=store)

    assert outcome["status"] == "indexed"
    assert captured["store"] is store
