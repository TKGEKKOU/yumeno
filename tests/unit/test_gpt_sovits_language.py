import pytest

from voice.gpt_sovits.language import (
    LanguageUncertain,
    TextSegment,
    TrainingRow,
    split_text_by_language,
    validate_training_rows,
)


def test_japanese_kana_forces_ja():
    assert split_text_by_language("何の用かしら", None) == [TextSegment("何の用かしら", "ja")]


def test_japanese_reference_can_emit_chinese_segment():
    assert split_text_by_language("你好，今天见。", "zh") == [TextSegment("你好，今天见。", "zh")]


def test_ambiguous_han_requires_default():
    with pytest.raises(LanguageUncertain):
        split_text_by_language("何用", None)


def test_han_only_sentence_inherits_japanese_from_nearby_kana():
    assert split_text_by_language("今日は晴れ。東京最高。", None) == [
        TextSegment("今日は晴れ。東京最高。", "ja")
    ]


def test_rejects_mojibake_japanese_training_text():
    rows = [TrainingRow("001.wav", "asset", "JA", "銇傘倢銇屻仺")]
    assert "疑似乱码" in validate_training_rows(rows, "ja")[0]


def test_rejects_wrong_language_tag_for_japanese():
    rows = [TrainingRow("001.wav", "asset", "ZH", "何の用かしら")]
    assert "语言标签" in validate_training_rows(rows, "ja")[0]
