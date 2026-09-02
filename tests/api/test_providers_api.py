import json

from fastapi.testclient import TestClient

from app.main import create_app


def test_provider_list_returns_explicit_api_key(tmp_path, monkeypatch):
    import app.routers.providers as providers

    monkeypatch.setattr(
        providers,
        "_load_provider_config",
        lambda provider_id: {"api_key": "secret-key", "model": "gpt-test"},
    )
    monkeypatch.setattr(
        providers,
        "_resource_status",
        lambda request, provider_id, resource_kind: {"ready": False, "installed": False}
        if resource_kind == "embedding" else None,
    )

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.get("/api/providers/list", headers={"X-YUMENO-Request": "web"})

    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert "secret-key" in response.text
    provider = next(item for item in response.json()["providers"] if item["id"] == "openai")
    assert provider["current_api_key"] == "secret-key"
    assert provider["is_configured"] is True
    assert provider["runtime_supported"] is True
    provider_ids = {item["id"] for item in response.json()["providers"]}
    assert {"tavily", "bocha", "custom_search"} <= provider_ids
    assert not ({"serper", "freesearch"} & provider_ids)
    assert "gemini" not in provider_ids and "anthropic" not in provider_ids
    assert "mimo_stt" in provider_ids
    local_embedding = next(item for item in response.json()["providers"] if item["id"] == "local_embedding")
    assert local_embedding["mode"] == "local"
    assert local_embedding["resource_kind"] == "embedding"
    assert local_embedding["is_configured"] is False
    assert local_embedding["resource_status"]["ready"] is False



def test_configure_llm_provider_syncs_runtime_settings_and_invalidates_cache(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    provider_dir = tmp_path / "providers"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", provider_dir)
    invalidated = []
    monkeypatch.setattr("rag.llm.clear_llm_cache", lambda: invalidated.append("llm"))

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "llm",
                "provider_id": "deepseek",
                "api_key": "runtime-key",
                "base_url": "https://api.deepseek.com/v1",
                "model": "deepseek-chat",
                "enabled": True,
            },
        )

    assert response.status_code == 200
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored == {
        "llm_provider": "deepseek",
        "openai_api_key": "runtime-key",
        "openai_base_url": "https://api.deepseek.com/v1",
        "openai_model": "deepseek-chat",
    }
    assert invalidated == ["llm"]
    assert json.loads((provider_dir / "deepseek.json").read_text(encoding="utf-8"))["api_key"] == "runtime-key"


def test_configure_embedding_provider_syncs_runtime_settings(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr("ingestion.embeddings.clear_embedding_cache", lambda: None)
    monkeypatch.setattr("rag.retriever.clear_retriever_cache", lambda: None)

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "embedding",
                "provider_id": "dashscope_embedding",
                "api_key": "embedding-key",
                "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
                "model": "text-embedding-v3",
                "enabled": True,
            },
        )

    assert response.status_code == 200
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored["embedding_provider"] == "custom"
    assert stored["embedding_api_key"] == "embedding-key"
    assert stored["embedding_base_url"].endswith("/v1")
    assert stored["embedding_model"] == "text-embedding-v3"
    assert stored["embedding_send_dimensions"] is True


def test_configure_web_search_provider_syncs_only_supported_runtime_mapping(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        unsupported = client.post(
            "/api/providers/configure",
            json={"provider_type": "web_search", "provider_id": "bocha", "api_key": "bocha-key"},
        )
        supported = client.post(
            "/api/providers/configure",
            json={"provider_type": "web_search", "provider_id": "tavily", "api_key": "tavily-key", "enabled": True},
        )

    assert unsupported.status_code == 200
    assert unsupported.json()["runtime_supported"] is True
    assert supported.status_code == 200
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored["web_search_provider"] == "tavily"
    assert stored["web_search_api_key"] == "tavily-key"


def test_removed_provider_is_not_exposed_or_configurable(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "reranker",
                "provider_id": "cohere_rerank",
                "api_key": "cohere-key",
                "enabled": True,
            },
        )

    assert response.status_code == 404
    assert not settings_path.exists()


def test_stt_alias_and_local_provider_apply_resource_settings(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr("rag.retriever.clear_retriever_cache", lambda: None)

    app = create_app(initialize_database=False)
    calls = []
    app.state.asr_resources.configure = lambda **changes: calls.append(changes) or {"ready": False, **changes}
    with TestClient(app, base_url="http://localhost") as client:
        stt = client.get("/api/stt/status", headers={"X-YUMENO-Request": "web"})
        legacy = client.get("/api/asr/status", headers={"X-YUMENO-Request": "web"})
        response = client.post(
            "/api/providers/configure",
            json={"provider_type": "stt", "provider_id": "local_stt", "enabled": True},
        )

    assert stt.status_code == 200
    assert legacy.status_code == 200
    assert response.status_code == 200
    assert calls == [{"enabled": True}]
    assert json.loads(settings_path.read_text(encoding="utf-8"))["asr_provider"] == "local_stt"


def test_local_embedding_provider_syncs_resource_configuration(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr("ingestion.embeddings.clear_embedding_cache", lambda: None)
    monkeypatch.setattr("rag.retriever.clear_retriever_cache", lambda: None)

    app = create_app(initialize_database=False)
    calls = []
    app.state.embedding_resources.configure = lambda model_id, source, device: calls.append((model_id, source, device)) or {"ready": False}
    with TestClient(app, base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "embedding",
                "provider_id": "local_embedding",
                "model": "Qwen/Qwen3-Embedding-0.6B",
                "source": "modelscope",
                "device": "cpu",
                "enabled": True,
            },
        )

    assert response.status_code == 200
    assert calls == [("Qwen/Qwen3-Embedding-0.6B", "modelscope", "cpu")]
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored["embedding_provider"] == "managed_local"
    assert stored["embedding_device"] == "cpu"


def test_provider_list_falls_back_to_legacy_local_settings(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    settings_path.write_text(json.dumps({
        "llm_provider": "zhipu",
        "openai_api_key": "legacy-key",
        "openai_base_url": "https://legacy.example/v1",
        "openai_model": "legacy-model",
    }), encoding="utf-8")
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr(
        providers,
        "_resource_status",
        lambda request, provider_id, resource_kind: {"ready": False, "installed": False}
        if resource_kind else None,
    )

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.get("/api/providers/list", headers={"X-YUMENO-Request": "web"})

    assert response.status_code == 200
    provider = next(item for item in response.json()["providers"] if item["id"] == "zhipu")
    assert provider["current_api_key"] == "legacy-key"
    assert provider["current_base_url"] == "https://legacy.example/v1"
    assert provider["current_model"] == "legacy-model"
    assert provider["is_configured"] is True
    assert provider["is_active"] is True


def test_invalid_provider_key_does_not_override_legacy_real_key(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    settings_path.write_text(json.dumps({
        "llm_provider": "zhipu",
        "openai_api_key": "legacy-key",
        "openai_model": "legacy-model",
    }), encoding="utf-8")
    provider_dir = tmp_path / "providers"
    provider_dir.mkdir()
    (provider_dir / "zhipu.json").write_text(json.dumps({"api_key": "${OPENAI_API_KEY}", "model": "new-model"}), encoding="utf-8")
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", provider_dir)
    monkeypatch.setattr(providers, "_resource_status", lambda request, provider_id, resource_kind: None)

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.get("/api/providers/list", headers={"X-YUMENO-Request": "web"})

    provider = next(item for item in response.json()["providers"] if item["id"] == "zhipu")
    assert provider["current_api_key"] == "legacy-key"
    assert provider["current_model"] == "new-model"
    assert provider["is_configured"] is True


def test_provider_with_placeholder_key_cannot_become_active(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "llm",
                "provider_id": "openai",
                "api_key": "${OPENAI_API_KEY}",
                "enabled": True,
            },
        )

    assert response.status_code == 200
    assert "缺少有效 API Key" in response.json()["message"]
    assert not settings_path.exists()


def test_disabling_active_llm_clears_runtime_settings(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr("rag.llm.clear_llm_cache", lambda: None)

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        enabled = client.post(
            "/api/providers/configure",
            json={"provider_type": "llm", "provider_id": "deepseek", "api_key": "key", "model": "deepseek-chat", "enabled": True},
        )
        disabled = client.post(
            "/api/providers/configure",
            json={"provider_type": "llm", "provider_id": "deepseek", "enabled": False},
        )

    assert enabled.status_code == 200
    assert disabled.status_code == 200
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored["llm_provider"] is None
    assert stored["openai_api_key"] == ""
    assert stored["openai_base_url"] == ""
    assert stored["openai_model"] == ""


def test_embedding_active_id_is_not_lost_between_provider_and_runtime_names(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr(
        providers,
        "_resource_status",
        lambda request, provider_id, resource_kind: {"ready": True, "installed": True}
        if resource_kind == "embedding" else None,
    )
    monkeypatch.setattr("ingestion.embeddings.clear_embedding_cache", lambda: None)
    monkeypatch.setattr("rag.retriever.clear_retriever_cache", lambda: None)

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "embedding",
                "provider_id": "local_embedding",
                "model": "Qwen/Qwen3-Embedding-0.6B",
                "source": "modelscope",
                "device": "cpu",
                "enabled": True,
            },
        )
        listing = client.get("/api/providers/list", headers={"X-YUMENO-Request": "web"})

    assert response.status_code == 200
    assert listing.status_code == 200
    embedding = [item for item in listing.json()["providers"] if item["type"] == "embedding"]
    assert [item["id"] for item in embedding if item["is_active"]] == ["local_embedding"]


def test_custom_search_active_id_is_not_confused_with_runtime_alias(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "web_search",
                "provider_id": "custom_search",
                "api_key": "search-key",
                "base_url": "https://search.example/v1/web-search",
                "enabled": True,
            },
        )
        listing = client.get("/api/providers/list", headers={"X-YUMENO-Request": "web"})

    assert response.status_code == 200
    assert listing.status_code == 200
    search = [item for item in listing.json()["providers"] if item["type"] == "web_search"]
    assert [item["id"] for item in search if item["is_active"]] == ["custom_search"]


def test_local_provider_test_reports_resource_state(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")
    monkeypatch.setattr(
        providers,
        "_resource_status",
        lambda request, provider_id, resource_kind: {"ready": True, "installed": True}
        if resource_kind == "embedding" else None,
    )

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/test",
            json={"provider_type": "embedding", "provider_id": "local_embedding"},
        )

    assert response.status_code == 200
    assert response.json()["ok"] is True
    assert response.json()["message"] == "本地资源已就绪"


def test_configure_bailian_reranker_syncs_runtime_settings(tmp_path, monkeypatch):
    import app.routers.providers as providers

    settings_path = tmp_path / "local_settings.json"
    monkeypatch.setattr(providers, "SETTINGS_PATH", settings_path)
    monkeypatch.setattr(providers, "PROVIDER_CONFIG_DIR", tmp_path / "providers")

    from app.main import create_app
    from fastapi.testclient import TestClient

    with TestClient(create_app(initialize_database=False), base_url="http://localhost") as client:
        response = client.post(
            "/api/providers/configure",
            json={
                "provider_type": "reranker",
                "provider_id": "bailian_rerank",
                "api_key": "bailian-key",
                "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
                "model": "qwen3-rerank",
                "enabled": True,
            },
        )

    assert response.status_code == 200
    stored = json.loads(settings_path.read_text(encoding="utf-8"))
    assert stored["reranker_provider"] == "bailian_rerank"
    assert stored["reranker_api_key"] == "bailian-key"
    assert stored["reranker_base_url"].endswith("/compatible-mode/v1")
    assert stored["reranker_model"] == "qwen3-rerank"



