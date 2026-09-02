from langchain_core.documents import Document

from rag.candidate_processing import Candidate
from rag.context_assembler import assemble_context
from rag.presets import get_retrieval_preset
from rag.reranker import rerank_candidates
from rag.adaptive_graph import batch_grade_documents_node, generate_node


class FakeReranker:
    def score_pairs(self, query, documents):
        return [float(index) for index, _ in enumerate(documents)]


class LowScoreReranker:
    def score_pairs(self, query, documents):
        return [0.01 for _ in documents]


def test_reranker_sorts_and_keeps_requested_count():
    candidates = [Candidate(Document(page_content="a"), 0), Candidate(Document(page_content="b"), 1)]
    result = rerank_candidates("q", candidates, FakeReranker(), 1)
    assert result[0].candidate.document.page_content == "b"


def test_candidate_stage_uses_local_reranker_without_remote_llm_grader(monkeypatch):
    documents = [Document(page_content="a"), Document(page_content="b")]
    monkeypatch.setattr("rag.adaptive_graph.get_managed_reranker", lambda *args: FakeReranker())
    monkeypatch.setattr(
        "rag.adaptive_graph.grade_retrieved_documents",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("remote grader must not run")),
    )

    result = batch_grade_documents_node(
        {
            "question": "q",
            "documents": documents,
            "retrieval_config": {"profile": "precise"},
            "trace": [],
        }
    )

    assert [document.page_content for document in result["documents"]] == ["b", "a"]
    assert result["rerank_scores"] == [1.0, 0.0]
    assert result["reranker_fallback"] is False


def test_generation_reuses_existing_rerank_scores(monkeypatch):
    documents = [Document(page_content="b", metadata={"document_id": "d1"})]
    monkeypatch.setattr(
        "rag.adaptive_graph.get_managed_reranker",
        lambda *args: (_ for _ in ()).throw(AssertionError("must not rerank twice")),
    )
    monkeypatch.setattr("rag.adaptive_graph.generate_answer", lambda *args, **kwargs: "answer")

    result = generate_node(
        {
            "question": "q",
            "documents": documents,
            "rerank_scores": [0.9],
            "reranker_fallback": False,
            "retrieval_config": {"profile": "precise"},
            "context": type("Context", (), {"knowledge_space_ids": ()})(),
            "trace": [],
        }
    )

    assert result["answer"] == "answer"
    assert result["rerank_count"] == 1


def test_low_relevance_batch_is_removed_before_context_assembly(monkeypatch):
    monkeypatch.setattr("rag.adaptive_graph.get_managed_reranker", lambda *args: LowScoreReranker())
    result = batch_grade_documents_node(
        {
            "question": "unrelated question",
            "documents": [Document(page_content="character biography")],
            "retrieval_config": {"profile": "precise"},
            "trace": [],
        }
    )
    assert result["documents"] == []
    assert result["irrelevant_after_rerank"] is True
    assert result["rerank_scores"] == [0.01]


def test_context_assembly_obeys_budget_and_k():
    candidates = [Candidate(Document(page_content="第一段。" * 100), 0), Candidate(Document(page_content="第二段。" * 100), 1)]
    ranked = rerank_candidates("q", candidates, None, 2)
    result = assemble_context("q", ranked, get_retrieval_preset("precise"), lambda text: len(text))
    assert result.token_count <= 2200
    assert len(result.documents) <= 4


def test_context_assembly_returns_the_text_that_was_counted_against_the_budget():
    document = Document(page_content="第一句。第二句。第三句。", metadata={"chunk_id": "d1:0000"})
    ranked = rerank_candidates("q", [Candidate(document, 0)], None, 1)
    profile = get_retrieval_preset("precise")
    profile = type(profile)(
        name=profile.name,
        retrieval_k=profile.retrieval_k,
        rerank_k=profile.rerank_k,
        final_context_k=profile.final_context_k,
        evidence_token_budget=4,
        allow_neighbors=profile.allow_neighbors,
    )

    result = assemble_context("q", ranked, profile, tokenizer=len)

    assert result.truncated is True
    assert result.documents[0].page_content == "第一句。"
    assert result.token_count == len(result.documents[0].page_content)
    assert result.documents[0].metadata == document.metadata


def test_context_assembly_loads_neighbors_and_orders_each_document_by_chunk_id():
    main = Document(page_content="中间", metadata={"document_id": "d1", "chunk_id": "d1:0001", "previous_chunk_id": "d1:0000", "next_chunk_id": "d1:0002"})
    other = Document(page_content="另一文档", metadata={"document_id": "d2", "chunk_id": "d2:0000"})
    neighbors = {
        "d1:0000": Document(page_content="前文", metadata={"document_id": "d1", "chunk_id": "d1:0000"}),
        "d1:0002": Document(page_content="后文", metadata={"document_id": "d1", "chunk_id": "d1:0002"}),
    }
    ranked = [
        rerank_candidates("q", [Candidate(main, 0)], FakeReranker(), 1)[0],
        rerank_candidates("q", [Candidate(other, 0)], FakeReranker(), 1)[0],
    ]
    ranked[0] = type(ranked[0])(ranked[0].candidate, 0.9, 0, False)
    ranked[1] = type(ranked[1])(ranked[1].candidate, 0.7, 1, False)

    result = assemble_context(
        "q", ranked, get_retrieval_preset("deep"),
        tokenizer=lambda text: len(text),
        neighbor_loader=lambda ids: [neighbors[item] for item in ids if item in neighbors],
    )

    assert [doc.metadata["chunk_id"] for doc in result.documents] == ["d1:0000", "d1:0001", "d1:0002", "d2:0000"]
    assert result.main_hit_count == 2
    assert result.neighbor_count == 2
    assert all(doc.metadata.get("supporting_neighbor") for doc in (result.documents[0], result.documents[2]))
    assert all(doc.metadata.get("evidence_role") == "supporting_neighbor" for doc in (result.documents[0], result.documents[2]))
    assert all(doc.metadata.get("evidence_role") != "supporting_neighbor" for doc in (result.documents[1], result.documents[3]))
