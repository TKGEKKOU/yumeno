import json

from agents.service import AgentTurnResult


def test_realtime_text_turn_persists_messages(client):
    persona = client.post("/api/personas", json={"name": "RealtimeMemory"}).json()

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "token", "text": "好的，"}
            yield {"kind": "token", "text": "记住了"}
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed", answer="好的，记住了", specialist="conversation"
                ),
            }

    client.app.state.agent_service = FakeAgentService()
    conversation_id = "conv-rt"
    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/{conversation_id}"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "记住我叫小明"}))
        seen_deltas = []
        seen_final = False
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "text.delta":
                seen_deltas.append(event["text"])
            if event.get("type") == "text.final":
                seen_final = True
                break
        assert seen_final
        assert seen_deltas, "streaming tokens must arrive before text.final"
        assert "".join(seen_deltas) == "好的，记住了"

    messages = client.get(
        f"/api/personas/{persona['id']}/conversations/{conversation_id}/messages"
    ).json()
    assert [(message["role"], message["content"]) for message in messages] == [
        ("user", "记住我叫小明"),
        ("assistant", "好的，记住了"),
    ]


def test_realtime_forwards_stage_events(client):
    persona = client.post("/api/personas", json={"name": "Stage"}).json()

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "stage", "stage": "知识agent · 正在检索角色资料…"}
            yield {
                "kind": "result",
                "result": AgentTurnResult(status="completed", answer="完成", specialist="conversation"),
            }

    client.app.state.agent_service = FakeAgentService()
    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/conv-stage"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "查资料"}))
        seen_stage = False
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "agent.stage":
                seen_stage = True
                assert event["stage"] == "知识agent · 正在检索角色资料…"
            if event.get("type") == "text.final":
                break
        assert seen_stage


def test_realtime_emits_confirmation_required_immediately(client):
    persona = client.post("/api/personas", json={"name": "Confirm"}).json()

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "stage", "stage": "正在管理人设"}
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="pending_confirmation",
                    answer="",
                    specialist="management",
                    pending_action={
                        "tool": "rename_persona",
                        "title": "改名",
                        "arguments": {"name": "agent 架构师"},
                    },
                ),
            }

    client.app.state.agent_service = FakeAgentService()
    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/conv-confirm"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "你改名为 agent 架构师"}))
        event = ws.receive_json()
        assert event["type"] == "turn.started"
        event = ws.receive_json()
        while event["type"] == "agent.status":
            event = ws.receive_json()
        assert event["type"] == "agent.stage"
        event = ws.receive_json()
        assert event["type"] == "confirmation.required"
        assert event["specialist"] == "management"
        assert event["pending_action"]["tool"] == "rename_persona"


def test_realtime_prefers_shared_runtime_when_available(client):
    persona = client.post("/api/personas", json={"name": "RuntimeRealtime"}).json()

    class Service:
        def stream_query(self, question, context):
            yield {"kind": "result", "result": AgentTurnResult(
                status="completed", answer="旧服务回复", specialist="conversation"
            )}

    class Runtime:
        def stream_query(self, question, context):
            yield {"kind": "result", "result": AgentTurnResult(
                status="completed", answer="运行时流式回复", specialist="conversation"
            )}

    client.app.state.agent_service = Service()
    client.app.state.agent_runtime = Runtime()

    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/conv-runtime"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "测试统一入口"}))
        final = None
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "text.final":
                final = event
                break
        assert final is not None
        assert final["answer"] == "运行时流式回复"


def test_realtime_forwards_workflow_updates(client):
    persona = client.post("/api/personas", json={"name": "FlowWs"}).json()
    flow = {
        "flow_id": "rvc.audio_conversion",
        "title": "RVC 音频转换",
        "kind": "workflow",
        "status": "running",
        "current_node": "gpu_inference",
        "progress": 42,
        "nodes": [
            {
                "id": "gpu_inference",
                "label": "GPU 音色转换",
                "description": "生成音频",
                "status": "running",
                "progress": 42,
            }
        ],
        "edges": [],
        "waiting_inputs": [],
    }

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "workflow_update", "task_id": "task-ws", "flow": flow}
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed",
                    answer="任务已提交",
                    specialist="management",
                    worker="rvc_worker",
                    workflow=flow,
                ),
            }

    client.app.state.agent_service = FakeAgentService()
    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/conv-flow-ws"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "用 RVC 处理"}))
        workflow_event = None
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "workflow.update":
                workflow_event = event
                break
        assert workflow_event is not None
        assert workflow_event["task_id"] == "task-ws"
        assert workflow_event["flow"]["current_node"] == "gpu_inference"


def test_realtime_resumes_waiting_input_with_structured_values(client):
    persona = client.post("/api/personas", json={"name": "ResumeInput"}).json()

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "result", "result": AgentTurnResult(
                status="waiting_input", answer="", specialist="management",
                worker="rvc_worker", task_id="task-input",
                waiting_inputs=({"kind": "attachment", "input_id": "rvc_audio", "label": "请上传音频", "required": True},),
            )}

        def stream_resume(self, context, specialist, approved=None, **kwargs):
            assert kwargs["worker"] == "rvc_worker"
            assert kwargs["task_id"] == "task-input"
            assert kwargs["attachment_ids"] == ("file-a",)
            assert kwargs["input_values"] == {"model_id": "model-a", "index_id": "index-a"}
            yield {"kind": "result", "result": AgentTurnResult(
                status="completed", answer="已完成", specialist="management", worker="rvc_worker",
                task_id="task-input",
            )}

    client.app.state.agent_service = FakeAgentService()
    with client.websocket_connect(
        f"/ws/personas/{persona['id']}/conversations/conv-resume-input"
    ) as ws:
        assert ws.receive_json()["type"] == "session.ready"
        ws.send_text(json.dumps({"type": "text.submit", "question": "用 RVC 变声"}))
        required = None
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "input.required":
                required = event
                break
        assert required is not None
        assert required["task_id"] == "task-input"
        ws.send_text(json.dumps({
            "type": "confirmation.respond",
            "approved": None,
            "specialist": "management",
            "worker": "rvc_worker",
            "task_id": "task-input",
            "attachment_ids": ["file-a"],
            "input_values": {"model_id": "model-a", "index_id": "index-a"},
        }))
        final = None
        for _ in range(20):
            event = ws.receive_json()
            if event.get("type") == "text.final":
                final = event
                break
        assert final is not None
        assert final["answer"] == "已完成"
