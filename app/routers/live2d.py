from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Header, HTTPException, Request

from app.routers.settings import require_local
from settings import Settings


router = APIRouter(prefix="/api/live2d", tags=["live2d"])

LIVE2D_ROOT = Settings.load().project_root / "data" / "live2d"
CUBISM4_GLOB = "*.model3.json"
CUBISM2_GLOB = "*.model.json"
VTS_URL = "ws://127.0.0.1:8001"
MAX_MOC3_VERSION = 6


def _moc3_version(entry: Path) -> int | None:
    try:
        data = json.loads(entry.read_text(encoding="utf-8"))
        moc_name = data.get("FileReferences", {}).get("Moc")
        if not moc_name:
            return None
        header = (entry.parent / moc_name).read_bytes()[:5]
        if header[:4] != b"MOC3" or len(header) < 5:
            return None
        return header[4]
    except (OSError, ValueError, TypeError):
        return None


def discover_models(root: Path) -> list[dict]:
    """Scan one directory per model. Prefer Cubism 4 (.model3.json) over
    Cubism 2 (.model.json) when both exist in the same folder."""
    if not root.is_dir():
        return []
    models: list[dict] = []
    for directory in sorted((item for item in root.iterdir() if item.is_dir())):
        cubism4 = sorted(directory.glob(CUBISM4_GLOB))
        cubism2 = sorted(directory.glob(CUBISM2_GLOB))
        if cubism4:
            entry, kind = cubism4[0], "cubism4"
        elif cubism2:
            entry, kind = cubism2[0], "cubism2"
        else:
            continue
        moc_version = _moc3_version(entry) if kind == "cubism4" else None
        models.append(
            {
                "id": directory.name,
                "name": directory.name,
                "entry": f"{directory.name}/{entry.name}",
                "kind": kind,
                "moc_version": moc_version,
                "compatible": moc_version is None or moc_version <= MAX_MOC3_VERSION,
            }
        )
    return models


@router.get("/models")
def list_models(request: Request) -> dict:
    require_local(request)
    return {"models": discover_models(LIVE2D_ROOT)}


@router.get("/vts")
def vts_connection_config(request: Request) -> dict:
    require_local(request)
    return {
        "url": VTS_URL,
        "host": "127.0.0.1",
        "port": 8001,
        "plugin_name": "YUMENO",
        "protocol": "VTubeStudioPublicAPI 1.0",
    }


@router.post("/model-directory")
def open_live2d_model_directory(
    request: Request,
    x_yumeno_request: str = Header(default=""),
) -> dict:
    require_local(request)
    if x_yumeno_request != "web":
        raise HTTPException(status_code=403, detail="Missing same-origin request header")
    from voice.resource_directory import open_resource_directory

    LIVE2D_ROOT.mkdir(parents=True, exist_ok=True)
    return {"opened_directory": open_resource_directory(LIVE2D_ROOT)}
