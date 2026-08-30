from __future__ import annotations

from typing import Any, TYPE_CHECKING

from agents.context import PersonaAgentContext
from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError, public_error_message
from agents.runtime.models import AgentResult, AgentRun, RunEvent, RunStatus
from agents.service import AgentTurnResult

if TYPE_CHECKING:
    from app.run_store import RunStore


def _result_status(result: AgentTurnResult) -> tuple[str, str | None]:
    if result.metrics.get("status") == "degraded":
        return "degraded", RuntimeErrorCode.PROVIDER_UNAVAILABLE.value
    if result.status == "pending_confirmation":
        return "pending_confirmation", None
    if result.status in {"completed", "failed", "degraded"}:
        return result.status, None
    return "failed", RuntimeErrorCode.CONTRACT_INVALID.value


def to_agent_result(run_id: str, result: AgentTurnResult) -> AgentResult:
    """把现有 AgentTurnResult 转成 Runtime 的稳定结果合同。"""

    status, error_code = _result_status(result)
    return AgentResult(
        run_id=run_id,
        status=status,
        answer=result.answer,
        specialist=result.specialist,
        pending_action=result.pending_action,
        worker_results=list(result.tool_calls),
        evidence=list(result.evidence),
        citations=[],
        uncertainties=[],
        trace=list(result.trace),
        requires_approval=status == "pending_confirmation",
        error_code=error_code,
    )


class AgentRuntime:
    """围绕现有 PersonaAgentService 的运行记录适配层。"""

    def __init__(self, service: Any, run_store: RunStore) -> None:
        self.service = service
        self.run_store = run_store

    def start_run(self, context: PersonaAgentContext, action: str = "chat") -> AgentRun:
        specialist = "conversation"
        thread_id = self.service.thread_id(context, specialist) if hasattr(self.service, "thread_id") else f"{context.persona_id}:{context.conversation_id}"
        run = AgentRun(
            action=action,
            workspace_id=context.workspace_id,
            persona_id=context.persona_id,
            conversation_id=context.conversation_id,
            thread_id=thread_id,
        )
        self.run_store.create(run)
        running = self.run_store.update_status(run.run_id, RunStatus.RUNNING)
        self.run_store.append_event(
            RunEvent(
                run_id=run.run_id,
                sequence=1,
                category="agent",
                name="run_started",
                label="开始处理",
                status="started",
                details={"source": "runtime", "status": "running"},
            )
        )
        return running

    def _append_result_events(self, run_id: str, events: tuple[dict[str, Any], ...]) -> None:
        for index, payload in enumerate(events, start=1):
            try:
                event = RunEvent.model_validate(
                    {"run_id": run_id, "sequence": payload.get("sequence", index), **payload}
                )
            except Exception:
                continue
            self.run_store.append_event(event)

    def record_result(self, run_id: str, result: AgentTurnResult) -> AgentRun:
        contract = to_agent_result(run_id, result)
        status = {
            "completed": RunStatus.COMPLETED,
            "pending_confirmation": RunStatus.WAITING_APPROVAL,
            "degraded": RunStatus.FAILED,
            "failed": RunStatus.FAILED,
        }.get(contract.status, RunStatus.FAILED)
        updated = self.run_store.update_status(
            run_id,
            status,
            specialist=contract.specialist,
            pending_action=contract.pending_action,
            active_worker=contract.specialist,
            answer=contract.answer,
            worker_results=contract.worker_results,
            evidence=contract.evidence,
            citations=contract.citations,
            uncertainties=contract.uncertainties,
            trace=contract.trace,
            requires_approval=contract.requires_approval,
            error_code=contract.error_code,
            result_json=contract.model_dump(mode="json"),
            error_message=public_error_message(contract.error_code) if contract.error_code else None,
        )
        self._append_result_events(run_id, result.events)
        return updated

    def record_pending(self, run_id: str, result: AgentTurnResult) -> AgentRun:
        if result.status != "pending_confirmation":
            result = AgentTurnResult(
                status="pending_confirmation",
                answer=result.answer,
                specialist=result.specialist,
                pending_action=result.pending_action,
                tool_calls=result.tool_calls,
                evidence=result.evidence,
                trace=result.trace,
                duration_seconds=result.duration_seconds,
                loaded_skills=result.loaded_skills,
                events=result.events,
                metrics=result.metrics,
            )
        return self.record_result(run_id, result)

    def record_failure(self, run_id: str, exc: Exception) -> AgentRun:
        name = exc.__class__.__name__.lower()
        if isinstance(exc, TimeoutError) or "timeout" in name:
            code = RuntimeErrorCode.WORKER_TIMEOUT
        elif any(token in name for token in ("connection", "provider", "ratelimit")):
            code = RuntimeErrorCode.PROVIDER_UNAVAILABLE
        else:
            code = RuntimeErrorCode.RUNTIME_FAILED
        updated = self.run_store.update_status(
            run_id,
            RunStatus.FAILED,
            error_code=code.value,
            error_message=public_error_message(code),
            result_json={"run_id": run_id, "status": "failed", "error_code": code.value},
        )
        self.run_store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="runtime",
                name="run_failed",
                label="处理失败",
                status="failed",
                details={"error_code": code.value},
            )
        )
        return updated

    def query(self, question: str, context: PersonaAgentContext) -> AgentTurnResult:
        run = self.start_run(context, action="chat")
        try:
            result = self.service.query(question, context)
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise
        self.record_result(run.run_id, result)
        return result

    def stream_query(self, question: str, context: PersonaAgentContext):
        run = self.start_run(context, action="chat")
        try:
            for event in self.service.stream_query(question, context):
                if event.get("kind") == "result":
                    self.record_result(run.run_id, event["result"])
                yield event
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise

    def resume(self, context: PersonaAgentContext, specialist: str, approved: bool) -> AgentTurnResult:
        run = self.start_run(context, action="resume")
        try:
            result = self.service.resume(context, specialist, approved)
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise
        self.record_result(run.run_id, result)
        return result

    def stream_resume(self, context: PersonaAgentContext, specialist: str, approved: bool):
        run = self.start_run(context, action="resume")
        try:
            for event in self.service.stream_resume(context, specialist, approved):
                if event.get("kind") == "result":
                    self.record_result(run.run_id, event["result"])
                yield event
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise

    def cancel(self, run_id: str) -> AgentRun:
        current = self.run_store.get(run_id)
        if current is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if current.status is RunStatus.CANCELLED:
            return current
        if current.status in {RunStatus.COMPLETED, RunStatus.FAILED}:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_TERMINAL)
        updated = self.run_store.update_status(run_id, RunStatus.CANCELLED)
        self.run_store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="runtime",
                name="run_cancelled",
                label="已取消",
                status="completed",
            )
        )
        return updated
