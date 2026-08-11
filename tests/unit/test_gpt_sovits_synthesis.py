import io
import wave
import wave
from types import SimpleNamespace

from voice.gpt_sovits.synthesis import GPTSoVITSSynthesisService, split_text_for_delivery


def _wav_bytes(frame_count: int, frame_rate: int = 24000) -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(frame_rate)
        target.writeframes(b"\x00\x00" * frame_count)
    return output.getvalue()


def test_merge_wavs_accepts_same_format_with_different_durations():
    from voice.gpt_sovits.synthesis import merge_wavs

    merged = merge_wavs([_wav_bytes(120), _wav_bytes(240)])

    with wave.open(io.BytesIO(merged), "rb") as result:
        assert result.getframerate() == 24000
        assert result.getnframes() == 360


def wav_bytes(value: int = 0) -> bytes:
    stream = io.BytesIO()
    with wave.open(stream, "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(32000)
        output.writeframes(value.to_bytes(2, "little", signed=True))
    return stream.getvalue()


def fake_service():
    calls = []

    class Adapter:
        def synthesize(self, text, **kwargs):
            calls.append({"text": text, **kwargs})
            return wav_bytes(len(calls))

    return GPTSoVITSSynthesisService(Adapter()), calls


def asset(reference_language="ja"):
    return SimpleNamespace(
        reference_language=reference_language,
        gpt_weights_path="gpt.ckpt",
        sovits_weights_path="sovits.pth",
        refer_audio_path="reference.wav",
        dataset_dir=None,
        status="ready",
    )


def test_japanese_asset_reads_japanese_with_separate_languages():
    service, calls = fake_service()

    service.synthesize(asset(), "何の用かしら")

    assert calls[0]["prompt_lang"] == "ja"
    assert calls[0]["text_lang"] == "ja"


def test_japanese_asset_reads_chinese_without_changing_prompt_language():
    service, calls = fake_service()

    service.synthesize(asset(), "你好", default_language="zh")

    assert calls[0]["prompt_lang"] == "ja"
    assert calls[0]["text_lang"] == "zh"


def test_auto_language_uses_reference_language_for_ambiguous_han():
    service, calls = fake_service()

    service.synthesize(asset(), "何用")

    assert calls[0]["prompt_lang"] == "ja"
    assert calls[0]["text_lang"] == "ja"


def test_synthesis_merges_multiple_segments():
    service, calls = fake_service()

    audio = service.synthesize(asset(), "何の用かしら。你好", default_language="zh")

    assert len(calls) == 2
    with wave.open(io.BytesIO(audio), "rb") as output:
        assert output.getnframes() == 2


def test_delivery_splits_language_segment_at_punctuation_and_preserves_order():
    segments = split_text_for_delivery("第一句。第二句！\n第三句", "zh", max_chars=80)

    assert [(item.text, item.language) for item in segments] == [
        ("第一句。", "zh"),
        ("第二句！", "zh"),
        ("第三句", "zh"),
    ]
