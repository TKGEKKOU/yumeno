import asyncio
from pathlib import Path
from types import SimpleNamespace

from integrations.onebot11.router import ImMessageRouter


def test_voice_reply_sends_each_synthesized_segment_in_order(tmp_path: Path, monkeypatch):
    sent: list[str] = []
    text_replies: list[str] = []

    class Tts:
        def iter_synthesize_segments(self, asset, text, default_language=None):
            yield SimpleNamespace(audio=b"first")
            assert len(sent) == 1
            yield SimpleNamespace(audio=b"second")

    class Session:
        def __enter__(self):
            return self
        def __exit__(self, *args):
            return False

    router = ImMessageRouter(None, lambda: Session(), tmp_path / "bindings.json", tmp_path / "integrations.json", tts_synthesis=Tts())
    monkeypatch.setattr(router, "_config", lambda: {"auto_voice_reply": True, "voice_only": True})
    monkeypatch.setattr(router, "_persona_for", lambda event: "persona-1")
    monkeypatch.setattr("app.routers.personas.local_persona_or_404", lambda session, persona_id: SimpleNamespace())
    monkeypatch.setattr("integrations.onebot11.router.persona_voice_asset", lambda persona, session: object())
    monkeypatch.setattr("integrations.onebot11.router.persona_output_language", lambda persona: "ja")
    monkeypatch.setattr("integrations.onebot11.router.Settings.load", lambda: SimpleNamespace(project_root=tmp_path))

    async def no_cleanup(path):
        return None
    monkeypatch.setattr(router, "_remove_later", no_cleanup)
    event = SimpleNamespace(reply=lambda text: text_replies.append(text), reply_record=lambda path: sent.append(path))

    asyncio.run(router._reply(event, "第一句。第二句"))

    assert [Path(path).read_bytes() for path in sent] == [b"first", b"second"]
    assert text_replies == []
