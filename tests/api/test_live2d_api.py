from pathlib import Path

from app.routers.live2d import discover_models


def test_live2d_models_endpoint(client):
    response = client.get("/api/live2d/models")
    assert response.status_code == 200
    payload = response.json()
    assert "models" in payload
    for model in payload["models"]:
        assert model["id"]
        assert model["entry"].endswith((".model.json", ".model3.json"))
        assert model["kind"] in {"cubism2", "cubism4"}


def test_vts_connection_config_endpoint(client):
    response = client.get("/api/live2d/vts")
    assert response.status_code == 200
    payload = response.json()
    assert payload["url"] == "ws://127.0.0.1:8001"
    assert payload["port"] == 8001
    assert payload["plugin_name"] == "YUMENO"


def test_open_live2d_model_directory(client, monkeypatch):
    opened = []
    monkeypatch.setattr(
        "voice.resource_directory.open_resource_directory",
        lambda path: opened.append(path) or str(path),
    )
    response = client.post(
        "/api/live2d/model-directory",
        headers={"X-YUMENO-Request": "web"},
    )
    assert response.status_code == 200
    assert response.json()["opened_directory"].endswith("data\\live2d")
    assert opened


def test_discover_models_prefers_cubism4(tmp_path: Path):
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "A.model.json").write_text("{}", encoding="utf-8")
    (tmp_path / "a" / "A.model3.json").write_text("{}", encoding="utf-8")
    (tmp_path / "b").mkdir()
    (tmp_path / "b" / "B.model.json").write_text("{}", encoding="utf-8")
    (tmp_path / "c").mkdir()  # no entry file, must be skipped

    models = discover_models(tmp_path)
    assert [model["id"] for model in models] == ["a", "b"]
    assert models[0]["kind"] == "cubism4"
    assert models[0]["entry"] == "a/A.model3.json"
    assert models[1]["kind"] == "cubism2"
    assert models[1]["entry"] == "b/B.model.json"


def test_discover_models_accepts_moc3_v6(tmp_path: Path):
    model_dir = tmp_path / "new"
    model_dir.mkdir()
    (model_dir / "New.model3.json").write_text(
        '{"Version":3,"FileReferences":{"Moc":"New.moc3","Textures":[]}}',
        encoding="utf-8",
    )
    (model_dir / "New.moc3").write_bytes(b"MOC3\x06" + b"\0" * 12)
    model = discover_models(tmp_path)[0]
    assert model["moc_version"] == 6
    assert model["compatible"] is True
