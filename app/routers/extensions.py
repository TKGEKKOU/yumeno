"""Online Skill/MCP extension catalog and transactional installation API."""

from __future__ import annotations

import asyncio
from dataclasses import asdict

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from extensions.catalog import CatalogClient, CatalogUnavailableError
from extensions.installer import ExtensionInstaller


router = APIRouter(prefix="/api/extensions", tags=["extensions"])


class InstallPayload(BaseModel):
    confirmed: bool = False


def _catalog(request: Request) -> CatalogClient:
    client = getattr(request.app.state, "extension_catalog_client", None)
    if client is None:
        client = CatalogClient(request.app.state.settings.project_root)
        request.app.state.extension_catalog_client = client
    return client


def _installer(request: Request) -> ExtensionInstaller:
    installer = getattr(request.app.state, "extension_installer", None)
    manager = getattr(request.app.state, "mcp_manager", None)
    if installer is None:
        installer = ExtensionInstaller(
            request.app.state.settings.project_root,
            catalog_client=_catalog(request),
            mcp_manager=manager,
        )
        request.app.state.extension_installer = installer
    else:
        installer.catalog_client = _catalog(request)
        installer.mcp_manager = manager
    return installer


def _item_dict(item) -> dict:
    value = asdict(item)
    value["categories"] = list(item.categories)
    return value


def _snapshot_dict(snapshot, kind: str = "all") -> dict:
    items = [item for item in snapshot.items if kind in {"all", item.kind}]
    return {
        "schema_version": snapshot.schema_version,
        "catalog_version": snapshot.catalog_version,
        "generated_at": snapshot.generated_at,
        "fetched_at": snapshot.fetched_at,
        "stale": snapshot.stale,
        "items": [_item_dict(item) for item in items],
    }


@router.get("/catalog")
def catalog_api(request: Request, kind: str = Query("all"), refresh: bool = False) -> dict:
    if kind not in {"all", "skill", "mcp"}:
        raise HTTPException(status_code=422, detail="kind 仅支持 all/skill/mcp")
    try:
        return _snapshot_dict(_catalog(request).fetch(refresh=refresh), kind)
    except CatalogUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/catalog/{item_id}")
def catalog_item_api(request: Request, item_id: str) -> dict:
    try:
        snapshot = _catalog(request).fetch()
    except CatalogUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    item = next((value for value in snapshot.items if value.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="扩展目录条目不存在")
    return _item_dict(item)


@router.post("/catalog/refresh")
def refresh_catalog_api(request: Request) -> dict:
    try:
        return _snapshot_dict(_catalog(request).fetch(refresh=True))
    except CatalogUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/catalog/{item_id}/install")
async def install_catalog_item_api(request: Request, item_id: str, payload: InstallPayload) -> dict:
    installer = _installer(request)
    try:
        if not payload.confirmed:
            return installer.install(item_id, confirmed=False).to_dict()
        result = await asyncio.to_thread(installer.install, item_id, confirmed=True)
        return result.to_dict()
    except KeyError:
        raise HTTPException(status_code=404, detail="扩展目录条目不存在") from None
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/catalog/install/{job_id}")
def install_status_api(request: Request, job_id: str) -> dict:
    try:
        return _installer(request).status(job_id).to_dict()
    except KeyError:
        raise HTTPException(status_code=404, detail="安装任务不存在") from None
