from agents.service import AgentTurnResult


def test_agent_query_uses_server_persona_context(client, monkeypatch):
    persona = client.post("/api/personas", json={"name": "Alpha"}).json()
    captured = {}

    class FakeAgentService:
        def query(self, question, context):
            captured["context"] = context
            return AgentTurnResult(status="completed", answer="hello", specialist="conversation")

    client.app.state.agent_service = FakeAgentService()
    response = client.post(
        f"/api/personas/{persona['id']}/agent/query",
        json={"question": "你好", "conversation_id": "conversation-a"},
    )

    assert response.status_code == 200
    assert response.json()["answer"] == "hello"
    assert captured["context"].persona_id == persona["id"]
    assert captured["context"].knowledge_space_ids == (persona["knowledge_space_id"],)


def test_agent_resume_passes_only_server_context_and_user_decision(client):
    persona = client.post("/api/personas", json={"name": "Alpha"}).json()
    captured = {}

    class FakeAgentService:
        def resume(self, context, specialist, approved):
            captured.update(context=context, specialist=specialist, approved=approved)
            return AgentTurnResult(status="completed", answer="已取消", specialist=specialist)

    client.app.state.agent_service = FakeAgentService()
    response = client.post(
        f"/api/personas/{persona['id']}/agent/resume",
        json={"conversation_id": "conversation-a", "specialist": "management", "approved": False},
    )

    assert response.status_code == 200
    assert captured["context"].persona_id == persona["id"]
    assert captured["specialist"] == "management"
    assert captured["approved"] is False


def test_agent_stream_returns_sse_events(client):
    persona = client.post("/api/personas", json={"name": "Alpha"}).json()

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "stage", "stage": "知识agent · 正在检索角色资料…"}
            yield {"kind": "token", "text": "你好"}
            yield {
                "kind": "result",
                "result": AgentTurnResult(
                    status="completed", answer="你好", specialist="conversation"
                ),
            }

    client.app.state.agent_service = FakeAgentService()
    response = client.post(
        f"/api/personas/{persona['id']}/agent/stream",
        json={"question": "资料", "conversation_id": "conversation-a"},
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    text = response.text
    assert "知识agent · 正在检索角色资料…" in text
    assert '"kind": "token"' in text
    assert '"kind": "done"' in text


def test_agent_query_persists_text_turn(client):
    persona = client.post("/api/personas", json={"name": "Memory"}).json()

    class FakeAgentService:
        def query(self, question, context):
            return AgentTurnResult(status="completed", answer="记住了", specialist="conversation")

    client.app.state.agent_service = FakeAgentService()
    response = client.post(
        f"/api/personas/{persona['id']}/agent/query",
        json={"question": "记住我叫小明", "conversation_id": "conv-1"},
    )
    assert response.status_code == 200

    messages = client.get(
        f"/api/personas/{persona['id']}/conversations/conv-1/messages"
    ).json()
    assert [(message["role"], message["content"]) for message in messages] == [
        ("user", "记住我叫小明"),
        ("assistant", "记住了"),
    ]


def test_context_factory_provides_runtime_to_managed_tools(client, db_session):
    from agents.runtime.runner import AgentRuntime
    from app.run_store import RunStore

    persona = client.post("/api/personas", json={"name": "Context Runtime"}).json()
    captured = {}

    class FakeAgentService:
        def query(self, question, context):
            captured["context"] = context
            return AgentTurnResult(status="completed", answer="ok", specialist="conversation")

    runtime = AgentRuntime(FakeAgentService(), RunStore(client.app.state.session_factory))
    client.app.state.run_store = runtime.run_store
    client.app.state.agent_runtime = runtime
    response = client.post(
        f"/api/personas/{persona['id']}/agent/query",
        json={"question": "测试运行时", "conversation_id": "runtime-context"},
    )

    assert response.status_code == 200
    assert captured["context"].agent_runtime is runtime


def test_agent_query_passes_attachment_ids_into_context(client):
    persona = client.post("/api/personas", json={"name": "Attachment context"}).json()
    captured = {}

    class FakeAgentService:
        def query(self, question, context):
            captured["context"] = context
            return AgentTurnResult(status="completed", answer="ok", specialist="conversation")

    client.app.state.agent_service = FakeAgentService()
    uploaded = client.post(
        "/api/conversations/conversation-a/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[("files", ("input.wav", b"RIFFdemo", "audio/wav"))],
    ).json()["attachments"][0]
    response = client.post(
        f"/api/personas/{persona['id']}/agent/query",
        json={"question": "处理附件", "conversation_id": "conversation-a", "attachment_ids": [uploaded["file_id"]]},
    )
    assert response.status_code == 200
    assert captured["context"].attachment_ids == (uploaded["file_id"],)


def test_agent_stream_forwards_workflow_update(client):
    persona = client.post("/api/personas", json={"name": "FlowSse"}).json()
    flow = {
        "flow_id": "rvc.audio_conversion",
        "title": "RVC 音频转换",
        "kind": "workflow",
        "status": "running",
        "current_node": "gpu_inference",
        "progress": 68,
        "nodes": [
            {
                "id": "gpu_inference",
                "label": "GPU 音色转换",
                "description": "生成音频",
                "status": "running",
                "progress": 68,
            }
        ],
        "edges": [],
        "waiting_inputs": [],
    }

    class FakeAgentService:
        def stream_query(self, question, context):
            yield {"kind": "workflow_update", "task_id": "task-sse", "flow": flow}
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
    response = client.post(
        f"/api/personas/{persona['id']}/agent/stream",
        json={"question": "用 RVC 处理", "conversation_id": "conv-flow-sse"},
        headers={"X-YUMENO-Request": "web"},
    )

    assert response.status_code == 200
    assert '"kind": "workflow_update"' in response.text
    assert '"task_id": "task-sse"' in response.text
    assert '"current_node": "gpu_inference"' in response.text


def test_agent_resume_passes_structured_waiting_input_values_and_managed_attachments(client):
    persona = client.post("/api/personas", json={"name": "Structured resume"}).json()
    captured = {}
    uploaded = client.post(
        "/api/conversations/conversation-resume/attachments",
        headers={"X-YUMENO-Request": "web"},
        files=[("files", ("input.wav", b"RIFFdemo", "audio/wav"))],
    ).json()["attachments"][0]

    class FakeAgentService:
        def resume(self, context, specialist, approved=None, **kwargs):
            captured.update(
                context=context,
                specialist=specialist,
                approved=approved,
                kwargs=kwargs,
            )
            return AgentTurnResult(
                status="completed",
                answer="任务已恢复",
                specialist="management",
                worker="rvc_worker",
                task_id="task-resume",
            )

    client.app.state.agent_service = FakeAgentService()
    response = client.post(
        f"/api/personas/{persona['id']}/agent/resume",
        json={
            "conversation_id": "conversation-resume",
            "specialist": "management",
            "approved": None,
            "worker": "rvc_worker",
            "task_id": "task-resume",
            "attachment_ids": [uploaded["file_id"]],
            "input_values": {
                "model_id": "model-a",
                "index_id": "index-a",
                "mix_instrumental": False,
            },
        },
    )

    assert response.status_code == 200
    assert response.json()["task_id"] == "task-resume"
    assert captured["context"].attachment_ids == (uploaded["file_id"],)
    assert captured["kwargs"] == {
        "worker": "rvc_worker",
        "task_id": "task-resume",
        "attachment_ids": (uploaded["file_id"],),
        "input_values": {
            "model_id": "model-a",
            "index_id": "index-a",
            "mix_instrumental": False,
        },
    }
