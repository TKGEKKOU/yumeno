from __future__ import annotations

import asyncio
import base64
import subprocess
import tempfile
from pathlib import Path

import httpx
from voice.asr.base import STTConfigurationError, STTEmptyResultError, STTProvider, STTUpstreamError

class OpenAICompatibleSTT(STTProvider):
    """兼容 OpenAI Audio Transcriptions 的 STT 适配器。"""
    def __init__(self, api_key: str, base_url: str, model: str, timeout: float = 120) -> None:
        self.api_key, self.base_url, self.model = api_key.strip(), base_url.rstrip('/'), model.strip()
        self.timeout = timeout

    async def transcribe(self, filename: str, content_type: str, audio: bytes) -> str:
        if not self.api_key or not self.base_url or not self.model:
            raise STTConfigurationError("STT API 配置不完整")
        try:
            async with httpx.AsyncClient(timeout=self.timeout, trust_env=False) as client:
                response = await client.post(f"{self.base_url}/audio/transcriptions", headers={"Authorization": f"Bearer {self.api_key}"}, data={"model": self.model, "response_format": "json"}, files={"file": (Path(filename).name or "audio.webm", audio, content_type or "application/octet-stream")})
        except httpx.HTTPError as exc:
            raise STTUpstreamError("STT API 请求失败") from exc
        if not response.is_success:
            raise STTUpstreamError(f"STT API 返回 HTTP {response.status_code}")
        try:
            text = str(response.json().get("text", "")).strip()
        except (ValueError, AttributeError) as exc:
            raise STTUpstreamError("STT API 返回格式无效") from exc
        if not text:
            raise STTEmptyResultError("No speech was recognized")
        return text

class MiMoSTT(STTProvider):
    """MiMo STT 适配器。

    MiMo STT 使用 OpenAI-compatible Chat Completions 的音频内容格式，
    与 Whisper 的 multipart Audio Transcriptions 不是同一协议，因此单独适配。
    """

    def __init__(self, api_key: str, base_url: str, model: str, project_root: str | Path | None = None, timeout: float = 120) -> None:
        self.api_key = api_key.strip()
        self.base_url = base_url.rstrip("/")
        self.model = model.strip()
        self.project_root = Path(project_root) if project_root else None
        self.timeout = timeout

    def _convert_to_wav(self, filename: str, content_type: str, audio: bytes) -> tuple[bytes, str]:
        """MiMo 只接受 wav/mp3；浏览器录音常见的 webm/ogg 在本地转成 wav。"""
        if content_type in {"audio/wav", "audio/x-wav", "audio/mpeg"}:
            return audio, "audio/mpeg" if content_type == "audio/mpeg" else "audio/wav"
        try:
            from voice.clone_pipeline import find_ffmpeg
            if not self.project_root:
                raise STTConfigurationError("MiMo STT 处理浏览器音频需要项目 ffmpeg 资源")
            ffmpeg = find_ffmpeg(self.project_root)
        except STTConfigurationError:
            raise
        except Exception as exc:
            raise STTConfigurationError("MiMo STT 处理浏览器音频需要可用的 ffmpeg") from exc
        suffix = Path(filename).suffix or ".audio"
        with tempfile.TemporaryDirectory(prefix="yumeno-mimo-stt-") as temp_dir:
            source = Path(temp_dir) / f"input{suffix}"
            target = Path(temp_dir) / "output.wav"
            source.write_bytes(audio)
            command = [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", "-i", str(source), "-ac", "1", "-ar", "16000", str(target)]
            try:
                subprocess.run(command, check=True, capture_output=True, timeout=60)
            except (OSError, subprocess.SubprocessError) as exc:
                raise STTUpstreamError("MiMo STT 音频转换失败，请检查 ffmpeg") from exc
            if not target.is_file() or not target.stat().st_size:
                raise STTUpstreamError("MiMo STT 音频转换结果为空")
            return target.read_bytes(), "audio/wav"

    async def transcribe(self, filename: str, content_type: str, audio: bytes) -> str:
        if not self.api_key or not self.base_url or not self.model:
            raise STTConfigurationError("MiMo STT API 配置不完整")
        normalized_audio, normalized_type = await asyncio.to_thread(self._convert_to_wav, filename, content_type, audio)
        data_url = f"data:{normalized_type};base64,{base64.b64encode(normalized_audio).decode('ascii')}"
        model_is_asr = "asr" in self.model.lower()
        audio_part = {"type": "input_audio", "input_audio": {"data": data_url}}
        if model_is_asr:
            messages = [{"role": "user", "content": [audio_part]}]
        else:
            messages = [
                {"role": "system", "content": "You are a speech transcription assistant. Transcribe the spoken content exactly and return only the transcription text."},
                {"role": "user", "content": [audio_part, {"type": "text", "text": "Please transcribe the content of the audio and return only the transcription text."}]},
            ]
        try:
            async with httpx.AsyncClient(timeout=self.timeout, trust_env=False) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                    json={"model": self.model, "messages": messages, "max_completion_tokens": 1024},
                )
        except httpx.HTTPError as exc:
            raise STTUpstreamError("MiMo STT API 请求失败") from exc
        if not response.is_success:
            raise STTUpstreamError(f"MiMo STT API 返回 HTTP {response.status_code}")
        try:
            choice = (response.json().get("choices") or [{}])[0] or {}
            message = choice.get("message") or {}
            text = message.get("content") or message.get("reasoning_content") or ""
        except (ValueError, AttributeError, IndexError) as exc:
            raise STTUpstreamError("MiMo STT API 返回格式无效") from exc
        if not isinstance(text, str) or not text.strip():
            raise STTEmptyResultError("No speech was recognized")
        return text.strip()
