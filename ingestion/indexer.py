from pathlib import Path

from ingestion.markdown_parser import DocumentScope, MarkdownParser
from ingestion.milvus_store import MilvusRagStore
from settings import Settings
from ingestion.embeddings import get_embedding_model
from ingestion.semantic_chunker import build_chunks, chunks_to_documents


"""文档入库流程（Markdown 知识 → Milvus 分块向量）。

流程：解析 Markdown → 按 chunk_size/chunk_overlap 分块 → 计算 source_hash
去重 → 变更时先删除旧文档再写入新块 → flush 保证立即可见。

幂等：同一文档内容（source_hash）已存在时直接跳过；内容变化时整体替换，
避免残留旧分块造成检索脏数据。
"""
def ingest_markdown_file(
    path: Path,
    scope: DocumentScope,
    store: MilvusRagStore | None = None,
    chunking_preset: str | None = None,
    chunker_version: str | None = None,
) -> int:
    if not path.is_file() or path.suffix.lower() != ".md":
        raise FileNotFoundError(f"Markdown file does not exist: {path}")

    active_store = store or MilvusRagStore()
    if store is None:
        active_store.create_collection(reset=False)

    settings = Settings.load()
    if chunking_preset:
        text = path.read_text(encoding="utf-8")
        import hashlib

        source_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
        try:
            embedder = get_embedding_model(settings)
        except Exception:
            embedder = None
        chunks = build_chunks(
            text,
            chunking_preset,
            embedder,
            {
                "source": str(path),
                "filename": path.name,
                "filetype": "text/markdown",
                "title": path.stem,
                "section": path.stem,
                "category": "content",
                "doc_id": path.stem,
                "workspace_id": scope.workspace_id,
                "knowledge_space_id": scope.knowledge_space_id,
                "document_id": scope.document_id,
                "source_hash": source_hash,
                "chunker_version": chunker_version or settings.chunker_version,
            },
        )
        documents = chunks_to_documents(chunks)
    else:
        documents = MarkdownParser(settings.chunk_size, settings.chunk_overlap).parse_file(path, scope)
    if not documents:
        return 0

    source_hash = str(documents[0].metadata["source_hash"])
    old_hashes = active_store.indexed_hashes(scope, scope.document_id)
    if source_hash in old_hashes:
        return 0
    if old_hashes:
        active_store.delete_document(scope, scope.document_id)

    active_store.add_documents(documents)
    return len(documents)
