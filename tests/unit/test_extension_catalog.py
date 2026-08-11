import json
from pathlib import Path

import pytest

from extensions.catalog import (
    CatalogClient,
    CatalogUnavailableError,
    CatalogValidationError,
    validate_catalog,
)


def skill_item(**overrides):
    item = {
        "id": "demo-skill",
        "kind": "skill",
        "name": "Demo Skill",
        "description": "A test skill",
        "version": "1.0.0",
        "categories": ["test"],
        "source": {
            "type": "github",
            "repo": "owner/repo",
            "path": "skills/demo",
            "ref": "main",
        },
        "requires": {"tools": [], "env": [], "runtimes": []},
        "security": {"scripts": False, "network": False, "mutates_data": False, "notes": ""},
    }
    item.update(overrides)
    return item


def test_catalog_rejects_non_https_sources():
    with pytest.raises(CatalogValidationError, match="HTTPS"):
        validate_catalog(
            {
                "schema_version": 1,
                "items": [
                    skill_item(source={"type": "url", "url": "http://example.test/a.zip"})
                ],
            }
        )


def test_catalog_accepts_skill_and_mcp_items():
    mcp = {
        "id": "demo-mcp",
        "kind": "mcp",
        "name": "Demo MCP",
        "description": "A test MCP",
        "version": "1.0.0",
        "source": {
            "type": "package",
            "runtime": "uvx",
            "package": "demo-mcp==1.0.0",
            "args": ["demo-mcp"],
        },
    }
    snapshot = validate_catalog({"schema_version": 1, "items": [skill_item(), mcp]})
    assert [item.id for item in snapshot.items] == ["demo-skill", "demo-mcp"]
    assert snapshot.items[1].source["runtime"] == "uvx"


def test_catalog_rejects_duplicate_ids_and_scripts():
    with pytest.raises(CatalogValidationError, match="重复"):
        validate_catalog({"schema_version": 1, "items": [skill_item(), skill_item()]})
    with pytest.raises(CatalogValidationError, match="script"):
        validate_catalog(
            {"schema_version": 1, "items": [skill_item(source={"type": "github", "repo": "owner/repo", "path": "skills/demo", "script": "install.ps1"})]}
        )


def test_catalog_client_uses_cache_and_marks_stale_on_refresh_failure(tmp_path: Path):
    payload = {"schema_version": 1, "catalog_version": "test", "items": [skill_item()]}
    calls: list[str] = []

    def fetcher(url: str) -> bytes:
        calls.append(url)
        if len(calls) > 1:
            raise OSError("offline")
        return json.dumps(payload).encode("utf-8")

    client = CatalogClient(tmp_path, url="https://catalog.test/extensions.json", fetcher=fetcher)
    first = client.fetch(refresh=True)
    cached = client.fetch()
    stale = client.fetch(refresh=True)
    assert first.stale is False
    assert cached.stale is False
    assert stale.stale is True
    assert stale.items[0].id == "demo-skill"
    assert len(calls) == 2


def test_catalog_client_without_cache_raises_when_offline(tmp_path: Path):
    client = CatalogClient(tmp_path, fetcher=lambda url: (_ for _ in ()).throw(OSError("offline")))
    with pytest.raises(CatalogUnavailableError, match="目录不可用"):
        client.fetch(refresh=True)
