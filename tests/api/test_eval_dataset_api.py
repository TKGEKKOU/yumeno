from datetime import datetime, timezone

from app.models import DocumentJob, KnowledgeSpace, RagQueryFeedback, RagQueryRecord


def _create_persona(client, name="Eval persona"):
    response = client.post("/api/personas", json={"name": name})
    assert response.status_code == 201
    return response.json()


def _add_document(db_session, *, space_id: str, job_id: str = "job-1", document_id: str = "doc-1"):
    job = DocumentJob(
        id=job_id,
        workspace_id="local-default",
        knowledge_space_id=space_id,
        document_id=document_id,
        original_filename="guide.md",
        markdown_filename="guide.md",
        source_path="data/guide.md",
        status="indexed",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        indexed_at=datetime.now(timezone.utc),
    )
    db_session.add(job)
    db_session.commit()
    return job


def test_eval_case_crud_is_scoped_to_knowledge_space(client, db_session):
    persona = _create_persona(client)
    _add_document(db_session, space_id=persona["knowledge_space_id"])

    created = client.post(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/eval-cases",
        json={
            "question": "YUMENO 如何处理资料？",
            "expected_answer": "先转换为 Markdown，再切分并建立索引。",
            "relevant_document_ids": ["job-1"],
            "tags": ["ingestion", "happy-path"],
            "difficulty": "medium",
        },
    )
    assert created.status_code == 201
    item = created.json()
    assert item["question"] == "YUMENO 如何处理资料？"
    assert item["source"] == "manual"
    assert item["enabled"] is True
    assert item["relevant_document_ids"] == ["job-1"]

    listed = client.get(f"/api/knowledge-spaces/{persona['knowledge_space_id']}/eval-cases")
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["id"] == item["id"]

    updated = client.patch(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/eval-cases/{item['id']}",
        json={"expected_answer": "更新后的答案", "enabled": False, "tags": ["updated"]},
    )
    assert updated.status_code == 200
    assert updated.json()["expected_answer"] == "更新后的答案"
    assert updated.json()["enabled"] is False
    assert updated.json()["tags"] == ["updated"]

    deleted = client.delete(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/eval-cases/{item['id']}"
    )
    assert deleted.status_code == 204
    assert client.get(
        f"/api/knowledge-spaces/{persona['knowledge_space_id']}/eval-cases/{item['id']}"
    ).status_code == 404


def test_eval_case_rejects_document_from_another_space(client, db_session):
    first = _create_persona(client, "First")
    second = _create_persona(client, "Second")
    _add_document(db_session, space_id=first["knowledge_space_id"], job_id="job-first")

    response = client.post(
        f"/api/knowledge-spaces/{second['knowledge_space_id']}/eval-cases",
        json={"question": "跨空间引用", "relevant_document_ids": ["job-first"]},
    )
    assert response.status_code == 422


def test_eval_case_hides_another_space_and_rejects_invalid_space(client):
    first = _create_persona(client, "First")
    second = _create_persona(client, "Second")
    created = client.post(
        f"/api/knowledge-spaces/{first['knowledge_space_id']}/eval-cases",
        json={"question": "只属于第一个知识空间"},
    ).json()

    assert client.get(f"/api/knowledge-spaces/{second['knowledge_space_id']}/eval-cases").json()["total"] == 0
    assert client.patch(
        f"/api/knowledge-spaces/{second['knowledge_space_id']}/eval-cases/{created['id']}",
        json={"question": "越权修改"},
    ).status_code == 404
    assert client.get("/api/knowledge-spaces/not-a-space/eval-cases").status_code == 404


def test_eval_candidate_sync_review_loop(client, db_session):
    persona = _create_persona(client, "Candidate persona")
    _add_document(db_session, space_id=persona["knowledge_space_id"], job_id="job-1", document_id="doc-1")
    first = RagQueryRecord(
        workspace_id="local-default",
        persona_id=persona["id"],
        question="低置信度问题",
        answer="一个需要人工校验的回答",
        interaction_mode="knowledge",
        confidence=0.2,
        grounded=False,
        useful=False,
        evidence_json=[{"document_id": "doc-1", "chunk_id": "doc-1:0001", "content": "证据"}],
    )
    second = RagQueryRecord(
        workspace_id="local-default",
        persona_id=persona["id"],
        question="用户认为不够有帮助的问题",
        answer="待改进回答",
        interaction_mode="knowledge",
        confidence=0.9,
        grounded=True,
        useful=True,
        evidence_json=[],
    )
    db_session.add_all([first, second])
    db_session.commit()
    db_session.refresh(first)
    db_session.refresh(second)
    db_session.add(RagQueryFeedback(query_id=second.id, helpful=False, note="没有解决问题"))
    db_session.commit()

    space_id = persona["knowledge_space_id"]
    synced = client.post(f"/api/knowledge-spaces/{space_id}/eval-candidates/sync")
    assert synced.status_code == 200
    payload = synced.json()
    assert payload["created"] == 2
    assert {item["source_query_id"] for item in payload["items"]} == {first.id, second.id}

    again = client.post(f"/api/knowledge-spaces/{space_id}/eval-candidates/sync")
    assert again.status_code == 200
    assert again.json()["created"] == 0
    assert again.json()["existing"] == 2

    candidates = client.get(f"/api/knowledge-spaces/{space_id}/eval-candidates").json()["items"]
    first_candidate = next(item for item in candidates if item["source_query_id"] == first.id)
    approved = client.post(
        f"/api/knowledge-spaces/{space_id}/eval-candidates/{first_candidate['id']}/approve",
        json={"expected_answer": "确认后的标准答案", "relevant_document_ids": ["job-1"], "tags": ["回流"]},
    )
    assert approved.status_code == 200
    assert approved.json()["source"] == "feedback"
    assert approved.json()["expected_answer"] == "确认后的标准答案"
    assert approved.json()["relevant_document_ids"] == ["job-1"]

    second_candidate = next(item for item in candidates if item["source_query_id"] == second.id)
    rejected = client.post(
        f"/api/knowledge-spaces/{space_id}/eval-candidates/{second_candidate['id']}/reject",
        json={"note": "暂时不纳入回归集"},
    )
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"
    assert client.get(f"/api/knowledge-spaces/{space_id}/eval-candidates?status=accepted").json()["total"] == 1
    assert client.get(f"/api/knowledge-spaces/{space_id}/eval-candidates?status=pending").json()["total"] == 0
    assert client.get(f"/api/knowledge-spaces/{space_id}/eval-candidates?status=rejected").json()["total"] == 1

