"""Deterministic post-retrieval candidate normalization and deduplication."""

from dataclasses import dataclass
import re
from typing import Any


@dataclass(frozen=True)
class Candidate:
    document: Any
    source_rank: int = 0
    source: str = "rrf"
    rrf_score: float | None = None


@dataclass(frozen=True)
class DedupResult:
    candidates: list[Candidate]
    exact_duplicate_count: int = 0
    near_duplicate_count: int = 0


def _text(candidate: Candidate) -> str:
    return str(getattr(candidate.document, "page_content", "") or "")


def _normalized(text: str) -> str:
    return re.sub(r"\s+", "", text).replace("，", ",").replace("。", ".").lower()


def _has_version_difference(left: str, right: str) -> bool:
    numbers_left = re.findall(r"\d+(?:\.\d+)?", left)
    numbers_right = re.findall(r"\d+(?:\.\d+)?", right)
    return numbers_left != numbers_right


def _cosine(left: list[float], right: list[float]) -> float:
    numerator = sum(a * b for a, b in zip(left, right))
    left_norm = sum(a * a for a in left) ** 0.5
    right_norm = sum(b * b for b in right) ** 0.5
    return numerator / (left_norm * right_norm) if left_norm and right_norm else 0.0


def deduplicate_candidates(candidates: list[Candidate], embedder: Any | None = None, similarity_threshold: float = 0.92) -> DedupResult:
    kept: list[Candidate] = []
    hashes: set[str] = set()
    text_hashes: set[str] = set()
    exact = 0
    near = 0
    for candidate in sorted(candidates, key=lambda item: item.source_rank):
        document = candidate.document
        metadata = getattr(document, "metadata", {}) or {}
        chunk_id = metadata.get("chunk_id")
        normalized = _normalized(_text(candidate))
        key = f"chunk:{chunk_id}" if chunk_id else f"text:{normalized}"
        if key in hashes or normalized in text_hashes:
            exact += 1
            continue
        hashes.add(key)
        text_hashes.add(normalized)
        kept.append(candidate)
    if embedder is None or len(kept) < 2 or not hasattr(embedder, "embed_documents"):
        return DedupResult(kept, exact, 0)
    vectors = embedder.embed_documents([_text(item) for item in kept])
    final: list[Candidate] = []
    final_vectors: list[list[float]] = []
    for candidate, vector in zip(kept, vectors):
        duplicate = False
        for prior, prior_vector in zip(final, final_vectors):
            if _has_version_difference(_text(candidate), _text(prior)):
                continue
            if _cosine(vector, prior_vector) >= similarity_threshold:
                duplicate = True
                near += 1
                break
        if not duplicate:
            final.append(candidate)
            final_vectors.append(vector)
    return DedupResult(final, exact, near)
