"""Agent 系统韧性保证：熔断器、降级和错误恢复"""
import time
import logging
from functools import wraps
from typing import Any, Callable, Dict, Optional, Tuple
from langchain_core.messages import AIMessage

logger = logging.getLogger(__name__)


class CircuitBreaker:
    """熔断器：连续失败后自动熔断，超时后半开状态尝试恢复"""
    
    def __init__(
        self,
        max_failures: int = 3,
        reset_timeout: int = 60,
        half_open_max_calls: int = 1
    ):
        """
        Args:
            max_failures: 连续失败次数达到此值后熔断
            reset_timeout: 熔断后多少秒进入半开状态
            half_open_max_calls: 半开状态最多允许几次调用
        """
        self.max_failures = max_failures
        self.reset_timeout = reset_timeout
        self.half_open_max_calls = half_open_max_calls
        
        # {worker_name: (failure_count, last_failure_time, half_open_calls)}
        self._states: Dict[str, Tuple[int, float, int]] = {}
    
    def is_open(self, worker_name: str) -> bool:
        """检查熔断器是否打开（拒绝调用）"""
        if worker_name not in self._states:
            return False
        
        failure_count, last_failure, half_open_calls = self._states[worker_name]
        
        # 失败次数未达到阈值，熔断器关闭
        if failure_count < self.max_failures:
            return False
        
        # 达到阈值，检查是否进入半开状态
        time_since_failure = time.time() - last_failure
        if time_since_failure >= self.reset_timeout:
            # 进入半开状态，允许少量调用
            if half_open_calls < self.half_open_max_calls:
                return False
        
        # 熔断器打开
        return True
    
    def record_success(self, worker_name: str):
        """记录成功，重置计数"""
        self._states[worker_name] = (0, 0.0, 0)
        logger.info(f"Circuit breaker for {worker_name} reset after success")
    
    def record_failure(self, worker_name: str):
        """记录失败"""
        failure_count, last_failure, half_open_calls = self._states.get(
            worker_name, (0, 0.0, 0)
        )
        
        new_count = failure_count + 1
        self._states[worker_name] = (new_count, time.time(), 0)
        
        if new_count >= self.max_failures:
            logger.warning(
                f"Circuit breaker for {worker_name} OPEN "
                f"(failures: {new_count}/{self.max_failures})"
            )
        else:
            logger.info(
                f"Circuit breaker for {worker_name} recorded failure "
                f"({new_count}/{self.max_failures})"
            )
    
    def record_half_open_attempt(self, worker_name: str):
        """记录半开状态的调用尝试"""
        if worker_name in self._states:
            failure_count, last_failure, half_open_calls = self._states[worker_name]
            self._states[worker_name] = (failure_count, last_failure, half_open_calls + 1)


# 全局熔断器实例
_global_circuit_breaker = CircuitBreaker(
    max_failures=3,
    reset_timeout=60,
    half_open_max_calls=1
)


def with_circuit_breaker(
    fallback_fn: Optional[Callable] = None,
    worker_name: Optional[str] = None
):
    """
    装饰器：为 Worker 添加熔断保护和降级逻辑
    
    Args:
        fallback_fn: 降级函数，熔断或出错时调用
        worker_name: Worker 名称，默认使用函数名
    """
    def decorator(fn: Callable):
        actual_worker_name = worker_name or fn.__name__
        
        @wraps(fn)
        async def async_wrapper(*args, **kwargs):
            # 检查熔断器状态
            if _global_circuit_breaker.is_open(actual_worker_name):
                logger.warning(
                    f"Worker {actual_worker_name} circuit breaker OPEN, using fallback"
                )
                if fallback_fn:
                    return await fallback_fn(*args, **kwargs)
                else:
                    return _default_fallback(actual_worker_name)
            
            # 记录半开状态尝试
            _global_circuit_breaker.record_half_open_attempt(actual_worker_name)
            
            try:
                result = await fn(*args, **kwargs)
                _global_circuit_breaker.record_success(actual_worker_name)
                return result
            except Exception as e:
                _global_circuit_breaker.record_failure(actual_worker_name)
                logger.error(
                    f"Worker {actual_worker_name} failed: {e}, using fallback",
                    exc_info=True
                )
                if fallback_fn:
                    return await fallback_fn(*args, **kwargs)
                else:
                    return _default_fallback(actual_worker_name)
        
        @wraps(fn)
        def sync_wrapper(*args, **kwargs):
            if _global_circuit_breaker.is_open(actual_worker_name):
                logger.warning(
                    f"Worker {actual_worker_name} circuit breaker OPEN, using fallback"
                )
                if fallback_fn:
                    return fallback_fn(*args, **kwargs)
                else:
                    return _default_fallback(actual_worker_name)
            
            _global_circuit_breaker.record_half_open_attempt(actual_worker_name)
            
            try:
                result = fn(*args, **kwargs)
                _global_circuit_breaker.record_success(actual_worker_name)
                return result
            except Exception as e:
                _global_circuit_breaker.record_failure(actual_worker_name)
                logger.error(
                    f"Worker {actual_worker_name} failed: {e}, using fallback",
                    exc_info=True
                )
                if fallback_fn:
                    return fallback_fn(*args, **kwargs)
                else:
                    return _default_fallback(actual_worker_name)
        
        # 根据函数类型返回对应的 wrapper
        import inspect
        if inspect.iscoroutinefunction(fn):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def _default_fallback(worker_name: str) -> Dict[str, Any]:
    """默认降级响应"""
    return {
        "messages": [
            AIMessage(
                content=f"{worker_name} 暂时不可用，请稍后再试或联系管理员。系统已记录此问题。"
            )
        ],
        "status": "degraded",
        "worker": worker_name,
    }


def get_circuit_breaker() -> CircuitBreaker:
    """获取全局熔断器实例，用于监控和测试"""
    return _global_circuit_breaker
