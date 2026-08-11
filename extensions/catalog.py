"""Validated online catalog for declarative Skill and MCP extensions."""

from __future__ import annotations

import json
import os
import re
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
from urllib.parse import urlparse


DEFAULT_CATALOG_URL = "https://raw.githubusercontent.com/TKGEKKOU/yumeno/main/catalog/extension-catalog.json"
CATALOG_SCHEMA_VERSION = 1
MAX_CATALOG_BYTES = 2 * 1024 * 1024
_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
_SHA256_PATTERN = re.compile(r"^[0-9a-fA-F]{64}$")
_MCP_RUNTIMES = {"uvx", "npx", "docker"}
_MCP_TRANSPORTS = {"streamable_http", "sse"}


class CatalogValidationError(ValueError):
    pass


class CatalogUnavailableError(RuntimeError):
    pass


@dataclass(frozen=True)
class CatalogItem:
    id: str
    kind: str
    name: str
    description: str
    version: str
    categories: tuple[str, ...]
    source: dict
    requires: dict
    security: dict


@dataclass(frozen=True)
class CatalogSnapshot:
    schema_version: int
    catalog_version: str
    generated_at: str
    fetched_at: str
    stale: bool
    items: tuple[CatalogItem, ...]


def _https(value: str, field: str) -> None:
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.netloc:
        raise CatalogValidationError(f"{field} 必须使用 HTTPS")


def _reject_scripts(value: object, field: str = "source") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if "script" in str(key).lower() or "command_file" in str(key).lower():
                raise CatalogValidationError(f"{field}.{key} 不允许声明远程 script")
            _reject_scripts(child, f"{field}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _reject_scripts(child, f"{field}[{index}]")


def _source(source: object, kind: str) -> dict:
    if not isinstance(source, dict):
        raise CatalogValidationError("source 必须是对象")
    result = {str(key): value for key, value in source.items()}
    source_type = str(result.get("type") or "")
    if kind == "skill":
        if source_type == "github":
            repo = str(result.get("repo") or "")
            path = str(result.get("path") or "").strip("/")
            if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo) or not path:
                raise CatalogValidationError("Skill GitHub 来源需要 repo 和 path")
        elif source_type == "url":
            url = str(result.get("url") or "")
            _https(url, "source.url")
        else:
            raise CatalogValidationError("Skill source.type 仅支持 github/url")
    elif kind == "mcp":
        if source_type == "package":
            runtime = str(result.get("runtime") or "")
            package = str(result.get("package") or "").strip()
            if runtime not in _MCP_RUNTIMES or not package:
                raise CatalogValidationError("MCP package 来源需要受支持的 runtime 和 package")
            args = result.get("args") or []
            if not isinstance(args, list) or not all(isinstance(item, str) for item in args):
                raise CatalogValidationError("MCP source.args 必须是字符串数组")
        elif source_type == "remote":
            transport = str(result.get("transport") or "")
            if transport not in _MCP_TRANSPORTS:
                raise CatalogValidationError("MCP remote transport 不受支持")
            _https(str(result.get("url") or ""), "source.url")
        else:
            raise CatalogValidationError("MCP source.type 仅支持 package/remote")
    else:
        raise CatalogValidationError(f"kind 不受支持: {kind}")
    _reject_scripts(result)
    digest = result.get("sha256")
    if digest is not None and not _SHA256_PATTERN.fullmatch(str(digest)):
        raise CatalogValidationError("source.sha256 必须是 64 位十六进制")
    return result


def validate_catalog(payload: dict) -> CatalogSnapshot:
    if not isinstance(payload, dict) or payload.get("schema_version") != CATALOG_SCHEMA_VERSION:
        raise CatalogValidationError("不支持的目录 schema_version")
    raw_items = payload.get("items")
    if not isinstance(raw_items, list):
        raise CatalogValidationError("items 必须是数组")
    items: list[CatalogItem] = []
    ids: set[str] = set()
    for raw in raw_items:
        if not isinstance(raw, dict):
            raise CatalogValidationError("目录条目必须是对象")
        item_id = str(raw.get("id") or "")
        if not _ID_PATTERN.fullmatch(item_id):
            raise CatalogValidationError("目录条目 id 格式无效")
        if item_id in ids:
            raise CatalogValidationError(f"目录条目 id 重复: {item_id}")
        ids.add(item_id)
        kind = str(raw.get("kind") or "")
        source = _source(raw.get("source"), kind)
        categories = raw.get("categories") or []
        if not isinstance(categories, list) or not all(isinstance(value, str) for value in categories):
            raise CatalogValidationError("categories 必须是字符串数组")
        requires = raw.get("requires") or {}
        security = raw.get("security") or {}
        if not isinstance(requires, dict) or not isinstance(security, dict):
            raise CatalogValidationError("requires/security 必须是对象")
        items.append(
            CatalogItem(
                id=item_id,
                kind=kind,
                name=str(raw.get("name") or item_id),
                description=str(raw.get("description") or ""),
                version=str(raw.get("version") or ""),
                categories=tuple(categories),
                source=source,
                requires=dict(requires),
                security=dict(security),
            )
        )
    fetched_at = str(payload.get("fetched_at") or datetime.now(timezone.utc).isoformat())
    return CatalogSnapshot(
        schema_version=CATALOG_SCHEMA_VERSION,
        catalog_version=str(payload.get("catalog_version") or ""),
        generated_at=str(payload.get("generated_at") or ""),
        fetched_at=fetched_at,
        stale=False,
        items=tuple(items),
    )


class CatalogClient:
    def __init__(
        self,
        project_root: Path,
        *,
        url: str | None = None,
        fetcher: Callable[[str], bytes] | None = None,
    ) -> None:
        self.project_root = Path(project_root)
        self.url = url or os.environ.get("YUMENO_EXTENSION_CATALOG_URL", DEFAULT_CATALOG_URL)
        self.cache_path = self.project_root / "data" / "cache" / "extensions" / "catalog.json"
        self.fetcher = fetcher or self._download

    @staticmethod
    def _download(url: str) -> bytes:
        _https(url, "目录 URL")
        request = urllib.request.Request(url, headers={"User-Agent": "YUMENO"})
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read(MAX_CATALOG_BYTES + 1)
        if len(data) > MAX_CATALOG_BYTES:
            raise CatalogValidationError("在线目录超过 2MB 上限")
        return data

    def _cached(self) -> CatalogSnapshot | None:
        try:
            payload = json.loads(self.cache_path.read_text(encoding="utf-8"))
            return validate_catalog(payload)
        except (OSError, ValueError, json.JSONDecodeError):
            return None

    def fetch(self, *, refresh: bool = False) -> CatalogSnapshot:
        cached = self._cached()
        if cached is not None and not refresh:
            return cached
        try:
            payload = json.loads(self.fetcher(self.url).decode("utf-8"))
            snapshot = validate_catalog(payload)
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            stored = dict(payload)
            stored["fetched_at"] = snapshot.fetched_at
            self.cache_path.write_text(json.dumps(stored, ensure_ascii=False, indent=2), encoding="utf-8")
            return snapshot
        except Exception as exc:
            if cached is not None:
                return CatalogSnapshot(
                    schema_version=cached.schema_version,
                    catalog_version=cached.catalog_version,
                    generated_at=cached.generated_at,
                    fetched_at=cached.fetched_at,
                    stale=True,
                    items=cached.items,
                )
            raise CatalogUnavailableError(f"在线扩展目录不可用: {exc}") from exc
