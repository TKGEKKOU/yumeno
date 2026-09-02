from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Body, Header, HTTPException, Request
from sqlalchemy import select

from app.models import ProviderDownloadTask
from app.routers.settings import require_local

router = APIRouter(prefix="/api/resources", tags=["resources"])
legacy_router = APIRouter(prefix="/api/providers/resources", tags=["provider-resources"])

_ACTIVE = {"queued", "preparing", "downloading", "verifying", "installing", "running"}

def _guard(request: Request, header: str) -> None:
    require_local(request)
    if header != "web":
        raise HTTPException(status_code=403, detail="Missing same-origin request header")

def _resource(request: Request, provider_id: str):
    mapping = {
        "embedding": "embedding_resources", "local_embedding": "embedding_resources",
        "reranker": "reranker_resources", "local_rerank": "reranker_resources",
        "stt": "asr_resources", "local_stt": "asr_resources",
        "gsv_tts_local": "gpt_sovits_install", "tts": "gpt_sovits_install",
        "rvc": "rvc_resources", "separator": "separator_resources",
    }
    attr = mapping.get(provider_id)
    value = getattr(request.app.state, attr, None) if attr else None
    if value is None:
        raise HTTPException(status_code=404, detail=f"未找到本地资源管理器：{provider_id}")
    return value

def _status(resource: Any) -> dict[str, Any]:
    value = resource.status() if callable(getattr(resource, "status", None)) else {}
    return value if isinstance(value, dict) else {"value": value}

def _task_payload(row: ProviderDownloadTask, status: dict[str, Any] | None = None) -> dict[str, Any]:
    """Serialize a task without replacing terminal history with live provider state.

    A provider exposes one current installation state, while the database stores many
    historical tasks.  For a failed/cancelled task we must keep its own phase/error;
    otherwise every old failure would appear as ``failed + done + 100%`` after the
    provider becomes ready later.
    """
    status = status or {}
    telemetry = (row.parameters_json or {}).get("telemetry", {})
    live = row.status in _ACTIVE
    progress = status.get("progress_percent", status.get("progress", telemetry.get("progress_percent", row.progress))) if live else row.progress
    downloaded = status.get("downloaded_bytes", telemetry.get("downloaded_bytes", 0)) if live else telemetry.get("downloaded_bytes", 0)
    total = status.get("total_bytes", telemetry.get("total_bytes", 0)) if live else telemetry.get("total_bytes", 0)
    elapsed = status.get("elapsed_seconds", telemetry.get("elapsed_seconds", 0)) or 0
    speed = status.get("speed_bytes_per_second", telemetry.get("speed_bytes_per_second", 0)) or (downloaded / elapsed if elapsed else 0)
    status_name = row.status
    if live and status.get("installing"):
        status_name = "downloading" if status.get("phase") in {"downloading", "download"} else "installing"
    elif live and (status.get("ready") or status.get("installed")):
        status_name = "ready"
    phase = status.get("phase", row.phase) if live else row.phase
    current_file = status.get("current_file", telemetry.get("current_file", "")) if live else telemetry.get("current_file", "")
    error = (status.get("error") or row.error) if live else row.error
    return {
        "task_id": row.id, "provider_id": row.provider_id, "resource_kind": row.resource_kind,
        "resource_name": (row.parameters_json or {}).get("resource_name", row.provider_id),
        "operation": row.operation, "status": status_name, "phase": phase,
        "progress_percent": progress, "downloaded_bytes": downloaded,
        "total_bytes": total, "speed_bytes_per_second": speed,
        "eta_seconds": status.get("eta_seconds") if live and status.get("eta_seconds") is not None else (max(0, (total - downloaded) / speed) if speed and total else None),
        "current_file": current_file,
        "error_message": error, "retry_count": (row.parameters_json or {}).get("retry_count", 0),
        "resource_status": status if live else None,
        # Legacy aliases retained while all clients migrate to the standard fields.
        "progress": progress, "detail": row.detail, "error": error,
        "parameters": row.parameters_json or {},
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "started_at": row.started_at.isoformat() if row.started_at else None,
        "finished_at": row.finished_at.isoformat() if row.finished_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }

def _sync_task(request: Request, row: ProviderDownloadTask) -> dict[str, Any]:
    try:
        value = _status(_resource(request, row.provider_id))
    except HTTPException:
        value = {}
    if row.status in _ACTIVE:
        progress = value.get("progress_percent", value.get("progress"))
        if progress is not None:
            row.progress = max(0, min(100, int(progress)))
        if value.get("error"):
            row.error = str(value["error"])
            row.status = "failed"
            row.phase = "failed"
            row.detail = str(value.get("detail") or value.get("message") or "资源安装失败")
            row.finished_at = datetime.now(timezone.utc)
        elif value.get("ready") and not value.get("installing"):
            row.status = "ready"
            row.phase = "done"
            row.progress = 100
            row.finished_at = datetime.now(timezone.utc)
        else:
            row.phase = str(value.get("phase") or row.phase)
        row.detail = str(value.get("current_file") or value.get("message") or row.detail)
        # Keep the most recent byte/speed telemetry in the task JSON.  This makes
        # completed history useful while live fields still come from the manager.
        parameters = dict(row.parameters_json or {})
        parameters["telemetry"] = {
            key: value.get(key)
            for key in ("progress_percent", "downloaded_bytes", "total_bytes", "speed_bytes_per_second", "eta_seconds", "current_file", "phase")
            if value.get(key) is not None
        }
        row.parameters_json = parameters
        row.updated_at = datetime.now(timezone.utc)
        with request.app.state.session_factory() as session:
            session.merge(row); session.commit()
    return _task_payload(row, value)

def _install(request: Request, provider_id: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = dict(payload or {})
    # New clients send {parameters: {...}} while early clients sent the
    # parameters directly. Accept both so the unified endpoint is stable.
    nested = payload.pop("parameters", None)
    if isinstance(nested, dict):
        nested.update(payload)
        payload = nested
    resource = _resource(request, provider_id)
    with request.app.state.session_factory() as session:
        existing = session.scalar(select(ProviderDownloadTask).where(ProviderDownloadTask.provider_id == provider_id, ProviderDownloadTask.status.in_(_ACTIVE)).order_by(ProviderDownloadTask.created_at.desc()))
        if existing:
            return _task_payload(existing, _status(resource))
        payload.setdefault("resource_name", {"rvc": "RVC", "separator": "人声分离"}.get(provider_id, provider_id))
        row = ProviderDownloadTask(id=str(uuid4()), provider_id=provider_id, resource_kind=provider_id, operation="install", status="preparing", phase="preparing", parameters_json=payload)
        session.add(row); session.commit(); session.refresh(row)
    try:
        if provider_id in {"embedding", "local_embedding", "reranker", "local_rerank"}:
            resource.start_install(payload.get("model_id", ""), payload.get("source", "modelscope"), payload.get("device", "auto"))
        elif provider_id in {"gsv_tts_local", "tts"}:
            resource.start_install(payload.get("url"))
        else:
            resource.start_install()
    except Exception as exc:
        with request.app.state.session_factory() as session:
            current = session.get(ProviderDownloadTask, row.id)
            if current:
                current.status = "failed"; current.error = str(exc); current.finished_at = datetime.now(timezone.utc); session.commit()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return _sync_task(request, row)

def install(request: Request, provider_id: str, x_yumeno_request: str, payload: dict[str, Any] | None = None):
    _guard(request, x_yumeno_request)
    return _install(request, provider_id, payload)

@router.post("/{provider_id}/install", status_code=202)
def install_resource(
    provider_id: str,
    request: Request,
    payload: dict[str, Any] | None = Body(default=None),
    x_yumeno_request: str = Header(default=""),
):
    """统一资源安装入口；旧的 /api/providers/resources 路径继续兼容。"""
    _guard(request, x_yumeno_request)
    return _install(request, provider_id, payload)


@router.get("/tasks")
def list_tasks(request: Request, x_yumeno_request: str = Header(default=""), limit: int = 30):
    _guard(request, x_yumeno_request)
    with request.app.state.session_factory() as session:
        rows = session.scalars(select(ProviderDownloadTask).order_by(ProviderDownloadTask.created_at.desc()).limit(max(1, min(limit, 100)))).all()
    return {"items": [_sync_task(request, row) for row in rows]}

@router.delete("/tasks", status_code=200)
def clear_finished_tasks(request: Request, finished: bool = False, x_yumeno_request: str = Header(default="")):
    """清理已结束的资源任务记录，不触碰已安装的资源文件。"""
    _guard(request, x_yumeno_request)
    if not finished:
        raise HTTPException(status_code=400, detail="只允许清理已结束任务")
    terminal = {"succeeded", "success", "ready", "failed", "cancelled", "interrupted"}
    with request.app.state.session_factory() as session:
        rows = session.scalars(select(ProviderDownloadTask).where(ProviderDownloadTask.status.in_(terminal))).all()
        count = len(rows)
        for row in rows:
            session.delete(row)
        session.commit()
    return {"deleted": count}

@router.get("/tasks/{task_id}")
def task_detail(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    _guard(request, x_yumeno_request)
    with request.app.state.session_factory() as session:
        row = session.get(ProviderDownloadTask, task_id)
    if row is None: raise HTTPException(status_code=404, detail="任务不存在")
    return _sync_task(request, row)

@router.delete("/tasks/{task_id}", status_code=202)
def cancel_task(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    _guard(request, x_yumeno_request)
    with request.app.state.session_factory() as session:
        row = session.get(ProviderDownloadTask, task_id)
        if row is None: raise HTTPException(status_code=404, detail="任务不存在")
        resource = _resource(request, row.provider_id)
        if row.status in _ACTIVE:
            cancel = getattr(resource, "cancel_install", None)
            if callable(cancel): cancel()
            row.status = "cancelled"; row.phase = "cancelled"; row.finished_at = datetime.now(timezone.utc); session.commit()
    return {"task_id": task_id, "cancelled": True}

@router.post("/tasks/{task_id}/retry", status_code=202)
def retry_task(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    _guard(request, x_yumeno_request)
    with request.app.state.session_factory() as session:
        row = session.get(ProviderDownloadTask, task_id)
        if row is None: raise HTTPException(status_code=404, detail="任务不存在")
        provider_id, params = row.provider_id, dict(row.parameters_json or {})
        params["retry_count"] = int(params.get("retry_count", 0)) + 1
    return _install(request, provider_id, params)

for _router in (legacy_router,):
    _router.add_api_route("/{provider_id}/install", install, methods=["POST"], status_code=202)
    _router.add_api_route("/tasks", list_tasks, methods=["GET"])
    _router.add_api_route("/tasks", clear_finished_tasks, methods=["DELETE"])
    _router.add_api_route("/tasks/{task_id}", task_detail, methods=["GET"])
    _router.add_api_route("/tasks/{task_id}", cancel_task, methods=["DELETE"], status_code=202)
    _router.add_api_route("/tasks/{task_id}/retry", retry_task, methods=["POST"], status_code=202)

__all__ = ["router", "legacy_router"]
