"""Typed records shared by chunking, retrieval and context assembly."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class SemanticChunk:
    chunk_id: str
    content: str
    metadata: dict = field(default_factory=dict)
    heading_path: str = ""
    sentence_start: int = 0
    sentence_end: int = 0
    previous_chunk_id: str | None = None
    next_chunk_id: str | None = None
    char_count: int = 0
    token_count: int = 0
    chunking_preset: str = "character"
    chunker_version: str = "semantic-v1"
    embedding_version: str = ""
