from __future__ import annotations

import time
from dataclasses import asdict, dataclass, field
from threading import Lock
from typing import Any
from uuid import uuid4


PUBLIC_DETAIL_KEYS = frozenset(
    {
        "worker",
        "tool",
        "source",
        "count",
        "candidate_count",
        "result_count",
        "ok",
        "reason",
        "error_code",
        "status",
        "previous_status",
        "route",
        "query_rewritten",
        "corrected",
        "refused",
        # Runtime task/step summaries may retain identifiers and lifecycle
        # markers, but never free-form prompts, queries, or tool payloads.
        "document_job_id",
        "session_id",
        "source_kind",
        "operation",
        "phase",
        "task_id",
        "step_id",
        "step_key",
    }
)


def sanitize_details(details: dict[str, Any] | None) -> dict[str, Any]:
    """Keep operational metadata while dropping prompts, secrets and payloads."""

    if not details:
        return {}
    return {
        key: value
        for key, value in details.items()
        if key in PUBLIC_DETAIL_KEYS
        and (value is None or isinstance(value, (str, int, float, bool)))
    }


@dataclass(frozen=True)
class RunEvent:
    sequence: int
    category: str
    name: str
    label: str
    status: str
    duration_ms: float | None = None
    details: dict[str, Any] = field(default_factory=dict)


class RunRecorder:
    """Request-local telemetry. It is never stored in LangGraph or the database."""

    def __init__(self, *, source: str = "api") -> None:
        self.run_id = str(uuid4())
        self.source = source
        self._started = time.perf_counter()
        self._first_token_ms: float | None = None
        self._finished_ms: float | None = None
        self._status = "running"
        self._handoff_count = 0
        self._model_calls = 0
        self._model_duration_ms = 0.0
        self._input_tokens = 0
        self._output_tokens = 0
        self._token_usage_calls = 0
        self._context_tokens_before = 0
        self._context_tokens_after = 0
        self._context_dropped_messages = 0
        self._events: list[RunEvent] = []
        self._lock = Lock()

    def event(
        self,
        category: str,
        name: str,
        label: str,
        *,
        status: str = "completed",
        duration_ms: float | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        with self._lock:
            self._events.append(
                RunEvent(
                    sequence=len(self._events) + 1,
                    category=category,
                    name=name,
                    label=label,
                    status=status,
                    duration_ms=round(duration_ms, 1) if duration_ms is not None else None,
                    details=sanitize_details(details),
                )
            )

    def mark_model_call(
        self,
        *,
        input_tokens: int | None = None,
        output_tokens: int | None = None,
        duration_ms: float = 0.0,
    ) -> None:
        with self._lock:
            self._model_calls += 1
            if input_tokens is not None or output_tokens is not None:
                self._token_usage_calls += 1
                self._input_tokens += max(0, int(input_tokens or 0))
                self._output_tokens += max(0, int(output_tokens or 0))
            self._model_duration_ms += max(0.0, float(duration_ms))

    def mark_context(
        self,
        *,
        tokens_before: int,
        tokens_after: int,
        dropped_messages: int,
    ) -> None:
        with self._lock:
            self._context_tokens_before += max(0, int(tokens_before))
            self._context_tokens_after += max(0, int(tokens_after))
            self._context_dropped_messages += max(0, int(dropped_messages))

    def mark_first_token(self) -> None:
        with self._lock:
            if self._first_token_ms is None:
                self._first_token_ms = (time.perf_counter() - self._started) * 1000

    def finish(self, *, status: str = "completed", handoff_count: int = 0) -> None:
        with self._lock:
            if self._finished_ms is None:
                self._finished_ms = (time.perf_counter() - self._started) * 1000
            self._status = status
            self._handoff_count = max(0, int(handoff_count))
            self._events.append(
                RunEvent(
                    sequence=len(self._events) + 1,
                    category="system",
                    name="turn_finished",
                    label="处理完成" if status == "completed" else "处理结束",
                    status=status,
                    duration_ms=round(self._finished_ms, 1),
                )
            )

    def events(self) -> tuple[dict[str, Any], ...]:
        with self._lock:
            return tuple(asdict(item) for item in self._events)

    def metrics(self) -> dict[str, Any]:
        with self._lock:
            tool_events = [event for event in self._events if event.category == "tool"]
            successes = sum(event.status == "completed" for event in tool_events)
            failures = sum(event.status in {"failed", "denied"} for event in tool_events)
            total_ms = self._finished_ms
            if total_ms is None:
                total_ms = (time.perf_counter() - self._started) * 1000
            return {
                "run_id": self.run_id,
                "source": self.source,
                "status": self._status,
                "first_token_ms": (
                    round(self._first_token_ms, 1) if self._first_token_ms is not None else None
                ),
                "total_ms": round(total_ms, 1),
                "model_calls": self._model_calls,
                "model_duration_ms": round(self._model_duration_ms, 1),
                "input_tokens": self._input_tokens if self._token_usage_calls else None,
                "output_tokens": self._output_tokens if self._token_usage_calls else None,
                "total_tokens": (
                    self._input_tokens + self._output_tokens
                    if self._token_usage_calls
                    else None
                ),
                "token_usage_calls": self._token_usage_calls,
                "context_tokens_before": self._context_tokens_before,
                "context_tokens_after": self._context_tokens_after,
                "context_dropped_messages": self._context_dropped_messages,
                "tool_calls": len(tool_events),
                "tool_successes": successes,
                "tool_failures": failures,
                "handoff_count": self._handoff_count,
            }
