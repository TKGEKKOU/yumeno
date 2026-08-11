from pathlib import Path

from voice.gpt_sovits.config import GPTSoVITSConfig


def test_voice_asset_crud(client, tmp_path):
    from app.models import VoiceAsset

    headers = {"X-YUMENO-Request": "web"}

    created = client.post("/api/voice-assets", json={"name": "测试音色"}, headers=headers)
    assert created.status_code == 201
    asset_id = created.json()["id"]
    assert created.json()["status"] == "created"

    listed = client.get("/api/voice-assets")
    assert listed.status_code == 200
    assert any(item["id"] == asset_id for item in listed.json()["items"])

    updated = client.patch(
        f"/api/voice-assets/{asset_id}",
        json={"gpt_weights_path": "D:/x.ckpt", "sovits_weights_path": "D:/x.pth"},
        headers=headers,
    )
    assert updated.json()["gpt_weights_path"] == "D:/x.ckpt"

    deleted = client.delete(f"/api/voice-assets/{asset_id}", headers=headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/voice-assets/{asset_id}").status_code == 404


def test_voice_asset_import_scans_directory(client, tmp_path):
    from app.models import VoiceAsset

    model_dir = tmp_path / "models"
    char = model_dir / "角色A"
    char.mkdir(parents=True)
    (char / "角色A.ckpt").write_bytes(b"g")
    (char / "角色A.pth").write_bytes(b"s")
    (char / "ref.wav").write_bytes(b"w")
    client.app.state.gpt_sovits_config = GPTSoVITSConfig(tmp_path)

    response = client.post(
        "/api/voice-assets/import",
        json={"directory": str(model_dir), "reference_language": "ja"},
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    items = response.json()["imported"]
    assert len(items) == 1
    assert items[0]["status"] == "ready"
    assert items[0]["reference_language"] == "ja"
    assert items[0]["refer_audio_path"].endswith("ref.wav")


def test_voice_asset_preview_uses_multilingual_synthesis_service(client, db_session):
    from app.models import VoiceAsset

    asset = VoiceAsset(
        name="日语音色",
        workspace_id="local",
        status="ready",
        reference_language="ja",
        gpt_weights_path="gpt.ckpt",
        sovits_weights_path="sovits.pth",
    )
    db_session.add(asset)
    db_session.commit()
    calls = []

    class FakeSynthesis:
        def synthesize(self, received_asset, text, default_language=None):
            calls.append((received_asset.id, text, default_language))
            return b"wav"

    client.app.state.tts_synthesis = FakeSynthesis()
    response = client.post(
        f"/api/voice-assets/{asset.id}/synthesize",
        json={"text": "你好。何の用かしら", "text_lang": "auto"},
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    assert response.content == b"wav"
    assert calls == [(asset.id, "你好。何の用かしら", None)]


def test_gpt_sovits_status_reports_config(client, tmp_path):
    config = GPTSoVITSConfig(tmp_path)
    client.app.state.gpt_sovits_config = config
    from voice.gpt_sovits.adapter import GPTSoVITSAdapter

    client.app.state.gpt_sovits = GPTSoVITSAdapter(config, tmp_path)

    response = client.get("/api/gpt-sovits/status")

    assert response.status_code == 200
    assert response.json()["configured"] is False
    assert response.json()["installed"] is False


def test_existing_invalid_asset_can_be_retrained_with_language(client, db_session, tmp_path):
    from app.models import VoiceAsset

    asset = VoiceAsset(
        name="需要重训",
        workspace_id="local",
        status="needs_retraining",
        error_message="旧标注错误",
    )
    db_session.add(asset)
    db_session.commit()
    calls = []

    class FakeTraining:
        def dataset_dir(self, asset_id):
            path = tmp_path / asset_id / "dataset"
            path.mkdir(parents=True, exist_ok=True)
            return path

        def prepare_dataset(self, asset_id, paths, language):
            calls.append(("prepare", asset_id, language, len(paths)))

        def label_with_asr(self, asset_id, language):
            calls.append(("label", asset_id, language))

        def start_training(self, asset_id, expected_language=None):
            calls.append(("start", asset_id, expected_language))
            return True

    client.app.state.gpt_sovits_training = FakeTraining()
    response = client.post(
        f"/api/voice-assets/{asset.id}/train",
        data={"language": "ja"},
        files={"files": ("sample.wav", b"audio", "audio/wav")},
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    db_session.refresh(asset)
    assert asset.reference_language == "ja"
    assert asset.error_message is None
    assert calls == [
        ("prepare", asset.id, "JA", 1),
        ("label", asset.id, "ja"),
        ("start", asset.id, "ja"),
    ]
