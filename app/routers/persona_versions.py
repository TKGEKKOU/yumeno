"""角色运行时版本 API。"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_session
from app.routers.personas import local_persona_or_404
from app.schemas import PersonaVersionCreate
from integrations.mcp.config import GLOBAL_ALL
from persona.versions import PersonaRuntimeSnapshot, PersonaVersionService, diff_runtime_snapshots

router = APIRouter(prefix="/api/personas", tags=["persona-versions"])
_service = PersonaVersionService()


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _serialize_version(version, *, include_snapshot: bool = True) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "id": version.id,
        "persona_id": version.persona_id,
        "version_number": version.version_number,
        "status": version.status,
        "label": version.label,
        "note": version.note,
        "created_at": _iso(version.created_at),
        "published_at": _iso(version.published_at),
    }
    if include_snapshot:
        payload["snapshot"] = PersonaRuntimeSnapshot.model_validate(version.snapshot_json).model_dump(mode="json")
    return payload


def _manager(request: Request):
    return getattr(request.app.state, "mcp_manager", None)


def _current_mcp_server_names(manager, persona_id: str) -> list[str]:
    if manager is None:
        return []
    return sorted(
        server.name
        for server in manager.list_configs()
        if GLOBAL_ALL in server.allowed_persona_ids or persona_id in server.allowed_persona_ids
    )


def _apply_mcp_server_names(manager, persona_id: str, server_names: list[str]) -> None:
    if manager is None:
        if server_names:
            raise HTTPException(status_code=409, detail="MCP 管理器尚未就绪，无法恢复角色授权")
        return
    wanted = set(server_names)
    servers = manager.list_configs()
    missing = sorted(wanted - {server.name for server in servers})
    if missing:
        raise HTTPException(status_code=409, detail=f"版本引用的 MCP 服务器不存在: {', '.join(missing)}")
    for server in servers:
        if GLOBAL_ALL in server.allowed_persona_ids:
            continue
        allowed = set(server.allowed_persona_ids)
        if server.name in wanted:
            allowed.add(persona_id)
        else:
            allowed.discard(persona_id)
        server.allowed_persona_ids = sorted(allowed)
    manager.save_configs(servers)


def _refresh_mcp_grants() -> None:
    from agents.mcp_grants import refresh_grants

    refresh_grants()


def _version_or_404(session: Session, persona_id: str, version_id: str):
    local_persona_or_404(session, persona_id)
    version = _service.get(session, persona_id, version_id)
    if version is None:
        raise HTTPException(status_code=404, detail="角色版本不存在")
    return version


@router.post("/{persona_id}/versions", status_code=status.HTTP_201_CREATED)
def create_persona_version(
    persona_id: str,
    payload: PersonaVersionCreate,
    request: Request,
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    persona = local_persona_or_404(session, persona_id)
    manager = _manager(request)
    version = _service.create(
        session,
        persona,
        label=payload.label,
        note=payload.note,
        mcp_server_names=_current_mcp_server_names(manager, persona_id),
    )
    session.commit()
    session.refresh(version)
    return _serialize_version(version)


@router.get("/{persona_id}/versions")
def list_persona_versions(
    persona_id: str,
    session: Session = Depends(get_session),
) -> list[dict[str, Any]]:
    local_persona_or_404(session, persona_id)
    return [_serialize_version(version, include_snapshot=False) for version in _service.list(session, persona_id)]


@router.get("/{persona_id}/versions/diff")
def diff_persona_versions(
    persona_id: str,
    from_version_id: str = Query(..., min_length=1),
    to_version_id: str = Query(..., min_length=1),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    local_persona_or_404(session, persona_id)
    before = _service.get(session, persona_id, from_version_id)
    after = _service.get(session, persona_id, to_version_id)
    if before is None or after is None:
        raise HTTPException(status_code=404, detail="比较的角色版本不存在")
    return {
        "persona_id": persona_id,
        "from_version_id": from_version_id,
        "to_version_id": to_version_id,
        **diff_runtime_snapshots(_service.snapshot(before), _service.snapshot(after)),
    }


@router.get("/{persona_id}/versions/{version_id}")
def get_persona_version(
    persona_id: str,
    version_id: str,
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    return _serialize_version(_version_or_404(session, persona_id, version_id))


def _publish_version(
    *,
    action: str,
    persona_id: str,
    version_id: str,
    request: Request,
    session: Session,
) -> dict[str, Any]:
    persona = local_persona_or_404(session, persona_id)
    version = _service.get(session, persona_id, version_id)
    if version is None:
        raise HTTPException(status_code=404, detail="角色版本不存在")
    manager = _manager(request)
    snapshot = _service.snapshot(version)
    previous_servers = deepcopy(manager.list_configs()) if manager is not None else None
    try:
        _service.publish(session, persona, version)
        _apply_mcp_server_names(manager, persona_id, snapshot.mcp_server_names)
        session.commit()
        _refresh_mcp_grants()
        session.refresh(version)
    except ValueError as exc:
        session.rollback()
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception:
        session.rollback()
        try:
            if manager is not None and previous_servers is not None:
                manager.save_configs(previous_servers)
                _refresh_mcp_grants()
        except Exception:
            # 原始异常更能说明发布失败原因；配置回滚失败会在后续健康检查中暴露。
            pass
        raise
    return {"action": action, **_serialize_version(version)}


@router.post("/{persona_id}/versions/{version_id}/publish")
def publish_persona_version(
    persona_id: str,
    version_id: str,
    request: Request,
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    return _publish_version(
        action="publish",
        persona_id=persona_id,
        version_id=version_id,
        request=request,
        session=session,
    )


@router.post("/{persona_id}/versions/{version_id}/rollback")
def rollback_persona_version(
    persona_id: str,
    version_id: str,
    request: Request,
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    return _publish_version(
        action="rollback",
        persona_id=persona_id,
        version_id=version_id,
        request=request,
        session=session,
    )

