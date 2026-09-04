from types import SimpleNamespace

from agents.tools.voice import (
    get_voice_system_status,
    get_voice_studio_session,
    list_voice_studio_sessions,
)
from agents.tools.voice_clone import start_voice_clone_session


class FakeStudio:
    def create_session(self, origin="chat"):
        return {"session_id": f"vs-{origin}"}

    def list_sessions(self):
        return [{"session_id": "vs-chat", "phase": "idle"}]

    def session_state(self, session_id):
        return {"session_id": session_id, "phase": "ready"}


class FakeGPT:
    def status(self):
        return {"installed": True, "ready": True}


def _graph_runtime(**state_fields):
    app_state = SimpleNamespace(**state_fields)
    context = SimpleNamespace(
        persona_id="persona-a",
        workspace_id="ws-1",
        agent_runtime=SimpleNamespace(app_state=app_state),
    )
    return SimpleNamespace(context=context, request=None)


def test_voice_status_tools_use_agent_runtime_app_state_without_http_request():
    runtime = _graph_runtime(tts_synthesis=object(), gpt_sovits=FakeGPT(), asr_resources=None, voice_studio=FakeStudio())

    status = get_voice_system_status.func(runtime)
    assert status["status"] == "ok"
    assert status["systems"]["gpt_sovits"]["available"] is True
    assert status["systems"]["asr"] == {"available": False}

    listed = list_voice_studio_sessions.func(runtime)
    assert listed["status"] == "ok"
    assert listed["items"][0]["session_id"] == "vs-chat"

    session = get_voice_studio_session.func("vs-chat", runtime)
    assert session["status"] == "ok"
    assert session["session"]["phase"] == "ready"


def test_voice_clone_session_uses_runtime_app_state_instead_of_starlette_request():
    runtime = _graph_runtime(voice_studio=FakeStudio())

    result = start_voice_clone_session.func(runtime, "gentle")

    assert result["status"] == "created"
    assert result["session_id"] == "vs-chat"
    assert result["next_step"] == "request_file_upload"


def test_voice_clone_session_is_unavailable_when_runtime_has_no_studio():
    runtime = _graph_runtime()

    result = start_voice_clone_session.func(runtime, "gentle")

    assert result["status"] == "unavailable"


from pathlib import Path

from agents.tools.voice_clone import (
    analyze_voice_material,
    bind_trained_voice,
    check_training_progress,
    request_training_confirmation,
    start_voice_training,
)


class RecordingStudio(FakeStudio):
    def __init__(self, tmp_path: Path):
        self.project_root = tmp_path
        self.uploaded = []
        self.videos = []
        self.separated = []
        self.completed = []
        self.sessions = {"vs-chat": {"session_id": "vs-chat", "phase": "idle", "progress": 0, "running": False}}
        self._root = tmp_path / "voice_studio_sessions"
        self._root.mkdir(parents=True, exist_ok=True)

    def _session_dir(self, session_id):
        path = self._root / session_id
        path.mkdir(parents=True, exist_ok=True)
        return path

    def create_session(self, origin="chat"):
        session = {"session_id": f"vs-{origin}", "phase": "idle", "progress": 0, "running": False, "origin": origin}
        self.sessions[session["session_id"]] = session
        return session

    def session_state(self, session_id):
        return dict(self.sessions.get(session_id) or {})

    def upload_audio_files(self, session_id, audio_paths):
        self.uploaded.append((session_id, [str(path) for path in audio_paths]))
        session = {"session_id": session_id, "phase": "audio_ready", "progress": 100, "running": False, "source_name": Path(audio_paths[0]).name}
        self.sessions[session_id] = session
        return session

    def start_video_task(self, session_id, video_path):
        self.videos.append((session_id, str(video_path)))
        session = {"session_id": session_id, "phase": "queued", "progress": 0, "running": True, "source_name": Path(video_path).name}
        self.sessions[session_id] = session
        return session

    def start_separation(self, session_id):
        self.separated.append(session_id)
        session = {"session_id": session_id, "phase": "queued", "progress": 0, "running": True, "operation": "separation"}
        self.sessions[session_id] = session
        return session

    def select_segments(self, session_id, indices):
        session = {"session_id": session_id, "phase": "reference", "progress": 100, "running": False, "selected": list(indices), "reference_seconds": 4.0}
        self.sessions[session_id] = session
        return session

    def complete_session(self, session_id, name):
        voice = {"voice_id": "voice-1", "name": name, "session_id": session_id}
        self.completed.append(voice)
        self.sessions[session_id] = {"session_id": session_id, "phase": "done", "progress": 100, "voice_id": "voice-1", "voice_name": name}
        return voice

    def list_voices_by_id(self, voice_id):
        return {"voice_id": voice_id, "name": "saved"}

    def upload_segments(self, session_id, audio_paths):
        self.uploaded.append((session_id, [str(path) for path in audio_paths], "segments"))
        session = {
            "session_id": session_id,
            "phase": "segments",
            "progress": 100,
            "running": False,
            "segments": [{"index": 0, "seconds": 2.0, "file": "upload_1.wav", "source": "upload"}],
        }
        self.sessions[session_id] = session
        return session

    def cancel_session(self, session_id):
        session = {"session_id": session_id, "phase": "cancelled", "progress": 0, "running": False}
        self.sessions[session_id] = session
        return session


class FakeTraining:
    def __init__(self):
        self.started = []

    def start_training(self, asset_id, expected_language=None):
        del expected_language
        self.started.append(asset_id)
        return True

    def status(self):
        return {"active_asset_id": self.started[-1] if self.started else None, "assets_root": "managed"}


class FakeDB:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def close(self):
        return None


def test_analyze_voice_material_rejects_local_file_paths(tmp_path):
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    result = analyze_voice_material.func(
        session_id="vs-chat",
        file_path=r"C:\\Users\\tmp\\clip.wav",
        runtime=runtime,
    )
    assert result["status"] == "failed"
    assert "attachment_id" in result["reason"]


def test_analyze_voice_material_uses_attachment_id_and_studio_manager(tmp_path, monkeypatch):
    source = tmp_path / "clip.wav"
    source.write_bytes(b"RIFF")
    studio = RecordingStudio(tmp_path)
    runtime = _graph_runtime(voice_studio=studio)
    runtime.context.conversation_id = "c1"
    runtime.context.session_factory = FakeDB

    monkeypatch.setattr(
        "agents.tools.voice_clone.resolve_attachment",
        lambda db, root, conversation_id, file_id, workspace_id=None: type(
            "Item",
            (),
            {"name": "clip.wav", "storage_path": str(source), "kind": "audio"},
        )(),
    )

    result = analyze_voice_material.func(
        session_id="vs-chat",
        attachment_id="att-1",
        runtime=runtime,
    )
    assert result["status"] == "accepted"
    assert result["session_id"] == "vs-chat"
    assert studio.uploaded
    assert studio.separated == ["vs-chat"]
    assert "storage_path" not in (result.get("session") or {})
    assert "file_path" not in (result.get("session") or {})


def test_voice_clone_tools_do_not_import_missing_studio_service():
    import agents.tools.voice_clone as module
    import inspect

    source = inspect.getsource(module)
    assert "voice.studio.service" not in source
    assert "analyze_audio_quality" not in source
    assert "save_and_bind_voice" not in source


def test_start_voice_training_uses_gpt_sovits_training_service(tmp_path):
    training = FakeTraining()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path), gpt_sovits_training=training)
    missing = start_voice_training.func(runtime=runtime)
    assert missing["status"] == "failed"
    assert "Voice Asset" in missing["reason"]

    started = start_voice_training.func(asset_id="asset-1", runtime=runtime)
    assert started["status"] == "accepted"
    assert training.started == ["asset-1"]


def test_bind_trained_voice_completes_studio_session(tmp_path):
    studio = RecordingStudio(tmp_path)
    studio.sessions["vs-chat"] = {"session_id": "vs-chat", "phase": "reference", "reference_seconds": 3, "running": False}
    runtime = _graph_runtime(voice_studio=studio)
    result = bind_trained_voice.func("vs-chat", "Gentle", runtime)
    assert result["status"] == "completed"
    assert result["voice_id"] == "voice-1"
    assert studio.completed[0]["name"] == "Gentle"


def test_request_training_confirmation_asks_for_segments(tmp_path):
    studio = RecordingStudio(tmp_path)
    studio.sessions["vs-chat"] = {"session_id": "vs-chat", "phase": "segments", "running": False, "segments": [{"index": 0}]}
    runtime = _graph_runtime(voice_studio=studio)
    waiting = request_training_confirmation.func("vs-chat", runtime=runtime)
    assert waiting["status"] == "waiting_input"
    assert waiting["waiting_inputs"][0]["input_id"] == "segment_indices"

    confirmed = request_training_confirmation.func("vs-chat", [0], runtime)
    assert confirmed["status"] == "waiting_input"
    assert confirmed["waiting_inputs"][0]["input_id"] == "save_voice"


def test_synthesize_voice_asset_waits_for_text_and_asset(tmp_path):
    from agents.tools.voice import synthesize_voice_asset

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path), tts_synthesis=object())
    runtime.context.conversation_id = "c1"
    runtime.context.session_factory = FakeDB
    waiting_text = synthesize_voice_asset.func(runtime=runtime)
    assert waiting_text["status"] == "waiting_input"
    assert waiting_text["waiting_inputs"][0]["input_id"] == "tts_text"

    waiting_asset = synthesize_voice_asset.func(text="hello", runtime=runtime)
    assert waiting_asset["status"] == "waiting_input"
    assert waiting_asset["waiting_inputs"][0]["input_id"] == "asset_id"


def test_synthesize_voice_asset_persists_attachment_not_local_path(tmp_path, monkeypatch):
    from agents.tools.voice import synthesize_voice_asset

    class FakeTTS:
        def synthesize(self, asset, text, default_language=None):
            del asset, default_language
            assert text == "hello there"
            return b"RIFFWAVE"

    class Asset:
        id = "asset-1"
        name = "Gentle"
        engine = "gpt_sovits"
        workspace_id = "ws-1"

    class SynthDB(FakeDB):
        def scalar(self, *args, **kwargs):
            del args, kwargs
            return Asset()

        def commit(self):
            return None

        def rollback(self):
            return None

    studio = RecordingStudio(tmp_path)
    runtime = _graph_runtime(voice_studio=studio, tts_synthesis=FakeTTS())
    runtime.context.conversation_id = "c1"
    runtime.context.session_factory = lambda: SynthDB()

    monkeypatch.setattr(
        "agents.tools.voice.create_attachment",
        lambda *args, **kwargs: type("Item", (), {"id": "att-out"})(),
    )
    monkeypatch.setattr(
        "agents.tools.voice.public_attachment",
        lambda item, base_url="": {"file_id": "att-out", "name": "Gentle.wav", "mime_type": "audio/wav", "source": "voice_worker"},
    )

    result = synthesize_voice_asset.func(text="hello there", asset_id="asset-1", runtime=runtime)
    assert result["status"] == "completed"
    assert result["result_refs"] == ["att-out"]
    assert "storage_path" not in result
    assert "path" not in (result.get("attachment") or {})


def test_control_gpt_sovits_service_starts_and_stops_without_install(tmp_path):
    from agents.tools.voice import control_gpt_sovits_service, get_gpt_sovits_engine_status

    class FakeEngine:
        def __init__(self):
            self.started = 0
            self.stopped = 0

        def ensure_service(self):
            self.started += 1

        def stop_service(self):
            self.stopped += 1

        def status(self):
            return {"installed": True, "running": self.started > self.stopped}

    engine = FakeEngine()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path), gpt_sovits=engine)
    status = get_gpt_sovits_engine_status.func(runtime)
    assert status["status"] == "ok"
    assert status["engine"]["installed"] is True

    started = control_gpt_sovits_service.func("start", runtime)
    assert started["status"] == "completed"
    assert engine.started == 1
    stopped = control_gpt_sovits_service.func("stop", runtime)
    assert stopped["status"] == "completed"
    assert engine.stopped == 1
    invalid = control_gpt_sovits_service.func("install", runtime)
    assert invalid["status"] == "failed"


def test_train_voice_from_studio_uses_segments_and_training_service(tmp_path, monkeypatch):
    from agents.tools.voice_clone import train_voice_from_studio

    class Asset:
        def __init__(self, **kwargs):
            self.id = "asset-new"
            self.status = "created"
            self.error_message = None
            self.name = kwargs.get("name")
            self.engine = kwargs.get("engine")
            self.workspace_id = kwargs.get("workspace_id")
            self.reference_language = kwargs.get("reference_language")

    class TrainDB(FakeDB):
        def __init__(self):
            self.added = []

        def add(self, asset):
            self.added.append(asset)

        def commit(self):
            return None

        def refresh(self, asset):
            return None

    class Training(FakeTraining):
        def __init__(self):
            super().__init__()
            self.prepared = []
            self.labeled = []

        def prepare_dataset(self, asset_id, paths, language="ZH"):
            self.prepared.append((asset_id, list(paths), language))

        def label_with_asr(self, asset_id, language="zh"):
            self.labeled.append((asset_id, language))

        def validate_dataset(self, asset_id, expected_language):
            del asset_id, expected_language
            return []

    studio = RecordingStudio(tmp_path)
    studio.sessions_dir = studio._root
    session_dir = studio._session_dir("vs-chat")
    segment = session_dir / "segments"
    segment.mkdir(parents=True, exist_ok=True)
    wav = segment / "000.wav"
    wav.write_bytes(b"RIFF")
    studio.sessions["vs-chat"] = {
        "session_id": "vs-chat",
        "phase": "segments",
        "running": False,
        "segments": [{"index": 0, "file": "000.wav"}],
    }
    training = Training()
    runtime = _graph_runtime(voice_studio=studio, gpt_sovits_training=training)
    db = TrainDB()
    runtime.context.session_factory = lambda: db
    monkeypatch.setattr("app.models.VoiceAsset", Asset)

    waiting = train_voice_from_studio.func(session_id="vs-chat", runtime=runtime)
    assert waiting["status"] == "waiting_input"

    result = train_voice_from_studio.func(session_id="vs-chat", name="Gentle", segment_indices=[0], runtime=runtime)
    assert result["status"] == "accepted"
    assert result["asset_id"] == "asset-new"
    assert training.prepared
    assert training.started == ["asset-new"]
    assert "dataset_dir" not in result



def test_create_voice_asset_waits_for_name(tmp_path):
    from agents.tools.voice import create_voice_asset

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = FakeDB
    waiting = create_voice_asset.func(runtime=runtime)
    assert waiting['status'] == 'waiting_input'
    assert waiting['waiting_inputs'][0]['input_id'] == 'asset_name'


def test_create_voice_asset_persists_workspace_scoped_record(tmp_path, monkeypatch):
    from agents.tools.voice import create_voice_asset

    class Asset:
        def __init__(self, **kwargs):
            self.id = 'asset-new'
            self.status = 'created'
            self.training_stage = ''
            self.error_message = None
            self.refer_audio_path = None
            self.preview_audio_path = None
            self.created_at = None
            self.updated_at = None
            self.name = kwargs.get('name')
            self.engine = kwargs.get('engine')
            self.workspace_id = kwargs.get('workspace_id')
            self.reference_language = kwargs.get('reference_language')

    class CreateDB(FakeDB):
        def __init__(self):
            self.added = []

        def add(self, asset):
            self.added.append(asset)

        def commit(self):
            return None

        def refresh(self, asset):
            return None

    db = CreateDB()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = lambda: db
    monkeypatch.setattr('app.models.VoiceAsset', Asset)

    result = create_voice_asset.func(name='Gentle', reference_language='zh', runtime=runtime)
    assert result['status'] == 'completed'
    assert result['asset']['id'] == 'asset-new'
    assert result['asset']['name'] == 'Gentle'
    assert result['asset']['engine'] == 'gpt_sovits'
    assert db.added[0].workspace_id == 'ws-1'
    assert 'gpt_weights_path' not in result['asset']
    assert 'path' not in result['asset']


def test_update_voice_asset_renames_and_ignores_weight_paths(tmp_path):
    from agents.tools.voice import update_voice_asset

    class Asset:
        id = 'asset-1'
        name = 'Old'
        engine = 'gpt_sovits'
        workspace_id = 'ws-1'
        status = 'ready'
        training_stage = 'done'
        error_message = None
        refer_audio_path = None
        preview_audio_path = None
        created_at = None
        updated_at = None
        reference_language = 'ZH'
        gpt_weights_path = r'C:\\models\\a.ckpt'
        sovits_weights_path = r'C:\\models\\a.pth'

    class UpdateDB(FakeDB):
        def __init__(self):
            self.asset = Asset()
            self.deleted = []

        def scalar(self, *args, **kwargs):
            del args, kwargs
            return self.asset

        def commit(self):
            return None

        def refresh(self, asset):
            return None

        def delete(self, asset):
            self.deleted.append(asset)

    db = UpdateDB()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = lambda: db
    result = update_voice_asset.func(
        asset_id='asset-1',
        name='New',
        gpt_weights_path=r'D:\\Downloads\\leak.pth',
        runtime=runtime,
    )
    assert result['status'] == 'completed'
    assert db.asset.name == 'New'
    assert db.asset.gpt_weights_path == r'C:\\models\\a.ckpt'
    assert 'gpt_weights_path' not in result['asset']


def test_delete_voice_asset_removes_db_record_not_files(tmp_path):
    from agents.tools.voice import delete_voice_asset

    managed = tmp_path / 'data' / 'gpt_sovits' / 'voices' / 'asset-1'
    managed.mkdir(parents=True)
    weight = managed / 'model.pth'
    weight.write_bytes(b'weights')

    class Asset:
        id = 'asset-1'
        name = 'Gentle'
        engine = 'gpt_sovits'
        workspace_id = 'ws-1'
        sovits_weights_path = str(weight)

    class DeleteDB(FakeDB):
        def __init__(self):
            self.asset = Asset()
            self.deleted = []

        def scalar(self, *args, **kwargs):
            del args, kwargs
            return self.asset

        def delete(self, asset):
            self.deleted.append(asset)

        def commit(self):
            return None

    db = DeleteDB()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = lambda: db
    result = delete_voice_asset.func(asset_id='asset-1', runtime=runtime)
    assert result['status'] == 'completed'
    assert db.deleted[0].id == 'asset-1'
    assert weight.exists()


def test_transcribe_voice_attachment_waits_for_attachment(tmp_path):
    from agents.tools.voice import transcribe_voice_attachment

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = FakeDB
    waiting = transcribe_voice_attachment.func(runtime=runtime)
    assert waiting['status'] == 'waiting_input'
    assert waiting['waiting_inputs'][0]['input_id'] == 'audio_attachment'


def test_transcribe_voice_attachment_rejects_local_path(tmp_path):
    from agents.tools.voice import transcribe_voice_attachment

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = FakeDB
    result = transcribe_voice_attachment.func(
        file_path=str(tmp_path / 'clip.wav'),
        runtime=runtime,
    )
    assert result['status'] == 'failed'
    assert 'attachment_id' in result['reason']


def test_transcribe_voice_attachment_uses_asr_and_hides_storage_path(tmp_path, monkeypatch):
    from agents.tools.voice import transcribe_voice_attachment

    source = tmp_path / 'clip.wav'
    source.write_bytes(b'RIFFWAVE')

    class FakeASR:
        def __init__(self):
            self.calls = []

        def transcribe(self, filename, content_type, audio):
            self.calls.append((filename, content_type, audio))
            return 'hello voice'

    asr = FakeASR()
    runtime = _graph_runtime(
        voice_studio=RecordingStudio(tmp_path),
        asr_provider_factory=lambda: asr,
    )
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = FakeDB
    monkeypatch.setattr(
        'agents.tools.voice.resolve_attachment',
        lambda db, root, conversation_id, file_id, workspace_id=None: type(
            'Item',
            (),
            {'name': 'clip.wav', 'storage_path': str(source), 'mime_type': 'audio/wav', 'kind': 'audio'},
        )(),
    )
    result = transcribe_voice_attachment.func(attachment_id='att-1', runtime=runtime)
    assert result['status'] == 'completed'
    assert result['text'] == 'hello voice'
    assert result['attachment_id'] == 'att-1'
    assert asr.calls[0][0] == 'clip.wav'
    assert asr.calls[0][2] == b'RIFFWAVE'
    assert 'storage_path' not in result
    assert 'path' not in result


def test_get_voice_asset_waits_for_id(tmp_path):
    from agents.tools.voice import get_voice_asset

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = FakeDB
    waiting = get_voice_asset.func(runtime=runtime)
    assert waiting['status'] == 'waiting_input'
    assert waiting['waiting_inputs'][0]['input_id'] == 'asset_id'


def test_get_voice_asset_returns_payload_without_weight_paths(tmp_path):
    from agents.tools.voice import get_voice_asset

    class Asset:
        id = 'asset-1'
        name = 'Gentle'
        engine = 'gpt_sovits'
        workspace_id = 'ws-1'
        status = 'ready'
        training_stage = 'done'
        error_message = None
        refer_audio_path = r'C:\\models\\refer.wav'
        preview_audio_path = None
        created_at = None
        updated_at = None
        reference_language = 'ZH'
        gpt_weights_path = r'C:\\models\\a.ckpt'

    class QueryDB(FakeDB):
        def scalar(self, *args, **kwargs):
            del args, kwargs
            return Asset()

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = QueryDB
    result = get_voice_asset.func(asset_id='asset-1', runtime=runtime)
    assert result['status'] == 'ok'
    assert result['asset']['id'] == 'asset-1'
    assert result['asset']['name'] == 'Gentle'
    assert result['asset']['has_reference_audio'] is True
    assert 'gpt_weights_path' not in result['asset']
    assert 'refer_audio_path' not in result['asset']
    assert 'path' not in result['asset']


def test_set_voice_asset_reference_audio_waits_for_asset_and_attachment(tmp_path):
    from agents.tools.voice import set_voice_asset_reference_audio

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = FakeDB
    waiting_asset = set_voice_asset_reference_audio.func(runtime=runtime)
    assert waiting_asset['status'] == 'waiting_input'
    assert waiting_asset['waiting_inputs'][0]['input_id'] == 'asset_id'
    waiting_file = set_voice_asset_reference_audio.func(asset_id='asset-1', runtime=runtime)
    assert waiting_file['status'] == 'waiting_input'
    assert waiting_file['waiting_inputs'][0]['input_id'] == 'audio_attachment'


def test_set_voice_asset_reference_audio_rejects_local_path(tmp_path):
    from agents.tools.voice import set_voice_asset_reference_audio

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = FakeDB
    result = set_voice_asset_reference_audio.func(
        asset_id='asset-1',
        file_path=str(tmp_path / 'clip.wav'),
        runtime=runtime,
    )
    assert result['status'] == 'failed'
    assert 'attachment_id' in result['reason']


def test_set_voice_asset_reference_audio_copies_into_managed_dir(tmp_path, monkeypatch):
    from agents.tools.voice import set_voice_asset_reference_audio

    source = tmp_path / 'clip.wav'
    source.write_bytes(b'RIFFWAVE')

    class Asset:
        id = 'asset-1'
        name = 'Gentle'
        engine = 'gpt_sovits'
        workspace_id = 'ws-1'
        status = 'ready'
        training_stage = 'done'
        error_message = None
        refer_audio_path = None
        preview_audio_path = None
        created_at = None
        updated_at = None
        reference_language = 'ZH'

    class UpdateDB(FakeDB):
        def __init__(self):
            self.asset = Asset()

        def scalar(self, *args, **kwargs):
            del args, kwargs
            return self.asset

        def commit(self):
            return None

        def refresh(self, asset):
            return None

    db = UpdateDB()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.conversation_id = 'c1'
    runtime.context.session_factory = lambda: db
    monkeypatch.setattr(
        'agents.tools.voice.resolve_attachment',
        lambda db, root, conversation_id, file_id, workspace_id=None: type(
            'Item',
            (),
            {'name': 'clip.wav', 'storage_path': str(source), 'mime_type': 'audio/wav', 'kind': 'audio'},
        )(),
    )
    result = set_voice_asset_reference_audio.func(
        asset_id='asset-1',
        attachment_id='att-1',
        runtime=runtime,
    )
    managed = tmp_path / 'data' / 'gpt_sovits' / 'voices' / 'asset-1' / 'refer.wav'
    assert result['status'] == 'completed'
    assert result['asset']['has_reference_audio'] is True
    assert 'refer_audio_path' not in result['asset']
    assert 'path' not in result
    assert managed.is_file()
    assert managed.read_bytes() == b'RIFFWAVE'
    assert db.asset.refer_audio_path == str(managed)
    assert source.exists()

def test_bind_voice_asset_to_persona_writes_tts_profile(tmp_path, monkeypatch):
    from agents.tools.voice import bind_voice_asset_to_persona

    class Asset:
        id = "asset-1"
        name = "Gentle"
        engine = "gpt_sovits"
        workspace_id = "ws-1"
        status = "ready"
        training_stage = "done"
        error_message = None
        refer_audio_path = "managed"
        preview_audio_path = None
        created_at = None
        updated_at = None
        reference_language = "ZH"

    class Persona:
        id = "persona-a"
        workspace_id = "ws-1"
        profile_json = {"tts": {"enabled": False}}

    class BindDB(FakeDB):
        def __init__(self):
            self.asset = Asset()
            self.persona = Persona()
            self.committed = False

        def scalar(self, *args, **kwargs):
            del args, kwargs
            return self.persona

        def commit(self):
            self.committed = True

    db = BindDB()
    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = lambda: db
    monkeypatch.setattr("agents.tools.voice._load_gpt_sovits_asset", lambda *args, **kwargs: db.asset)
    result = bind_voice_asset_to_persona.func(asset_id="asset-1", runtime=runtime)
    assert result["status"] == "completed"
    assert db.persona.profile_json["tts"]["voice_asset_id"] == "asset-1"
    assert db.persona.profile_json["tts"]["enabled"] is True
    assert result["asset"]["id"] == "asset-1"
    assert "path" not in result["asset"]


def test_bind_voice_asset_to_persona_waits_for_asset_id(tmp_path):
    from agents.tools.voice import bind_voice_asset_to_persona

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    runtime.context.session_factory = FakeDB
    waiting = bind_voice_asset_to_persona.func(runtime=runtime)
    assert waiting["status"] == "waiting_input"
    assert waiting["waiting_inputs"][0]["input_id"] == "asset_id"


def test_upload_voice_studio_segments_rejects_local_path(tmp_path):
    from agents.tools.voice_clone import upload_voice_studio_segments

    runtime = _graph_runtime(voice_studio=RecordingStudio(tmp_path))
    result = upload_voice_studio_segments.func(
        session_id="vs-chat",
        file_path=r"C:\\Users\\tmp\\clip.wav",
        runtime=runtime,
    )
    assert result["status"] == "failed"
    assert "attachment_id" in result["reason"]


def test_upload_voice_studio_segments_uses_attachment(tmp_path, monkeypatch):
    from agents.tools.voice_clone import upload_voice_studio_segments

    source = tmp_path / "extra.wav"
    source.write_bytes(b"RIFF")
    studio = RecordingStudio(tmp_path)
    runtime = _graph_runtime(voice_studio=studio)
    runtime.context.conversation_id = "c1"
    runtime.context.session_factory = FakeDB
    monkeypatch.setattr(
        "agents.tools.voice_clone.resolve_attachment",
        lambda db, root, conversation_id, file_id, workspace_id=None: type(
            "Item",
            (),
            {"name": "extra.wav", "storage_path": str(source), "kind": "audio"},
        )(),
    )
    result = upload_voice_studio_segments.func(
        session_id="vs-chat",
        attachment_id="att-2",
        runtime=runtime,
    )
    assert result["status"] == "completed"
    assert result["session"]["phase"] == "segments"
    assert "storage_path" not in result["session"]


def test_cancel_voice_studio_session_does_not_delete_files(tmp_path):
    from agents.tools.voice_clone import cancel_voice_studio_session

    studio = RecordingStudio(tmp_path)
    keep = studio._session_dir("vs-chat") / "keep.wav"
    keep.write_bytes(b"data")
    runtime = _graph_runtime(voice_studio=studio)
    result = cancel_voice_studio_session.func(session_id="vs-chat", runtime=runtime)
    assert result["status"] == "cancelled"
    assert result["session"]["phase"] == "cancelled"
    assert keep.exists()



def test_get_voice_studio_session_hides_private_paths_and_maps_phases():
    class Studio:
        def __init__(self):
            self.states = {
                "vs-seg": {
                    "session_id": "vs-seg",
                    "phase": "segments",
                    "running": False,
                    "audio_path": "C:/tmp/audio.wav",
                    "work_path": "C:/tmp/work",
                    "segments": [{"index": 0, "seconds": 1.5}],
                },
                "vs-ready": {
                    "session_id": "vs-ready",
                    "phase": "ready",
                    "running": False,
                    "audio_path": "C:/tmp/ready.wav",
                },
            }

        def session_state(self, session_id):
            return dict(self.states[session_id])

    runtime = _graph_runtime(voice_studio=Studio())
    waiting = get_voice_studio_session.func("vs-seg", runtime)
    assert waiting["status"] == "waiting_input"
    assert waiting["waiting_inputs"][0]["input_id"] == "segment_indices"
    assert "audio_path" not in waiting["session"]
    assert "work_path" not in waiting["session"]

    ready = get_voice_studio_session.func("vs-ready", runtime)
    assert ready["status"] == "ok"
    assert ready["session"]["phase"] == "ready"
    assert "audio_path" not in ready["session"]
    assert "work_path" not in ready["session"]
