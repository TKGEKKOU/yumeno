from rag.pipeline_types import SemanticChunk


def test_semantic_chunk_exposes_retrieval_metadata():
    chunk = SemanticChunk(
        chunk_id="c1",
        content="正文",
        metadata={"document_id": "d1"},
        heading_path="人物 > 经历",
        sentence_start=0,
        sentence_end=1,
        previous_chunk_id=None,
        next_chunk_id="c2",
        char_count=2,
        token_count=1,
        chunking_preset="character",
        chunker_version="semantic-v1",
    )
    assert chunk.next_chunk_id == "c2"
    assert chunk.metadata["document_id"] == "d1"
