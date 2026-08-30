from datetime import datetime, timezone

import pytest

from agents.runtime.errors import RuntimeErrorCode, public_error_message
from agents.runtime.events import sanitize_event_details
from agents.runtime.models import (
    AgentResult,
    AgentRun,
    RunEvent,
    RunStatus,
    allowed_transition,
)


def test_run_status_values_are_stable():
    assert [status.value for status in RunStatus] == [
        "queued",
        "running",
        "waiting_approval",
        "paused",
        "completed",
        "failed",
        "cancelled",
    ]


def test_run_state_machine_allows_progress_and_terminal_idempotency():
    assert allowed_transition(RunStatus.QUEUED, RunStatus.RUNNING)
    assert allowed_transition(RunStatus.RUNNING, RunStatus.WAITING_APPROVAL)
    assert allowed_transition(RunStatus.WAITING_APPROVAL, RunStatus.RUNNING)
    assert allowed_transition(RunStatus.RUNNING, RunStatus.COMPLETED)
    assert allowed_transition(RunStatus.COMPLETED, RunStatus.COMPLETED)
    assert not allowed_transition(RunStatus.COMPLETED, RunStatus.RUNNING)
    assert not allowed_transition(RunStatus.QUEUED, RunStatus.COMPLETED)


def test_agent_run_and_result_have_safe_defaults():
    run = AgentRun(run_id="run-1", action="chat")
    result = AgentResult(run_id="run-1")

    assert run.status is RunStatus.QUEUED
    assert run.created_at.tzinfo is not None
    assert result.status == "completed"
    assert result.answer == ""
    assert result.worker_results == []
    assert result.evidence == []
    assert result.citations == []
    assert result.requires_approval is False


def test_run_event_requires_positive_sequence_and_public_details():
    event = RunEvent(
        run_id="run-1",
        sequence=1,
        category="agent",
        name="turn_started",
        label="开始处理",
        status="started",
        duration_ms=12.5,
        details={"worker": "knowledge", "prompt": "secret", "api_key": "sk-test"},
    )

    assert event.details == {"worker": "knowledge"}
    with pytest.raises(ValueError):
        RunEvent(
            run_id="run-1",
            sequence=0,
            category="agent",
            name="invalid",
            label="无效",
            status="failed",
        )


def test_runtime_errors_have_stable_public_messages():
    assert RuntimeErrorCode.RUN_NOT_FOUND.value == "run_not_found"
    assert public_error_message(RuntimeErrorCode.RUN_NOT_FOUND) == "运行记录不存在。"
    assert public_error_message("not-a-code") == "运行时操作失败。"


def test_sanitize_event_details_reuses_observability_allowlist():
    assert sanitize_event_details(
        {
            "tool": "search",
            "status": "completed",
            "nested": {"prompt": "do not persist"},
            "token": "do not persist",
        }
    ) == {"tool": "search", "status": "completed"}
