from __future__ import annotations

from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError
from agents.runtime.models import RunEvent, RunStatus
from agents.runtime.runner import AgentRuntime


class ApprovalService:
    """只负责审批状态控制；实际 LangGraph resume 仍走既有入口。"""

    def __init__(self, runtime: AgentRuntime) -> None:
        self.runtime = runtime

    def decide(self, run_id: str, approved: bool):
        run = self.runtime.run_store.get(run_id)
        if run is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if run.status is not RunStatus.WAITING_APPROVAL:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_APPROVAL)
        if not approved:
            return self.runtime.cancel(run_id)
        updated = self.runtime.run_store.update_status(run_id, RunStatus.RUNNING)
        self.runtime.run_store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="approval",
                name="approval_granted",
                label="已批准，等待继续处理",
                status="completed",
            )
        )
        return updated
