from typing import Any

from fastapi import APIRouter, HTTPException

from agents.registry import worker_manifest, worker_manifests


router = APIRouter(prefix="/api/workers/manifests", tags=["worker-manifests"])


@router.get("")
def list_worker_manifests() -> dict[str, list[dict[str, Any]]]:
    return {"items": [manifest.as_dict() for manifest in worker_manifests()]}


@router.get("/{worker}")
def get_worker_manifest(worker: str) -> dict[str, Any]:
    try:
        return worker_manifest(worker).as_dict()
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Worker manifest not found: {worker}",
        ) from exc