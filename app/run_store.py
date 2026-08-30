from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Callable, Iterator

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError
from agents.runtime.models import AgentRun, RunEvent, RunStatus, allowed_transition
from app.models import AgentRunEventRecord, AgentRunRecord


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
            specialist=record.specialist,
            answer=record.answer or "",
            worker_results=list(record.worker_results_json or []),
            evidence=list(record.evidence_json or []),
            citations=list(record.citations_json or []),
            uncertainties=list(record.uncertainties_json or []),
            trace=list(record.trace_json or []),
            requires_approval=bool(record.requires_approval),
            error_code=record.error_code,
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

    def create(self, run: AgentRun) -> AgentRun:
        with self._session() as session:
            if session.get(AgentRunRecord, run.run_id) is not None:
                raise RuntimeOperationError(RuntimeErrorCode.INVALID_REQUEST, "run already exists")
            now = self._now()
            record = AgentRunRecord(
                run_id=run.run_id,
                action=run.action,
                status=run.status.value,
                workspace_id=run.workspace_id,
                persona_id=run.persona_id,
                conversation_id=run.conversation_id,
                specialist=run.specialist,
                answer=run.answer,
                worker_results_json=run.worker_results,
                evidence_json=run.evidence,
                citations_json=run.citations,
                uncertainties_json=run.uncertainties,
                trace_json=run.trace,
                requires_approval=run.requires_approval,
                error_code=run.error_code,
                created_at=run.created_at or now,
                started_at=run.started_at,
                finished_at=run.finished_at,
                updated_at=now,
            )
            session.add(record)
            session.flush()
            return self._record_to_run(record)

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
            for name, value in fields.items():
                column = (
                    f"{name}_json"
                    if name in {"worker_results", "evidence", "citations", "uncertainties", "trace", "pending_action"}
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
            session.flush()
            return self._record_to_run(record)

    def append_event(self, event: RunEvent) -> RunEvent:
        with self._session() as session:
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

    def delete(self, run_id: str) -> bool:
        with self._session() as session:
            record = session.get(AgentRunRecord, run_id)
            if record is None:
                return False
            session.query(AgentRunEventRecord).filter(
                AgentRunEventRecord.run_id == run_id
            ).delete(synchronize_session=False)
            session.delete(record)
            return True
