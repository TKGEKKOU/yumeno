import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, patch

from voice.asr.http_provider import MiMoSTT, OpenAICompatibleSTT


def test_openai_compatible_stt_sends_multipart_and_reads_text():
    response = type("Response", (), {"is_success": True, "json": lambda self: {"text": "你好"}})()
    client = AsyncMock()
    client.post.return_value = response
    manager = AsyncMock()
    manager.__aenter__.return_value = client
    manager.__aexit__.return_value = False
    with patch("voice.asr.http_provider.httpx.AsyncClient", return_value=manager):
        result = asyncio.run(OpenAICompatibleSTT("key", "http://stt/v1", "whisper-1").transcribe("a.wav", "audio/wav", b"audio"))
    assert result == "你好"
    kwargs = client.post.call_args.kwargs
    assert kwargs["data"]["model"] == "whisper-1"
    assert kwargs["files"]["file"][0] == "a.wav"
    assert client.post.call_args.args[0] == "http://stt/v1/audio/transcriptions"


def test_mimo_stt_uses_chat_completions_audio_payload():
    response = type("Response", (), {"is_success": True, "json": lambda self: {"choices": [{"message": {"content": "你好 MiMo"}}]}})()
    client = AsyncMock()
    client.post.return_value = response
    manager = AsyncMock()
    manager.__aenter__.return_value = client
    manager.__aexit__.return_value = False
    with patch("voice.asr.http_provider.httpx.AsyncClient", return_value=manager):
        result = asyncio.run(MiMoSTT("key", "https://api.xiaomimimo.com/v1", "mimo-v2.5-asr").transcribe("a.wav", "audio/wav", b"RIFFWAVE"))
    assert result == "你好 MiMo"
    kwargs = client.post.call_args.kwargs
    assert client.post.call_args.args[0] == "https://api.xiaomimimo.com/v1/chat/completions"
    assert kwargs["json"]["model"] == "mimo-v2.5-asr"
    assert kwargs["json"]["messages"][0]["content"][0]["type"] == "input_audio"
    assert kwargs["json"]["messages"][0]["content"][0]["input_audio"]["data"].startswith("data:audio/wav;base64,")
