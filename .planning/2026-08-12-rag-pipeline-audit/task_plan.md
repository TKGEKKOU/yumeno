# RAG Pipeline Audit

## Goal
Verify from the current source and tests whether the project has initial retrieval, candidate merge/dedup/filter, reranking, and final-context assembly before LLM generation.

## Scope
- Read-only analysis of the current implementation and tests.
- Treat the user's "重拍" as the likely typo "重排 (rerank)".
- Distinguish implemented behavior, configuration-dependent behavior, and missing behavior.

## Phases
- [complete] Phase 1: Map entry points, modules, and configuration.
- [complete] Phase 2: Trace retrieval and candidate processing.
- [complete] Phase 3: Trace reranking and final-context assembly.
- [complete] Phase 4: Verify with focused tests/probes and report evidence.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---:|---|
| Parallel discovery batch timed out due to recursive PowerShell scan | 1 | Split commands and use targeted `rg` searches. |
| Existing RAG planning directories did not contain standard plan files | 1 | Treat them as empty/migrated artifacts and rely on current source. |
| Evidence `rg` command had a PowerShell/regex escaping error | 1 | Replaced it with fixed-string/line-range reads and reran verification. |

## Final Assessment
- Initial retrieval: present, using Dense HNSW + BM25 sparse retrieval with RRF fusion and server-side scope metadata filtering.
- Candidate deduplication: no explicit online content/chunk dedup stage found. RRF may fuse identical hits from its two channels, while ingestion deduplicates unchanged documents by source hash; neither is a general post-retrieval dedup stage.
- Reranking: no independent cross-encoder/semantic reranker. Adaptive mode has an LLM batch relevance filter that preserves original candidate order through `relevant_ids`.
- Final context: present as concatenation of all documents surviving the relevance filter, but there is no explicit final-context K or aggregate token budget/truncation.
- Staged K: absent. Current local retrieval directly returns 4 candidates; the adaptive filter can reduce that to 0-4.
- Active pipeline: `.env` uses `RAG_PIPELINE=default`, resolved at runtime to `rag.adaptive_graph.run_adaptive`.
