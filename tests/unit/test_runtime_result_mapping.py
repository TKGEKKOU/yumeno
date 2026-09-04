import json

from langchain_core.messages import AIMessage, ToolMessage

from agents.service import PersonaAgentService


def test_service_result_maps_citations_and_uncertainties_from_knowledge_tool():
    result = PersonaAgentService._result(
        {
            "messages": [
                ToolMessage(
                    content=json.dumps(
                        {
                            "status": "insufficient",
                            "answer": "",
                            "evidence": [],
                            "citations": [{"filename": "设定.md"}],
                            "uncertainties": ["资料没有说明原因"],
                            "trace": [],
                        },
                        ensure_ascii=False,
                    ),
                    name="search_persona_knowledge",
                    tool_call_id="rag-1",
                )
            ]
        }
    )

    assert result.citations == ({"filename": "设定.md"},)
    assert result.uncertainties == ("资料没有说明原因",)


def test_service_result_preserves_structured_worker_handoff_and_canonical_worker():
    result = PersonaAgentService._result(
        {
            "messages": [AIMessage(content="根据资料整理后的回答")],
            "active_worker": None,
            "worker_results": [
                {
                    "worker": "knowledge_worker",
                    "status": "accepted",
                    "answer": "知识 Worker 的结构化结果",
                    "evidence": [{"title": "设定.md"}],
                }
            ],
        }
    )

    assert result.worker == "knowledge_worker"
    assert result.specialist == "conversation"
    assert result.worker_results == (
        {
            "worker": "knowledge_worker",
            "status": "accepted",
            "answer": "知识 Worker 的结构化结果",
            "evidence": [{"title": "设定.md"}],
        },
    )


def test_service_result_keeps_accepted_rvc_task_running_while_turn_completes():
    result = PersonaAgentService._result(
        {
            "messages": [
                ToolMessage(
                    content=json.dumps(
                        {
                            "status": "accepted",
                            "worker": "rvc_worker",
                            "task_id": "task-running",
                            "phase": "converting",
                            "progress": 68,
                            "message": "RVC 任务已提交",
                        },
                        ensure_ascii=False,
                    ),
                    name="convert_audio_with_rvc",
                    tool_call_id="rvc-running",
                )
            ],
            "active_worker": "rvc_worker",
            "dispatch_status": "accepted",
        }
    )

    assert result.status == "completed"
    assert result.task_id == "task-running"
    assert result.workflow is not None
    assert result.workflow["status"] == "running"
    assert result.workflow["current_node"] == "gpu_inference"
    assert result.workflow["progress"] == 68


def test_service_result_maps_succeeded_rvc_task_to_completed_workflow():
    result = PersonaAgentService._result(
        {
            "messages": [
                ToolMessage(
                    content=json.dumps(
                        {
                            "status": "succeeded",
                            "worker": "rvc_worker",
                            "task_id": "task-complete",
                            "phase": "done",
                            "progress": 100,
                            "message": "RVC 音频已生成",
                        },
                        ensure_ascii=False,
                    ),
                    name="get_rvc_task_status",
                    tool_call_id="rvc-complete",
                )
            ],
            "active_worker": "rvc_worker",
            "dispatch_status": "completed",
        }
    )

    assert result.status == "completed"
    assert result.workflow is not None
    assert result.workflow["status"] == "completed"
    assert result.workflow["progress"] == 100


def test_service_result_maps_failed_worker_tool_to_failed_turn_and_workflow():
    result = PersonaAgentService._result(
        {
            "messages": [
                ToolMessage(
                    content=json.dumps(
                        {
                            "status": "failed",
                            "worker": "rvc_worker",
                            "task_id": "task-failed",
                            "phase": "converting",
                            "progress": 68,
                            "reason": "GPU 推理失败",
                        },
                        ensure_ascii=False,
                    ),
                    name="convert_audio_with_rvc",
                    tool_call_id="rvc-failed",
                )
            ],
            "active_worker": "rvc_worker",
            "dispatch_status": "failed",
        }
    )

    assert result.status == "failed"
    assert result.error_code == "worker_failed"
    assert result.error_message == "GPU 推理失败"
    assert result.workflow is not None
    assert result.workflow["status"] == "failed"

