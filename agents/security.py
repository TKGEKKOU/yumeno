"""
工具安全增强模块
提供工具级权限验证、输入清洗、审计日志等安全机制
"""
from functools import wraps
from typing import Callable, Any
from langchain_core.tools import ToolRuntime
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

# 审计日志
class AuditLogger:
    """审计日志记录器"""
    
    @staticmethod
    def log_tool_call(
        persona_id: str,
        conversation_id: str,
        tool_name: str,
        worker: str,
        parameters: dict,
        success: bool,
        error: str = None
    ):
        """记录工具调用"""
        log_entry = {
            "persona_id": persona_id,
            "conversation_id": conversation_id,
            "tool_name": tool_name,
            "worker": worker,
            "parameters": {k: v if k not in {"password", "token", "key"} else "***" for k, v in parameters.items()},
            "success": success,
            "error": error
        }
        if success:
            logger.info(f"AUDIT: {tool_name} executed by {worker}", extra=log_entry)
        else:
            logger.warning(f"AUDIT: {tool_name} failed by {worker}: {error}", extra=log_entry)

# 权限验证装饰器
def require_worker(allowed_workers: list[str]):
    """
    工具级权限验证：确保只有指定的 Worker 可以调用此工具
    
    Args:
        allowed_workers: 允许调用此工具的 Worker 列表
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 查找 runtime 参数
            runtime = None
            for arg in args:
                if isinstance(arg, ToolRuntime):
                    runtime = arg
                    break
            if not runtime:
                runtime = kwargs.get("runtime")
            
            if runtime:
                active_worker = runtime.state.get("active_worker")
                if active_worker and active_worker not in allowed_workers:
                    error_msg = f"Permission denied: {func.__name__} can only be called by {allowed_workers}, but called by {active_worker}"
                    
                    # 审计日志
                    AuditLogger.log_tool_call(
                        persona_id=getattr(runtime.context, "persona_id", "unknown"),
                        conversation_id=getattr(runtime.context, "conversation_id", "unknown"),
                        tool_name=func.__name__,
                        worker=active_worker or "unknown",
                        parameters=kwargs,
                        success=False,
                        error="permission_denied"
                    )
                    
                    raise PermissionError(error_msg)
            
            # 执行工具
            try:
                result = func(*args, **kwargs)
                
                # 审计成功调用
                if runtime:
                    AuditLogger.log_tool_call(
                        persona_id=getattr(runtime.context, "persona_id", "unknown"),
                        conversation_id=getattr(runtime.context, "conversation_id", "unknown"),
                        tool_name=func.__name__,
                        worker=runtime.state.get("active_worker", "unknown"),
                        parameters=kwargs,
                        success=True
                    )
                
                return result
            except Exception as e:
                # 审计失败调用
                if runtime:
                    AuditLogger.log_tool_call(
                        persona_id=getattr(runtime.context, "persona_id", "unknown"),
                        conversation_id=getattr(runtime.context, "conversation_id", "unknown"),
                        tool_name=func.__name__,
                        worker=runtime.state.get("active_worker", "unknown"),
                        parameters=kwargs,
                        success=False,
                        error=str(e)
                    )
                raise
        
        return wrapper
    return decorator

# 输入验证函数
class InputValidator:
    """输入验证和清洗"""
    
    @staticmethod
    def validate_file_path(path: str, allowed_dirs: list[str] = None) -> str:
        """
        验证文件路径，防止路径遍历攻击
        
        Args:
            path: 用户提供的路径
            allowed_dirs: 允许访问的目录列表
            
        Returns:
            规范化后的安全路径
            
        Raises:
            ValueError: 路径不安全
        """
        # 规范化路径
        try:
            normalized = Path(path).resolve()
        except Exception as e:
            raise ValueError(f"Invalid path: {e}")
        
        # 检查路径遍历
        if ".." in path or path.startswith("/"):
            raise ValueError("Path traversal detected")
        
        # 检查允许的目录
        if allowed_dirs:
            allowed = False
            for allowed_dir in allowed_dirs:
                try:
                    allowed_path = Path(allowed_dir).resolve()
                    if normalized.is_relative_to(allowed_path):
                        allowed = True
                        break
                except Exception:
                    pass
            
            if not allowed:
                raise ValueError(f"Path outside allowed directories: {normalized}")
        
        return str(normalized)
    
    @staticmethod
    def validate_sql_query(query: str) -> str:
        """
        验证 SQL 查询，防止注入
        
        Args:
            query: 用户提供的查询
            
        Returns:
            清洗后的查询
            
        Raises:
            ValueError: 查询包含危险语句
        """
        # 禁止的 SQL 关键字
        dangerous_keywords = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE",
            "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE"
        ]
        
        upper_query = query.upper()
        for keyword in dangerous_keywords:
            if keyword in upper_query:
                raise ValueError(f"SQL query contains dangerous keyword: {keyword}")
        
        return query
    
    @staticmethod
    def validate_content_length(content: str, max_length: int = 10000) -> str:
        """
        验证内容长度
        
        Args:
            content: 用户提供的内容
            max_length: 最大长度
            
        Returns:
            验证后的内容
            
        Raises:
            ValueError: 内容过长
        """
        if len(content) > max_length:
            raise ValueError(f"Content too long: {len(content)} > {max_length}")
        
        return content
    
    @staticmethod
    def validate_file_size(file_path: str, max_size_mb: int = 100) -> None:
        """
        验证文件大小
        
        Args:
            file_path: 文件路径
            max_size_mb: 最大大小（MB）
            
        Raises:
            ValueError: 文件过大
        """
        try:
            size_mb = Path(file_path).stat().st_size / (1024 * 1024)
            if size_mb > max_size_mb:
                raise ValueError(f"File too large: {size_mb:.1f}MB > {max_size_mb}MB")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")

# 速率限制
class RateLimiter:
    """简单的速率限制器"""
    
    def __init__(self):
        self._counters = {}
    
    def check_limit(self, key: str, limit: int, window_seconds: int = 60) -> bool:
        """
        检查速率限制
        
        Args:
            key: 限制键（如 persona_id:tool_name）
            limit: 限制次数
            window_seconds: 时间窗口（秒）
            
        Returns:
            是否允许执行
        """
        import time
        
        now = time.time()
        if key not in self._counters:
            self._counters[key] = []
        
        # 清理过期记录
        self._counters[key] = [t for t in self._counters[key] if now - t < window_seconds]
        
        # 检查限制
        if len(self._counters[key]) >= limit:
            return False
        
        self._counters[key].append(now)
        return True

# 全局速率限制器实例
rate_limiter = RateLimiter()

def rate_limit(limit: int, window_seconds: int = 60):
    """
    速率限制装饰器
    
    Args:
        limit: 允许的最大调用次数
        window_seconds: 时间窗口（秒）
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 查找 runtime 参数
            runtime = None
            for arg in args:
                if isinstance(arg, ToolRuntime):
                    runtime = arg
                    break
            if not runtime:
                runtime = kwargs.get("runtime")
            
            if runtime:
                persona_id = getattr(runtime.context, "persona_id", "unknown")
                key = f"{persona_id}:{func.__name__}"
                
                if not rate_limiter.check_limit(key, limit, window_seconds):
                    raise Exception(f"Rate limit exceeded: {func.__name__} allows {limit} calls per {window_seconds}s")
            
            return func(*args, **kwargs)
        
        return wrapper
    return decorator
