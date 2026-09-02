"""HTTP TTS runtimes inspired by AstrBot's provider adapters.

Adapters are intentionally YUMENO-native: they return WAV bytes so the existing
conversation/audio persistence pipeline can remain unchanged.
"""
from __future__ import annotations

import base64
import json
import io
import wave
from dataclasses import dataclass
from typing import Any

import httpx


class TTSProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class TTSRequest:
    text: str
    model: str
    voice: str


class BaseTTSProvider:
    def synthesize(self, request: TTSRequest) -> bytes:
        raise NotImplementedError

    def close(self) -> None:
        pass


def _ensure_wav(payload: bytes, provider: str) -> bytes:
    try:
        with wave.open(io.BytesIO(payload), "rb") as wav:
            if wav.getnframes() <= 0:
                raise ValueError("空 WAV")
    except (wave.Error, EOFError, ValueError) as exc:
        raise TTSProviderError(f"{provider} TTS 返回的不是有效 WAV；请将 response/audio format 设置为 wav") from exc
    return payload


def _error(response: httpx.Response, provider: str) -> TTSProviderError:
    body = response.text[:1000]
    return TTSProviderError(f"{provider} TTS 请求失败（HTTP {response.status_code}）：{body}")


class OpenAITTSProvider(BaseTTSProvider):
    def __init__(self, api_key: str, base_url: str, timeout: float = 60.0) -> None:
        if not api_key:
            raise TTSProviderError("OpenAI TTS 缺少 API Key")
        self.client = httpx.Client(base_url=base_url.rstrip("/"), timeout=timeout, follow_redirects=True)
        self.headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def synthesize(self, request: TTSRequest) -> bytes:
        response = self.client.post("/audio/speech", headers=self.headers, json={
            "model": request.model, "voice": request.voice, "input": request.text,
            "response_format": "wav",
        })
        if response.status_code >= 400:
            raise _error(response, "OpenAI-compatible")
        if not response.content:
            raise TTSProviderError("OpenAI-compatible TTS 返回空音频")
        return _ensure_wav(response.content, "OpenAI-compatible")

    def close(self) -> None:
        self.client.close()


class MiMoTTSProvider(BaseTTSProvider):
    def __init__(self, api_key: str, base_url: str, timeout: float = 60.0) -> None:
        if not api_key:
            raise TTSProviderError("MiMo TTS 缺少 API Key")
        self.client = httpx.Client(timeout=timeout, follow_redirects=True)
        self.url = base_url.rstrip("/") + "/chat/completions"
        self.headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def synthesize(self, request: TTSRequest) -> bytes:
        response = self.client.post(self.url, headers=self.headers, json={
            "model": request.model,
            "messages": [{"role": "assistant", "content": request.text}],
            "audio": {"format": "wav", "voice": request.voice},
        })
        if response.status_code >= 400:
            raise _error(response, "MiMo")
        try:
            data: dict[str, Any] = response.json()
            encoded = data["choices"][0]["message"]["audio"]["data"]
            return _ensure_wav(base64.b64decode(encoded), "MiMo")
        except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise TTSProviderError("MiMo TTS 响应中没有有效音频") from exc

    def close(self) -> None:
        self.client.close()


def build_tts_provider(settings) -> BaseTTSProvider | None:
    provider = (settings.tts_provider or "gsv_tts_local").strip().lower()
    if provider == "openai_tts":
        return OpenAITTSProvider(settings.tts_api_key, settings.tts_base_url or "https://api.openai.com/v1")
    if provider == "mimo_tts":
        return MiMoTTSProvider(settings.tts_api_key, settings.tts_base_url or "https://api.xiaomimimo.com/v1")
    return None
