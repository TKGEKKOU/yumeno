from __future__ import annotations

from voice.gpt_sovits.synthesis import GPTSoVITSSynthesisService, SynthesizedSegment, split_text_for_delivery
from voice.tts.http_provider import TTSRequest, build_tts_provider


class AdaptiveTTSSynthesisService:
    """Selects the active TTS runtime once per request.

    GPT-SoVITS remains persona-voice aware; API TTS is a provider-level fallback
    and does not pretend to support a trained persona voice.
    """
    def __init__(self, gpt_service, settings_loader):
        self.gpt_service = gpt_service
        self.settings_loader = settings_loader
        self._provider = None
        self._provider_key = None

    def _api_provider(self):
        settings = self.settings_loader()
        key = (settings.tts_provider, settings.tts_api_key, settings.tts_base_url, settings.tts_model)
        if key != self._provider_key:
            if self._provider is not None:
                self._provider.close()
            self._provider = build_tts_provider(settings)
            self._provider_key = key
        return self._provider, settings

    def _segments(self, text: str, default_language: str | None):
        return split_text_for_delivery(text, default_language, max_chars=300)

    def synthesize_segments(self, asset, text: str, default_language: str | None = None) -> list[SynthesizedSegment]:
        provider, settings = self._api_provider()
        if provider is None:
            if asset is None:
                raise RuntimeError("当前 TTS 为 GPT-SoVITS，但角色未绑定可用音色")
            return self.gpt_service.synthesize_segments(asset, text, default_language)
        output = []
        for segment in self._segments(text, default_language):
            audio = provider.synthesize(TTSRequest(segment.text, settings.tts_model, settings.tts_voice))
            output.append(SynthesizedSegment(segment.text, segment.language, audio))
        return output

    def synthesize(self, asset, text: str, default_language: str | None = None) -> bytes:
        from voice.gpt_sovits.synthesis import merge_wavs
        return merge_wavs([item.audio for item in self.synthesize_segments(asset, text, default_language)])

    def close(self) -> None:
        if self._provider is not None:
            self._provider.close()
            self._provider = None

