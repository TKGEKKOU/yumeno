"""工具执行保护：超时、并发限制、审计日志"""
from __future__ import annotations
import asyncio
import logging
import time
import functools
from typing import Any, Callable
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# 全局并发控制
MAX_CONCURRENT_TOOLS = 5
_tool_semaphore = asyncio.Semaphore(MAX_CONCURRENT_TOOLS)

# 超时配置（秒）
TOOL_TIMEOUTS = {
    # 快速操作
    "list_persona_documents": 5,
    "read_persona_memories": 5,
    "list_structured_tables": 5,
    "list_available_configs": 3,
    "get_config_detail": 3,
    "check_training_progress": 3,
    
    # 中等操作
    "search_persona_knowledge": 15,
    "query_structured_data": 15,
    "web_search": 20,
    "save_persona_memory": 10,
    "export_conversation": 10,
    
    # 重操作
    "add_persona_knowledge": 60,
    "import_knowledge_from_url": 90,
    "analyze_voice_material": 30,
    "start_voice_training": 5,  # 只是启动任务
    
    # 默认
    "default": 30
}


class ToolExecutionError(Exception):
    """工具执行错误基类"""
    pass


class ToolTimeoutError(ToolExecutionError):
    """工具执行超时"""
    pass


class ToolConcurrencyError(ToolExecutionError):
    """并发限制错误"""
    pass


def get_tool_timeout(tool_name: str) -> int:
    """获取工具超时配置"""
    return TOOL_TIMEOUTS.get(tool_name, TOOL_TIMEOUTS["default"])


@asynccontextmanager
async def tool_execution_guard(tool_name: str):
    """工具执行守卫：并发控制 + 计时"""
    acquired = await _tool_semaphore.acquire()
    if not acquired:
        raise ToolConcurrencyError(f"工具并发数已达上限（{MAX_CONCURRENT_TOOLS}）")
    
    start_time = time.time()
    try:
        yield
    finally:
        _tool_semaphore.release()
        duration = time.time() - start_time
        logger.debug(f"Tool {tool_name} completed in {duration:.2f}s")


async def execute_tool_with_timeout(
    tool_func: Callable,
    args: dict[str, Any],
    tool_name: str
) -> Any:
    """
    带超时保护的工具执行。
    
    Args:
        tool_func: 工具函数
        args: 参数字典
        tool_name: 工具名
    
    Returns:
        工具执行结果
        
    Raises:
        ToolTimeoutError: 执行超时
        ToolConcurrencyError: 并发限制
    """
    timeout = get_tool_timeout(tool_name)
    
    async with tool_execution_guard(tool_name):
        try:
            # 如果是同步函数，在线程池中执行
            if asyncio.iscoroutinefunction(tool_func):
                result = await asyncio.wait_for(
                    tool_func(**args),
                    timeout=timeout
                )
            else:
                loop = asyncio.get_event_loop()
                result = await asyncio.wait_for(
                    loop.run_in_executor(None, functools.partial(tool_func, **args)),
                    timeout=timeout
                )
            return result
            
        except asyncio.TimeoutError:
            logger.error(f"Tool {tool_name} timeout after {timeout}s")
            raise ToolTimeoutError(f"工具 {tool_name} 执行超时（{timeout}秒）")


def log_tool_invocation(
    tool_name: str,
    args: dict[str, Any],
    result: Any,
    duration_ms: float,
    error: Exception | None = None,
    context: dict[str, Any] | None = None
):
    """
    记录工具调用审计日志。
    
    Args:
        tool_name: 工具名
        args: 调用参数
        result: 执行结果
        duration_ms: 执行时长（毫秒）
        error: 异常信息
        context: 上下文（persona_id, workspace 等）
    """
    log_entry = {
        "tool": tool_name,
        "duration_ms": round(duration_ms, 2),
        "success": error is None,
    }
    
    # 添加上下文
    if context:
        log_entry.update({
            "persona_id": context.get("persona_id"),
            "workspace": context.get("workspace"),
            "knowledge_space": context.get("knowledge_space"),
        })
    
    # 参数脱敏：移除敏感字段
    safe_args = {
        k: v for k, v in args.items()
        if k not in ("api_key", "password", "token", "secret")
    }
    log_entry["args"] = safe_args
    
    # 结果摘要
    if error:
        log_entry["error"] = str(error)
        logger.warning(f"Tool invocation failed: {log_entry}")
    else:
        # 只记录结果类型和大小，避免日志过大
        if isinstance(result, dict):
            log_entry["result_keys"] = list(result.keys())
            log_entry["result_status"] = result.get("status")
        elif isinstance(result, (list, tuple)):
            log_entry["result_count"] = len(result)
        
        logger.info(f"Tool invocation: {log_entry}")


def safe_tool_wrapper(tool_func: Callable) -> Callable:
    """
    工具函数包装器：添加超时、并发控制和审计日志。
    
    用法：
        @safe_tool_wrapper
        @tool
        def my_tool(...):
            ...
    """
    @functools.wraps(tool_func)
    async def async_wrapper(*args, **kwargs):
        tool_name = tool_func.__name__
        start_time = time.time()
        error = None
        result = None
        
        # 提取上下文
        context = {}
        if "runtime" in kwargs:
            runtime = kwargs["runtime"]
            if hasattr(runtime, "context"):
                context = {
                    "persona_id": getattr(runtime.context, "persona_id", None),
                    "workspace": getattr(runtime.context, "workspace", None),
                    "knowledge_space": getattr(runtime.context, "knowledge_space", None),
                }
        
        try:
            result = await execute_tool_with_timeout(
                tool_func,
                kwargs,
                tool_name
            )
            return result
            
        except Exception as e:
            error = e
            raise
            
        finally:
            duration_ms = (time.time() - start_time) * 1000
            log_tool_invocation(
                tool_name,
                kwargs,
                result,
                duration_ms,
                error,
                context
            )
    
    @functools.wraps(tool_func)
    def sync_wrapper(*args, **kwargs):
        # 对于同步函数，在事件循环中运行异步包装器
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(async_wrapper(*args, **kwargs))
    
    # 根据原函数类型返回对应包装器
    if asyncio.iscoroutinefunction(tool_func):
        return async_wrapper
    else:
        return sync_wrapper


def configure_tool_timeouts(overrides: dict[str, int]):
    """
    动态配置工具超时时间。
    
    Args:
        overrides: 工具名 -> 超时秒数的映射
    """
    TOOL_TIMEOUTS.update(overrides)
    logger.info(f"Updated tool timeouts: {overrides}")


def get_tool_stats() -> dict[str, Any]:
    """
    获取工具执行统计。
    
    Returns:
        当前并发数、配置等信息
    """
    return {
        "max_concurrent": MAX_CONCURRENT_TOOLS,
        "current_concurrent": MAX_CONCURRENT_TOOLS - _tool_semaphore._value,
        "configured_timeouts": len(TOOL_TIMEOUTS),
    }
