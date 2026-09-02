from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Callable, Iterator

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError, public_error_message
from agents.runtime.events import sanitize_event_details
from agents.runtime.models import (
    AgentRun,
    RunEvent,
    RunStatus,
    RuntimeStep,
    RuntimeTask,
    StepStatus,
    TaskStatus,
    allowed_transition,
)
from app.models import AgentRunEventRecord, AgentRunRecord, RuntimeStepRecord, RuntimeTaskRecord


class RunStore:
    """SQLite-backed store for public Agent Runtime state and events."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    @contextmanager
    def _session(self) -> Iterator[Session]:
        session = self._session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def _now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _as_utc(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @staticmethod
    def _record_to_run(record: AgentRunRecord) -> AgentRun:
        return AgentRun(
            run_id=record.run_id,
            action=record.action,
            status=RunStatus(record.status),
            workspace_id=record.workspace_id,
            persona_id=record.persona_id,
            conversation_id=record.conversation_id,
            thread_id=record.thread_id,
            active_worker=record.active_worker,
            specialist=record.specialist,
            pending_action=record.pending_action_json,
            current_step=record.current_step or "",
            current_question=record.current_question or "",
            progress=max(0, int(record.progress or 0)),
            total=max(0, int(record.total or 0)),
            status_text=record.status_text or "",
            resume_state=record.resume_state_json,
            answer=record.answer or "",
            worker_results=list(record.worker_results_json or []),
            evidence=list(record.evidence_json or []),
            citations=list(record.citations_json or []),
            uncertainties=list(record.uncertainties_json or []),
            trace=list(record.trace_json or []),
            requires_approval=bool(record.requires_approval),
            error_code=record.error_code,
            error_message=record.error_message,
            result_json=record.result_json,
            created_at=RunStore._as_utc(record.created_at),
            started_at=RunStore._as_utc(record.started_at),
            finished_at=RunStore._as_utc(record.finished_at),
            updated_at=RunStore._as_utc(record.updated_at),
        )

    @staticmethod
    def _event_to_model(record: AgentRunEventRecord) -> RunEvent:
        return RunEvent(
            run_id=record.run_id,
            sequence=record.sequence,
            category=record.category,
            name=record.name,
            label=record.label,
            status=record.status,
            duration_ms=record.duration_ms,
            details=record.details_json or {},
        )

    @staticmethod
    def _record_to_task(record: RuntimeTaskRecord) -> RuntimeTask:
        return RuntimeTask(
            task_id=record.task_id,
            run_id=record.run_id,
            name=record.name or "task",
            status=TaskStatus(record.status),
            input_summary=record.input_summary_json or {},
            output_summary=record.output_summary_json or {},
            metadata=record.metadata_json or {},
            created_at=RunStore._as_utc(record.created_at) or RunStore._now(),
            started_at=RunStore._as_utc(record.started_at),
            finished_at=RunStore._as_utc(record.finished_at),
            updated_at=RunStore._as_utc(record.updated_at) or RunStore._now(),
        )

    @staticmethod
    def _record_to_step(record: RuntimeStepRecord) -> RuntimeStep:
        return RuntimeStep(
            step_id=record.step_id,
            task_id=record.task_id,
            sequence=record.sequence,
            name=record.name or "step",
            worker=record.worker,
            status=StepStatus(record.status),
            input_summary=record.input_summary_json or {},
            output_summary=record.output_summary_json or {},
            resume_state=record.resume_state_json,
            created_at=RunStore._as_utc(record.created_at) or RunStore._now(),
            started_at=RunStore._as_utc(record.started_at),
            finished_at=RunStore._as_utc(record.finished_at),
            updated_at=RunStore._as_utc(record.updated_at) or RunStore._now(),
        )

    @staticmethod
    def _record_from_task(task: RuntimeTask, now: datetime | None = None) -> RuntimeTaskRecord:
        now = now or RunStore._now()
        return RuntimeTaskRecord(
            task_id=task.task_id,
            run_id=task.run_id,
            name=task.name[:128],
            status=task.status.value,
            input_summary_json=task.input_summary,
            output_summary_json=task.output_summary,
            metadata_json=task.metadata,
            created_at=task.created_at or now,
            started_at=task.started_at,
            finished_at=task.finished_at,
            updated_at=task.updated_at or now,
        )

    @staticmethod
    def _record_from_step(step: RuntimeStep, now: datetime | None = None) -> RuntimeStepRecord:
        now = now or RunStore._now()
        return RuntimeStepRecord(
            step_id=step.step_id,
            task_id=step.task_id,
            sequence=step.sequence,
            name=step.name[:128],
            worker=step.worker[:64] if step.worker else None,
            status=step.status.value,
            input_summary_json=step.input_summary,
            output_summary_json=step.output_summary,
            resume_state_json=step.resume_state,
            created_at=step.created_at or now,
            started_at=step.started_at,
            finished_at=step.finished_at,
            updated_at=step.updated_at or now,
        )

    def _create_task_in_session(self, session: Session, task: RuntimeTask) -> RuntimeTask:
        if session.get(AgentRunRecord, task.run_id) is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if session.get(RuntimeTaskRecord, task.task_id) is not None:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "task already exists")
        record = self._record_from_task(task)
        session.add(record)
        session.flush()
        return self._record_to_task(record)

    def create_task(self, task: RuntimeTask) -> RuntimeTask:
        """Persist a Task summary without changing the parent Run state."""
        with self._session() as session:
            return self._create_task_in_session(session, task)

    def get_task(self, task_id: str) -> RuntimeTask | None:
        with self._session() as session:
            record = session.get(RuntimeTaskRecord, task_id)
            return self._record_to_task(record) if record is not None else None

    def list_tasks(self, run_id: str) -> list[RuntimeTask]:
        with self._session() as session:
            records = session.scalars(
                select(RuntimeTaskRecord)
                .where(RuntimeTaskRecord.run_id == run_id)
                .order_by(RuntimeTaskRecord.created_at.asc(), RuntimeTaskRecord.task_id.asc())
            ).all()
            return [self._record_to_task(record) for record in records]

    def _create_step_in_session(self, session: Session, step: RuntimeStep) -> RuntimeStep:
        if session.get(RuntimeTaskRecord, step.task_id) is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        if session.get(RuntimeStepRecord, step.step_id) is not None:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "step already exists")
        record = self._record_from_step(step)
        session.add(record)
        session.flush()
        return self._record_to_step(record)

    def create_step(self, step: RuntimeStep) -> RuntimeStep:
        """Persist one ordered Step summary under an existing Task."""
        with self._session() as session:
            return self._create_step_in_session(session, step)

    def get_step(self, step_id: str) -> RuntimeStep | None:
        with self._session() as session:
            record = session.get(RuntimeStepRecord, step_id)
            return self._record_to_step(record) if record is not None else None

    def list_steps(self, task_id: str) -> list[RuntimeStep]:
        with self._session() as session:
            records = session.scalars(
                select(RuntimeStepRecord)
                .where(RuntimeStepRecord.task_id == task_id)
                .order_by(RuntimeStepRecord.sequence.asc(), RuntimeStepRecord.step_id.asc())
            ).all()
            return [self._record_to_step(record) for record in records]

    @classmethod
    def _record_from_run(cls, run: AgentRun, now: datetime | None = None) -> AgentRunRecord:
        now = now or cls._now()
        return AgentRunRecord(
            run_id=run.run_id,
            action=run.action,
            status=run.status.value,
            workspace_id=run.workspace_id,
            persona_id=run.persona_id,
            conversation_id=run.conversation_id,
            thread_id=run.thread_id,
            active_worker=run.active_worker,
            specialist=run.specialist,
            pending_action_json=run.pending_action,
            current_step=run.current_step,
            current_question=run.current_question,
            progress=run.progress,
            total=run.total,
            status_text=run.status_text,
            resume_state_json=run.resume_state,
            answer=run.answer,
            worker_results_json=run.worker_results,
            evidence_json=run.evidence,
            citations_json=run.citations,
            uncertainties_json=run.uncertainties,
            trace_json=run.trace,
            requires_approval=run.requires_approval,
            error_code=run.error_code,
            error_message=run.error_message,
            result_json=run.result_json,
            created_at=run.created_at or now,
            started_at=run.started_at,
            finished_at=run.finished_at,
            updated_at=run.updated_at or now,
        )

    def create_in_session(self, session: Session, run: AgentRun) -> AgentRun:
        """Create a run without committing, so the caller can share its transaction."""
        if session.get(AgentRunRecord, run.run_id) is not None:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "run already exists")
        record = self._record_from_run(run)
        session.add(record)
        session.flush()
        return self._record_to_run(record)

    def create(self, run: AgentRun) -> AgentRun:
        with self._session() as session:
            return self.create_in_session(session, run)

    def create_run_with_task(
        self,
        run: AgentRun,
        task: RuntimeTask,
        step: RuntimeStep,
        event: RunEvent | None = None,
    ) -> tuple[AgentRun, RuntimeTask, RuntimeStep]:
        """Atomically create a Run, its primary Task, initial Step and optional event.

        This is intentionally a narrow creation boundary for new managed tasks. It
        prevents callers from exposing a running Run before its child execution
        records exist, while leaving the existing single-record APIs compatible.
        """

        if task.run_id != run.run_id:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "task does not belong to run")
        if step.task_id != task.task_id:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "step does not belong to task")
        if event is not None and event.run_id != run.run_id:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "event does not belong to run")

        with self._session() as session:
            created_run = self.create_in_session(session, run)
            created_task = self._create_task_in_session(session, task)
            created_step = self._create_step_in_session(session, step)
            if event is not None:
                self._append_event_in_session(session, event)
            return created_run, created_task, created_step

    @staticmethod
    def _sync_child_statuses_in_session(
        session: Session,
        run_id: str,
        status: RunStatus,
        *,
        now: datetime,
        worker: str | None = None,
        current_step: str | None = None,
        resume_state: dict[str, Any] | None = None,
    ) -> None:
        """Keep newly-created Task/Step rows aligned with their parent Run.

        Legacy runs may not have child rows; in that case this is intentionally a
        no-op. Terminal child records are never reactivated by a late parent write.
        """

        child_status = {
            RunStatus.QUEUED: TaskStatus.QUEUED,
            RunStatus.RUNNING: TaskStatus.RUNNING,
            RunStatus.WAITING_APPROVAL: TaskStatus.WAITING_APPROVAL,
            RunStatus.PAUSED: TaskStatus.PAUSED,
            RunStatus.COMPLETED: TaskStatus.COMPLETED,
            RunStatus.FAILED: TaskStatus.FAILED,
            RunStatus.CANCELLED: TaskStatus.CANCELLED,
        }[status]
        terminal_task_statuses = {
            TaskStatus.COMPLETED.value,
            TaskStatus.FAILED.value,
            TaskStatus.CANCELLED.value,
        }
        task_records = session.scalars(
            select(RuntimeTaskRecord)
            .where(RuntimeTaskRecord.run_id == run_id)
            .order_by(RuntimeTaskRecord.created_at.asc(), RuntimeTaskRecord.task_id.asc())
        ).all()
        for task_record in task_records:
            if task_record.status not in terminal_task_statuses:
                task_record.status = child_status.value
                task_record.updated_at = now
                if child_status is TaskStatus.RUNNING and task_record.started_at is None:
                    task_record.started_at = now
                if child_status in {
                    TaskStatus.COMPLETED,
                    TaskStatus.FAILED,
                    TaskStatus.CANCELLED,
                }:
                    task_record.finished_at = task_record.finished_at or now

            step_records = session.scalars(
                select(RuntimeStepRecord)
                .where(RuntimeStepRecord.task_id == task_record.task_id)
                .order_by(RuntimeStepRecord.sequence.asc(), RuntimeStepRecord.step_id.asc())
            ).all()
            for step_record in step_records:
                if step_record.status != StepStatus.SKIPPED.value and step_record.status not in terminal_task_statuses:
                    step_record.status = child_status.value
                    step_record.updated_at = now
                    if child_status is TaskStatus.RUNNING and step_record.started_at is None:
                        step_record.started_at = now
                    if child_status in {
                        TaskStatus.COMPLETED,
                        TaskStatus.FAILED,
                        TaskStatus.CANCELLED,
                    }:
                        step_record.finished_at = step_record.finished_at or now

            # Only the active/latest step receives the human-readable progress
            # snapshot. Earlier steps retain their own completed output.
            if step_records:
                active_step = next(
                    (item for item in reversed(step_records) if item.status != StepStatus.SKIPPED.value),
                    step_records[-1],
                )
                if current_step is not None and current_step:
                    active_step.name = current_step[:128]
                if worker is not None:
                    active_step.worker = worker[:64]
                if resume_state is not None:
                    active_step.resume_state_json = resume_state
                active_step.updated_at = now

    def get(self, run_id: str) -> AgentRun | None:
        with self._session() as session:
            record = session.get(AgentRunRecord, run_id)
            return self._record_to_run(record) if record is not None else None

    def update_status(self, run_id: str, status: RunStatus | str, **fields: Any) -> AgentRun:
        try:
            target = RunStatus(status)
        except (TypeError, ValueError) as exc:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "invalid status") from exc
        allowed_fields = {
            "action", "workspace_id", "persona_id", "conversation_id", "thread_id", "active_worker",
            "specialist", "pending_action", "answer",
            "worker_results", "evidence", "citations", "uncertainties", "trace",
            "current_step", "current_question", "progress", "total", "status_text", "resume_state",
            "requires_approval", "error_code", "error_message", "result_json",
        }
        unknown = set(fields) - allowed_fields
        if unknown:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "unknown run fields")
        with self._session() as session:
            record = session.get(AgentRunRecord, run_id)
            if record is None:
                raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
            current = RunStatus(record.status)
            if current == target and current in {
                RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED
            }:
                return self._record_to_run(record)
            if current != target and not allowed_transition(current, target):
                raise RuntimeOperationError(RuntimeErrorCode.INVALID_TRANSITION)
            safe_fields = dict(fields)
            if "resume_state" in safe_fields:
                safe_fields["resume_state"] = (
                    None
                    if safe_fields["resume_state"] is None
                    else sanitize_event_details(safe_fields["resume_state"])
                )
            for name, value in safe_fields.items():
                column = (
                    f"{name}_json"
                    if name in {
                        "worker_results", "evidence", "citations", "uncertainties", "trace",
                        "pending_action", "resume_state",
                    }
                    else name
                )
                setattr(record, column, value)
            record.status = target.value
            if target == RunStatus.WAITING_APPROVAL:
                record.requires_approval = True
            elif target in {RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED}:
                record.requires_approval = False
            now = self._now()
            if target == RunStatus.RUNNING and record.started_at is None:
                record.started_at = now
            if target in {RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED}:
                record.finished_at = record.finished_at or now
            record.updated_at = now
            self._sync_child_statuses_in_session(
                session,
                run_id,
                target,
                now=now,
                worker=record.active_worker,
                current_step=record.current_step,
                resume_state=record.resume_state_json,
            )
            session.flush()
            return self._record_to_run(record)

    def update_progress(self, run_id: str, **fields: Any) -> AgentRun:
        """Update public progress fields without changing the run status."""
        allowed_fields = {
            "current_step", "current_question", "progress", "total", "status_text", "resume_state",
        }
        unknown = set(fields) - allowed_fields
        if unknown:
            raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "unknown progress fields")
        with self._session() as session:
            record = session.get(AgentRunRecord, run_id)
            if record is None:
                raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
            if RunStatus(record.status) in {RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED}:
                return self._record_to_run(record)
            if "progress" in fields and int(fields["progress"]) < 0:
                raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "progress must be non-negative")
            if "total" in fields and int(fields["total"]) < 0:
                raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "total must be non-negative")
            safe_fields = dict(fields)
            if "resume_state" in safe_fields:
                safe_fields["resume_state"] = (
                    None
                    if safe_fields["resume_state"] is None
                    else sanitize_event_details(safe_fields["resume_state"])
                )
            for name, value in safe_fields.items():
                setattr(record, f"{name}_json" if name == "resume_state" else name, value)
            now = self._now()
            record.updated_at = now
            self._sync_child_statuses_in_session(
                session,
                run_id,
                RunStatus(record.status),
                now=now,
                worker=record.active_worker,
                current_step=record.current_step,
                resume_state=record.resume_state_json,
            )
            session.flush()
            return self._record_to_run(record)

    def _append_event_in_session(self, session: Session, event: RunEvent) -> RunEvent:
        if session.get(AgentRunRecord, event.run_id) is None:
            raise RuntimeOperationError(RuntimeErrorCode.RUN_NOT_FOUND)
        last = session.scalar(
            select(func.max(AgentRunEventRecord.sequence)).where(
                AgentRunEventRecord.run_id == event.run_id
            )
        )
        persisted = event.model_copy(update={"sequence": int(last or 0) + 1})
        record = AgentRunEventRecord(
            run_id=persisted.run_id,
            sequence=persisted.sequence,
            category=persisted.category,
            name=persisted.name,
            label=persisted.label,
            status=persisted.status,
            duration_ms=persisted.duration_ms,
            details_json=persisted.details,
        )
        session.add(record)
        session.flush()
        return self._event_to_model(record)

    def append_event(self, event: RunEvent) -> RunEvent:
        with self._session() as session:
            return self._append_event_in_session(session, event)

    def list_events(self, run_id: str, after_sequence: int = 0) -> list[RunEvent]:
        with self._session() as session:
            rows = session.scalars(
                select(AgentRunEventRecord)
                .where(
                    AgentRunEventRecord.run_id == run_id,
                    AgentRunEventRecord.sequence > max(0, int(after_sequence)),
                )
                .order_by(AgentRunEventRecord.sequence.asc())
            ).all()
            return [self._event_to_model(row) for row in rows]

    def recover_incomplete_runs(self) -> list[AgentRun]:
        """将进程重启时遗留的排队/运行状态安全收口为失败。

        ``waiting_approval`` 和 ``paused`` 代表可以由用户继续处理的持久化状态，
        不属于当前进程独占的执行态，因此必须保留；只有 queued/running 在进程
        重启后无法确认仍有执行者，才按公开错误合同标记为 runtime_restarted。
        """

        error_code = RuntimeErrorCode.RUNTIME_RESTARTED.value
        error_message = public_error_message(error_code)
        recovered: list[AgentRun] = []
        with self._session() as session:
            records = session.scalars(
                select(AgentRunRecord)
                .where(AgentRunRecord.status.in_([RunStatus.QUEUED.value, RunStatus.RUNNING.value]))
                .order_by(AgentRunRecord.created_at.asc(), AgentRunRecord.run_id.asc())
            ).all()
            now = self._now()
            for record in records:
                previous_status = record.status
                error = {"code": error_code, "message": error_message}
                record.status = RunStatus.FAILED.value
                record.requires_approval = False
                record.error_code = error_code
                record.error_message = error_message
                previous_result = dict(record.result_json or {})
                record.result_json = {
                    **previous_result,
                    "run_id": record.run_id,
                    "status": RunStatus.FAILED.value,
                    "error": error,
                    "error_code": error_code,
                    "error_message": error_message,
                    "requires_approval": False,
                }
                record.finished_at = record.finished_at or now
                record.updated_at = now
                self._sync_child_statuses_in_session(
                    session,
                    record.run_id,
                    RunStatus.FAILED,
                    now=now,
                    worker=record.active_worker,
                    current_step=record.current_step,
                    resume_state=record.resume_state_json,
                )
                last_sequence = session.scalar(
                    select(func.max(AgentRunEventRecord.sequence)).where(
                        AgentRunEventRecord.run_id == record.run_id
                    )
                )
                event = RunEvent(
                    run_id=record.run_id,
                    sequence=int(last_sequence or 0) + 1,
                    category="runtime",
                    name="run_recovered_failed",
                    label="服务重启后已结束",
                    status="failed",
                    details={
                        "previous_status": previous_status,
                        "error_code": error_code,
                    },
                )
                session.add(
                    AgentRunEventRecord(
                        run_id=event.run_id,
                        sequence=event.sequence,
                        category=event.category,
                        name=event.name,
                        label=event.label,
                        status=event.status,
                        duration_ms=event.duration_ms,
                        details_json=event.details,
                    )
                )
                session.flush()
                recovered.append(self._record_to_run(record))
        return recovered

    def latest(
        self,
        *,
        action: str | None = None,
        workspace_id: str | None = None,
        persona_id: str | None = None,
        statuses: set[RunStatus | str] | None = None,
    ) -> AgentRun | None:
        """Return the newest run, optionally narrowed by domain and status."""
        with self._session() as session:
            statement = select(AgentRunRecord).order_by(
                AgentRunRecord.created_at.desc(), AgentRunRecord.run_id.desc()
            )
            if action is not None:
                statement = statement.where(AgentRunRecord.action == action)
            if workspace_id is not None:
                statement = statement.where(AgentRunRecord.workspace_id == workspace_id)
            if persona_id is not None:
                statement = statement.where(AgentRunRecord.persona_id == persona_id)
            if statuses:
                values = [RunStatus(status).value for status in statuses]
                statement = statement.where(AgentRunRecord.status.in_(values))
            record = session.scalars(statement.limit(1)).first()
            return self._record_to_run(record) if record is not None else None

    def delete(self, run_id: str) -> bool:
        with self._session() as session:
            record = session.get(AgentRunRecord, run_id)
            if record is None:
                return False
            task_ids = session.scalars(
                select(RuntimeTaskRecord.task_id).where(RuntimeTaskRecord.run_id == run_id)
            ).all()
            if task_ids:
                session.query(RuntimeStepRecord).filter(
                    RuntimeStepRecord.task_id.in_(task_ids)
                ).delete(synchronize_session=False)
                session.query(RuntimeTaskRecord).filter(
                    RuntimeTaskRecord.task_id.in_(task_ids)
                ).delete(synchronize_session=False)
            session.query(AgentRunEventRecord).filter(
                AgentRunEventRecord.run_id == run_id
            ).delete(synchronize_session=False)
            session.delete(record)
            return True
