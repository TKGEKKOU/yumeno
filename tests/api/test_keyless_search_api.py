"""已移除的免费联网搜索 API 不再暴露。"""

import pytest

from integrations.mcp.config import MCPServerConfig


class FakeManager:
    def __init__(self):
        self.servers: list = []
        self.status_map: dict = {}
        self.reloaded: list = []
        self.disabled: list = []

    def get_config(self, name):
        return next((s for s in self.servers if s.name == name), None)

    def list_configs(self):
        return list(self.servers)

    def save_configs(self, servers):
        self.servers = list(servers)

    async def reload_server(self, name):
        self.reloaded.append(name)
        self.status_map[name] = {"status": "connected", "tool_count": 2, "error": ""}
        return self.status_map[name]

    async def disable_server_async(self, name):
        self.disabled.append(name)
        self.status_map[name] = {"status": "disabled", "tool_count": 0, "error": ""}

    def status(self):
        return dict(self.status_map)


@pytest.fixture
def keyless(client, monkeypatch):
    manager = FakeManager()
    client.app.state.mcp_manager = manager
    monkeypatch.setattr(
        "app.routers.system.shutil.which",
        lambda name: "C:\\uvx.exe" if name == "uvx" else None,
    )
    return manager


def test_keyless_status_endpoint_is_removed(client, keyless):
    assert client.get("/api/system/web-search-keyless").status_code == 404


def test_keyless_mutation_endpoint_is_removed(client, keyless):
    assert client.post("/api/system/web-search-keyless", json={"enabled": True}).status_code == 404
