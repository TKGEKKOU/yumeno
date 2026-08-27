"""Versioned configuration for chunking and retrieval profiles."""

from dataclasses import dataclass
from typing import Literal


ChunkingPresetName = Literal["character", "knowledge_base"]
RetrievalPresetName = Literal["precise", "deep"]


@dataclass(frozen=True)
class ChunkingPreset:
    name: ChunkingPresetName
    semantic_unit_min_chars: int
    semantic_unit_max_chars: int
    target_chunk_chars: int
    min_chunk_chars: int
    max_chunk_chars: int
    semantic_window_units: int
    breakpoint_percentile: int
    fixed_overlap: int
    preserve_neighbors: bool
    respect_headings: bool = False
    semantic_split_long_sections: bool = True

    def __post_init__(self) -> None:
        if not 0 <= self.fixed_overlap <= self.max_chunk_chars:
            raise ValueError("fixed_overlap must be within max_chunk_chars")
        if not self.min_chunk_chars <= self.target_chunk_chars <= self.max_chunk_chars:
            raise ValueError("chunk lengths must satisfy min <= target <= max")
        if not 0 < self.breakpoint_percentile <= 100:
            raise ValueError("breakpoint_percentile must be in (0, 100]")


@dataclass(frozen=True)
class RetrievalPreset:
    name: RetrievalPresetName
    retrieval_k: int
    rerank_k: int
    final_context_k: int
    evidence_token_budget: int
    allow_neighbors: bool

    def __post_init__(self) -> None:
        if not 1 <= self.rerank_k <= self.retrieval_k:
            raise ValueError("rerank_k must be between 1 and retrieval_k")
        if not 1 <= self.final_context_k:
            raise ValueError("final_context_k must be positive")
        if not 1 <= self.evidence_token_budget:
            raise ValueError("evidence_token_budget must be positive")


_CHUNKING_PRESETS = {
    "character": ChunkingPreset(
        name="character", semantic_unit_min_chars=80, semantic_unit_max_chars=150,
        target_chunk_chars=650, min_chunk_chars=200, max_chunk_chars=1100,
        semantic_window_units=3, breakpoint_percentile=18, fixed_overlap=0,
        preserve_neighbors=True,
    ),
    "knowledge_base": ChunkingPreset(
        name="knowledge_base", semantic_unit_min_chars=60, semantic_unit_max_chars=140,
        target_chunk_chars=500, min_chunk_chars=150, max_chunk_chars=900,
        semantic_window_units=3, breakpoint_percentile=20, fixed_overlap=0,
        preserve_neighbors=True, respect_headings=True,
    ),
}

_RETRIEVAL_PRESETS = {
    "precise": RetrievalPreset("precise", 12, 5, 4, 2200, False),
    "deep": RetrievalPreset("deep", 20, 8, 8, 4500, True),
}


def get_chunking_preset(name: str) -> ChunkingPreset:
    try:
        return _CHUNKING_PRESETS[name]
    except KeyError as exc:
        raise ValueError(f"Unsupported chunking preset: {name}") from exc


def get_retrieval_preset(name: str) -> RetrievalPreset:
    try:
        return _RETRIEVAL_PRESETS[name]
    except KeyError as exc:
        raise ValueError(f"Unsupported retrieval preset: {name}") from exc
