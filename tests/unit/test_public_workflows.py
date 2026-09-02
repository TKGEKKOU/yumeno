from agents.workflows import default_workflow, workflow_from_task, workflow_update_for_stage
from app.schemas import WorkflowResponse
from agents.service import PersonaAgentService
from app.routers.agents import response_for


def test_rvc_public_workflow_contract_and_branches():
    flow = workflow_from_task(
        "rvc_worker",
        {
            "task_id": "task-public",
            "phase": "converting",
            "status": "running",
            "progress": 68,
            "separate_vocals": False,
            "mix_instrumental": False,
            "index_rate": 0,
            "has_index": False,
        },
        status="running",
        phase="converting",
        progress=68,
    )

    validated = WorkflowResponse.model_validate(flow).model_dump(by_alias=True)
    statuses = {node["id"]: node["status"] for node in validated["nodes"]}
    assert validated["flow_id"] == "rvc.audio_conversion"
    assert validated["current_node"] == "gpu_inference"
    assert validated["progress"] == 68
    assert statuses["separate_vocals"] == "skipped"
    assert statuses["select_vocals"] == "skipped"
    assert statuses["prepare_index"] == "skipped"
    assert statuses["mix_instrumental"] == "skipped"
    assert statuses["gpu_inference"] == "running"
    assert validated["worker"] == "rvc_worker"


def test_waiting_rvc_workflow_response_serializes_worker_handoff():
    flow = workflow_from_task(
        "rvc_worker",
        {"task_id": "task-waiting", "phase": "awaiting_source", "status": "waiting_input"},
        status="waiting_input",
        phase="awaiting_source",
        progress=0,
    )

    validated = WorkflowResponse.model_validate(flow)
    assert validated.worker == "rvc_worker"
    assert validated.status == "waiting_input"


def test_waiting_rvc_agent_response_keeps_formal_handoff_contract():
    result = PersonaAgentService._result(
        {
            "active_worker": "rvc_worker",
            "dispatch_status": "waiting_input",
            "waiting_inputs": [{"kind": "attachment", "input_id": "rvc_audio"}],
            "worker_results": [],
            "messages": [],
            "artifacts": [],
        }
    )

    response = response_for(result)
    assert response.status == "waiting_input"
    assert response.worker == "rvc_worker"
    assert response.workflow is not None
    assert response.workflow.worker == "rvc_worker"


def test_public_workflow_is_only_emitted_for_rvc():
    assert default_workflow("conversation", status="running", phase="preparing") is None
    assert workflow_update_for_stage("conversation", "正在回复") is None
    assert workflow_update_for_stage("rvc_worker", "正在 GPU 推理")["current_node"] == "gpu_inference"


def test_public_workflow_does_not_expose_internal_names_or_paths():
    flow = default_workflow("rvc_worker", status="running", phase="loading_model")
    serialized = str(flow)
    for forbidden in ("ToolMessage", "Supervisor", "LangGraph", "handoff", "D:\\\\", "C:\\\\"):
        assert forbidden not in serialized
