"""测试 Agent 熔断器"""
import asyncio
from agents.resilience import CircuitBreaker, with_circuit_breaker, get_circuit_breaker


def test_circuit_breaker_opens_after_max_failures():
    """连续失败达到阈值后熔断器打开"""
    cb = CircuitBreaker(max_failures=3, reset_timeout=60)
    
    # 初始状态：熔断器关闭
    assert not cb.is_open("test_worker")
    
    # 记录 3 次失败
    cb.record_failure("test_worker")
    assert not cb.is_open("test_worker")  # 1/3
    
    cb.record_failure("test_worker")
    assert not cb.is_open("test_worker")  # 2/3
    
    cb.record_failure("test_worker")
    assert cb.is_open("test_worker")  # 3/3，熔断器打开


def test_circuit_breaker_resets_on_success():
    """成功后熔断器重置"""
    cb = CircuitBreaker(max_failures=3)
    
    cb.record_failure("test_worker")
    cb.record_failure("test_worker")
    assert not cb.is_open("test_worker")
    
    cb.record_success("test_worker")
    assert not cb.is_open("test_worker")
    
    # 计数已重置，需要再次累积才能熔断
    cb.record_failure("test_worker")
    assert not cb.is_open("test_worker")


def test_with_circuit_breaker_decorator_async():
    """装饰器保护异步函数"""
    call_count = 0
    fallback_count = 0
    
    async def fallback_fn(*args, **kwargs):
        nonlocal fallback_count
        fallback_count += 1
        return {"status": "degraded", "messages": ["降级响应"]}
    
    @with_circuit_breaker(fallback_fn=fallback_fn, worker_name="test_async_worker")
    async def failing_worker():
        nonlocal call_count
        call_count += 1
        raise ValueError("Worker failed")
    
    async def run_test():
        # 前 3 次失败，都会调用 fallback
        for i in range(3):
            result = await failing_worker()
            assert result["status"] == "degraded"
            assert call_count == i + 1
            assert fallback_count == i + 1
        
        # 熔断器打开后，直接降级，不再调用原函数
        result = await failing_worker()
        assert result["status"] == "degraded"
        assert call_count == 3  # 不再增加
        assert fallback_count == 4  # fallback 继续增加
    
    asyncio.run(run_test())


def test_with_circuit_breaker_decorator_sync():
    """装饰器保护同步函数"""
    call_count = 0
    
    def fallback_fn(*args, **kwargs):
        return {"status": "degraded"}
    
    @with_circuit_breaker(fallback_fn=fallback_fn, worker_name="test_sync_worker")
    def failing_worker():
        nonlocal call_count
        call_count += 1
        raise ValueError("Sync worker failed")
    
    # 触发 3 次失败
    for _ in range(3):
        result = failing_worker()
        assert result["status"] == "degraded"
    
    # 熔断后不再调用
    result = failing_worker()
    assert call_count == 3


def test_global_circuit_breaker_is_shared():
    """全局熔断器在多个函数间共享状态"""
    cb = get_circuit_breaker()
    
    # 重置状态
    cb.record_success("shared_worker")
    
    cb.record_failure("shared_worker")
    cb.record_failure("shared_worker")
    cb.record_failure("shared_worker")
    
    assert cb.is_open("shared_worker")
    
    # 成功后重置
    cb.record_success("shared_worker")
    assert not cb.is_open("shared_worker")
