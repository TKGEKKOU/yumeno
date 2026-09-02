import base64
import json
import httpx
import io
import wave

def valid_wav():
    out=io.BytesIO()
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000); w.writeframes(b"\x00\x00"*160)
    return out.getvalue()

from voice.tts.http_provider import MiMoTTSProvider, OpenAITTSProvider, TTSRequest

def test_openai_tts_payload_and_bytes(monkeypatch):
    seen = {}
    def handler(request):
        seen.update(request=json.loads(request.content))
        return httpx.Response(200, content=valid_wav(), request=request)
    transport = httpx.MockTransport(handler)
    provider = OpenAITTSProvider("key", "https://example.test/v1")
    provider.client.close()
    provider.client = httpx.Client(base_url="https://example.test/v1", transport=transport)
    assert provider.synthesize(TTSRequest("你好", "tts-1", "alloy")) == valid_wav()
    assert seen["request"]["response_format"] == "wav"
    provider.close()

def test_mimo_tts_decodes_audio(monkeypatch):
    encoded = base64.b64encode(valid_wav()).decode()
    transport = httpx.MockTransport(lambda request: httpx.Response(200, json={"choices":[{"message":{"audio":{"data":encoded}}}]}))
    provider = MiMoTTSProvider("key", "https://example.test/v1")
    provider.client.close()
    provider.client = httpx.Client(transport=transport)
    assert provider.synthesize(TTSRequest("你好", "mimo-v2.5-tts", "mimo_default")) == valid_wav()
    provider.close()



