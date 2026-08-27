# Findings

## User Reference Pipeline
- Initial retrieval may include vector, BM25, or hybrid retrieval.
- Candidate processing may include merge, deduplication, and metadata filtering.
- Reranker reduces the candidate set.
- Threshold/token budget selects the final context sent to the LLM.
- Top-K should be separated into retrieval K, rerank K, and final-context K.

## Project History Check
- `.planning/2026-08-10-enterprise-agent-rag` and `.planning/2026-08-11-agent-rag-search-routing` exist, but standard `task_plan.md`, `findings.md`, and `progress.md` files were absent when checked.
- External memory registry had no YUMENO/RAG project hit; current source is the authority.

## Initial Source Map
- `ingestion/milvus_store.py` defines dense HNSW and BM25 sparse indexes; retrieval fuses the two channels with RRF.
- `rag/adaptive_graph.py` is the main adaptive/corrective RAG graph. Its retrieval node currently calls `build_retriever(..., k=4)`.
- `rag/generate.py` formats all documents received by generation into the prompt context.
- `tests/unit/test_retriever.py` asserts hybrid RRF configuration, including `ranker_type="rrf"` and RRF parameter `k=100`.
- Important distinction to verify: RRF fuses dense/sparse rankings but is not automatically an independent semantic/cross-encoder reranker.
- Important distinction to verify: batch document grading may be a quality gate rather than per-document reranking/filtering.

## Visual Reference Verification
- Vision extraction confirmed the image's target chain: vector/BM25/hybrid retrieval; merge/dedup/metadata filter; reranker; threshold/token budget; then LLM.
- Reference starting K values are retrieval 50, rerank keep 10, final context 4-8.

## Final Evidence
- Active configuration: `.env` sets `RAG_PIPELINE=default`; a runtime probe resolved it to `rag.adaptive_graph.run_adaptive` with confidence threshold 0.75.
- Retrieval implementation: `rag/retriever.py:71-103` sets output `k`, Dense threshold 0.1, RRF fusion, and server scope expression.
- Online retrieval K: `rag/adaptive_graph.py:132-136` directly requests `k=4`.
- Relevance filtering: `rag/adaptive_graph.py:148-161` calls the batch LLM grader and retains only `score.relevant_ids`. It does not assign new relevance scores or sort the selected documents.
- Final context: `rag/generate.py:39-42` joins every surviving document with blank lines. No aggregate token count, truncation, final K, or context budget is applied here.
- Ingestion dedup is based on whole-document `source_hash`; this prevents unchanged re-uploads but is not retrieval-time candidate deduplication.
- Focused verification passed: 22 tests covering retriever configuration, adaptive decisions, service contract, and offline evaluation.
- Test gap: no direct production-node test asserts batch grading filters documents in `batch_grade_documents_node`; no test asserts a final-context K/token budget because the feature is absent.
