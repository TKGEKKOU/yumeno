"""Budgeted evidence selection for generation prompts."""

from dataclasses import dataclass
import re
from typing import Callable
from langchain_core.documents import Document

from rag.presets import RetrievalPreset
from rag.reranker import RankedCandidate


@dataclass(frozen=True)
class ContextAssembly:
    documents: list
    token_count: int
    main_hit_count: int
    neighbor_count: int
    truncated: bool


def _count(text: str, tokenizer: Callable[[str], int] | None) -> int:
    return max(1, int(tokenizer(text)) if tokenizer else max(1, len(text) // 2))


def _safe_prefix(text: str, budget: int, tokenizer: Callable[[str], int] | None) -> str:
    if _count(text, tokenizer) <= budget:
        return text
    pieces = re.split(r"(?<=[。！？!?；;])", text)
    result = ""
    for piece in pieces:
        if _count(result + piece, tokenizer) > budget:
            break
        result += piece
    return result or text[: max(1, budget * 2)]


def _metadata(document) -> dict:
    return dict(getattr(document, "metadata", {}) or {})


def _chunk_order(document) -> tuple:
    metadata = _metadata(document)
    chunk_id = str(metadata.get("chunk_id") or "")
    match = re.search(r":(\d+)$", chunk_id)
    return (int(match.group(1)) if match else 0, chunk_id)


def assemble_context(
    question: str,
    ranked_candidates: list[RankedCandidate],
    profile: RetrievalPreset,
    tokenizer: Callable[[str], int] | None = None,
    neighbor_loader: Callable[[list[str]], list] | None = None,
) -> ContextAssembly:
    del question
    main_ranked = ranked_candidates[: profile.final_context_k]
    main_ids = {str(_metadata(item.candidate.document).get("chunk_id") or "") for item in main_ranked}
    neighbors_by_id = {}
    if profile.allow_neighbors and neighbor_loader:
        neighbor_ids = []
        for ranked in main_ranked:
            metadata = _metadata(ranked.candidate.document)
            for key in ("previous_chunk_id", "next_chunk_id"):
                value = str(metadata.get(key) or "")
                if value and value not in main_ids:
                    neighbor_ids.append(value)
            chunk_id = str(metadata.get("chunk_id") or "")
            match = re.match(r"^(.*:)(\d+)$", chunk_id)
            if match:
                prefix, number = match.groups()
                width = len(number)
                current = int(number)
                if current > 0:
                    neighbor_ids.append(f"{prefix}{current - 1:0{width}d}")
                neighbor_ids.append(f"{prefix}{current + 1:0{width}d}")
        for document in neighbor_loader(list(dict.fromkeys(neighbor_ids))):
            metadata = _metadata(document)
            chunk_id = str(metadata.get("chunk_id") or "")
            if chunk_id and chunk_id not in main_ids:
                neighbors_by_id[chunk_id] = Document(
                    page_content=str(getattr(document, "page_content", "") or ""),
                    metadata={**metadata, "supporting_neighbor": True, "evidence_role": "supporting_neighbor"},
                )

    document_groups: dict[str, dict] = {}
    for ranked in main_ranked:
        document = ranked.candidate.document
        metadata = _metadata(document)
        document_id = str(metadata.get("document_id") or metadata.get("doc_id") or metadata.get("source") or "")
        group = document_groups.setdefault(document_id, {"score": ranked.score, "documents": []})
        group["score"] = max(group["score"], ranked.score)
        group["documents"].append(document)
        for neighbor_id in (metadata.get("previous_chunk_id"), metadata.get("next_chunk_id")):
            if neighbor_id in neighbors_by_id:
                group["documents"].append(neighbors_by_id[neighbor_id])
        chunk_id = str(metadata.get("chunk_id") or "")
        match = re.match(r"^(.*:)(\d+)$", chunk_id)
        if match:
            prefix, number = match.groups()
            width, current = len(number), int(number)
            inferred = ([f"{prefix}{current - 1:0{width}d}"] if current > 0 else []) + [f"{prefix}{current + 1:0{width}d}"]
            for neighbor_id in inferred:
                if neighbor_id in neighbors_by_id:
                    group["documents"].append(neighbors_by_id[neighbor_id])

    ordered = []
    for group in sorted(document_groups.values(), key=lambda item: item["score"], reverse=True):
        unique = {str(_metadata(doc).get("chunk_id") or id(doc)): doc for doc in group["documents"]}
        ordered.extend(sorted(unique.values(), key=_chunk_order))

    selected = []
    total = 0
    truncated = False
    seen = set()
    neighbor_count = 0
    main_hit_count = 0
    for document in ordered:
        content = str(getattr(document, "page_content", "") or "")
        key = re.sub(r"\s+", "", content)
        if not content or key in seen:
            continue
        remaining = profile.evidence_token_budget - total
        if remaining <= 0:
            break
        bounded = _safe_prefix(content, remaining, tokenizer)
        used = _count(bounded, tokenizer)
        if used > remaining:
            break
        if bounded != content:
            truncated = True
        selected.append(
            document
            if bounded == content
            else Document(page_content=bounded, metadata=_metadata(document))
        )
        if _metadata(document).get("supporting_neighbor"):
            neighbor_count += 1
        else:
            main_hit_count += 1
        seen.add(key)
        total += used
    return ContextAssembly(selected, total, main_hit_count, neighbor_count, truncated)
