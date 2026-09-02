"""MCP 客户端管理器：工具分类、注册与连接状态。"""

import asyncio
import concurrent.futures
import sys
import threading
import time

import pytest

from langchain_core.tools import tool

from agents.registry import tool_specs, unregister_tool_specs
from integrations.mcp.client import (
    MCPManager,
    MCPRuntime,
    classify_mcp_tool,
)
from integrations.mcp.config import MCPServerConfig


def test_config_roundtrip_allowed_persona_ids(tmp_path):
    from integrations.mcp.config import load_servers, save_servers

    cfg = MCPServerConfig(
        name="demo", command="python", args=["s.py"], allowed_persona_ids=["p1", "p2"]
    )
    save_servers(tmp_path / "mcp_servers.json", [cfg])
    loaded = load_servers(tmp_path / "mcp_servers.json")[0]
    assert loaded.allowed_persona_ids == ["p1", "p2"]


def test_tool_spec_server_default_empty():
    from agents.registry import ToolSpec

    spec = ToolSpec("n", "mcp", tool=lambda: None)
    assert spec.server == ""


def _make_tool(name, description="desc", metadata=None):
    def fn(*args, **kwargs):
        return "ok"

    fn.__name__ = name
    built = tool(description=description)(fn)
    built.metadata = metadata
    return built


def test_classify_mcp_tool():
    read_only = _make_tool("read", metadata={"read_only_hint": True})
    assert classify_mcp_tool(read_only) == (False, False)

    writer = _make_tool("write", metadata={"read_only_hint": False})
    assert classify_mcp_tool(writer) == (True, True)

    destructive = _make_tool("rm", metadata={"destructive_hint": True})
    assert classify_mcp_tool(destructive) == (True, True)

    undeclared = _make_tool("plain")
    assert classify_mcp_tool(undeclared) == (True, True)

    camel = _make_tool("camel", metadata={"readOnlyHint": True})
    assert classify_mcp_tool(camel) == (False, False)


class FakeMCPClient:
    """假客户端：按服务器名返回预设工具，可配置失败。"""

    def __init__(self, connections, tool_name_prefix=True, handle_tool_errors=True):
        self.connections = connections
        self.tool_name_prefix = tool_name_prefix
        self.server_tools = {}

    async def get_tools(self, server_name=None):
        if self.connections.get(server_name, {}).get("fail"):
            raise ConnectionError("boom")
        return self.server_tools.get(server_name, [])


def _fake_factory(tools_by_server, fail_servers=()):
    def factory(connections, tool_name_prefix=True, handle_tool_errors=True):
        client = FakeMCPClient(connections, tool_name_prefix, handle_tool_errors)
        for name, cfg in connections.items():
            cfg["fail"] = name in fail_servers
            client.server_tools[name] = tools_by_server.get(name, [])
        return client

    return factory


def test_register_and_unregister_tool_specs():
    before = {spec.name for spec in tool_specs()}
    extra = [
        _make_tool("demo_add", metadata={"read_only_hint": True}),
        _make_tool("demo_write", metadata={"read_only_hint": False}),
    ]
    from agents.registry import ToolSpec, register_tool_specs

    specs = [
        ToolSpec(
            name=tool.name,
            specialist="mcp",
            tool=tool,
            requires_confirmation=cf,
            mutates_data=mut,
        )
        for tool, (cf, mut) in zip(extra, [classify_mcp_tool(t) for t in extra])
    ]
    register_tool_specs(specs)
    names = {spec.name for spec in tool_specs()}
    assert names >= before | {"demo_add", "demo_write"}
    unregister_tool_specs(["demo_add", "demo_write"])
    assert {spec.name for spec in tool_specs()} == before


def test_connect_all_registers_tools_and_status(tmp_path):
    tools = [
        _make_tool("demo_add", metadata={"read_only_hint": True}),
        _make_tool("demo_write", metadata={"read_only_hint": False}),
    ]
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory({"demo": tools}, fail_servers=("bad",)),
    )
    manager.save_configs(
        [
            MCPServerConfig(name="demo", command="python", args=["s.py"]),
            MCPServerConfig(name="bad", command="python", args=["s.py"]),
            MCPServerConfig(name="off", command="python", args=["s.py"], enabled=False),
        ]
    )
    status = asyncio.run(manager.connect_all(register=True))
    assert status["demo"]["status"] == "connected"
    assert status["demo"]["tool_count"] == 2
    assert status["bad"]["status"] == "error"
    assert status["off"]["status"] == "disabled"
    assert {info.name for info in manager.registered_tools()} == {
        "demo_add",
        "demo_write",
    }
    spec_by_name = {spec.name: spec for spec in tool_specs()}
    assert spec_by_name["demo_add"].specialist == "mcp"
    assert spec_by_name["demo_add"].requires_confirmation is False
    assert spec_by_name["demo_write"].requires_confirmation is True
    manager.unregister_all()
    assert manager.registered_tools() == []


def test_mcp_tools_not_exposed_to_workers(tmp_path):
    """specialist='mcp' 的工具不应出现在任何 Worker 的工具集里。"""

    from agents.registry import tools_for_specialist

    tools = [_make_tool("demo_add")]
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory({"demo": tools}),
    )
    manager.save_configs([MCPServerConfig(name="demo", command="python")])
    asyncio.run(manager.connect_all(register=True))
    try:
        from agents.workflow import WORKERS

        worker_names = {
            tool.name
            for specialist in WORKERS
            for tool in tools_for_specialist(specialist)
        }
        assert "demo_add" not in worker_names
    finally:
        manager.unregister_all()


def test_client_factory_disables_tool_name_prefix(tmp_path):
    """MCP 工具名应保持服务器原生名，便于标准技能包直接引用。"""

    observed: list[bool] = []

    def recording_factory(connections, tool_name_prefix=True, handle_tool_errors=True):
        observed.append(tool_name_prefix)
        return FakeMCPClient(connections, tool_name_prefix, handle_tool_errors)

    manager = MCPManager(tmp_path / "mcp_servers.json", client_factory=recording_factory)
    manager.save_configs([MCPServerConfig(name="demo", command="python", args=["s.py"])])
    asyncio.run(manager.connect_all(register=True))
    assert observed and all(value is False for value in observed)
    manager.unregister_all()


def test_mcp_tools_are_sync_invokable(tmp_path):
    """异步 MCP 工具注册后可在同步 Agent 链路中调用（asyncio.run 桥接）。"""

    from langchain_core.tools import tool as make_tool
    from agents.registry import tool_specs

    @make_tool
    async def async_search(query: str) -> str:
        """Search the web."""
        return f"result:{query}"

    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory({"demo": [async_search]}),
    )
    manager.save_configs([MCPServerConfig(name="demo", command="python")])
    asyncio.run(manager.connect_all(register=True))
    try:
        spec = next(s for s in tool_specs() if s.name == "async_search")
        assert spec.tool.invoke({"query": "天气"}) == "result:天气"
    finally:
        manager.unregister_all()


def test_mcp_tool_call_has_timeout_bridge(tmp_path, monkeypatch):
    """MCP 工具调用有兜底超时，挂起时不会无限阻塞整轮对话。"""

    from langchain_core.tools import tool as make_tool
    from integrations.mcp import client as mcp_client
    from agents.registry import tool_specs

    @make_tool
    async def slow_search(query: str) -> str:
        """Search slowly."""
        await asyncio.sleep(10)
        return "never"

    monkeypatch.setattr(mcp_client, "MCP_TOOL_TIMEOUT_SECONDS", 0.1)
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory({"demo": [slow_search]}),
    )
    manager.save_configs([MCPServerConfig(name="demo", command="python")])
    asyncio.run(manager.connect_all(register=True))
    try:
        spec = next(s for s in tool_specs() if s.name == "slow_search")
        import pytest

        with pytest.raises(Exception):
            spec.tool.invoke({"query": "x"})
    finally:
        manager.unregister_all()


def test_enable_disable_reload_lifecycle(tmp_path):
    tools = [_make_tool("demo_add")]
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory({"demo": tools}),
    )
    cfg = MCPServerConfig(name="demo", command="python", args=["s.py"])
    status = asyncio.run(manager.enable_server(cfg))
    assert status["status"] == "connected"
    assert {info.name for info in manager.registered_tools()} == {"demo_add"}
    assert manager.disable_server("demo")["status"] == "disabled"
    assert manager.registered_tools() == []
    assert manager.status()["demo"]["last_check"]


def test_disable_only_removes_own_server(tmp_path):
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=_fake_factory(
            {"a": [_make_tool("tool_a")], "b": [_make_tool("tool_b")]}
        ),
    )
    manager.save_configs(
        [
            MCPServerConfig(name="a", command="python", args=["s.py"]),
            MCPServerConfig(name="b", command="python", args=["s.py"]),
        ]
    )
    asyncio.run(manager.connect_all(register=True))
    manager.disable_server("a")
    assert {info.name for info in manager.registered_tools()} == {"tool_b"}
    manager.unregister_all()


def test_native_runtime_keeps_stdio_session_for_sync_tool(tmp_path):
    """The production path uses one persistent SDK session, not the fake adapter."""

    script = tmp_path / "server.py"
    script.write_text(
        "import anyio\n"
        "from mcp import types\n"
        "from mcp.server import Server\n"
        "from mcp.server.stdio import stdio_server\n"
        "async def list_tools(_context, _params):\n"
        "    return types.ListToolsResult(tools=[types.Tool(name='echo', inputSchema={'type': 'object', 'properties': {'text': {'type': 'string'}}, 'required': ['text']})])\n"
        "async def call_tool(_context, params):\n"
        "    return types.CallToolResult(content=[types.TextContent(type='text', text='echo:' + str((params.arguments or {}).get('text', '')))])\n"
        "server = Server('runtime-test', on_list_tools=list_tools, on_call_tool=call_tool)\n"
        "async def main():\n"
        "    async with stdio_server() as (read_stream, write_stream):\n"
        "        await server.run(read_stream, write_stream, server.create_initialization_options())\n"
        "anyio.run(main)\n",
        encoding="utf-8",
    )
    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        allow_arbitrary_stdio=True,
    )
    manager.save_configs(
        [MCPServerConfig(name="runtime", command=sys.executable, args=[str(script)])]
    )
    try:
        status = asyncio.run(manager.connect_all(register=True))
        assert status["runtime"]["status"] == "connected"
        spec = next(item for item in tool_specs() if item.name == "echo")
        assert spec.tool.invoke({"text": "ok"}) == "echo:ok"
    finally:
        manager.close()


def test_persistent_runtime_work_does_not_block_caller_event_loop(tmp_path):
    """Persistent MCP startup and disconnects run outside FastAPI's event loop."""

    class SlowRuntime:
        def start(self):
            time.sleep(0.12)

        async def load_tools(self, _config, session_token=None):
            del session_token
            return []

        async def disconnect(self, _name, session_token=None):
            del session_token
            return None

        def run(self, coroutine, *, timeout=None):
            del timeout
            time.sleep(0.12)
            coroutine.close()
            return []

    manager = MCPManager(tmp_path / "mcp_servers.json")
    manager._runtime = SlowRuntime()
    config = MCPServerConfig(name="slow", command="python", args=["server.py"])

    async def exercise():
        ready = asyncio.Event()
        done = asyncio.Event()
        gaps: list[float] = []

        async def ticker():
            previous = time.perf_counter()
            ready.set()
            while not done.is_set():
                await asyncio.sleep(0.01)
                now = time.perf_counter()
                gaps.append(now - previous)
                previous = now

        ticker_task = asyncio.create_task(ticker())
        await ready.wait()
        await manager.connect_server(config)
        done.set()
        await ticker_task
        return gaps

    gaps = asyncio.run(exercise())

    assert len(gaps) >= 10
    assert max(gaps) < 0.08


def test_disable_wins_over_inflight_enable(tmp_path):
    fetch_started = asyncio.Event()
    release_fetch = asyncio.Event()
    delayed_tool = _make_tool("delayed_read", metadata={"read_only_hint": True})

    class DelayedClient(FakeMCPClient):
        async def get_tools(self, server_name=None):
            del server_name
            fetch_started.set()
            await release_fetch.wait()
            return [delayed_tool]

    manager = MCPManager(
        tmp_path / "mcp_servers.json",
        client_factory=lambda *args, **kwargs: DelayedClient(*args, **kwargs),
    )
    config = MCPServerConfig(name="demo", command="python", args=["server.py"])

    async def exercise():
        enable_task = asyncio.create_task(manager.enable_server(config))
        await fetch_started.wait()
        disable_task = asyncio.create_task(manager.disable_server_async(config.name))
        release_fetch.set()
        await asyncio.gather(enable_task, disable_task)

    asyncio.run(exercise())

    assert manager.status()["demo"]["status"] == "disabled"
    assert all(info.server != "demo" for info in manager.registered_tools())


def test_runtime_stop_waits_for_thread_that_is_still_starting(monkeypatch):
    runtime = MCPRuntime()
    thread_entered = threading.Event()
    release_thread = threading.Event()

    def delayed_thread_main():
        thread_entered.set()
        release_thread.wait(timeout=1)
        runtime._ready.set()

    monkeypatch.setattr(runtime, "_thread_main", delayed_thread_main)
    start_errors = []
    start_thread = threading.Thread(
        target=lambda: _capture_thread_error(runtime.start, start_errors)
    )
    start_thread.start()
    assert thread_entered.wait(timeout=1)

    stop_thread = threading.Thread(target=runtime.stop)
    stop_thread.start()
    time.sleep(0.05)

    assert stop_thread.is_alive() is True
    release_thread.set()
    stop_thread.join(timeout=1)
    start_thread.join(timeout=1)
    assert stop_thread.is_alive() is False
    assert runtime._thread is None or runtime._thread.is_alive() is False


def test_runtime_timeout_cancels_submitted_coroutine():
    runtime = MCPRuntime()
    cancelled = threading.Event()

    async def slow_operation():
        try:
            await asyncio.sleep(10)
        finally:
            cancelled.set()

    try:
        with pytest.raises(TimeoutError):
            runtime.run(slow_operation(), timeout=0.01)

        assert cancelled.wait(timeout=1)
    finally:
        runtime.stop()


def test_runtime_stop_cancels_all_inflight_futures():
    runtime = MCPRuntime()

    class FakeFuture:
        def __init__(self):
            self.cancelled = False

        def cancel(self):
            self.cancelled = True

    future = FakeFuture()
    runtime._futures.add(future)

    runtime.stop()

    assert future.cancelled is True
    assert runtime._futures == set()


def test_runtime_group_enters_and_exits_on_same_owner_task(monkeypatch):
    """MCP SDK 的 exit stack 必须在进入它的同一个 asyncio task 中关闭。"""

    from mcp.client import session_group

    observed = {}

    class FakeGroup:
        async def __aenter__(self):
            observed["enter"] = asyncio.current_task()
            return self

        async def __aexit__(self, *_exc):
            observed["exit"] = asyncio.current_task()
            return False

    monkeypatch.setattr(session_group, "ClientSessionGroup", FakeGroup)
    runtime = MCPRuntime()
    runtime.start()
    runtime.stop()

    assert observed["enter"] is observed["exit"]


def test_runtime_load_tools_disconnects_session_when_listing_fails():
    runtime = MCPRuntime()

    class BrokenSession:
        async def list_tools(self):
            raise RuntimeError("listing failed")

    class FakeGroup:
        def __init__(self):
            self.session = BrokenSession()
            self.disconnected = []

        async def connect_to_server(self, _parameters):
            return self.session

        async def disconnect_from_server(self, session):
            self.disconnected.append(session)

    group = FakeGroup()
    runtime._group = group
    config = MCPServerConfig(name="broken", command="python")

    with pytest.raises(RuntimeError, match="listing failed"):
        asyncio.run(runtime.load_tools(config))

    assert group.disconnected == [group.session]
    assert "broken" not in runtime._sessions


def test_runtime_disconnects_only_the_requested_session_token():
    runtime = MCPRuntime()

    class Listed:
        tools = []

    class FakeSession:
        async def list_tools(self):
            return Listed()

    class FakeGroup:
        def __init__(self):
            self.sessions = [FakeSession(), FakeSession()]
            self.disconnected = []

        async def connect_to_server(self, _parameters):
            return self.sessions.pop(0)

        async def disconnect_from_server(self, session):
            self.disconnected.append(session)

    group = FakeGroup()
    created_sessions = list(group.sessions)
    runtime._group = group
    config = MCPServerConfig(name="same-name", command="python")

    async def exercise():
        await runtime.load_tools(config, session_token="old")
        await runtime.load_tools(config, session_token="new")
        await runtime.disconnect(config.name, session_token="old")

    asyncio.run(exercise())

    assert group.disconnected == [created_sessions[0]]
    assert "new" in runtime._sessions[config.name]


def test_async_disable_keeps_caller_event_loop_responsive(tmp_path):
    class SlowRuntime:
        async def disconnect(self, _name, session_token=None):
            del session_token
            return None

        def run(self, coroutine, *, timeout=None):
            del timeout
            time.sleep(0.15)
            coroutine.close()
            return None

    manager = MCPManager(tmp_path / "mcp_servers.json")
    manager._runtime = SlowRuntime()

    async def exercise():
        disable_task = asyncio.create_task(manager.disable_server_async("slow"))
        started = time.perf_counter()
        await asyncio.sleep(0.01)
        elapsed = time.perf_counter() - started
        await disable_task
        return elapsed

    elapsed = asyncio.run(exercise())

    assert elapsed < 0.08


def _capture_thread_error(callback, errors):
    try:
        callback()
    except Exception as exc:
        errors.append(exc)
