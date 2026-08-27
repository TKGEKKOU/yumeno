import pytest

from rag.presets import get_chunking_preset, get_retrieval_preset


def test_character_preset_has_zero_overlap_and_650_target():
    preset = get_chunking_preset("character")
    assert preset.target_chunk_chars == 650
    assert preset.fixed_overlap == 0


def test_precise_and_deep_have_distinct_budgets():
    assert get_retrieval_preset("precise").retrieval_k == 12
    assert get_retrieval_preset("deep").retrieval_k == 20
    assert get_retrieval_preset("precise").evidence_token_budget < get_retrieval_preset("deep").evidence_token_budget


def test_unknown_preset_is_rejected():
    with pytest.raises(ValueError):
        get_retrieval_preset("unknown")
