"""Semantic, structure-aware chunking for narrative text and Markdown."""

from __future__ import annotations

import hashlib
import re
from dataclasses import replace
from typing import Any

from langchain_core.documents import Document

from rag.pipeline_types import SemanticChunk
from rag.presets import ChunkingPreset, get_chunking_preset


_SENTENCE_RE = re.compile(r".*?(?:[。！？!?；;]|……|$)", re.S)
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def _sentences(text: str) -> list[str]:
    """Split mostly-continuous Chinese text without splitting inside quotes/brackets."""
    result: list[str] = []
    start = 0
    quote_pairs = {"“": "”", "‘": "’", "（": "）", "(": ")", "[": "]", "【": "】"}
    stack: list[str] = []
    for index, char in enumerate(text):
        if char in quote_pairs:
            stack.append(quote_pairs[char])
        elif stack and char == stack[-1]:
            stack.pop()
        if char in "。！？!?；;" and not stack:
            value = text[start : index + 1].strip()
            if value:
                result.append(value)
            start = index + 1
    tail = text[start:].strip()
    if tail:
        result.append(tail)
    return result


def _aggregate_units(sentences: list[str], preset: ChunkingPreset) -> list[str]:
    units: list[str] = []
    current = ""
    for sentence in sentences:
        candidate = f"{current}{sentence}"
        if current and len(candidate) > preset.semantic_unit_max_chars:
            units.append(current)
            current = sentence
        else:
            current = candidate
        if len(current) >= preset.semantic_unit_min_chars:
            units.append(current)
            current = ""
    if current:
        if units and len(current) < preset.semantic_unit_min_chars:
            units[-1] += current
        else:
            units.append(current)
    return units


def _similarity(left: list[float], right: list[float]) -> float:
    if not left or not right:
        return 0.0
    numerator = sum(a * b for a, b in zip(left, right))
    left_norm = sum(a * a for a in left) ** 0.5
    right_norm = sum(b * b for b in right) ** 0.5
    return numerator / (left_norm * right_norm) if left_norm and right_norm else 0.0


def _breakpoints(units: list[str], preset: ChunkingPreset, embedder: Any | None) -> set[int]:
    if len(units) < 2 or embedder is None or not hasattr(embedder, "embed_documents"):
        return set()
    vectors = embedder.embed_documents(units)
    scores = [_similarity(vectors[i - 1], vectors[i]) for i in range(1, len(vectors))]
    if not scores:
        return set()
    ordered = sorted(scores)
    index = min(len(ordered) - 1, max(0, int(len(ordered) * preset.breakpoint_percentile / 100)))
    threshold = ordered[index]
    return {i for i, score in enumerate(scores, start=1) if score <= threshold}


def _make_chunks(units: list[str], preset: ChunkingPreset, metadata: dict, heading_path: str, embedder: Any | None) -> list[SemanticChunk]:
    breaks = _breakpoints(units, preset, embedder)
    groups: list[str] = []
    current = ""
    for index, unit in enumerate(units):
        candidate = f"{current}{unit}"
        forced = len(candidate) > preset.max_chunk_chars and current
        semantic_break = index in breaks and len(current) >= preset.min_chunk_chars
        if current and (forced or semantic_break or len(candidate) > preset.target_chunk_chars):
            groups.append(current)
            current = unit
        else:
            current = candidate
    if current:
        groups.append(current)
    chunks: list[SemanticChunk] = []
    for index, content in enumerate(groups):
        chunk_id = f"{metadata.get('document_id', 'document')}:{index:04d}"
        chunks.append(SemanticChunk(
            chunk_id=chunk_id,
            content=content,
            metadata={**metadata, "chunk_id": chunk_id, "heading_path": heading_path},
            heading_path=heading_path,
            sentence_start=0,
            sentence_end=max(0, len(content)),
            char_count=len(content),
            token_count=max(1, len(content) // 2),
            chunking_preset=preset.name,
        ))
    return [replace(chunk, previous_chunk_id=chunks[i - 1].chunk_id if i else None, next_chunk_id=chunks[i + 1].chunk_id if i + 1 < len(chunks) else None) for i, chunk in enumerate(chunks)]


def split_text_semantically(text: str, preset: ChunkingPreset, embedder: Any | None = None, metadata: dict | None = None) -> list[SemanticChunk]:
    units = _aggregate_units(_sentences(text), preset)
    return _make_chunks(units, preset, metadata or {}, "", embedder)


def split_markdown_semantically(text: str, preset: ChunkingPreset, embedder: Any | None = None, metadata: dict | None = None) -> list[SemanticChunk]:
    metadata = metadata or {}
    sections: list[tuple[str, str]] = []
    path: list[str] = []
    body: list[str] = []
    current_path = ""
    for line in text.splitlines():
        match = _HEADING_RE.match(line)
        if match:
            if body:
                sections.append((current_path, "\n".join(body)))
                body = []
            level = len(match.group(1))
            path = path[: level - 1] + [match.group(2).strip()]
            current_path = " > ".join(path)
        else:
            body.append(line)
    if body:
        sections.append((current_path, "\n".join(body)))
    output: list[SemanticChunk] = []
    for heading_path, section in sections:
        section_units = _aggregate_units(_sentences(section), preset)
        output.extend(_make_chunks(section_units, preset, metadata, heading_path, embedder))
    # IDs must be unique across Markdown sections; preserve neighbor links globally.
    normalized: list[SemanticChunk] = []
    for index, chunk in enumerate(output):
        chunk_id = f"{metadata.get('document_id', 'document')}:{index:04d}"
        normalized.append(replace(chunk, chunk_id=chunk_id, previous_chunk_id=None, next_chunk_id=None, metadata={**chunk.metadata, "chunk_id": chunk_id}))
    return [replace(chunk, previous_chunk_id=normalized[i - 1].chunk_id if i else None, next_chunk_id=normalized[i + 1].chunk_id if i + 1 < len(normalized) else None) for i, chunk in enumerate(normalized)]


def build_chunks(text: str, preset_name: str, embedder: Any | None = None, metadata: dict | None = None) -> list[SemanticChunk]:
    preset = get_chunking_preset(preset_name)
    if preset.respect_headings or re.search(r"(?m)^#{1,6}\s+", text):
        return split_markdown_semantically(text, preset, embedder, metadata)
    return split_text_semantically(text, preset, embedder, metadata)


def chunks_to_documents(chunks: list[SemanticChunk]) -> list[Document]:
    return [Document(page_content=chunk.content, metadata={**chunk.metadata, "previous_chunk_id": chunk.previous_chunk_id, "next_chunk_id": chunk.next_chunk_id, "token_count": chunk.token_count, "chunking_preset": chunk.chunking_preset, "chunker_version": chunk.chunker_version}) for chunk in chunks]
