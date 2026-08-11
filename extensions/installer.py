"""Transactional installer for declarative online Skill and MCP catalog items."""

from __future__ import annotations

import asyncio
import inspect
import shutil
import tempfile
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable

from agents.skill_sources import fetch_github_skill, fetch_url_skill
from extensions.catalog import CatalogItem, CatalogSnapshot
from integrations.mcp.config import MCPServerConfig, load_servers, save_servers


@dataclass(frozen=True)
class InstallPreview:
    item_id: str
    kind: str
    name: str
    version: str
    description: str
    source: dict
    requires: dict
    security: dict
    conflicts: tuple[str, ...] = ()

    def to_dict(self) -> dict:
        return asdict(self) | {"conflicts": list(self.conflicts)}


@dataclass(frozen=True)
class InstallResult:
    status: str
    item_id: str
    message: str = ""
    preview: InstallPreview | None = None
    result: dict | None = None
    job_id: str = ""

    def to_dict(self) -> dict:
        value = asdict(self)
        value["preview"] = self.preview.to_dict() if self.preview else None
        return value


class ExtensionInstaller:
    """Install catalog entries without executing untrusted downloaded code."""

    def __init__(
        self,
        project_root: Path,
        *,
        catalog_client: Any,
        skills_module: Any | None = None,
        mcp_manager: Any | None = None,
        skill_fetcher: Callable[[str, Path], Path] | None = None,
    ) -> None:
        self.project_root = Path(project_root)
        self.catalog_client = catalog_client
        self.skills_module = skills_module
        self.mcp_manager = mcp_manager
        self.skill_fetcher = skill_fetcher
        self.jobs: dict[str, InstallResult] = {}

    def _snapshot(self) -> CatalogSnapshot:
        return self.catalog_client.fetch()

    def _find(self, item_id: str) -> CatalogItem:
        item = next((value for value in self._snapshot().items if value.id == item_id), None)
        if item is None:
            raise KeyError(item_id)
        return item

    def _mcp_path(self) -> Path:
        if self.mcp_manager is not None and getattr(self.mcp_manager, "config_path", None):
            return Path(self.mcp_manager.config_path)
        return self.project_root / "data" / "mcp_servers.json"

    def preview(self, item_id: str) -> InstallPreview:
        item = self._find(item_id)
        conflicts: list[str] = []
        if item.kind == "skill":
            skills = self.skills_module
            if skills is None:
                import agents.skills as skills
            try:
                existing = skills.get_skill(item.id)
            except KeyError:
                existing = None
            if existing is not None:
                conflicts.append("已存在同名 Skill")
        else:
            if any(server.name == item.id for server in load_servers(self._mcp_path())):
                conflicts.append("已存在同名 MCP")
        return InstallPreview(
            item_id=item.id,
            kind=item.kind,
            name=item.name,
            version=item.version,
            description=item.description,
            source=dict(item.source),
            requires=dict(item.requires),
            security=dict(item.security),
            conflicts=tuple(conflicts),
        )

    def install(self, item_id: str, *, confirmed: bool = False) -> InstallResult:
        preview = self.preview(item_id)
        if preview.conflicts:
            raise ValueError("；".join(preview.conflicts))
        if not confirmed:
            return InstallResult("awaiting_confirmation", item_id, "需要确认安装", preview=preview)
        job_id = uuid.uuid4().hex
        self.jobs[job_id] = InstallResult("running", item_id, "正在安装", preview=preview, job_id=job_id)
        try:
            result = self._install_item(self._find(item_id))
            final = InstallResult("installed", item_id, "安装完成，默认保持停用", preview, result, job_id)
        except Exception as exc:
            final = InstallResult("rolled_back", item_id, f"安装失败，已回滚：{exc}", preview, job_id=job_id)
        self.jobs[job_id] = final
        return final

    def status(self, job_id: str) -> InstallResult:
        try:
            return self.jobs[job_id]
        except KeyError:
            raise KeyError(job_id) from None

    def _install_item(self, item: CatalogItem) -> dict:
        if item.kind == "skill":
            return self._install_skill(item)
        return self._install_mcp(item)

    def _install_skill(self, item: CatalogItem) -> dict:
        skills = self.skills_module
        if skills is None:
            import agents.skills as skills
        target = Path(skills.USER_SKILL_DIR) / item.id
        state_path = Path(skills.USER_SKILL_DIR) / "skills_state.json"
        old_state = state_path.read_bytes() if state_path.is_file() else None
        try:
            with tempfile.TemporaryDirectory(prefix="yumeno-skill-") as raw:
                workdir = Path(raw)
                source = item.source
                if self.skill_fetcher is not None:
                    skill_dir = self.skill_fetcher(item.id, workdir)
                elif source["type"] == "github":
                    skill_dir = fetch_github_skill(
                        str(source["repo"]), str(source["path"]), str(source.get("ref") or "main"), workdir
                    )
                else:
                    skill_dir = fetch_url_skill(str(source["url"]), workdir)
                from agents.skill_parser import parse_skill_dir
                from agents.registry import tool_specs

                parsed = parse_skill_dir(skill_dir)
                if parsed is None or parsed["name"] != item.id:
                    raise ValueError("Skill 元数据名称与目录 ID 不一致")
                known_tools = {spec.name for spec in tool_specs()}
                unknown_tools = [name for name in parsed.get("tool_names") or () if name not in known_tools]
                if unknown_tools:
                    raise ValueError(f"Skill 引用了未知工具: {', '.join(unknown_tools)}")
                if target.exists():
                    raise ValueError("已存在同名 Skill")
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(skill_dir, target)
            skills.refresh_skills()
            skills.set_skill_state(item.id, enabled=False, trusted=False, scripts_enabled=False)
            return {"name": item.id, "tools": list(parsed.get("tool_names") or ())}
        except Exception:
            shutil.rmtree(target, ignore_errors=True)
            if old_state is None:
                state_path.unlink(missing_ok=True)
            else:
                state_path.parent.mkdir(parents=True, exist_ok=True)
                state_path.write_bytes(old_state)
            skills.refresh_skills()
            raise

    def _install_mcp(self, item: CatalogItem) -> dict:
        if self.mcp_manager is None:
            raise RuntimeError("MCP 管理器尚未就绪")
        path = self._mcp_path()
        old_config = path.read_bytes() if path.is_file() else None
        servers = load_servers(path)
        source = item.source
        if source["type"] == "package":
            runtime = str(source["runtime"])
            package = str(source["package"])
            args = [package, *[str(value) for value in source.get("args") or []]]
            if runtime == "npx":
                args = ["-y", *args]
            elif runtime == "docker":
                args = ["run", "--rm", "-i", *args]
            config = MCPServerConfig(name=item.id, command=runtime, args=args, env={})
        else:
            config = MCPServerConfig(
                name=item.id,
                transport=str(source["transport"]),
                url=str(source["url"]),
                headers={str(k): str(v) for k, v in (source.get("headers") or {}).items()},
            )
        config.enabled = False
        config.allowed_persona_ids = []
        config.validate(allow_arbitrary_stdio=getattr(self.mcp_manager, "_allow_arbitrary", False))
        try:
            save_servers(path, [*servers, config])
            outcome = self.mcp_manager.reload_server(item.id)
            if inspect.isawaitable(outcome):
                outcome = asyncio.run(outcome)
            if isinstance(outcome, dict) and outcome.get("status") == "error":
                raise RuntimeError(outcome.get("error") or "MCP 连接失败")
            return {"name": item.id, "transport": config.transport}
        except Exception:
            if old_config is None:
                path.unlink(missing_ok=True)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(old_config)
            raise
