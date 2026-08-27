from __future__ import annotations

import base64
import json
from pathlib import Path
from urllib.request import Request, urlopen


class VoiceRegistry:
    def __init__(self, path: Path):
        self.path = Path(path)

    def list(self) -> list[dict]:
        if not self.path.is_file():
            return []
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return []
        return data if isinstance(data, list) else []

    def get(self, voice_id: str) -> dict | None:
        return next((item for item in self.list() if item.get("voice_id") == voice_id), None)

    def upsert(self, voice: dict) -> dict:
        voice_id = str(voice.get("voice_id", "")).strip()
        if not voice_id:
            raise ValueError("voice_id 不能为空")
        rows = [item for item in self.list() if item.get("voice_id") != voice_id]
        item = {"backend": "gpt_sovits", "status": "ready", **voice, "voice_id": voice_id}
        rows.append(item)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
        return item


class GPTSoVITSClient:
    def __init__(self, api_base: str, registry: VoiceRegistry, timeout: int = 300):
        self.api_base = api_base.rstrip("/")
        self.registry = registry
        self.timeout = timeout

    def status(self) -> dict:
        try:
            request = Request(f"{self.api_base}/", method="GET")
            with urlopen(request, timeout=3) as response:
                return {"reachable": True, "http_status": response.status}
        except OSError as exc:
            return {"reachable": False, "error": str(exc)}

    def synthesize(self, text: str, voice_id: str) -> bytes:
        voice = self.registry.get(voice_id)
        if not voice:
            raise ValueError(f"音色不存在: {voice_id}")
        payload = {
            "text": text,
            "text_lang": voice.get("language", "zh"),
            "ref_audio_path": voice.get("reference_audio", ""),
            "prompt_lang": voice.get("reference_language", voice.get("language", "zh")),
            "prompt_text": voice.get("reference_text", ""),
            "media_type": "wav",
            "streaming_mode": False,
        }
        request = Request(
            f"{self.api_base}/tts",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request, timeout=self.timeout) as response:
            return response.read()

    @staticmethod
    def encode_audio(audio: bytes) -> str:
        return base64.b64encode(audio).decode("ascii")
