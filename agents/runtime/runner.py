from __future__ import annotations

from typing import Any, Callable, TYPE_CHECKING

from agents.context import PersonaAgentContext
from agents.contracts import resolve_error_fields
from agents.runtime.native import NativeAgentLoop
from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError, public_error_message
from agents.runtime.events import sanitize_event_details
from agents.runtime.models import (
    AgentResult,
    AgentRun,
    RunEvent,
    RunStatus,
    RuntimeStep,
    RuntimeTask,
    StepStatus,
    TaskStatus,
)
from agents.service import AgentTurnResult

if TYPE_CHECKING:
    from app.run_store import RunStore


def _result_status(result: AgentTurnResult) -> tuple[str, str | None]:
    if result.metrics.get("status") == "degraded":
        return "degraded", RuntimeErrorCode.PROVIDER_UNAVAILABLE.value
    if result.status == "pending_confirmation":
        return "pending_confirmation", None
    if result.status == "waiting_input":
        return "pending_confirmation", None
    if result.status in {"completed", "failed", "degraded"}:
        return result.status, None
    return "failed", RuntimeErrorCode.CONTRACT_INVALID.value


def to_agent_result(run_id: str, result: AgentTurnResult) -> AgentResult:
    """把现有 AgentTurnResult 转成 Runtime 的稳定结果合同。"""

    status, status_error_code = _result_status(result)
    worker = result.worker or result.specialist
    result_error = result.error
    resolved_error_code, resolved_error_message = resolve_error_fields(
        result_error, result.error_code or status_error_code, result.error_message
    )
    if resolved_error_code and not resolved_error_message:
        resolved_error_message = public_error_message(resolved_error_code)
    if result_error is None and resolved_error_code:
        result_error = {
            "code": resolved_error_code,
            "message": resolved_error_message,
        }
    return AgentResult(
        run_id=run_id,
        status=status,
        answer=result.answer,
        worker=worker,
        specialist=result.specialist,
        pending_action=result.pending_action,
        worker_results=list(result.worker_results or result.tool_calls),
        evidence=list(result.evidence),
        artifacts=list(result.artifacts),
        citations=list(result.citations),
        uncertainties=list(result.uncertainties),
        trace=list(result.trace),
        confidence=float((result.metrics or {}).get("confidence") or 0.0),
        requires_approval=status == "pending_confirmation" or result.pending_action is not None,
        error=result_error,
        error_code=resolved_error_code,
        error_message=resolved_error_message,
        task_type=result.task_type,
        input_refs=dict(result.input_refs),
        selected_options=dict(result.selected_options),
        waiting_inputs=list(result.waiting_inputs),
        result_refs=list(result.result_refs),
        task_id=result.task_id,
    )


class AgentRuntime:
    """围绕现有 PersonaAgentService 的运行记录适配层。"""

    def __init__(self, service: Any, run_store: RunStore) -> None:
        self.service = service
        self.run_store = run_store
        self._cancel_handlers: dict[str, Callable[[], None]] = {}
        # Agent 工具执行时可能没有 Starlette request；由应用启动时注入共享 state。
        self.app_state: Any | None = None
        # 内置执行内核只负责生命周期；Core/Supervisor/Worker 仍负责业务判断与执行。
        self.engine = NativeAgentLoop(service)

    def register_cancel_handler(self, run_id: str, handler: Callable[[], None]) -> None:
        """注册领域任务的取消钩子，让通用 Runtime 能中止进程内 Worker。"""

        if self.run_store.get(run_id) is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        self._cancel_handlers[run_id] = handler

    def unregister_cancel_handler(self, run_id: str) -> None:
        self._cancel_handlers.pop(run_id, None)

    def start_task(
        self,
        *,
        action: str,
        workspace_id: str | None = None,
        persona_id: str | None = None,
        conversation_id: str | None = None,
        thread_id: str | None = None,
        worker: str | None = None,
        current_step: str = "",
        status_text: str = "等待开始",
        resume_state: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRun:
        """创建一个非对话后台任务，并纳入同一套 Runtime 状态机。

        文档索引、评测和后续声音任务不一定拥有 PersonaAgentContext，
        因此不能强行复用 ``start_run``。它们仍然共享 AgentRun/事件/取消/恢复
        合同，而不是各自维护一套不可恢复的线程状态。
        """

        safe_metadata = sanitize_event_details(metadata)
        safe_resume_state = sanitize_event_details(resume_state)
        run = AgentRun(
            action=action,
            status=RunStatus.RUNNING,
            workspace_id=workspace_id,
            persona_id=persona_id,
            conversation_id=conversation_id,
            thread_id=thread_id,
            active_worker=worker,
            current_step=current_step,
            status_text=status_text,
            resume_state=safe_resume_state,
            result_json=safe_metadata,
        )
        now = run.created_at
        run.started_at = now
        task = RuntimeTask(
            run_id=run.run_id,
            name=action,
            status=TaskStatus.RUNNING,
            metadata=safe_metadata,
            created_at=now,
            started_at=now,
            updated_at=now,
        )
        step = RuntimeStep(
            task_id=task.task_id,
            sequence=1,
            name=current_step or action,
            worker=worker,
            status=StepStatus.RUNNING,
            resume_state=safe_resume_state,
            created_at=now,
            started_at=now,
            updated_at=now,
        )
        created_run, _, _ = self.run_store.create_run_with_task(
            run,
            task,
            step,
            RunEvent(
                run_id=run.run_id,
                sequence=1,
                category="runtime",
                name="task_started",
                label="任务开始",
                status="started",
                details={"action": action, "worker": worker or ""},
            ),
        )
        return created_run

    def update_task_progress(
        self,
        run_id: str,
        *,
        current_step: str | None = None,
        status_text: str | None = None,
        progress: int | None = None,
        total: int | None = None,
        resume_state: dict[str, Any] | None = None,
        event_name: str | None = None,
        event_label: str | None = None,
    ) -> AgentRun:
        """更新后台任务的公开进度，并可选写入一个脱敏事件。"""

        fields = {
            name: value
            for name, value in {
                "current_step": current_step,
                "status_text": status_text,
                "progress": progress,
                "total": total,
                "resume_state": resume_state,
            }.items()
            if value is not None
        }
        updated = self.run_store.update_progress(run_id, **fields)
        # 领域 Worker 可能在取消/失败竞态中最后一次写入快照；
        # 终态之后不再追加 status=running 的进度事件，避免事件流把已取消任务
        # 重新显示成仍在执行。
        if event_name and updated.status not in {RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED}:
            self.run_store.append_event(
                RunEvent(
                    run_id=run_id,
                    sequence=1,
                    category="runtime",
                    name=event_name,
                    label=event_label or event_name,
                    status="running",
                    details={
                        key: value
                        for key, value in {
                            "current_step": current_step,
                            "progress": progress,
                            "total": total,
                        }.items()
                        if value is not None
                    },
                )
            )
        return updated

    def _task_result_payload(
        self,
        run_id: str,
        status: RunStatus,
        result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        current = self.run_store.get(run_id)
        payload = dict(current.result_json or {}) if current else {}
        payload.update(result or {})
        payload.update({"run_id": run_id, "status": status.value})
        return payload

    def finish_task(
        self,
        run_id: str,
        *,
        current_step: str = "",
        status_text: str = "任务完成",
        progress: int = 0,
        total: int = 0,
        resume_state: dict[str, Any] | None = None,
        result: dict[str, Any] | None = None,
    ) -> AgentRun:
        """收口后台任务；如果任务已被取消，不会把取消覆盖成完成。"""

        current = self.run_store.get(run_id)
        if current is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if current.status in {RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.COMPLETED}:
            return current
        payload = self._task_result_payload(run_id, RunStatus.COMPLETED, result)
        try:
            updated = self.run_store.update_status(
                run_id,
                RunStatus.COMPLETED,
                current_step=current_step,
                status_text=status_text,
                progress=progress,
                total=total,
                resume_state=resume_state,
                result_json=payload,
            )
        except RuntimeOperationError as exc:
            # 取消请求可能在上面的终态预检查之后抢先提交。把这类竞态
            # 收口为幂等返回，而不是让后台 Worker 以 invalid_transition 失败。
            if exc.code == RuntimeErrorCode.INVALID_TRANSITION.value:
                latest = self.run_store.get(run_id)
                if latest is not None and latest.status in {
                    RunStatus.COMPLETED,
                    RunStatus.FAILED,
                    RunStatus.CANCELLED,
                }:
                    return latest
            raise
        self.run_store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="runtime",
                name="task_completed",
                label="任务完成",
                status="completed",
                details={"action": updated.action},
            )
        )
        return updated

    def fail_task(
        self,
        run_id: str,
        *,
        error_code: RuntimeErrorCode | str = RuntimeErrorCode.RUNTIME_FAILED,
        status_text: str = "任务失败",
        result: dict[str, Any] | None = None,
    ) -> AgentRun:
        """以公开错误合同收口后台任务，不保存底层异常文本。"""

        current = self.run_store.get(run_id)
        if current is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if current.status in {RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.COMPLETED}:
            return current
        try:
            normalized_code = RuntimeErrorCode(error_code)
        except (TypeError, ValueError):
            normalized_code = RuntimeErrorCode.RUNTIME_FAILED
        message = public_error_message(normalized_code)
        error = {"code": normalized_code.value, "message": message}
        payload = self._task_result_payload(
            run_id,
            RunStatus.FAILED,
            {
                **(result or {}),
                "error": error,
                "error_code": normalized_code.value,
                "error_message": message,
            },
        )
        updated = self.run_store.update_status(
            run_id,
            RunStatus.FAILED,
            status_text=status_text,
            error_code=normalized_code.value,
            error_message=message,
            result_json=payload,
        )
        self.run_store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="runtime",
                name="task_failed",
                label="任务失败",
                status="failed",
                details={"action": updated.action, "error_code": normalized_code.value},
            )
        )
        return updated
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
            active_worker=contract.worker,
            specialist=contract.specialist,
            pending_action=contract.pending_action,
            answer=contract.answer,
            worker_results=contract.worker_results,
            evidence=contract.evidence,
            # AgentRun 当前把详细结果放在 result_json；这里同时保留摘要字段，
            # 后续持久化模型可以按同一合同读取，而不再依赖 specialist 的旧命名。
            citations=contract.citations,
            uncertainties=contract.uncertainties,
            trace=contract.trace,
            requires_approval=contract.requires_approval,
            error_code=contract.error_code,
            error_message=contract.error_message,
            result_json=contract.model_dump(mode="json"),
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
                artifacts=result.artifacts,
                citations=result.citations,
                uncertainties=result.uncertainties,
                trace=result.trace,
                duration_seconds=result.duration_seconds,
                loaded_skills=result.loaded_skills,
                events=result.events,
                metrics=result.metrics,
                error=result.error,
                worker=result.worker,
                error_code=result.error_code,
                error_message=result.error_message,
                worker_results=result.worker_results,
                task_type=result.task_type,
                input_refs=result.input_refs,
                selected_options=result.selected_options,
                waiting_inputs=result.waiting_inputs,
                result_refs=result.result_refs,
                task_id=result.task_id,
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
        error_message = public_error_message(code)
        error = {"code": code.value, "message": error_message}
        updated = self.run_store.update_status(
            run_id,
            RunStatus.FAILED,
            error_code=code.value,
            error_message=error_message,
            result_json={
                "run_id": run_id,
                "status": "failed",
                "error": error,
                "error_code": code.value,
                "error_message": error_message,
                "requires_approval": False,
            },
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
            result = self.engine.query(question, context, job_id=run.run_id)
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise
        self.record_result(run.run_id, result)
        return result

    def stream_query(self, question: str, context: PersonaAgentContext):
        run = self.start_run(context, action="chat")
        try:
            for event in self.engine.stream_query(question, context, job_id=run.run_id):
                if event.get("kind") == "result":
                    self.record_result(run.run_id, event["result"])
                yield event
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise

    def resume(
        self, context: PersonaAgentContext, specialist: str, approved: bool | None = None, *,
        worker: str | None = None, task_id: str | None = None,
        attachment_ids: tuple[str, ...] = (), input_values: dict[str, Any] | None = None,
    ) -> AgentTurnResult:
        run = self.start_run(context, action="resume")
        try:
            result = self.engine.resume(
                context, specialist, approved, job_id=run.run_id, worker=worker, task_id=task_id,
                attachment_ids=attachment_ids, input_values=input_values,
            )
        except Exception as exc:
            self.record_failure(run.run_id, exc)
            raise
        self.record_result(run.run_id, result)
        return result

    def stream_resume(
        self, context: PersonaAgentContext, specialist: str, approved: bool | None = None, *,
        worker: str | None = None, task_id: str | None = None,
        attachment_ids: tuple[str, ...] = (), input_values: dict[str, Any] | None = None,
    ):
        run = self.start_run(context, action="resume")
        try:
            for event in self.engine.stream_resume(
                context, specialist, approved, job_id=run.run_id, worker=worker, task_id=task_id,
                attachment_ids=attachment_ids, input_values=input_values,
            ):
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
        # 先通知内置执行内核，停止当前 Job 的事件转发；领域钩子随后负责
        # RVC/session/下载等具体任务的取消。
        self.engine.cancel(run_id)
        handler = self._cancel_handlers.get(run_id)
        if handler is not None:
            try:
                handler()
            except Exception:
                # 取消信号本身不能因为领域钩子异常而阻塞 Runtime 收口。
                pass
        try:
            updated = self.run_store.update_status(run_id, RunStatus.CANCELLED)
        except RuntimeOperationError as exc:
            # 完成/失败可能恰好在首次读取之后提交。此时取消请求仍应
            # 返回稳定的 terminal 合同，而不是把存储层竞态泄漏为非法转换。
            if exc.code == RuntimeErrorCode.INVALID_TRANSITION.value:
                latest = self.run_store.get(run_id)
                if latest is not None and latest.status is RunStatus.CANCELLED:
                    return latest
                if latest is not None and latest.status in {
                    RunStatus.COMPLETED,
                    RunStatus.FAILED,
                }:
                    raise RuntimeOperationError(RuntimeErrorCode.RUN_TERMINAL) from exc
            raise
        self._cancel_handlers.pop(run_id, None)
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
