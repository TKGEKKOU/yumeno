import json
from unittest.mock import AsyncMock


def test_get_integrations_returns_defaults(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    response = client.get("/api/integrations")
    assert response.status_code == 200
    body = response.json()
    assert body["onebot11"]["enabled"] is False
    assert body["onebot11"]["access_token_configured"] is False
    assert body["onebot11"]["group_trigger"] == "at"
    assert body["onebot11"]["connected"] is False
    assert body["onebot11"]["client_count"] == 0


def test_put_integrations_persists(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    response = client.put(
        "/api/integrations/onebot11",
        json={"enabled": True, "access_token": "secret-token",
              "group_trigger": "prefix", "prefix": "机器人，", "default_persona_id": "p1"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["enabled"] is True
    assert body["access_token_configured"] is True
    assert "secret-token" not in response.text
    saved = json.loads(path.read_text(encoding="utf-8"))
    assert saved["onebot11"]["access_token"] == "secret-token"
    assert saved["onebot11"]["group_trigger"] == "prefix"


def test_put_integrations_rejects_invalid_trigger(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    response = client.put("/api/integrations/onebot11", json={"group_trigger": "bogus"})
    assert response.status_code == 422


def test_onebot_status_exposes_connection_diagnostics_without_token(client):
    response = client.get("/api/integrations/onebot11")
    assert response.status_code == 200
    body = response.json()
    assert body["connected_at"] is None
    assert body["last_event_at"] is None
    assert body["last_error_at"] is None
    assert body["last_action_error"] is None
    assert "access_token" not in body


def test_clear_onebot_token_is_explicit_and_never_returns_secret(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    client.put(
        "/api/integrations/onebot11",
        json={"enabled": True, "access_token": "private-token"},
    )
    response = client.delete("/api/integrations/onebot11/token")
    assert response.status_code == 200
    assert response.json()["access_token_configured"] is False
    assert "private-token" not in response.text
    assert json.loads(path.read_text(encoding="utf-8"))["onebot11"]["access_token"] == ""


def test_onebot_targets_normalize_friend_and_group_lists(client):
    from unittest.mock import AsyncMock

    manager = client.app.state.onebot
    manager.request_action = AsyncMock(side_effect=[
        [{"user_id": 20001, "nickname": "Alice"}],
        [{"group_id": 30001, "group_name": "Test"}],
    ])
    response = client.get("/api/integrations/onebot11/targets")
    assert response.status_code == 200
    assert response.json()["friends"] == [{"user_id": 20001, "nickname": "Alice"}]
    assert response.json()["groups"] == [{"group_id": 30001, "group_name": "Test"}]
    assert response.json()["available"] is True


def test_napcat_send_text_calls_onebot(client):
    manager = client.app.state.onebot
    manager.send_text = AsyncMock(return_value={"message_id": 12})
    manager.status = lambda: {"connected": True}
    response = client.post(
        "/api/integrations/napcat/send",
        json={"target_type": "private", "target_id": "20001", "text": "你好"},
        headers={"X-YUMENO-Request": "web"},
    )
    assert response.status_code == 200
    assert response.json()["sent"]["text"] is True
    manager.send_text.assert_awaited_once_with("private", "20001", "你好")


def test_napcat_send_rejects_empty_payload(client):
    response = client.post(
        "/api/integrations/napcat/send",
        json={"target_type": "group", "target_id": "30001"},
        headers={"X-YUMENO-Request": "web"},
    )
    assert response.status_code == 422


def test_onebot_connection_test_calls_login_info(client):
    manager = client.app.state.onebot
    manager.status = lambda: {"connected": True}
    manager.request_action = AsyncMock(return_value={"user_id": 3828435165, "nickname": "napcat"})
    response = client.post("/api/integrations/onebot11/test", headers={"X-YUMENO-Request": "web"})
    assert response.status_code == 200
    assert response.json()["user_id"] == 3828435165
    manager.request_action.assert_awaited_once_with("get_login_info", {})


def test_disconnect_onebot_closes_active_websocket_without_server_error(
    client, tmp_path, monkeypatch
):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    websocket = AsyncMock()
    manager = client.app.state.onebot
    manager._connections.append(websocket)

    response = client.post(
        "/api/integrations/onebot11/disconnect",
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    websocket.close.assert_awaited_once_with(code=1008, reason="integration disabled")


def test_clear_onebot_window_memory_clears_all_persona_threads(
    client, tmp_path, monkeypatch
):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    first = client.post("/api/personas", json={"name": "Window A", "profile": {}}).json()
    second = client.post("/api/personas", json={"name": "Window B", "profile": {}}).json()
    deleted: list[str] = []

    class Checkpointer:
        def delete_thread(self, thread_id):
            deleted.append(thread_id)

    client.app.state.agent_service.checkpointer = Checkpointer()
    response = client.post(
        "/api/integrations/onebot11/conversation/clear",
        headers={"X-YUMENO-Request": "web"},
        json={"target_type": "group", "target_id": "123456"},
    )

    assert response.status_code == 200
    assert deleted == [
        f"{first['id']}:im:onebot11:group:123456",
        f"{second['id']}:im:onebot11:group:123456",
    ]


def test_observation_endpoint_updates_group_authorization(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    response = client.put(
        "/api/integrations/onebot11/observation",
        headers={"X-YUMENO-Request": "web"},
        json={"target_type": "group", "target_id": "30001", "enabled": True},
    )
    assert response.status_code == 200
    assert response.json()["authorized_group_ids"] == ["30001"]


def test_bilibili_cookie_is_saved_but_never_returned(client, tmp_path, monkeypatch):
    from app.routers import integrations as integrations_router

    path = tmp_path / "data" / "integrations.json"
    monkeypatch.setattr(integrations_router, "INTEGRATIONS_PATH", path)
    response = client.put(
        "/api/integrations/bilibili/config",
        json={"room_id": "22798888", "cookie": "SESSDATA=private-value"},
    )
    assert response.status_code == 200
    assert response.json()["cookie_configured"] is True
    assert "private-value" not in response.text
    assert json.loads(path.read_text(encoding="utf-8"))["bilibili"]["cookie"] == "SESSDATA=private-value"


def test_bilibili_pause_and_resume_use_manager_lifecycle(client):
    manager = client.app.state.bilibili
    manager.pause = AsyncMock()
    manager.resume = AsyncMock()

    paused = client.post(
        "/api/integrations/bilibili/pause",
        headers={"X-YUMENO-Request": "web"},
    )
    resumed = client.post(
        "/api/integrations/bilibili/resume",
        headers={"X-YUMENO-Request": "web"},
    )

    assert paused.status_code == 200
    assert resumed.status_code == 200
    manager.pause.assert_awaited_once_with()
    manager.resume.assert_awaited_once_with()


def test_bilibili_clear_session_uses_manager_lifecycle(client):
    manager = client.app.state.bilibili
    manager.clear_session = AsyncMock()

    response = client.post(
        "/api/integrations/bilibili/session/clear",
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    manager.clear_session.assert_awaited_once_with()
