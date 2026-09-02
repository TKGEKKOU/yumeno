"""Live2D Worker 工具集。

工具只包装当前项目已经存在的 Live2D 能力，不虚构动作、表情或远程控制 API。
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from langchain.tools import ToolRuntime, tool

from agents.context import PersonaAgentContext
from settings import Settings


def _live2d_root() -> Path:
    return Settings.load().project_root / "data" / "live2d"


@tool("list_live2d_models")
def list_live2d_models(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """扫描项目中的 Cubism 2/4 Live2D 模型并返回兼容性。"""
    from app.routers.live2d import discover_models

    root = _live2d_root()
    root.mkdir(parents=True, exist_ok=True)
    return {"status": "ok", "root": str(root), "models": discover_models(root)}


@tool("get_live2d_vts_config")
def get_live2d_vts_config(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """返回 VTube Studio WebSocket 连接配置。"""
    from app.routers.live2d import VTS_URL

    return {
        "status": "ok",
        "url": VTS_URL,
        "host": "127.0.0.1",
        "port": 8001,
        "plugin_name": "YUMENO",
        "protocol": "VTubeStudioPublicAPI 1.0",
    }


@tool("open_live2d_model_directory")
def open_live2d_model_directory(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """打开本地 Live2D 模型目录。"""
    from voice.resource_directory import open_resource_directory

    root = _live2d_root()
    root.mkdir(parents=True, exist_ok=True)
    return {"status": "ok", "opened_directory": open_resource_directory(root)}


__all__ = ["list_live2d_models", "get_live2d_vts_config", "open_live2d_model_directory"]
