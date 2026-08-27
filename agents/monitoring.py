"""
Worker 监控和可观测性模块
提供性能监控、健康检查、调用链追踪
"""
import time
import logging
from dataclasses import dataclass, field
from typing import Optional
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@dataclass
class WorkerMetrics:
    """Worker 指标"""
    worker_name: str
    total_calls: int = 0
    success_calls: int = 0
    failed_calls: int = 0
    total_duration_ms: float = 0.0
    min_duration_ms: float = float('inf')
    max_duration_ms: float = 0.0
    last_call_time: Optional[datetime] = None
    error_counts: dict = field(default_factory=dict)
    
    @property
    def avg_duration_ms(self) -> float:
        return self.total_duration_ms / self.total_calls if self.total_calls > 0 else 0.0
    
    @property
    def success_rate(self) -> float:
        return self.success_calls / self.total_calls if self.total_calls > 0 else 0.0
    
    def to_dict(self) -> dict:
        return {
            "worker_name": self.worker_name,
            "total_calls": self.total_calls,
            "success_calls": self.success_calls,
            "failed_calls": self.failed_calls,
            "success_rate": f"{self.success_rate:.2%}",
            "avg_duration_ms": f"{self.avg_duration_ms:.2f}",
            "min_duration_ms": f"{self.min_duration_ms:.2f}",
            "max_duration_ms": f"{self.max_duration_ms:.2f}",
            "last_call": self.last_call_time.isoformat() if self.last_call_time else None,
            "top_errors": dict(sorted(self.error_counts.items(), key=lambda x: x[1], reverse=True)[:5])
        }

class WorkerMonitor:
    """Worker 监控器"""
    
    def __init__(self):
        self._metrics: dict[str, WorkerMetrics] = {}
        self._active_traces: dict[str, dict] = {}  # request_id -> trace_info
        
    def record_call(
        self,
        worker_name: str,
        duration_ms: float,
        success: bool,
        error: Optional[str] = None
    ):
        """记录 Worker 调用"""
        if worker_name not in self._metrics:
            self._metrics[worker_name] = WorkerMetrics(worker_name)
        
        metrics = self._metrics[worker_name]
        metrics.total_calls += 1
        metrics.total_duration_ms += duration_ms
        metrics.min_duration_ms = min(metrics.min_duration_ms, duration_ms)
        metrics.max_duration_ms = max(metrics.max_duration_ms, duration_ms)
        metrics.last_call_time = datetime.now()
        
        if success:
            metrics.success_calls += 1
        else:
            metrics.failed_calls += 1
            if error:
                metrics.error_counts[error] = metrics.error_counts.get(error, 0) + 1
    
    def start_trace(self, request_id: str, persona_id: str, conversation_id: str):
        """开始一个请求追踪"""
        self._active_traces[request_id] = {
            "request_id": request_id,
            "persona_id": persona_id,
            "conversation_id": conversation_id,
            "start_time": time.time(),
            "workers_called": [],
            "tools_called": []
        }
    
    def add_worker_to_trace(self, request_id: str, worker_name: str, start_time: float, end_time: float):
        """添加 Worker 调用到追踪"""
        if request_id in self._active_traces:
            self._active_traces[request_id]["workers_called"].append({
                "worker": worker_name,
                "start": start_time,
                "end": end_time,
                "duration_ms": (end_time - start_time) * 1000
            })
    
    def add_tool_to_trace(self, request_id: str, tool_name: str, worker: str, duration_ms: float):
        """添加工具调用到追踪"""
        if request_id in self._active_traces:
            self._active_traces[request_id]["tools_called"].append({
                "tool": tool_name,
                "worker": worker,
                "duration_ms": duration_ms
            })
    
    def end_trace(self, request_id: str) -> Optional[dict]:
        """结束追踪并返回结果"""
        if request_id not in self._active_traces:
            return None
        
        trace = self._active_traces.pop(request_id)
        trace["end_time"] = time.time()
        trace["total_duration_ms"] = (trace["end_time"] - trace["start_time"]) * 1000
        
        # 记录到日志
        logger.info(
            f"Request trace completed: {request_id}, "
            f"duration={trace['total_duration_ms']:.2f}ms, "
            f"workers={len(trace['workers_called'])}, "
            f"tools={len(trace['tools_called'])}"
        )
        
        return trace
    
    def get_metrics(self, worker_name: Optional[str] = None) -> dict:
        """获取指标"""
        if worker_name:
            metrics = self._metrics.get(worker_name)
            return metrics.to_dict() if metrics else {}
        else:
            return {name: metrics.to_dict() for name, metrics in self._metrics.items()}
    
    def get_health_status(self) -> dict:
        """获取健康状态"""
        now = datetime.now()
        unhealthy_workers = []
        
        for name, metrics in self._metrics.items():
            # 检查成功率
            if metrics.total_calls > 10 and metrics.success_rate < 0.5:
                unhealthy_workers.append({
                    "worker": name,
                    "reason": "low_success_rate",
                    "success_rate": metrics.success_rate
                })
            
            # 检查响应时间
            if metrics.avg_duration_ms > 30000:  # 30秒
                unhealthy_workers.append({
                    "worker": name,
                    "reason": "slow_response",
                    "avg_duration_ms": metrics.avg_duration_ms
                })
            
            # 检查最近活动
            if metrics.last_call_time and (now - metrics.last_call_time) > timedelta(hours=1):
                # 1小时内没有调用（可能不是问题，但值得注意）
                pass
        
        return {
            "status": "unhealthy" if unhealthy_workers else "healthy",
            "timestamp": now.isoformat(),
            "unhealthy_workers": unhealthy_workers,
            "total_workers": len(self._metrics),
            "active_traces": len(self._active_traces)
        }
    
    def reset_metrics(self, worker_name: Optional[str] = None):
        """重置指标"""
        if worker_name:
            if worker_name in self._metrics:
                del self._metrics[worker_name]
        else:
            self._metrics.clear()

# 全局监控器实例
global_monitor = WorkerMonitor()

# 监控装饰器
def monitor_worker(worker_name: str):
    """Worker 监控装饰器"""
    def decorator(func):
        from functools import wraps
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            success = False
            error = None
            
            try:
                result = func(*args, **kwargs)
                success = True
                return result
            except Exception as e:
                error = type(e).__name__
                raise
            finally:
                duration_ms = (time.time() - start_time) * 1000
                global_monitor.record_call(worker_name, duration_ms, success, error)
        
        return wrapper
    return decorator

# 示例：如何使用监控
"""
from agents.monitoring import monitor_worker, global_monitor

@monitor_worker("knowledge")
def knowledge_worker_node(state):
    # Worker 逻辑
    pass

# 查看指标
metrics = global_monitor.get_metrics()
health = global_monitor.get_health_status()

# 追踪请求
global_monitor.start_trace("req-123", "persona-456", "conv-789")
global_monitor.add_worker_to_trace("req-123", "knowledge", start, end)
trace = global_monitor.end_trace("req-123")
"""
