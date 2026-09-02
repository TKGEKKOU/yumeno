from app.models import ProviderDownloadTask


class FakeResource:
    def __init__(self):
        self.started = 0
        self.cancelled = 0
        self._status = {"installed": False, "ready": False, "installing": False, "phase": "idle"}

    def status(self):
        return dict(self._status)

    def start_install(self, **kwargs):
        self.started += 1
        self._status.update(installing=True, phase="preparing")
        return self.status()

    def cancel_install(self):
        self.cancelled += 1
        self._status.update(installing=False, phase="idle")
        return self.status()


def test_unified_resource_install_persists_task_and_exposes_status(client, monkeypatch):
    rvc = FakeResource()
    client.app.state.rvc_resources = rvc

    response = client.post(
        "/api/providers/resources/rvc/install",
        json={"source": "local"},
        headers={"X-YUMENO-Request": "web"},
    )
    assert response.status_code == 202
    body = response.json()
    assert body["provider_id"] == "rvc"
    assert body["status"] in {"queued", "running"}
    task_id = body["task_id"]

    detail = client.get(
        f"/api/providers/resources/tasks/{task_id}",
        headers={"X-YUMENO-Request": "web"},
    )
    assert detail.status_code == 200
    assert detail.json()["resource_status"]["installing"] is True

    listing = client.get("/api/providers/resources/tasks", headers={"X-YUMENO-Request": "web"})
    assert listing.status_code == 200
    assert any(item["task_id"] == task_id for item in listing.json()["items"])

    row_session = client.app.state.session_factory()
    try:
        row = row_session.get(ProviderDownloadTask, task_id)
        assert row is not None
        assert row.provider_id == "rvc"
    finally:
        row_session.close()

    cancelled = client.delete(
        f"/api/providers/resources/tasks/{task_id}",
        headers={"X-YUMENO-Request": "web"},
    )
    assert cancelled.status_code == 202


def test_unified_resource_cancel_and_retry(client):
    separator = FakeResource()
    client.app.state.separator_resources = separator
    headers = {"X-YUMENO-Request": "web"}
    created = client.post("/api/providers/resources/separator/install", headers=headers)
    assert created.status_code == 202
    task_id = created.json()["task_id"]

    cancelled = client.delete(f"/api/providers/resources/tasks/{task_id}", headers=headers)
    assert cancelled.status_code == 202
    assert cancelled.json()["cancelled"] is True
    assert separator.cancelled == 1

    retried = client.post(f"/api/providers/resources/tasks/{task_id}/retry", headers=headers)
    assert retried.status_code == 202
    assert retried.json()["provider_id"] == "separator"
    assert retried.json()["task_id"] != task_id


def test_unified_resource_status_supports_provider_aliases(client):
    client.app.state.rvc_resources = FakeResource()
    client.app.state.separator_resources = FakeResource()
    headers = {"X-YUMENO-Request": "web"}

    listing = client.get("/api/providers/resources", headers=headers)
    assert listing.status_code == 200
    assert {item["provider_id"] for item in listing.json()["items"]} == {"rvc", "separator"}

    status = client.get("/api/providers/resources/rvc_local/status", headers=headers)
    assert status.status_code == 200
    assert status.json()["resource_kind"] == "rvc"


def test_new_resources_alias_lists_persisted_tasks(client):
    response = client.get("/api/resources/tasks", headers={"X-YUMENO-Request": "web"})
    assert response.status_code == 200
    assert "items" in response.json()

def test_new_resources_install_accepts_nested_parameters(client):
    rvc = FakeResource()
    client.app.state.rvc_resources = rvc
    response = client.post(
        "/api/resources/rvc/install",
        json={"parameters": {"source": "local", "device": "cuda"}},
        headers={"X-YUMENO-Request": "web"},
    )
    assert response.status_code == 202
    assert response.json()["provider_id"] == "rvc"
    assert rvc.started == 1
