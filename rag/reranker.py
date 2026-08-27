"""Optional local reranker integration with deterministic RRF fallback."""

from dataclasses import dataclass
from typing import Protocol, Any

from rag.candidate_processing import Candidate


class Reranker(Protocol):
    def score_pairs(self, query: str, documents: list[str]) -> list[float]: ...


@dataclass(frozen=True)
class RankedCandidate:
    candidate: Candidate
    score: float
    rank: int
    fallback: bool = False


def rerank_candidates(query: str, candidates: list[Candidate], reranker: Reranker | None, keep: int) -> list[RankedCandidate]:
    if not candidates:
        return []
    try:
        if reranker is None:
            raise RuntimeError("reranker unavailable")
        scores = reranker.score_pairs(query, [getattr(item.document, "page_content", "") for item in candidates])
        if len(scores) != len(candidates):
            raise ValueError("reranker returned an unexpected score count")
        ordered = sorted(zip(candidates, scores), key=lambda pair: pair[1], reverse=True)
        return [RankedCandidate(candidate, float(score), index, False) for index, (candidate, score) in enumerate(ordered[:keep])]
    except Exception:
        return [RankedCandidate(candidate, float(-candidate.source_rank), index, True) for index, candidate in enumerate(candidates[:keep])]
