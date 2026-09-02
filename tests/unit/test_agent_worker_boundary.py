import json

from langchain_core.messages import ToolMessage

from agents.graph.supervisor import _finalize_worker, _supervisor_collect


def _rvc_state(payload):
    return {
        "messages": [ToolMessage(content=json.dumps(payload, ensure_ascii=False), name="prepare_rvc_source", tool_call_id="tool-1")],
        "dispatch_request": {"worker": "rvc_worker", "options": {"action": "prepare_and_separate"}},
        "active_worker": "rvc_worker",
        "worker_call_id": "call-1",
        "input_refs": {},
    }


def test_rvc_separated_session_is_public_waiting_input_not_success():
    update = _finalize_worker("rvc_worker")(_rvc_state({
        "status": "accepted", "worker": "rvc_worker", "action": "prepare",
        "session": {"session_id": "s-1", "phase": "separated", "progress": 100,
                    "vocals": {"file_id": "vocals.wav"},
                    "instrumental": {"file_id": "instrumental.wav"}},
    }))
    assert update["dispatch_status"] == "waiting_input"
    result = update["worker_results"][0]
    assert result["status"] == "waiting_input"
    assert result["waiting_inputs"]
    assert result["answer"] == ""


def test_rvc_failed_result_stays_failed():
    update = _finalize_worker("rvc_worker")(_rvc_state({
        "status": "failed", "worker": "rvc_worker", "action": "prepare",
        "reason": "ffmpeg exited with code 1",
    }))
    assert update["dispatch_status"] == "failed"
    assert update["worker_results"][0]["status"] == "failed"


def test_collect_confirmation_required_is_waiting_input():
    update = _supervisor_collect({
        "worker_results": [{"status": "confirmation_required", "worker": "rvc_worker",
                             "waiting_inputs": [{"kind": "confirmation"}]}],
        "dispatch_request": {"worker": "rvc_worker"},
        "active_worker": None,
    })
    assert update["dispatch_status"] == "waiting_input"

def test_waiting_input_update_preserves_managed_rvc_session_for_action_only_resume():
    from agents.service import PersonaAgentService

    state = {
        "dispatch_request": {
            "worker": "rvc_worker",
            "task_type": "voice_asset",
            "input_refs": {"attachment_ids": ["att-1"]},
            "options": {"action": "attach"},
        },
        "input_refs": {
            "attachment_ids": ["att-1"],
            "session_id": "session-42",
            "rvc_session_id": "session-42",
        },
        "active_worker": "rvc_worker",
        "task_type": "voice_asset",
    }

    update = PersonaAgentService._waiting_input_update(
        state, {"input_values": {"action": "prepare_and_separate"}}
    )
    request = update["dispatch_request"]
    assert request["options"]["action"] == "prepare_and_separate"
    assert request["input_refs"]["session_id"] == "session-42"
    assert request["input_refs"]["rvc_session_id"] == "session-42"
    assert update["input_refs"]["session_id"] == "session-42"


def test_waiting_input_update_new_session_ref_wins_over_stale_request_ref():
    from agents.service import PersonaAgentService

    state = {
        "dispatch_request": {
            "worker": "rvc_worker",
            "task_type": "voice_asset",
            "input_refs": {"session_id": "old-session"},
            "options": {"action": "attach"},
        },
        "input_refs": {"session_id": "new-session"},
        "active_worker": "rvc_worker",
        "task_type": "voice_asset",
    }

    update = PersonaAgentService._waiting_input_update(
        state, {"input_values": {"action": "prepare_and_separate"}}
    )
    assert update["dispatch_request"]["input_refs"]["session_id"] == "new-session"
    assert update["dispatch_request"]["input_refs"]["rvc_session_id"] == "new-session"

def test_rvc_failed_result_uses_tool_failure_reason_not_generated_success_text():
    update = _finalize_worker("rvc_worker")(_rvc_state({
        "status": "failed", "worker": "rvc_worker", "action": "prepare",
        "reason": "共享 RVC 服务调用失败",
    }))
    result = update["worker_results"][0]
    assert result["status"] == "failed"
    assert result["answer"] == "共享 RVC 服务调用失败"

