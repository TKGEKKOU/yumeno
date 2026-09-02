from types import SimpleNamespace

from app.routers import rag as rag_router


def _create_persona(client, name="Alpha"):
    response = client.post("/api/personas", json={"name": name})
    assert response.status_code == 201
    return response.json()


def _fake_result():
    return SimpleNamespace(
        answer_draft="来自资料的回答",
        evidence=({"chunk_id": "chunk-1", "document_id": "doc-1", "content": "证据"},),
        confidence=0.82,
        used_web_search=False,
        trace=({"node": "retrieve", "document_count": 1}, {"node": "generate", "has_answer": True}),
        grounded=True,
        useful=True,
        missing_points=(),
        interaction_mode="knowledge",
    )


def test_rag_query_is_persisted_and_feedback_is_idempotent(client, monkeypatch):
    persona = _create_persona(client)
    monkeypatch.setattr(rag_router.rag_service, "query", lambda request: _fake_result())

    response = client.post(
        f"/api/personas/{persona['id']}/rag/query",
        json={"question": "角色的设定是什么？", "conversation_id": "conv-1"},
    )
    assert response.status_code == 200
    query_id = response.json()["query_id"]
    assert query_id

    history = client.get(f"/api/personas/{persona['id']}/rag/queries").json()
    assert history[0]["id"] == query_id
    assert history[0]["evidence"][0]["chunk_id"] == "chunk-1"

    feedback_url = f"/api/personas/{persona['id']}/rag/queries/{query_id}/feedback"
    assert client.post(feedback_url, json={"helpful": True, "note": "有帮助"}).status_code == 200
    updated = client.post(feedback_url, json={"helpful": False, "note": "证据太少"})
    assert updated.status_code == 200
    assert updated.json()["feedback"]["helpful"] is False
    assert len(client.get(f"/api/personas/{persona['id']}/rag/queries").json()) == 1


def test_rag_quality_report_aggregates_trace_and_document_versions(client, monkeypatch):
    persona = _create_persona(client)
    monkeypatch.setattr(rag_router.rag_service, "query", lambda request: _fake_result())
    client.post(f"/api/personas/{persona['id']}/rag/query", json={"question": "q"})
    response = client.get(f"/api/personas/{persona['id']}/rag/report")
    assert response.status_code == 200
    report = response.json()
    assert report["query_count"] == 1
    assert report["grounded_rate"] == 1.0
    assert report["top_trace_nodes"][0]["node"] == "retrieve"
    assert report["retrieval_config"] == {}


def test_rag_feedback_cannot_cross_persona_scope(client, monkeypatch):
    first = _create_persona(client, "Alpha")
    second = _create_persona(client, "Beta")
    monkeypatch.setattr(rag_router.rag_service, "query", lambda request: _fake_result())
    query_id = client.post(f"/api/personas/{first['id']}/rag/query", json={"question": "q"}).json()["query_id"]
    response = client.post(
        f"/api/personas/{second['id']}/rag/queries/{query_id}/feedback",
        json={"helpful": True},
    )
    assert response.status_code == 404
