from langchain_core.documents import Document

from rag.candidate_processing import Candidate, deduplicate_candidates


class FakeEmbedder:
    def embed_documents(self, texts):
        return [[1.0, 0.0] if "版本" not in text else [0.99, 0.01] for text in texts]


def candidate(text, chunk_id="c1", rank=0):
    return Candidate(Document(page_content=text, metadata={"chunk_id": chunk_id}), rank, "rrf")


def test_dedup_removes_same_chunk_from_two_channels():
    result = deduplicate_candidates([candidate("same", "c1", 0), candidate("same", "c1", 1)], FakeEmbedder())
    assert len(result.candidates) == 1
    assert result.exact_duplicate_count == 1


def test_dedup_keeps_distinct_versions():
    result = deduplicate_candidates([candidate("版本 1.0", "c1"), candidate("版本 1.1", "c2", 1)], FakeEmbedder())
    assert len(result.candidates) == 2
