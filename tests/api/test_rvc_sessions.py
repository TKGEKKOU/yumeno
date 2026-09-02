from pathlib import Path
import time


def _wait(client, url, headers):
    for _ in range(80):
        result = client.get(url, headers=headers).json()
        if result.get("phase") in {"ready", "separated", "failed", "cancelled"}:
            return result
        time.sleep(0.03)
    return result


def test_rvc_session_accepts_audio_extracts_managed_wav(client, tmp_path, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    monkeypatch.setattr("app.routers.voice_rvc.find_ffmpeg", lambda _: Path("ffmpeg"), raising=False)
    session = client.post("/api/voice/rvc/sessions", headers=headers)
    assert session.status_code == 201
    sid = session.json()["session_id"]
    uploaded = client.post(
        f"/api/voice/rvc/sessions/{sid}/source",
        files={"file": ("voice.mp3", b"fake", "audio/mpeg")},
        headers=headers,
    )
    assert uploaded.status_code == 202
    monkeypatch.setattr("voice.rvc.sessions.convert_wav", lambda ffmpeg, source, target, rate, channels=1: target.write_bytes(b"RIFF") or target)
    extracted = client.post(f"/api/voice/rvc/sessions/{sid}/extract", headers=headers)
    assert extracted.status_code == 202
    state = _wait(client, f"/api/voice/rvc/sessions/{sid}", headers)
    assert state["phase"] == "ready"
    assert state["normalized_wav"]["file_id"]
    assert state["selected_input"] == state["normalized_wav"]["file_id"]


def test_rvc_session_separation_exposes_vocals_and_instrumental(client, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    app = client.app
    session = client.post("/api/voice/rvc/sessions", headers=headers).json()
    sid = session["session_id"]
    client.post(f"/api/voice/rvc/sessions/{sid}/source", files={"file": ("voice.wav", b"RIFF", "audio/wav")}, headers=headers)
    monkeypatch.setattr("voice.rvc.sessions.convert_wav", lambda ffmpeg, source, target, rate, channels=1: target.write_bytes(b"RIFF") or target)
    client.post(f"/api/voice/rvc/sessions/{sid}/extract", headers=headers)
    _wait(client, f"/api/voice/rvc/sessions/{sid}", headers)
    manager = app.state.rvc_sessions
    monkeypatch.setattr(manager, "_separate", lambda sid: manager._finish_separation(sid, Path("vocals.wav"), Path("instrumental.wav")))
    response = client.post(f"/api/voice/rvc/sessions/{sid}/separate", headers=headers)
    assert response.status_code == 202
    state = _wait(client, f"/api/voice/rvc/sessions/{sid}", headers)
    assert state["phase"] == "separated"
    assert state["vocals"]["selected_for_rvc"] is True
    assert state["instrumental"]["selected_for_rvc"] is False


def _prepare_managed_rvc_input(client, monkeypatch, headers):
    session = client.post("/api/voice/rvc/sessions", headers=headers).json()
    sid = session["session_id"]
    uploaded = client.post(
        f"/api/voice/rvc/sessions/{sid}/source",
        files={"file": ("voice.wav", b"RIFF", "audio/wav")},
        headers=headers,
    )
    assert uploaded.status_code == 202
    monkeypatch.setattr(
        "voice.rvc.sessions.convert_wav",
        lambda ffmpeg, source, target, rate, channels=1: target.write_bytes(b"RIFF") or target,
    )
    extracted = client.post(f"/api/voice/rvc/sessions/{sid}/extract", headers=headers)
    assert extracted.status_code == 202
    state = _wait(client, f"/api/voice/rvc/sessions/{sid}", headers)
    assert state["phase"] == "ready"
    return sid, state["normalized_wav"]["file_id"]


def test_rvc_convert_accepts_managed_session_file_without_reupload(client, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    sid, file_id = _prepare_managed_rvc_input(client, monkeypatch, headers)
    captured = {}

    monkeypatch.setattr(client.app.state.rvc_resources, "status", lambda: {"ready": True})
    monkeypatch.setattr(client.app.state.rvc_adapter, "resolve_model", lambda model: Path("voice.pth"))
    monkeypatch.setattr(
        client.app.state.rvc_adapter,
        "model_metadata",
        lambda model: {"speaker_count": 2, "speakers": [{"id": 0, "name": "Speaker 0"}, {"id": 1, "name": "Speaker 1"}]},
    )
    monkeypatch.setattr(client.app.state.rvc_adapter, "resolve_index", lambda index: None)

    def fake_start(input_path, **options):
        captured["input_path"] = Path(input_path)
        captured["options"] = options
        return "task-managed"

    monkeypatch.setattr(client.app.state.rvc_tasks, "start", fake_start)
    response = client.post(
        "/api/voice/rvc/convert",
        json={
            "session_id": sid,
            "input_file_id": file_id,
            "model_id": "voice.pth",
            "index_id": None,
            "speaker_id": 1,
            "pitch": 0,
            "f0_method": "rmvpe",
            "index_rate": 0,
            "protect": 0.33,
            "resample_sr": 0,
            "rms_mix_rate": 1.0,
        },
        headers=headers,
    )

    assert response.status_code == 202, response.text
    assert response.json()["task_id"] == "task-managed"
    assert captured["input_path"] == client.app.state.rvc_sessions.file_path(sid, file_id)
    assert captured["options"]["model"] == "voice.pth"
    assert captured["options"]["speaker_id"] == 1


def test_rvc_convert_rejects_speaker_outside_model_range(client, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    sid, file_id = _prepare_managed_rvc_input(client, monkeypatch, headers)
    monkeypatch.setattr(client.app.state.rvc_resources, "status", lambda: {"ready": True})
    monkeypatch.setattr(client.app.state.rvc_adapter, "resolve_model", lambda model: Path("voice.pth"))
    monkeypatch.setattr(client.app.state.rvc_adapter, "model_metadata", lambda model: {"speaker_count": 2, "speakers": []})

    response = client.post(
        "/api/voice/rvc/convert",
        json={"session_id": sid, "input_file_id": file_id, "model_id": "voice.pth", "speaker_id": 2, "index_rate": 0},
        headers=headers,
    )

    assert response.status_code == 422
    assert "Speaker ID" in response.json()["detail"]
    assert "0 到 1" in response.json()["detail"]


def test_rvc_convert_requires_index_when_index_rate_is_positive(client, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    sid, file_id = _prepare_managed_rvc_input(client, monkeypatch, headers)
    monkeypatch.setattr(client.app.state.rvc_resources, "status", lambda: {"ready": True})
    monkeypatch.setattr(client.app.state.rvc_adapter, "resolve_model", lambda model: Path("voice.pth"))
    monkeypatch.setattr(client.app.state.rvc_adapter, "model_metadata", lambda model: {"speaker_count": 1, "speakers": []})

    response = client.post(
        "/api/voice/rvc/convert",
        json={"session_id": sid, "input_file_id": file_id, "model_id": "voice.pth", "speaker_id": 0, "index_rate": 0.75},
        headers=headers,
    )

    assert response.status_code == 422
    assert "Index" in response.json()["detail"]


def test_rvc_convert_rejects_instrumental_as_managed_input(client, monkeypatch):
    headers = {"X-YUMENO-Request": "web"}
    sid, _ = _prepare_managed_rvc_input(client, monkeypatch, headers)
    manager = client.app.state.rvc_sessions
    work = manager._dir(sid) / "work"
    vocals = work / "vocals.wav"
    instrumental = work / "instrumental.wav"
    vocals.write_bytes(b"RIFFvocals")
    instrumental.write_bytes(b"RIFFinstrumental")
    state = manager._finish_separation(sid, vocals, instrumental)
    monkeypatch.setattr(client.app.state.rvc_resources, "status", lambda: {"ready": True})

    response = client.post(
        "/api/voice/rvc/convert",
        json={
            "session_id": sid,
            "input_file_id": state["instrumental"]["file_id"],
            "model_id": "voice.pth",
            "speaker_id": 0,
            "index_rate": 0,
        },
        headers=headers,
    )

    assert response.status_code == 422
    assert "背景音" in response.json()["detail"]
