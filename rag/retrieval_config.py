"""Role-scoped retrieval configuration; no query-time model routing."""

from dataclasses import asdict, dataclass

from rag.presets import get_retrieval_preset


@dataclass(frozen=True)
class RetrievalConfig:
    profile: str = "deep"
    retrieval_k: int = 20
    rerank_k: int = 8
    final_context_k: int = 8
    evidence_token_budget: int = 4500
    allow_neighbors: bool = True

    def __post_init__(self):
        if self.profile not in {"precise", "deep", "custom"}:
            raise ValueError("profile must be precise, deep, or custom")
        if not 1 <= self.rerank_k <= self.retrieval_k <= 100:
            raise ValueError("retrieval_k/rerank_k must satisfy 1 <= rerank_k <= retrieval_k <= 100")
        if not 1 <= self.final_context_k <= 30:
            raise ValueError("final_context_k must be between 1 and 30")
        if not 256 <= self.evidence_token_budget <= 20000:
            raise ValueError("evidence_token_budget must be between 256 and 20000")


def config_from_profile(profile: str) -> RetrievalConfig:
    preset = get_retrieval_preset(profile)
    return RetrievalConfig(
        profile=profile,
        retrieval_k=preset.retrieval_k,
        rerank_k=preset.rerank_k,
        final_context_k=preset.final_context_k,
        evidence_token_budget=preset.evidence_token_budget,
        allow_neighbors=preset.allow_neighbors,
    )


def validate_retrieval_config(payload: dict | None) -> RetrievalConfig:
    values = dict(payload or {})
    profile = str(values.get("profile") or "deep")
    if profile in {"precise", "deep"} and not any(key in values for key in ("retrieval_k", "rerank_k", "final_context_k", "evidence_token_budget", "allow_neighbors")):
        return config_from_profile(profile)
    if profile in {"precise", "deep"}:
        base = asdict(config_from_profile(profile))
        base.update({key: values[key] for key in base if key in values})
        base["profile"] = "custom"
        values = base
    return RetrievalConfig(
        profile=profile,
        retrieval_k=int(values.get("retrieval_k", 20)),
        rerank_k=int(values.get("rerank_k", 8)),
        final_context_k=int(values.get("final_context_k", 8)),
        evidence_token_budget=int(values.get("evidence_token_budget", 4500)),
        allow_neighbors=bool(values.get("allow_neighbors", True)),
    )


def resolve_retrieval_config(persona_profile: dict | None) -> RetrievalConfig:
    return validate_retrieval_config((persona_profile or {}).get("rag"))
