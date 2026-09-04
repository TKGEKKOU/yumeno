from types import SimpleNamespace
from pathlib import Path

from agents.graph.policy import direct_worker_for_intent
from agents.graph.state import WORKERS
from agents.intent_funnel import analyze_intents
from agents.registry import tool_specs, worker_manifest
from agents.graph.middleware import build_worker_action_tool_middleware
from agents.tools.rvc import (
    convert_audio_with_rvc, create_rvc_session, get_rvc_session, get_rvc_status,
    get_rvc_task_status, list_rvc_models, prepare_rvc_source,
    register_rvc_result_attachment, separate_rvc_vocals, validate_rvc_model,
)
from agents.context import PersonaAgentContext
from app.models import ConversationAttachment
from sqlalchemy.orm import sessionmaker


def _runtime(state):
    return SimpleNamespace(request=SimpleNamespace(app=SimpleNamespace(state=state)))


def test_rvc_worker_is_registered_with_structured_tools():
    names = {spec.name for spec in tool_specs() if spec.specialist == "rvc_worker"}
    assert names == {
        "create_rvc_session",
        "attach_file_to_rvc_session",
        "prepare_rvc_source",
        "separate_rvc_vocals",
        "get_rvc_session",
        "get_rvc_status",
        "list_rvc_models",
        "validate_rvc_model",
        "convert_audio_with_rvc",
        "mix_rvc_instrumental",
        "get_rvc_task_status",
        "cancel_rvc_task",
        "register_rvc_result_attachment",
    }
    manifest = worker_manifest("rvc_worker")
    assert manifest.name == "rvc_worker"
    assert "builtin/get_rvc_status" in manifest.capabilities
    assert manifest.timeout_seconds >= 300
    assert manifest.read_only is False


def test_rvc_intent_hands_off_to_dedicated_worker():
    result = analyze_intents("用 RVC 把这段录音变成角色 A 的音色")
    assert result.primary == "rvc_worker"
    assert "rvc_worker" in WORKERS
    assert direct_worker_for_intent(result.to_state()) == "rvc_worker"


def test_rvc_tools_use_app_runtime_and_hide_unmanaged_paths(tmp_path):
    class Adapter:
        resources = SimpleNamespace(project_root=tmp_path)

        def status(self):
            return {"ready": False}

        def list_models(self):
            return [{"id": "a.pth", "name": "a", "path": str(tmp_path / "a.pth")}]

        def list_indices(self):
            return []

        def resolve_model(self, value):
            assert value == "a.pth"
            return tmp_path / "a.pth"

        def resolve_index(self, value):
            return None

    class Tasks:
        def start(self, source, **options):
            raise AssertionError("unmanaged input must be rejected before task start")

    runtime = _runtime(SimpleNamespace(rvc_adapter=Adapter(), rvc_tasks=Tasks()))
    assert get_rvc_status.func(runtime=runtime)["worker"] == "rvc_worker"
    assert list_rvc_models.func(runtime=runtime)["models"] == [{"id": "a.pth", "name": "a"}]
    assert validate_rvc_model.func(model="a.pth", runtime=runtime)["status"] == "valid"
    assert "input_path" not in convert_audio_with_rvc.args_schema.model_fields
    result = convert_audio_with_rvc.func(model="a.pth", runtime=runtime)
    assert result["status"] == "rejected"
    assert "input_file_id 或 session_id" in result["reason"]



def test_rvc_public_tool_results_never_expose_local_paths(tmp_path):
    private = str(tmp_path / "private.wav")

    class Adapter:
        def status(self):
            return {
                "ready": True,
                "project_root": str(tmp_path),
                "components": {"runtime": {"ready": True, "path": private}},
            }

        def list_models(self):
            return [{"id": "voice.pth", "name": "voice", "path": private, "preview_audio_path": private}]

        def list_indices(self):
            return [{"id": "voice.index", "name": "voice.index", "path": private}]

    session_state = {
        "session_id": "session-a",
        "source": {"file_id": "source.wav", "path": private, "storage_path": private},
        "derived_files": [{"file_id": "vocals.wav", "output_path": private}],
    }

    class Sessions:
        def create(self): return session_state
        def start_extract(self, session_id): return session_state
        def start_separation(self, session_id): return session_state
        def state(self, session_id): return session_state

    class Tasks:
        def get(self, task_id):
            return {"task_id": task_id, "state": "running", "input_path": private, "outputs": {"mixed": {"file_id": "mixed", "path": private}}}

    runtime = _runtime(SimpleNamespace(rvc_adapter=Adapter(), rvc_sessions=Sessions(), rvc_tasks=Tasks()))
    payloads = [
        get_rvc_status.func(runtime=runtime),
        list_rvc_models.func(runtime=runtime),
        create_rvc_session.func(runtime=runtime),
        prepare_rvc_source.func(session_id="session-a", runtime=runtime),
        separate_rvc_vocals.func(session_id="session-a", runtime=runtime),
        get_rvc_session.func(session_id="session-a", runtime=runtime),
        get_rvc_task_status.func(task_id="task-a", runtime=runtime),
    ]
    serialized = repr(payloads)
    assert private not in serialized
    for forbidden in ("'path'", "'storage_path'", "'input_path'", "'output_path'", "'preview_audio_path'", "'project_root'"):
        assert forbidden not in serialized


def test_normal_voice_requests_do_not_route_to_rvc_worker():
    for text in ("让角色说这句话", "生成角色语音", "读出这段文字", "处理这个音频", "提取音频", "音频转写", "进行人声分离"):
        result = analyze_intents(text)
        assert result.primary != "rvc_worker"


def test_rvc_requires_an_existing_audio_conversion_request():
    assert analyze_intents("用 RVC 处理这个 mp3 文件").primary == "rvc_worker"
    assert analyze_intents("我想了解 RVC 是什么").primary != "rvc_worker"


def test_completed_rvc_output_can_be_registered_as_conversation_attachment(tmp_path, db_session):
    task_id = "task-complete"
    task_dir = tmp_path / "data" / "voice" / "rvc" / "tasks" / task_id
    task_dir.mkdir(parents=True)
    output = task_dir / "output.wav"
    output.write_bytes(b"RIFFgenerated")

    class Tasks:
        project_root = tmp_path
        tasks_root = tmp_path / "data" / "voice" / "rvc" / "tasks"

        def get(self, value):
            return {"task_id": value, "state": "succeeded"}

        def output_item(self, value, file_id):
            assert value == task_id
            assert file_id == "rvc_vocal"
            return {"file_id": file_id, "name": "output.wav", "path": str(output)}

    factory = sessionmaker(bind=db_session.get_bind(), expire_on_commit=False)
    context = PersonaAgentContext(
        persona_id="persona", workspace_id="local-default", knowledge_space_ids=("knowledge-space",),
        conversation_id="conversation", persona_name="Tester", persona_type="assistant",
        persona_profile={}, session_factory=factory,
    )
    runtime = SimpleNamespace(
        request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(rvc_tasks=Tasks()))),
        context=context,
    )
    first = register_rvc_result_attachment.func(task_id=task_id, runtime=runtime)
    second = register_rvc_result_attachment.func(task_id=task_id, runtime=runtime)
    assert first["status"] == "ok"
    assert second["attachment"]["file_id"] == first["attachment"]["file_id"]
    row = db_session.query(ConversationAttachment).one()
    assert row.source == "rvc"
    assert row.metadata_json["task_id"] == task_id
    assert Path(row.storage_path).is_file()
    assert str(task_dir) not in first["attachment"].get("url", "")



def test_convert_starts_result_registration_watcher(monkeypatch, tmp_path, db_session):
    from app.attachments import create_attachment

    input_item = create_attachment(
        db_session, tmp_path, "conversation", "input.wav", "audio/wav", b"RIFFdemo",
        workspace_id="local-default",
    )
    db_session.commit()
    task_id = "task-auto-register"
    task_dir = tmp_path / "data" / "voice" / "rvc" / "tasks" / task_id
    task_dir.mkdir(parents=True)
    output = task_dir / "output.wav"
    output.write_bytes(b"RIFFgenerated")

    class Adapter:
        resources = SimpleNamespace(project_root=tmp_path)

        def validate_input(self, path):
            return Path(path)

        def resolve_model(self, value):
            assert value == "model.pth"
            return tmp_path / value

        def resolve_index(self, value):
            return None

    class Tasks:
        project_root = tmp_path
        tasks_root = tmp_path / "data" / "voice" / "rvc" / "tasks"

        def start(self, source, **options):
            assert Path(source).is_file()
            return task_id

        def get(self, value):
            return {"task_id": value, "state": "succeeded"}

        def output_item(self, value, file_id):
            return {"file_id": file_id, "name": "output.wav", "path": str(output)}

    class ImmediateThread:
        def __init__(self, *, target, args, **kwargs):
            self.target = target
            self.args = args

        def start(self):
            self.target(*self.args)

    monkeypatch.setattr("agents.tools.rvc.threading.Thread", ImmediateThread)
    factory = sessionmaker(bind=db_session.get_bind(), expire_on_commit=False)
    context = PersonaAgentContext(
        persona_id="persona", workspace_id="local-default", knowledge_space_ids=("knowledge-space",),
        conversation_id="conversation", persona_name="Tester", persona_type="assistant",
        persona_profile={}, session_factory=factory,
    )
    runtime = SimpleNamespace(
        request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(rvc_adapter=Adapter(), rvc_tasks=Tasks()))),
        context=context,
    )
    result = convert_audio_with_rvc.func(
        input_file_id=input_item.id, model="model.pth", runtime=runtime,
    )
    assert result["status"] == "accepted"
    generated = db_session.query(ConversationAttachment).filter_by(source="rvc").one()
    assert generated.metadata_json["output_file_id"] == "rvc_vocal"



def test_mix_registers_mixed_output_attachment(monkeypatch, tmp_path, db_session):
    from app.attachments import create_attachment

    instrumental = create_attachment(
        db_session, tmp_path, "conversation", "instrumental.wav", "audio/wav", b"RIFFinstrumental",
        workspace_id="local-default",
    )
    db_session.commit()
    task_id = "task-mix-auto-register"
    task_dir = tmp_path / "data" / "voice" / "rvc" / "tasks" / task_id
    task_dir.mkdir(parents=True)
    mixed = task_dir / "mixed.wav"
    mixed.write_bytes(b"RIFFmixed")

    class Tasks:
        project_root = tmp_path
        tasks_root = tmp_path / "data" / "voice" / "rvc" / "tasks"

        def get(self, value):
            return {"task_id": value, "state": "succeeded"}

        def output_item(self, value, file_id):
            assert value == task_id
            assert file_id == "mixed"
            return {"file_id": file_id, "name": "mixed.wav", "path": str(mixed)}

        def mix(self, value, source):
            assert value == task_id
            assert Path(source) == Path(instrumental.storage_path)
            return {"task_id": value, "output_file_id": "mixed"}

    class Sessions:
        project_root = tmp_path

    class Context:
        workspace_id = "local-default"
        conversation_id = "conversation"
        session_factory = lambda self: sessionmaker(bind=db_session.get_bind(), expire_on_commit=False)()

    runtime = SimpleNamespace(
        request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(rvc_tasks=Tasks(), rvc_sessions=Sessions()))),
        context=Context(),
    )
    monkeypatch.setattr("agents.tools.rvc.threading.Thread", lambda **kwargs: SimpleNamespace(start=lambda: kwargs["target"](*kwargs["args"])))

    result = __import__("agents.tools.rvc", fromlist=["mix_rvc_instrumental"]).mix_rvc_instrumental.func(
        task_id=task_id,
        instrumental_file_id=instrumental.id,
        runtime=runtime,
    )
    assert result["status"] == "accepted"
    generated = db_session.query(ConversationAttachment).filter_by(source="rvc").one()
    assert generated.metadata_json["output_file_id"] == "mixed"



def test_rvc_worker_action_filters_model_tools():
    from types import SimpleNamespace

    tools = [SimpleNamespace(name=name) for name in (
        "create_rvc_session", "attach_file_to_rvc_session", "prepare_rvc_source",
        "get_rvc_session", "separate_rvc_vocals", "convert_audio_with_rvc",
        "cancel_rvc_task", "list_rvc_models",
    )]
    seen = {}
    middleware = build_worker_action_tool_middleware("rvc_worker")

    def handler(request):
        seen["names"] = [item.name for item in request.tools]
        seen["tool_choice"] = getattr(request, "tool_choice", None)
        return request

    request = SimpleNamespace(
        state={"dispatch_request": {"options": {"action": "prepare_and_separate"}}},
        tools=tools,
        override=lambda **kwargs: SimpleNamespace(**{**request.__dict__, **kwargs}),
    )
    middleware.wrap_model_call(request, handler)
    assert seen["names"] == ["prepare_rvc_source"]
    assert seen["tool_choice"] == {"type": "function", "function": {"name": "prepare_rvc_source"}}

    seen.clear()
    request.state = {"dispatch_request": {"options": {"action": "session_status"}}}
    middleware.wrap_model_call(request, handler)
    assert seen["names"] == ["get_rvc_session"]


def test_voice_worker_action_filters_model_tools():
    from types import SimpleNamespace

    tools = [SimpleNamespace(name=name) for name in (
        "analyze_voice_material", "get_voice_studio_session", "cancel_voice_studio_session",
        "request_training_confirmation", "bind_trained_voice", "synthesize_voice_asset",
        "transcribe_voice_attachment", "train_voice_from_studio",
    )]
    seen = {}
    middleware = build_worker_action_tool_middleware("voice_worker")

    def handler(request):
        seen["names"] = [item.name for item in request.tools]
        seen["tool_choice"] = getattr(request, "tool_choice", None)
        return request

    request = SimpleNamespace(
        state={"dispatch_request": {"options": {"action": "session_status"}}},
        tools=tools,
        override=lambda **kwargs: SimpleNamespace(**{**request.__dict__, **kwargs}),
    )
    middleware.wrap_model_call(request, handler)
    assert seen["names"] == ["get_voice_studio_session"]
    assert seen["tool_choice"] == {"type": "function", "function": {"name": "get_voice_studio_session"}}
