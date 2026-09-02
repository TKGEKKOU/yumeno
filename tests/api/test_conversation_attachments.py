import pytest
from dataclasses import replace
from pathlib import Path

from app.chat_store import persist_text_message
from app.models import ConversationAttachment, ConversationMessageAttachment


def _upload(client, conversation_id: str, name: str = "sample.wav", data: bytes = b"RIFFdemo"):
    return client.post(
        f"/api/conversations/{conversation_id}/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[("files", (name, data, "audio/wav"))],
    )


def test_attachment_upload_list_download_rename_and_delete(client, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    response = _upload(client, "conversation-a")
    assert response.status_code == 201
    item = response.json()["attachments"][0]
    assert item["kind"] == "audio"
    assert "storage_path" not in item
    assert (tmp_path / "data" / "attachments").is_dir()

    listed = client.get("/api/conversations/conversation-a/attachments")
    assert [row["file_id"] for row in listed.json()["attachments"]] == [item["file_id"]]

    downloaded = client.get(f"/api/conversations/conversation-a/attachments/{item['file_id']}")
    assert downloaded.status_code == 200
    assert downloaded.content == b"RIFFdemo"

    renamed = client.patch(
        f"/api/conversations/conversation-a/attachments/{item['file_id']}",
        headers={"X-YUMENO-Request": "web"},
        json={"name": "renamed.wav"},
    )
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "renamed.wav"

    assert client.get(f"/api/conversations/conversation-b/attachments/{item['file_id']}").status_code == 404
    deleted = client.delete(
        f"/api/conversations/conversation-a/attachments/{item['file_id']}",
        headers={"X-YUMENO-Request": "web"},
    )
    assert deleted.status_code == 204
    assert client.get(f"/api/conversations/conversation-a/attachments/{item['file_id']}").status_code == 404


def test_attachment_upload_rejects_unsupported_and_requires_same_origin(client, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    forbidden = client.post(
        "/api/conversations/c/attachments",
        files=[("files", ("sample.wav", b"data", "audio/wav"))],
    )
    assert forbidden.status_code == 403
    unsupported = client.post(
        "/api/conversations/c/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[("files", ("script.exe", b"MZ", "application/octet-stream"))],
    )
    assert unsupported.status_code == 415


def test_attachment_explicit_worker_targets_validate_file_kind(client, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    audio = _upload(client, "c").json()["attachments"][0]
    rvc = client.post(
        f"/api/conversations/c/attachments/{audio['file_id']}/send-to-rvc",
        headers={"X-YUMENO-Request": "web"},
    )
    assert rvc.status_code == 200
    assert rvc.json()["target"] == "rvc"
    rag = client.post(
        f"/api/conversations/c/attachments/{audio['file_id']}/send-to-rag",
        headers={"X-YUMENO-Request": "web"},
    )
    assert rag.status_code == 415


def test_message_persistence_keeps_only_authorized_attachment_links(client, db_session, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    persona = client.post("/api/personas", json={"name": "Attachment tester"}).json()
    selected = _upload(client, "conversation-a").json()["attachments"][0]
    foreign = _upload(client, "conversation-b", name="foreign.wav").json()["attachments"][0]

    persist_text_message(
        client.app.state.session_factory,
        workspace_id="local-default",
        persona_id=persona["id"],
        conversation_id="conversation-a",
        role="user",
        content="处理附件",
        attachment_ids=[selected["file_id"], foreign["file_id"], "missing"],
    )
    links = db_session.query(ConversationMessageAttachment).all()
    assert [link.attachment_id for link in links] == [selected["file_id"]]

    history = client.get(f"/api/personas/{persona['id']}/conversations/conversation-a/messages")
    assert history.status_code == 200
    assert history.json()[0]["attachments"][0]["file_id"] == selected["file_id"]
    assert "storage_path" not in history.json()[0]["attachments"][0]


def test_attachment_rejects_executable_content_disguised_as_audio(client, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    response = client.post(
        "/api/conversations/c/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[("files", ("not-audio.wav", b"MZ" + b"\x00" * 64, "audio/wav"))],
    )
    assert response.status_code == 415
    assert "内容" in response.json()["detail"]


def test_wav_attachment_records_duration_metadata(client, tmp_path):
    import io
    import wave

    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(8000)
        audio.writeframes(b"\x00\x00" * 800)
    response = _upload(client, "conversation-media", name="sample.wav", data=buffer.getvalue())
    assert response.status_code == 201
    item = response.json()["attachments"][0]
    assert item["duration"] == pytest.approx(0.1, abs=0.01)


def test_multi_attachment_upload_failure_removes_prior_file(client, tmp_path):
    client.app.state.settings = replace(client.app.state.settings, project_root=tmp_path)
    response = client.post(
        "/api/conversations/c/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[
            ("files", ("ok.wav", b"RIFFdemo", "audio/wav")),
            ("files", ("bad.exe", b"MZ", "application/octet-stream")),
        ],
    )
    assert response.status_code == 415
    attachment_root = tmp_path / "data" / "attachments"
    assert not list(attachment_root.rglob("*.wav"))
