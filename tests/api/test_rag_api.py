from rag.service import RagResult


def _create_persona(client):
    response = client.post("/api/personas", json={"name": "Alpha"})
    assert response.status_code == 201
    return response.json()


def test_query_scope_is_derived_from_path_persona(client, monkeypatch):
    persona = _create_persona(client)
    captured = {}

    def fake_query(request):
        captured["request"] = request
        return RagResult.empty("No indexed evidence")

    monkeypatch.setattr("app.routers.rag.rag_service.query", fake_query)
    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "What is in my material?"},
    )

    assert response.status_code == 200
    assert captured["request"].context.knowledge_space_ids == (
        persona["knowledge_space_id"],
    )
    assert captured["request"].persona_name == "Alpha"


def test_query_passes_persona_profile_to_chat_service(client, monkeypatch):
    persona = client.post(
        "/api/personas",
        json={"name": "爱弥斯", "profile": {"description": "活泼俏皮的数据幽灵"}},
    ).json()
    captured = {}

    def fake_query(request):
        captured["request"] = request
        return RagResult.empty("ok")

    monkeypatch.setattr("app.routers.rag.rag_service.query", fake_query)
    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "你好"},
    )

    assert response.status_code == 200
    assert captured["request"].persona_profile["description"] == "活泼俏皮的数据幽灵"


def test_query_rejects_client_scope_override(client):
    persona = _create_persona(client)
    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "facts", "knowledge_space_ids": ["space-b"]},
    )

    assert response.status_code == 422


def test_rag_error_contract_is_persisted_in_query_history(client, monkeypatch):
    persona = _create_persona(client)
    monkeypatch.setattr(
        "app.routers.rag.rag_service.query",
        lambda request: RagResult.failed("failed_quality_gate"),
    )

    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "查资料"},
    )
    assert response.status_code == 200
    query_id = response.json()["query_id"]

    history = client.get(f"/api/personas/{persona['id']}/rag/queries")
    assert history.status_code == 200
    saved = next(item for item in history.json() if item["id"] == query_id)
    assert saved["error_code"] == "failed_quality_gate"
    assert saved["error_message"] == "回答校验暂时失败，请稍后重试。"
    assert saved["answer"] == ""


def test_query_returns_sanitized_rag_error_contract(client, monkeypatch):
    from rag.service import RagResult

    persona = _create_persona(client)
    monkeypatch.setattr(
        "app.routers.rag.rag_service.query",
        lambda request: RagResult.failed("failed_retrieval"),
    )

    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "查资料"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["error_code"] == "failed_retrieval"
    assert body["error_message"] == "知识检索暂时失败，请稍后重试。"
    assert body["answer"] == ""
