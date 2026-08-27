def test_reranker_resource_api_uses_managed_resource_manager(client, tmp_path, monkeypatch):
    from ingestion.local_reranker.resources import LocalRerankerResourceManager

    manager = LocalRerankerResourceManager(tmp_path)
    monkeypatch.setattr(client.app.state, "reranker_resources", manager, raising=False)
    monkeypatch.setattr(manager, "start_install", lambda model_id, source, device: True)

    initial = client.get("/api/reranker/status")
    install = client.post(
        "/api/reranker/install",
        headers={"X-YUMENO-Request": "web"},
        json={"model_id": "Qwen/Qwen3-Reranker-0.6B", "source": "modelscope", "device": "auto"},
    )

    assert initial.status_code == 200
    assert initial.json()["model_id"] == "Qwen/Qwen3-Reranker-0.6B"
    assert install.status_code == 202


def test_reranker_install_rejects_unsafe_model_id(client, tmp_path, monkeypatch):
    from ingestion.local_reranker.resources import LocalRerankerResourceManager

    manager = LocalRerankerResourceManager(tmp_path)
    monkeypatch.setattr(client.app.state, "reranker_resources", manager, raising=False)
    response = client.post(
        "/api/reranker/install",
        headers={"X-YUMENO-Request": "web"},
        json={"model_id": "../outside", "source": "modelscope", "device": "auto"},
    )
    assert response.status_code == 422
