from extensions.catalog import CatalogItem, CatalogSnapshot


class _Catalog:
    def __init__(self, snapshot):
        self.snapshot = snapshot

    def fetch(self, *, refresh=False):
        return self.snapshot


def _catalog(stale=False):
    return _Catalog(
        CatalogSnapshot(
            schema_version=1,
            catalog_version="test",
            generated_at="",
            fetched_at="",
            stale=stale,
            items=(
                CatalogItem(
                    id="catalog-demo-skill",
                    kind="skill",
                    name="Demo Skill",
                    description="Demo",
                    version="1.0.0",
                    categories=("test",),
                    source={"type": "url", "url": "https://example.test/demo.zip"},
                    requires={},
                    security={},
                ),
                CatalogItem(
                    id="catalog-demo-mcp",
                    kind="mcp",
                    name="Demo MCP",
                    description="Demo",
                    version="1.0.0",
                    categories=("test",),
                    source={"type": "package", "runtime": "uvx", "package": "demo-mcp"},
                    requires={},
                    security={},
                ),
            ),
        )
    )


def test_catalog_endpoint_returns_items(client):
    client.app.state.extension_catalog_client = _catalog()
    client.app.state.extension_installer = None
    response = client.get("/api/extensions/catalog")
    assert response.status_code == 200
    assert response.json()["stale"] is False
    assert {item["id"] for item in response.json()["items"]} == {"catalog-demo-skill", "catalog-demo-mcp"}


def test_catalog_endpoint_filters_kind(client):
    client.app.state.extension_catalog_client = _catalog()
    response = client.get("/api/extensions/catalog?kind=skill")
    assert response.status_code == 200
    assert [item["id"] for item in response.json()["items"]] == ["catalog-demo-skill"]


def test_install_requires_confirmation(client):
    client.app.state.extension_catalog_client = _catalog()
    client.app.state.extension_installer = None
    response = client.post("/api/extensions/catalog/catalog-demo-skill/install", json={"confirmed": False})
    assert response.status_code == 200
    assert response.json()["status"] == "awaiting_confirmation"
    assert response.json()["preview"]["item_id"] == "catalog-demo-skill"


def test_missing_catalog_item_returns_404(client):
    client.app.state.extension_catalog_client = _catalog()
    response = client.get("/api/extensions/catalog/unknown")
    assert response.status_code == 404
