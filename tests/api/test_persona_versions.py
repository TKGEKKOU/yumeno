"""角色版本 API：创建、历史、差异、发布/回滚与访问隔离。"""

import pytest
from langchain_core.tools import tool

from integrations.mcp.client import MCPManager


class FakeMCPClient:
    def __init__(self, connections, tool_name_prefix=True, handle_tool_errors=True):
        self.connections = connections

    async def get_tools(self, server_name=None):
        @tool(description="fake tool")
        def demo_tool(value: str = "ok") -> str:
            return value

        return [demo_tool]


def _fake_factory(connections, tool_name_prefix=True, handle_tool_errors=True):
    return FakeMCPClient(connections, tool_name_prefix, handle_tool_errors)


@pytest.fixture
def mcp_manager(client, tmp_path):
    manager = MCPManager(tmp_path / "mcp_servers.json", client_factory=_fake_factory)
    client.app.state.mcp_manager = manager
    yield manager
    manager.unregister_all()


def create_persona(client, name: str) -> dict:
    response = client.post(
        "/api/personas",
        json={"name": name, "profile": {"description": f"{name} profile"}},
    )
    assert response.status_code == 201
    return response.json()


def create_version(client, persona_id: str, *, label: str, note: str = "") -> dict:
    response = client.post(
        f"/api/personas/{persona_id}/versions",
        json={"label": label, "note": note},
    )
    assert response.status_code == 201
    return response.json()


def test_version_api_creates_lists_and_reads_scoped_snapshots(client):
    persona = create_persona(client, "Alice")

    created = create_version(client, persona["id"], label="初始版本", note="第一次发布前检查")
    assert created["persona_id"] == persona["id"]
    assert created["version_number"] == 1
    assert created["status"] == "draft"
    assert created["snapshot"]["name"] == "Alice"
    assert created["snapshot"]["profile"]["description"] == "Alice profile"

    listed = client.get(f"/api/personas/{persona['id']}/versions")
    assert listed.status_code == 200
    assert [item["version_number"] for item in listed.json()] == [1]
    assert listed.json()[0]["label"] == "初始版本"

    fetched = client.get(f"/api/personas/{persona['id']}/versions/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["snapshot"]["name"] == "Alice"


def test_version_api_rejects_cross_persona_access_for_list_detail_diff_and_mutations(client):
    alice = create_persona(client, "Alice")
    bob = create_persona(client, "Bob")
    alice_version = create_version(client, alice["id"], label="Alice 版本")
    bob_version = create_version(client, bob["id"], label="Bob 版本")

    assert client.get(f"/api/personas/{bob['id']}/versions/{alice_version['id']}").status_code == 404
    assert client.post(f"/api/personas/{bob['id']}/versions/{alice_version['id']}/publish").status_code == 404
    assert client.post(f"/api/personas/{bob['id']}/versions/{alice_version['id']}/rollback").status_code == 404

    mixed_diff = client.get(
        f"/api/personas/{alice['id']}/versions/diff",
        params={"from_version_id": alice_version["id"], "to_version_id": bob_version["id"]},
    )
    assert mixed_diff.status_code == 404
    assert client.get("/api/personas/not-a-persona/versions").status_code == 404


def test_version_api_returns_nested_diff_between_two_snapshots(client):
    persona = create_persona(client, "Alice")
    first = create_version(client, persona["id"], label="初始")

    updated = client.patch(
        f"/api/personas/{persona['id']}",
        json={"profile": {"description": "updated", "style": "warm"}},
    )
    assert updated.status_code == 200
    second = create_version(client, persona["id"], label="温和口吻")

    diff = client.get(
        f"/api/personas/{persona['id']}/versions/diff",
        params={"from_version_id": first["id"], "to_version_id": second["id"]},
    )
    assert diff.status_code == 200
    body = diff.json()
    assert body["changed"] is True
    changes = {item["path"]: item for item in body["changes"]}
    assert changes["profile.description"]["before"] == "Alice profile"
    assert changes["profile.description"]["after"] == "updated"
    assert changes["profile.style"]["after"] == "warm"


def test_publish_restores_persona_capabilities_and_mcp_grants(client, mcp_manager):
    persona = create_persona(client, "Alice")
    created_server = client.post(
        "/api/mcp/servers",
        json={"name": "browser", "transport": "stdio", "command": "python"},
    )
    assert created_server.status_code == 201
    granted = client.put(
        f"/api/personas/{persona['id']}/mcp-grants",
        json={"server_names": ["browser"]},
    )
    assert granted.status_code == 200
    capabilities = client.put(
        f"/api/personas/{persona['id']}/capabilities",
        json={"overrides": {"builtin/search_persona_knowledge": False}},
    )
    assert capabilities.status_code == 200
    version = create_version(client, persona["id"], label="可发布版本")

    changed = client.patch(
        f"/api/personas/{persona['id']}",
        json={"name": "Changed", "profile": {"description": "changed"}},
    )
    assert changed.status_code == 200
    client.put(f"/api/personas/{persona['id']}/capabilities", json={"overrides": {}})
    client.put(f"/api/personas/{persona['id']}/mcp-grants", json={"server_names": []})

    published = client.post(f"/api/personas/{persona['id']}/versions/{version['id']}/publish")
    assert published.status_code == 200
    assert published.json()["status"] == "published"

    current = client.get(f"/api/personas/{persona['id']}").json()
    assert current["name"] == "Alice"
    assert current["profile"]["description"] == "Alice profile"
    current_capabilities = client.get(f"/api/personas/{persona['id']}/capabilities").json()
    assert current_capabilities["overrides"]["builtin/search_persona_knowledge"] is False
    current_grants = client.get(f"/api/personas/{persona['id']}/mcp-grants").json()
    assert next(item for item in current_grants["servers"] if item["name"] == "browser")["authorized"] is True


def test_rollback_reapplies_an_older_version_without_losing_version_history(client):
    persona = create_persona(client, "Alice")
    first = create_version(client, persona["id"], label="稳定")

    changed = client.patch(
        f"/api/personas/{persona['id']}",
        json={"name": "Bright", "profile": {"description": "bright"}},
    )
    assert changed.status_code == 200
    second = create_version(client, persona["id"], label="实验")
    assert second["version_number"] == 2

    published = client.post(f"/api/personas/{persona['id']}/versions/{second['id']}/publish")
    assert published.status_code == 200
    rolled_back = client.post(f"/api/personas/{persona['id']}/versions/{first['id']}/rollback")
    assert rolled_back.status_code == 200
    assert rolled_back.json()["status"] == "published"

    current = client.get(f"/api/personas/{persona['id']}").json()
    assert current["name"] == "Alice"
    assert current["profile"]["description"] == "Alice profile"
    history = client.get(f"/api/personas/{persona['id']}/versions").json()
    assert [item["version_number"] for item in history] == [2, 1]
    assert next(item for item in history if item["id"] == first["id"])["status"] == "published"
    assert next(item for item in history if item["id"] == second["id"])["status"] == "superseded"



def test_publish_preserves_live_credentials_omitted_from_version_snapshot(client):
    created = client.post(
        "/api/personas",
        json={
            "name": "Alice",
            "profile": {
                "description": "stable",
                "provider": {"api_key": "live-secret", "endpoint": "https://example.test"},
            },
        },
    )
    assert created.status_code == 201
    persona = created.json()
    version = create_version(client, persona["id"], label="不覆盖凭据")
    assert version["snapshot"]["profile"]["provider"]["api_key"] == "[已隐藏]"

    changed = client.patch(
        f"/api/personas/{persona['id']}",
        json={"profile": {"description": "changed"}},
    )
    assert changed.status_code == 200

    published = client.post(f"/api/personas/{persona['id']}/versions/{version['id']}/publish")
    assert published.status_code == 200
    current = client.get(f"/api/personas/{persona['id']}").json()
    assert current["profile"]["description"] == "stable"
    assert current["profile"]["provider"]["api_key"] == "live-secret"
    assert current["profile"]["provider"]["endpoint"] == "https://example.test"
