"""Chat-facing integration status and reconnect tools."""

import asyncio

from langchain.tools import ToolRuntime, tool

from agents.context import PersonaAgentContext

_mcp_manager = None
_onebot_manager = None
_bilibili_manager = None


def set_integration_managers(mcp, onebot, bilibili) -> None:
    global _mcp_manager, _onebot_manager, _bilibili_manager
    _mcp_manager = mcp
    _onebot_manager = onebot
    _bilibili_manager = bilibili


def get_mcp_manager():
    return _mcp_manager


def get_onebot_manager():
    return _onebot_manager


def get_bilibili_manager():
    return _bilibili_manager


def list_integration_status_core(mcp, onebot, bilibili) -> dict:
    statuses = mcp.status() if mcp is not None else {}
    items = [{"name": name, **dict(state)} for name, state in statuses.items()]
    return {
        "mcp": {"items": items},
        "onebot": onebot.status() if onebot is not None else {},
        "bilibili": bilibili.status() if bilibili is not None else {},
    }


def reconnect_mcp_server_core(name: str, manager) -> dict:
    config = manager.get_config(name) if manager is not None else None
    if config is None:
        return {"status": "error", "error": f"MCP 服务器不存在: {name}"}
    state = asyncio.run(manager.reload_server(name))
    ok = state.get("status") != "error"
    return {
        "status": "ok" if ok else "error",
        "server": name,
        "state": state,
        "error": state.get("error", ""),
    }


def reconnect_onebot_core(onebot) -> dict:
    return asyncio.run(onebot.reconnect())


def reconnect_bilibili_core(bilibili) -> dict:
    return asyncio.run(bilibili.reconnect())


@tool("list_integration_status")
def list_integration_status(runtime: ToolRuntime[PersonaAgentContext]) -> dict:
    """Read-only MCP / OneBot / Bilibili connection status for the current workspace."""
    return list_integration_status_core(_mcp_manager, _onebot_manager, _bilibili_manager)


@tool("reconnect_mcp_server")
def reconnect_mcp_server(name: str, runtime: ToolRuntime[PersonaAgentContext]) -> dict:
    """Hot-reload one configured MCP server by name."""
    return reconnect_mcp_server_core(name, _mcp_manager)


@tool("reconnect_onebot")
def reconnect_onebot(runtime: ToolRuntime[PersonaAgentContext]) -> dict:
    """Ask NapCat to reconnect the reverse WebSocket session."""
    return reconnect_onebot_core(_onebot_manager)


@tool("reconnect_bilibili")
def reconnect_bilibili(runtime: ToolRuntime[PersonaAgentContext]) -> dict:
    """Disconnect and reconnect the Bilibili live session."""
    return reconnect_bilibili_core(_bilibili_manager)
