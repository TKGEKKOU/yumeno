from __future__ import annotations

from enum import Enum


class RuntimeErrorCode(str, Enum):
    """稳定、可供本地 UI 消费的运行时错误码。"""

    RUN_NOT_FOUND = "run_not_found"
    INVALID_TRANSITION = "invalid_transition"
    INVALID_APPROVAL = "invalid_approval"
    APPROVAL_REQUIRED = "approval_required"
    RUN_TERMINAL = "run_terminal"
    RUN_CANCELLED = "run_cancelled"
    RUNTIME_FAILURE = "runtime_failure"
    STORAGE_ERROR = "storage_error"
    INVALID_REQUEST = "invalid_request"


_PUBLIC_MESSAGES = {
    RuntimeErrorCode.RUN_NOT_FOUND: "运行记录不存在。",
    RuntimeErrorCode.INVALID_TRANSITION: "运行状态不能执行此转换。",
    RuntimeErrorCode.INVALID_APPROVAL: "当前运行不在等待审批状态。",
    RuntimeErrorCode.APPROVAL_REQUIRED: "此操作需要先完成审批。",
    RuntimeErrorCode.RUN_TERMINAL: "运行已经结束，不能再执行此操作。",
    RuntimeErrorCode.RUN_CANCELLED: "运行已取消。",
    RuntimeErrorCode.RUNTIME_FAILURE: "运行处理失败，请稍后重试。",
    RuntimeErrorCode.STORAGE_ERROR: "运行记录暂时不可用。",
    RuntimeErrorCode.INVALID_REQUEST: "请求参数无效。",
}


def public_error_message(code: RuntimeErrorCode | str) -> str:
    """将内部错误码转换为不泄露实现细节的用户可见消息。"""

    try:
        normalized = RuntimeErrorCode(code)
    except (TypeError, ValueError):
        return "运行时操作失败。"
    return _PUBLIC_MESSAGES[normalized]
