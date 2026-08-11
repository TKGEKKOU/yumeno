import io
import re
import wave
from dataclasses import dataclass
from pathlib import Path

from voice.gpt_sovits.language import (
    TextSegment,
    normalize_language,
    split_text_by_language,
)


class SynthesisAssetInvalid(ValueError):
    pass


@dataclass(frozen=True)
class SynthesizedSegment:
    text: str
    language: str
    audio: bytes


def split_text_for_delivery(
    text: str,
    default_language: str | None = None,
    max_chars: int = 80,
) -> list[TextSegment]:
    """Split TTS text into ordered, message-sized segments for IM delivery."""

    if max_chars < 1:
        raise ValueError("max_chars must be positive")
    result: list[TextSegment] = []
    for language_segment in split_text_by_language(text, default_language):
        pieces = re.split(r"(?<=[。！？!?；;：:\n])", language_segment.text)
        for piece in pieces:
            piece = piece.strip()
            while len(piece) > max_chars:
                result.append(TextSegment(piece[:max_chars], language_segment.language))
                piece = piece[max_chars:].lstrip()
            if piece:
                result.append(TextSegment(piece, language_segment.language))
    return result


def _reference_prompt(asset) -> tuple[str, str]:
    refer = str(getattr(asset, "refer_audio_path", None) or "")
    dataset_dir = getattr(asset, "dataset_dir", None)
    if not refer or not dataset_dir:
        return refer, ""
    list_files = sorted(Path(dataset_dir).glob("*.list"))
    if not list_files:
        return refer, ""
    name = Path(refer).name
    for line in list_files[0].read_text(encoding="utf-8").splitlines():
        parts = line.split("|", 3)
        if len(parts) == 4 and Path(parts[0]).name == name:
            return refer, parts[3].strip()
    return refer, ""


def merge_wavs(parts: list[bytes]) -> bytes:
    if not parts:
        raise ValueError("没有可合并的音频片段")
    output = io.BytesIO()
    with wave.open(output, "wb") as target:
        params = None
        for payload in parts:
            with wave.open(io.BytesIO(payload), "rb") as source:
                current = source.getparams()
                if params is None:
                    params = current
                    target.setparams(current)
                elif (
                    current.nchannels,
                    current.sampwidth,
                    current.framerate,
                    current.comptype,
                ) != (
                    params.nchannels,
                    params.sampwidth,
                    params.framerate,
                    params.comptype,
                ):
                    raise ValueError("音频片段格式不一致")
                target.writeframes(source.readframes(source.getnframes()))
    return output.getvalue()


class GPTSoVITSSynthesisService:
    def __init__(self, adapter) -> None:
        self.adapter = adapter

    def _validate_asset(self, asset) -> str:
        if getattr(asset, "status", "") == "needs_retraining":
            raise SynthesisAssetInvalid("该音色训练标注无效，需要重新训练")
        reference_language = getattr(asset, "reference_language", None)
        if not reference_language:
            raise SynthesisAssetInvalid("音色缺少参考语言，请重新导入或训练")
        if not getattr(asset, "gpt_weights_path", None) or not getattr(asset, "sovits_weights_path", None):
            raise SynthesisAssetInvalid("音色模型尚未完成")
        return normalize_language(reference_language)

    def iter_synthesize_segments(
        self,
        asset,
        text: str,
        default_language: str | None = None,
    ):
        reference_language = self._validate_asset(asset)
        refer_audio, prompt_text = _reference_prompt(asset)
        language_hint = (
            reference_language
            if default_language in {None, "auto"}
            else default_language
        )
        for segment in split_text_for_delivery(text, language_hint):
            audio = self.adapter.synthesize(
                segment.text,
                text_lang=segment.language,
                gpt_weights=asset.gpt_weights_path,
                sovits_weights=asset.sovits_weights_path,
                refer_audio=refer_audio,
                prompt_text=prompt_text,
                prompt_lang=reference_language,
            )
            yield SynthesizedSegment(segment.text, segment.language, audio)

    def synthesize_segments(
        self,
        asset,
        text: str,
        default_language: str | None = None,
    ) -> list[SynthesizedSegment]:
        return list(self.iter_synthesize_segments(asset, text, default_language))

    def synthesize(self, asset, text: str, default_language: str | None = None) -> bytes:
        return merge_wavs(
            [item.audio for item in self.synthesize_segments(asset, text, default_language)]
        )
