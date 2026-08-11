import json
from pathlib import Path

import pytest

from extensions.catalog import CatalogItem, CatalogSnapshot


def _snapshot(*items: CatalogItem) -> CatalogSnapshot:
    return CatalogSnapshot(
        schema_version=1,
        catalog_version="test",
        generated_at="",
        fetched_at="",
        stale=False,
        items=tuple(items),
    )


class _Catalog:
    def __init__(self, snapshot):
        self.snapshot = snapshot

    def fetch(self, *, refresh=False):
        return self.snapshot


def test_skill_install_starts_disabled_and_untrusted(tmp_path, monkeypatch):
    import agents.skills as skills_module
    from extensions.installer import ExtensionInstaller

    skill_root = tmp_path / "skills"
    monkeypatch.setattr(skills_module, "USER_SKILL_DIR", skill_root)
    package = tmp_path / "demo-skill"
    package.mkdir()
    (package / "SKILL.md").write_text(
        "---\nname: demo-skill\ndescription: Demo\ntool-names: []\n---\nInstructions\n",
        encoding="utf-8",
    )
    item = CatalogItem(
        id="demo-skill", kind="skill", name="Demo Skill", description="", version="1.0.0",
        categories=(), source={"type": "url", "url": "https://example.test/demo.zip"},
        requires={}, security={},
    )
    installer = ExtensionInstaller(
        tmp_path,
        catalog_client=_Catalog(_snapshot(item)),
        skills_module=skills_module,
        skill_fetcher=lambda source, workdir: package,
    )

    preview = installer.preview("demo-skill")
    assert preview.kind == "skill"
    result = installer.install("demo-skill", confirmed=True)
    assert result.status == "installed"
    installed = skills_module.get_skill("demo-skill")
    assert installed.enabled is False
    assert installed.trusted is False
    assert installed.scripts_enabled is False


def test_install_requires_confirmation(tmp_path):
    from extensions.installer import ExtensionInstaller

    item = CatalogItem(
        id="demo-mcp", kind="mcp", name="Demo MCP", description="", version="1.0.0",
        categories=(), source={"type": "package", "runtime": "uvx", "package": "demo-mcp==1.0.0"},
        requires={}, security={},
    )
    installer = ExtensionInstaller(tmp_path, catalog_client=_Catalog(_snapshot(item)))
    result = installer.install("demo-mcp", confirmed=False)
    assert result.status == "awaiting_confirmation"
    assert result.preview is not None


def test_mcp_install_failure_restores_previous_config(tmp_path, monkeypatch):
    from extensions.installer import ExtensionInstaller
    from integrations.mcp.client import MCPManager

    config_path = tmp_path / "mcp_servers.json"
    config_path.write_text(json.dumps({"mcpServers": {}}, indent=2), encoding="utf-8")
    manager = MCPManager(config_path, client_factory=lambda *args, **kwargs: None)
    item = CatalogItem(
        id="demo-mcp", kind="mcp", name="Demo MCP", description="", version="1.0.0",
        categories=(), source={"type": "package", "runtime": "uvx", "package": "demo-mcp==1.0.0"},
        requires={}, security={},
    )
    installer = ExtensionInstaller(tmp_path, catalog_client=_Catalog(_snapshot(item)), mcp_manager=manager)
    before = config_path.read_text(encoding="utf-8")
    monkeypatch.setattr(manager, "reload_server", lambda name: (_ for _ in ()).throw(RuntimeError("connect failed")))
    result = installer.install("demo-mcp", confirmed=True)
    assert result.status == "rolled_back"
    assert config_path.read_text(encoding="utf-8") == before


def test_duplicate_mcp_is_rejected(tmp_path):
    from extensions.installer import ExtensionInstaller
    from integrations.mcp.client import MCPManager
    from integrations.mcp.config import MCPServerConfig, save_servers

    config_path = tmp_path / "mcp_servers.json"
    save_servers(config_path, [MCPServerConfig(name="demo-mcp", command="uvx", args=["existing"], enabled=False)])
    manager = MCPManager(config_path, client_factory=lambda *args, **kwargs: None)
    item = CatalogItem(
        id="demo-mcp", kind="mcp", name="Demo MCP", description="", version="1.0.0",
        categories=(), source={"type": "package", "runtime": "uvx", "package": "demo-mcp==1.0.0"},
        requires={}, security={},
    )
    installer = ExtensionInstaller(tmp_path, catalog_client=_Catalog(_snapshot(item)), mcp_manager=manager)
    with pytest.raises(ValueError, match="已存在"):
        installer.install("demo-mcp", confirmed=True)
