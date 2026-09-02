"""Worker Manifest API 的只读查询契约。"""


def test_worker_manifest_list_returns_public_manifests(client):
    response = client.get("/api/workers/manifests")

    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {"items"}
    assert [item["name"] for item in payload["items"]] == [
        "knowledge",
        "memory",
        "document",
        "profile",
        "voice",
        "rvc_worker",
        "live2d",
        "config",
    ]
    assert payload["items"]
    first = payload["items"][0]
    assert first["description"]
    assert first["input_schema"]["required"] == ["request"]
    assert first["output_schema"]["required"]
    assert isinstance(first["capabilities"], list)
    assert isinstance(first["mutating_operations"], list)
    assert isinstance(first["retry_policy"], dict)
    assert isinstance(first["read_only"], bool)


def test_worker_manifest_detail_returns_one_manifest(client):
    response = client.get("/api/workers/manifests/memory")

    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "memory"
    assert payload["tools"]
    assert payload["read_only"] is False
    assert payload["requires_confirmation"] is True


def test_worker_manifest_detail_returns_404_for_unknown_worker(client):
    response = client.get("/api/workers/manifests/not-a-worker")

    assert response.status_code == 404
    assert response.json()["detail"]


def test_worker_manifest_detail_exposes_voice_and_live2d_domains(client):
    voice = client.get("/api/workers/manifests/voice")
    live2d = client.get("/api/workers/manifests/live2d")

    assert voice.status_code == 200
    assert voice.json()["name"] == "voice"
    assert "start_voice_clone_session" in voice.json()["tools"]
    assert "list_voice_assets" in voice.json()["tools"]
    assert live2d.status_code == 200
    assert live2d.json()["name"] == "live2d"
    assert "list_live2d_models" in live2d.json()["tools"]
    rvc = client.get("/api/workers/manifests/rvc_worker")
    assert rvc.status_code == 200
    assert "convert_audio_with_rvc" in rvc.json()["tools"]
    assert client.get("/api/workers/manifests/voice_clone").status_code == 200