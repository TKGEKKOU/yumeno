"""Tests for the Core -> Supervisor -> Worker state contract."""

from __future__ import annotations

from typing import get_type_hints

import pytest
from pydantic import ValidationError

from agents.graph.state import PersonaWorkflowState
from agents.runtime.models import StructuredHandoff, validate_structured_handoff


def test_persona_workflow_state_exposes_structured_handoff_fields_and_legacy_fields():
    annotations = get_type_hints(PersonaWorkflowState)

    for field in (
        "conversation_id",
        "pending_task",
        "task_type",
        "dispatch_request",
        "input_refs",
        "selected_options",
        "waiting_inputs",
        "workflow",
        "result_refs",
    ):
        assert field in annotations

    for field in (
        "active_worker",
        "worker_results",
        "worker_request",
        "worker_call_id",
        "intent_decision",
        "route_node",
    ):
        assert field in annotations


def test_structured_handoff_accepts_contract_data_and_normalizes_to_json_dict():
    handoff = validate_structured_handoff(
        {
            "conversation_id": "conversation-1",
            "pending_task": "整理资料",
            "task_type": "document_search",
            "dispatch_request": {
                "worker": "knowledge",
                "request": "查找资料",
                "conversation_context": {"conversation_id": "conversation-1"},
                "input_refs": {"attachment_ids": ["attachment:one"]},
                "options": {"scope": "persona"},
            },
            "input_refs": {"attachment_ids": ["attachment:one"]},
            "selected_options": {"scope": "persona", "limit": 3},
            "waiting_inputs": [{"kind": "configuration", "label": "无需补充"}],
            "workflow": {"phase": "dispatch", "attempt": 1},
            "result_refs": [],
            "dispatch_status": "accepted",
        }
    )

    assert isinstance(handoff, StructuredHandoff)
    assert handoff.task_type == "document_search"
    assert handoff.dispatch_status == "accepted"
    assert handoff.model_dump(mode="json")["input_refs"] == {"attachment_ids": ["attachment:one"]}


def test_structured_handoff_rejects_forbidden_execution_fields_recursively():
    for forbidden in ("path", "command", "python", "shell"):
        with pytest.raises(ValidationError, match=forbidden):
            StructuredHandoff(
                dispatch_request={"worker": "document", "options": {forbidden: "blocked"}}
            )


def test_structured_handoff_rejects_unknown_top_level_fields():
    with pytest.raises(ValidationError):
        StructuredHandoff(command="echo blocked")
from agents.graph.supervisor import _dispatch_request_error


def test_supervisor_dispatch_rejects_forbidden_fields_at_any_nested_level():
    request = {
        "worker": "knowledge",
        "task_type": "lookup",
        "conversation_context": {"conversation_id": "conversation-1"},
        "input_refs": {"attachments": [{"metadata": {"command": "blocked"}}]},
        "options": {},
    }

    error = _dispatch_request_error(request, "knowledge")

    assert error is not None
    assert "command" in error
