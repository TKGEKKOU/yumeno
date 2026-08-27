import pytest

from rag.retrieval_config import config_from_profile, resolve_retrieval_config, validate_retrieval_config


def test_named_profiles_resolve_without_model_call():
    assert config_from_profile("precise").retrieval_k == 12
    assert resolve_retrieval_config({"rag": {"profile": "deep"}}).evidence_token_budget == 4500


def test_custom_profile_accepts_user_k_values():
    config = validate_retrieval_config({"profile": "custom", "retrieval_k": 16, "rerank_k": 6, "final_context_k": 5, "evidence_token_budget": 3000, "allow_neighbors": False})
    assert config.profile == "custom"
    assert config.rerank_k == 6
    assert config.allow_neighbors is False


def test_custom_profile_rejects_invalid_order_and_budget():
    with pytest.raises(ValueError):
        validate_retrieval_config({"profile": "custom", "retrieval_k": 4, "rerank_k": 8})
    with pytest.raises(ValueError):
        validate_retrieval_config({"profile": "custom", "evidence_token_budget": 10})
