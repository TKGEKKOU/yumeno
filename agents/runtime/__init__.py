"""YUMENO 的轻量 Agent Runtime 领域层。

该包只定义运行记录、结果和事件合同，不依赖 FastAPI 或数据库实现。
"""

from .errors import RuntimeErrorCode, public_error_message
from .events import sanitize_event_details
from .models import (
    AgentResult,
    AgentRun,
    RunEvent,
    RunStatus,
    RuntimeStep,
    RuntimeTask,
    StepStatus,
    TaskStatus,
    allowed_transition,
)

__all__ = [
    "AgentResult",
    "AgentRun",
    "RunEvent",
    "RunStatus",
    "RuntimeStep",
    "RuntimeTask",
    "StepStatus",
    "TaskStatus",
    "RuntimeErrorCode",
    "allowed_transition",
    "public_error_message",
    "sanitize_event_details",
]
