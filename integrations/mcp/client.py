"""MCP 客户端管理器。

基于 langchain-mcp-adapters 的 ``MultiServerMCPClient`` 连接外部 MCP
服务器。0.3.x 版本起客户端采用无状态模式：``get_tools()`` 时创建会话
拉取工具清单，工具被调用时再各自创建一次性会话，因此管理器不需要
持有长连接，也无需 ``aclose()``。
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import contextlib
import logging
import threading
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

from langchain_core.tools import BaseTool, StructuredTool

from agents.registry import ToolSpec, register_tool_specs, tool_specs
from integrations.mcp.config import (
    MCPServerConfig,
    ensure_default_servers,
    load_servers,
    save_servers,
)


logger = logging.getLogger(__name__)

# uvx 冷启动首次安装 free-search-mcp 依赖（playwright 等约 80 个包）实测约 18s，
# 网络抖动下可能更久；放宽到 90s，避免初始化握手被提前取消导致 BrokenResourceError。
CONNECT_TIMEOUT_SECONDS = 90
MCP_TOOL_TIMEOUT_SECONDS = 60


_FREE_SEARCH_ENGINE_HINT = (
    "\n\n【引擎提示】本服务器默认已启用国内可直接访问的百度引擎。调用 search / research 时"
    "不要手动传 engines 参数——尤其不要传 duckduckgo、mojeek、googlenews、bing、startpage、"
    "brave、google、searx 等引擎，它们在国内网络下会长时间超时并返回空结果。"
    '只有需要搜索 B 站视频时才传 engines=["bilibili"]。'
)


def _patch_free_search_description(name: str, description: str, server: str = "") -> str:
    """修正 free-search 服务端工具描述中的引擎误导。"""

    if server == "free-search" and name in {"search", "research"}:
        return description + _FREE_SEARCH_ENGINE_HINT
    return description


def _friendly_error(exc: Exception, limit: int = 300) -> str:
    """提取 MCP 连接失败的真实原因。

    langchain-mcp-adapters 用 anyio TaskGroup 聚合子进程错误，直接 ``str()``
    只会得到 "unhandled errors in a TaskGroup"，真实异常被包在
    ``BaseExceptionGroup`` 里。这里递归取第一个子异常，保留可读的错误消息。
    """

    if isinstance(exc, BaseExceptionGroup):
        if exc.exceptions:
            return _friendly_error(exc.exceptions[0], limit)
        return str(exc)[:limit]
    message = str(exc).strip()
    return message[:limit] if message else type(exc).__name__


def _mcp_result_text(result) -> str:
    """Convert MCP text/resource content to a compact LangChain result."""

    parts: list[str] = []
    for item in getattr(result, "content", ()):
        text = getattr(item, "text", None)
        if text is not None:
            parts.append(str(text))
            continue
        resource = getattr(item, "resource", None)
        resource_text = getattr(resource, "text", None)
        if resource_text is not None:
            parts.append(str(resource_text))
    return "\n".join(parts) if parts else "MCP tool completed without text output."


@dataclass(frozen=True)
class MCPToolInfo:
    """注册进 ToolSpec 前的 MCP 工具元数据（前端展示与安全分类共用）。"""

    name: str
    description: str
    server: str
    requires_confirmation: bool
    mutates_data: bool


@dataclass
class _RuntimeCommand:
    """A coroutine executed by the MCP runtime owner task."""

    coroutine: Any
    future: concurrent.futures.Future
    timeout: float | None


def classify_mcp_tool(tool: BaseTool) -> tuple[bool, bool]:
    """根据 MCP 工具注解判断 (requires_confirmation, mutates_data)。

    规则：
    - ``read_only_hint=True`` -> 只读，不要求确认；
    - 明确声明非只读（read_only_hint=False）或 ``destructive_hint=True``
      -> 视为写操作，要求 HITL 确认；
    - 服务器未声明任何注解 -> 默认按只读处理，方便日常使用。
    """

    metadata = tool.metadata if isinstance(tool.metadata, dict) else {}
    read_only = bool(
        metadata.get("read_only_hint", metadata.get("readOnlyHint"))
    )
    destructive = bool(
        metadata.get("destructive_hint", metadata.get("destructiveHint"))
    )
    declared = "read_only_hint" in metadata or "readOnlyHint" in metadata
    if read_only:
        return False, False
    if declared or destructive:
        return True, True
    return True, True


def _tool_info(name: str, server: str, tool: BaseTool) -> MCPToolInfo:
    requires_confirmation, mutates_data = classify_mcp_tool(tool)
    return MCPToolInfo(
        name=name,
        description=_patch_free_search_description(
            name, str(tool.description or ""), server
        ),
        server=server,
        requires_confirmation=requires_confirmation,
        mutates_data=mutates_data,
    )


def _make_sync_tool(
    original: BaseTool,
    server_name: str = "",
    runtime: "MCPRuntime | None" = None,
) -> BaseTool:
    """把仅支持异步调用的 MCP 工具包装为可在同步 Agent 链路中调用。

    YUMENO 的 workflow 是同步 invoke，并在工作线程（anyio.to_thread /
    FastAPI 同步端点）中执行，线程内没有运行中的事件循环，因此可以安全地
    用 asyncio.run 桥接异步工具；工具 schema 与 metadata 保持原样。
    """

    from langchain_core.tools import tool as make_tool

    async def _run(args: dict):
        # 单次工具调用兜底超时：搜索/抓取可能很慢或子进程挂起，
        # 超时后返回错误让模型给出说明，而不是让整轮对话无限等待。
        return await asyncio.wait_for(
            original.ainvoke(args), timeout=MCP_TOOL_TIMEOUT_SECONDS
        )

    @make_tool(
        original.name,
        description=_patch_free_search_description(
            original.name, original.description or "", server_name
        ),
    )
    def sync_tool(**kwargs):
        if runtime is not None:
            return runtime.run(_run(kwargs), timeout=MCP_TOOL_TIMEOUT_SECONDS + 5)
        return asyncio.run(_run(kwargs))

    sync_tool.args_schema = original.args_schema
    sync_tool.metadata = getattr(original, "metadata", None)
    return sync_tool


class MCPRuntime:
    """Own persistent MCP sessions on a dedicated asyncio event loop.

    MCP transports own sockets and stdio subprocesses which must remain on the
    event loop where they were created.  The rest of YUMENO still exposes
    synchronous LangChain tools, so this small bridge gives both sides a
    single lifecycle and avoids creating a fresh process for every tool call.
    """

    def __init__(self) -> None:
        self._thread: threading.Thread | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._group = None
        self._owner_task: asyncio.Task | None = None
        self._command_queue: asyncio.Queue | None = None
        self._ready = threading.Event()
        self._startup_error: BaseException | None = None
        self._lock = threading.Lock()
        self._sessions: dict[str, dict[object, object]] = {}
        self._futures: set[concurrent.futures.Future] = set()
        self._closed = False

    def start(self) -> None:
        with self._lock:
            if self._closed:
                raise RuntimeError("MCP runtime is closed")
            if self._thread is not None and self._thread.is_alive():
                thread = self._thread
            else:
                self._ready.clear()
                self._startup_error = None
                thread = threading.Thread(
                    target=self._thread_main,
                    name="yumeno-mcp-runtime",
                    daemon=True,
                )
                self._thread = thread
                thread.start()
        if not self._ready.wait(CONNECT_TIMEOUT_SECONDS):
            raise TimeoutError("MCP runtime startup timed out")
        with self._lock:
            if self._closed:
                raise RuntimeError("MCP runtime is closed")
        if self._startup_error is not None:
            raise RuntimeError(_friendly_error(self._startup_error)) from self._startup_error

    def _thread_main(self) -> None:
        loop = asyncio.new_event_loop()
        current_thread = threading.current_thread()
        with self._lock:
            self._loop = loop
        asyncio.set_event_loop(loop)

        self._command_queue = asyncio.Queue()

        async def owner() -> None:
            """Keep SDK enter/use/exit in one task to preserve AnyIO scopes."""

            try:
                from mcp.client.session_group import ClientSessionGroup

                async with ClientSessionGroup() as group:
                    with self._lock:
                        self._group = group
                    self._ready.set()
                    while True:
                        command = await self._command_queue.get()
                        if command is None:
                            break
                        if command.future.cancelled():
                            close_coroutine = getattr(command.coroutine, "close", None)
                            if close_coroutine is not None:
                                close_coroutine()
                            continue
                        try:
                            if command.timeout is None:
                                result = await command.coroutine
                            else:
                                # asyncio.timeout wraps the current owner task;
                                # unlike wait_for it does not move the coroutine
                                # into a second task with a different cancel scope.
                                async with asyncio.timeout(command.timeout):
                                    result = await command.coroutine
                        except asyncio.CancelledError:
                            if not command.future.done():
                                command.future.cancel()
                            raise
                        except BaseException as exc:
                            if not command.future.done():
                                command.future.set_exception(exc)
                        else:
                            if not command.future.done():
                                command.future.set_result(result)
            except asyncio.CancelledError:
                raise
            except BaseException as exc:  # pragma: no cover - platform startup
                self._startup_error = exc
                if not self._ready.is_set():
                    self._ready.set()
                raise
            finally:
                # Commands queued behind a shutdown must not leave un-awaited
                # coroutine objects or unresolved caller futures behind.
                if self._command_queue is not None:
                    while True:
                        try:
                            command = self._command_queue.get_nowait()
                        except asyncio.QueueEmpty:
                            break
                        if command is None:
                            continue
                        close_coroutine = getattr(command.coroutine, "close", None)
                        if close_coroutine is not None:
                            close_coroutine()
                        if not command.future.done():
                            command.future.cancel()

        owner_task = loop.create_task(owner(), name="yumeno-mcp-owner")
        with self._lock:
            self._owner_task = owner_task

        def owner_finished(_task: asyncio.Task) -> None:
            if not loop.is_closed():
                loop.stop()

        owner_task.add_done_callback(owner_finished)
        try:
            loop.run_forever()
            if not owner_task.done():
                owner_task.cancel()
                loop.run_until_complete(owner_task)
        finally:
            if not owner_task.done():
                owner_task.cancel()
                with contextlib.suppress(BaseException):
                    loop.run_until_complete(owner_task)
            loop.close()
            with self._lock:
                if self._thread is current_thread:
                    self._thread = None
                if self._loop is loop:
                    self._loop = None
                self._owner_task = None
                self._group = None
                self._command_queue = None

    def run(self, coroutine, *, timeout: float | None = None):
        try:
            self.start()
        except BaseException:
            close_coroutine = getattr(coroutine, "close", None)
            if close_coroutine is not None:
                close_coroutine()
            raise
        with self._lock:
            loop = self._loop
            queue = self._command_queue
            closed = self._closed
        if closed or loop is None or loop.is_closed() or queue is None:
            close_coroutine = getattr(coroutine, "close", None)
            if close_coroutine is not None:
                close_coroutine()
            raise RuntimeError("MCP runtime is not running")
        future: concurrent.futures.Future = concurrent.futures.Future()
        command = _RuntimeCommand(coroutine, future, timeout)
        with self._lock:
            if self._closed or self._loop is not loop or self._command_queue is not queue:
                close_coroutine = getattr(coroutine, "close", None)
                if close_coroutine is not None:
                    close_coroutine()
                raise RuntimeError("MCP runtime is closed")
            self._futures.add(future)

        def submit() -> None:
            with self._lock:
                invalid = self._closed or self._loop is not loop or self._command_queue is not queue
            if invalid:
                close_coroutine = getattr(coroutine, "close", None)
                if close_coroutine is not None:
                    close_coroutine()
                if not future.done():
                    future.set_exception(RuntimeError("MCP runtime is closed"))
                return
            queue.put_nowait(command)

        try:
            loop.call_soon_threadsafe(submit)
        except BaseException:
            close_coroutine = getattr(coroutine, "close", None)
            if close_coroutine is not None:
                close_coroutine()
            with self._lock:
                self._futures.discard(future)
            raise
        timeout_seconds = (timeout + 1) if timeout is not None else CONNECT_TIMEOUT_SECONDS + 5
        try:
            return future.result(timeout=timeout_seconds)
        except concurrent.futures.TimeoutError as exc:
            future.cancel()
            raise TimeoutError("MCP runtime operation timed out") from exc
        finally:
            with self._lock:
                self._futures.discard(future)

    def stop(self) -> None:
        with self._lock:
            self._closed = True
            thread = self._thread
            loop = self._loop
            owner_task = self._owner_task
            futures = list(self._futures)
            self._futures.clear()
        for future in futures:
            future.cancel()
        if thread is None:
            return
        if loop is None:
            self._ready.wait(CONNECT_TIMEOUT_SECONDS)
            with self._lock:
                loop = self._loop
        if loop is not None and not loop.is_closed():
            def request_stop() -> None:
                if owner_task is not None and not owner_task.done():
                    owner_task.cancel()
                elif self._command_queue is not None:
                    self._command_queue.put_nowait(None)

            loop.call_soon_threadsafe(request_stop)
        thread.join(timeout=CONNECT_TIMEOUT_SECONDS)
        if thread.is_alive():
            logger.warning("MCP runtime thread did not stop before timeout")
            return
        with self._lock:
            if self._thread is thread:
                self._thread = None
            if self._loop is loop:
                self._loop = None
            self._group = None

    @staticmethod
    def _server_parameters(config: MCPServerConfig):
        from mcp.client.session_group import (
            SseServerParameters,
            StdioServerParameters,
            StreamableHttpParameters,
        )

        if config.transport == "stdio":
            return StdioServerParameters(
                command=config.command,
                args=list(config.args),
                env=dict(config.env) or None,
            )
        if config.transport == "sse":
            return SseServerParameters(url=config.url, headers=dict(config.headers) or None)
        return StreamableHttpParameters(url=config.url, headers=dict(config.headers) or None)

    async def load_tools(
        self,
        config: MCPServerConfig,
        session_token: object | None = None,
    ) -> list[BaseTool]:
        group = self._group
        if group is None:
            raise RuntimeError("MCP runtime is not running")
        session = await group.connect_to_server(self._server_parameters(config))
        try:
            listed = await session.list_tools()
        except BaseException:
            with contextlib.suppress(BaseException):
                await group.disconnect_from_server(session)
            raise
        token = session_token if session_token is not None else object()
        self._sessions.setdefault(config.name, {})[token] = session
        tools: list[BaseTool] = []
        for definition in listed.tools:
            async def invoke_tool(
                _definition=definition,
                _session=session,
                **arguments,
            ):
                result = await _session.call_tool(_definition.name, arguments)
                is_error = getattr(
                    result, "is_error", getattr(result, "isError", False)
                )
                if is_error:
                    raise RuntimeError(_mcp_result_text(result))
                structured = getattr(
                    result,
                    "structured_content",
                    getattr(result, "structuredContent", None),
                )
                return structured if structured is not None else _mcp_result_text(result)

            annotations = getattr(definition, "annotations", None)
            metadata = annotations.model_dump() if annotations is not None else {}
            tools.append(
                StructuredTool(
                    name=definition.name,
                    description=definition.description or "",
                    args_schema=getattr(
                        definition,
                        "input_schema",
                        getattr(definition, "inputSchema", None),
                    ),
                    coroutine=invoke_tool,
                    metadata=metadata or None,
                )
            )
        return tools

    async def disconnect(
        self,
        server_name: str,
        session_token: object | None = None,
    ) -> None:
        if self._group is None:
            return
        sessions = self._sessions.get(server_name)
        if not sessions:
            return
        if session_token is None:
            targets = list(sessions.values())
            self._sessions.pop(server_name, None)
        else:
            session = sessions.pop(session_token, None)
            targets = [session] if session is not None else []
            if not sessions:
                self._sessions.pop(server_name, None)
        for session in targets:
            await self._group.disconnect_from_server(session)


class MCPManager:
    """管理 MCP 服务器配置、连接状态与工具注册。

    生命周期：应用启动时 ``connect_all()`` 连接所有启用的服务器并注册
    工具；配置变更后需重启应用生效（与插件机制一致）。``client_factory``
    可注入，便于测试时替换为假客户端。
    """

    def __init__(
        self,
        config_path: Path,
        client_factory: Callable[..., Any] | None = None,
        allow_arbitrary_stdio: bool = False,
    ) -> None:
        self.config_path = Path(config_path)
        self._client_factory = client_factory
        self._persistent = client_factory is None
        self._runtime = MCPRuntime() if self._persistent else None
        self._allow_arbitrary = allow_arbitrary_stdio
        ensure_default_servers(self.config_path)
        self._status: dict[str, dict] = {}
        self._registered: list[MCPToolInfo] = []
        self._operation_guard = threading.RLock()
        self._operation_generations: dict[str, int] = {}
        self._server_locks: dict[str, asyncio.Lock] = {}
        self._closed = False

    # ---- 配置 ----

    def list_configs(self) -> list[MCPServerConfig]:
        return load_servers(self.config_path)

    def save_configs(self, servers: list[MCPServerConfig]) -> None:
        for server in servers:
            server.validate(allow_arbitrary_stdio=self._allow_arbitrary)
        names = [server.name for server in servers]
        if len(names) != len(set(names)):
            raise ValueError("服务器名称不能重复")
        save_servers(self.config_path, servers)

    def get_config(self, name: str) -> MCPServerConfig | None:
        return next((s for s in self.list_configs() if s.name == name), None)

    # ---- 连接与注册 ----

    def _server_lock(self, name: str) -> asyncio.Lock:
        with self._operation_guard:
            return self._server_locks.setdefault(name, asyncio.Lock())

    def _begin_operation(self, name: str) -> int:
        with self._operation_guard:
            if self._closed:
                raise RuntimeError("MCP manager is closed")
            generation = self._operation_generations.get(name, 0) + 1
            self._operation_generations[name] = generation
            return generation

    def _commit_connection(
        self,
        name: str,
        generation: int,
        entries: list[tuple[BaseTool, MCPToolInfo]],
    ) -> dict | None:
        with self._operation_guard:
            if self._closed or self._operation_generations.get(name) != generation:
                return None
            self._register_server(name, entries)
            return self._mark(name, "connected", len(entries))

    async def _fetch_tools(
        self,
        config: MCPServerConfig,
        session_token: object | None = None,
    ) -> list[tuple[BaseTool, MCPToolInfo]]:
        # 不用服务器名前缀：工具名保持 MCP 服务器原生名（如 search / research），
        # 标准 SKILL.md 技能包的 tool-names 才能直接引用；多服务器同名工具由
        # 注册时的名称冲突跳过兜底。
        if self._persistent and self._runtime is not None:
            runtime = self._runtime

            def load_persistent_tools():
                runtime.start()
                return runtime.run(
                    runtime.load_tools(config, session_token=session_token),
                    timeout=CONNECT_TIMEOUT_SECONDS,
                )

            tools = await asyncio.to_thread(load_persistent_tools)
        else:
            client = self._client_factory(
                {config.name: config.to_connection()},
                tool_name_prefix=False,
                handle_tool_errors=True,
            )
            tools = await client.get_tools(server_name=config.name)
        return [
            (tool, _tool_info(tool.name, config.name, tool))
            for tool in tools
        ]

    async def _disconnect_persistent(
        self,
        server_name: str,
        session_token: object | None = None,
    ) -> None:
        runtime = self._runtime
        if not self._persistent or runtime is None:
            return

        def disconnect() -> None:
            runtime.run(
                runtime.disconnect(server_name, session_token=session_token),
                timeout=CONNECT_TIMEOUT_SECONDS,
            )

        await asyncio.to_thread(disconnect)

    async def connect_server(
        self, config: MCPServerConfig
    ) -> list[MCPToolInfo]:
        """连接单个服务器并返回工具信息；失败时抛出异常。"""

        async with self._server_lock(config.name):
            session_token = object()
            try:
                entries = await asyncio.wait_for(
                    self._fetch_tools(config, session_token=session_token),
                    timeout=CONNECT_TIMEOUT_SECONDS,
                )
                return [info for _, info in entries]
            finally:
                if self._persistent and self._runtime is not None:
                    await self._disconnect_persistent(
                        config.name,
                        session_token=session_token,
                    )

    async def connect_all(self, register: bool = True) -> dict[str, dict]:
        """连接所有启用的服务器；单个失败仅记录错误，不阻塞其他服务器。

        register=True 时把成功连接的工具注册进 ToolSpec 表（内部经
        ``enable_server``，含安全校验）。返回每个服务器的连接状态，供前端展示。
        """

        self._status = {}
        for config in self.list_configs():
            if not config.enabled:
                self._mark(config.name, "disabled", 0)
                continue
            try:
                if register:
                    await self.enable_server(config)
                else:
                    session_token = object()
                    try:
                        entries = await asyncio.wait_for(
                            self._fetch_tools(config, session_token=session_token),
                            timeout=CONNECT_TIMEOUT_SECONDS,
                        )
                        self._mark(config.name, "connected", len(entries))
                    finally:
                        if self._persistent and self._runtime is not None:
                            await self._disconnect_persistent(
                                config.name,
                                session_token=session_token,
                            )
            except Exception as exc:
                logger.warning(
                    "MCP 服务器 %s 连接失败: %s",
                    config.name,
                    _friendly_error(exc),
                )
                self._mark(config.name, "error", 0, _friendly_error(exc))
        return dict(self._status)

    def _mark(self, name: str, status: str, tool_count: int, error: str = "") -> dict:
        """记录服务器状态并返回该条目（含 last_check 时间戳）。"""

        entry = {
            "status": status,
            "tool_count": tool_count,
            "error": error,
            "last_check": datetime.now().isoformat(timespec="seconds"),
        }
        with self._operation_guard:
            self._status[name] = entry
        return entry

    def _register_server(
        self,
        server_name: str,
        entries: list[tuple[BaseTool, MCPToolInfo]],
    ) -> None:
        """把单个服务器的工具包装成 ToolSpec 注册进 registry（名称冲突跳过）。"""

        specs: list[ToolSpec] = []
        known = {spec.name for spec in tool_specs()}
        for tool, info in entries:
            if info.name in known:
                logger.warning("跳过 MCP 工具 %s：名称与现有工具冲突", info.name)
                continue
            specs.append(
                ToolSpec(
                    name=info.name,
                    specialist="mcp",
                    tool=_make_sync_tool(tool, server_name, self._runtime),
                    requires_confirmation=info.requires_confirmation,
                    mutates_data=info.mutates_data,
                    server=server_name,
                )
            )
            known.add(info.name)
            self._registered.append(info)
        register_tool_specs(specs)
        try:
            from agents.skills import refresh_skills

            refresh_skills()
        except Exception:
            pass

    def _unregister_server(self, name: str) -> None:
        """注销指定服务器注册的工具；不影响其他服务器。"""

        from agents.registry import unregister_tool_specs

        names = [info.name for info in self._registered if info.server == name]
        if names:
            unregister_tool_specs(names)
        self._registered = [info for info in self._registered if info.server != name]

    async def enable_server(self, config: MCPServerConfig) -> dict:
        """启用并连接单个服务器：安全校验 → 连接 → 注册工具。"""

        async with self._server_lock(config.name):
            generation = self._begin_operation(config.name)
            self._unregister_server(config.name)
            if self._persistent and self._runtime is not None:
                await self._disconnect_persistent(config.name)
            return await self._enable_server_locked(config, generation)

    async def _enable_server_locked(
        self,
        config: MCPServerConfig,
        generation: int,
    ) -> dict:
        config.validate(allow_arbitrary_stdio=self._allow_arbitrary)
        entries = await asyncio.wait_for(
            self._fetch_tools(config, session_token=generation),
            timeout=CONNECT_TIMEOUT_SECONDS,
        )
        committed = self._commit_connection(config.name, generation, entries)
        if committed is not None:
            return committed
        if self._persistent and self._runtime is not None:
            try:
                await self._disconnect_persistent(
                    config.name,
                    session_token=generation,
                )
            except Exception as exc:
                logger.warning(
                    "MCP 服务器 %s 过期连接清理失败: %s",
                    config.name,
                    _friendly_error(exc),
                )
        return self.status().get(
            config.name,
            {
                "status": "superseded",
                "tool_count": 0,
                "error": "",
                "last_check": datetime.now().isoformat(timespec="seconds"),
            },
        )

    def disable_server(self, name: str) -> dict:
        """停用单个服务器：注销其工具并标记 disabled。"""

        self._begin_operation(name)
        self._unregister_server(name)
        status = self._mark(name, "disabled", 0)
        if self._persistent and self._runtime is not None:
            try:
                self._runtime.run(self._runtime.disconnect(name), timeout=CONNECT_TIMEOUT_SECONDS)
            except Exception as exc:
                logger.warning(
                    "MCP 服务器 %s 停用时清理失败: %s",
                    name,
                    _friendly_error(exc),
                )
        return status

    async def disable_server_async(self, name: str) -> dict:
        """Async disable path used by FastAPI without blocking its event loop."""

        async with self._server_lock(name):
            self._begin_operation(name)
            self._unregister_server(name)
            status = self._mark(name, "disabled", 0)
            if self._persistent and self._runtime is not None:
                try:
                    await self._disconnect_persistent(name)
                except Exception as exc:
                    logger.warning(
                        "MCP 服务器 %s 停用时清理失败: %s",
                        name,
                        _friendly_error(exc),
                    )
            return status

    async def reload_server(self, name: str) -> dict:
        """配置变更后重连单个服务器；失败时标记 error 并保留原因。"""

        async with self._server_lock(name):
            generation = self._begin_operation(name)
            config = self.get_config(name)
            if config is None:
                raise KeyError(f"Unknown MCP server: {name}")
            self._unregister_server(name)
            if self._persistent and self._runtime is not None:
                try:
                    await self._disconnect_persistent(name)
                except Exception as exc:
                    logger.warning(
                        "MCP 服务器 %s 重载前清理失败: %s",
                        name,
                        _friendly_error(exc),
                    )
            if not config.enabled:
                return self._mark(name, "disabled", 0)
            try:
                return await self._enable_server_locked(config, generation)
            except Exception as exc:
                logger.warning(
                    "MCP 服务器 %s 重连失败: %s",
                    name,
                    _friendly_error(exc),
                )
                return self._mark(name, "error", 0, _friendly_error(exc))

    def registered_tools(self) -> list[MCPToolInfo]:
        return list(self._registered)

    def status(self) -> dict[str, dict]:
        with self._operation_guard:
            return dict(self._status)

    def unregister_all(self) -> None:
        """清空已注册的 MCP 工具（供配置变更后重建时使用）。"""

        from agents.registry import unregister_tool_specs

        names = [info.name for info in self._registered]
        unregister_tool_specs(names)
        self._registered = []

    def close(self) -> None:
        """Stop the owned MCP runtime and unregister all dynamic tools."""

        with self._operation_guard:
            self._closed = True
            for name in set(self._operation_generations) | set(self._status):
                self._operation_generations[name] = (
                    self._operation_generations.get(name, 0) + 1
                )
        self.unregister_all()
        if self._runtime is not None:
            self._runtime.stop()
