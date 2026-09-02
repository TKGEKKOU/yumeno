from __future__ import annotations

import time
import wave
from pathlib import Path
from threading import Event

from sqlalchemy.orm import sessionmaker

from agents.runtime.errors import RuntimeErrorCode, public_error_message
from agents.runtime.models import RunStatus
from agents.runtime.runner import AgentRuntime
from app.run_store import RunStore
from voice.studio import VoiceStudioManager


def _wav(path: Path, seconds: float = 1.0, rate: int = 44100) -> Path:
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(rate)
        output.writeframes(b"\\x00\\x00" * int(rate * seconds))
    return path


def _runtime(db_session) -> AgentRuntime:
    factory = sessionmaker(bind=db_session.get_bind(), expire_on_commit=False)
    return AgentRuntime(object(), RunStore(factory))


def _manager(tmp_path: Path, runtime: AgentRuntime) -> VoiceStudioManager:
    return VoiceStudioManager(
        tmp_path,
        separator_factory=lambda: None,
        vad_factory=lambda: None,
        voices_root=tmp_path / "voices",
        agent_runtime=runtime,
    )


def _wait_for(predicate, timeout: float = 3.0):
    deadline = time.monotonic() + timeout
    latest = None
    while time.monotonic() < deadline:
        latest = predicate()
        if latest:
            return latest
        time.sleep(0.02)
    return latest


def _segments_result(manager: VoiceStudioManager, session_id: str, source: Path) -> dict:
    segments_dir = manager._session_dir(session_id) / "segments"
    segments_dir.mkdir(parents=True, exist_ok=True)
    segment = segments_dir / "segment_001.wav"
    _wav(segment, seconds=1.0, rate=24000)
    return {
        "audio_44k": source,
        "segments": [
            {
                "index": 0,
                "seconds": 1.0,
                "rms": 0.2,
                "start_24k": 0,
                "end_24k": 24000,
                "file": segment.name,
                "source": "auto",
            }
        ],
    }


def test_video_task_creates_runtime_run_and_finishes_it(db_session, tmp_path, monkeypatch):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    source = _wav(tmp_path / "audio.wav", seconds=2.0)
    session_id = manager.create_session()["session_id"]

    def fake_video(current_session_id, _video_path, _cancel):
        manager._store_segments(current_session_id, _segments_result(manager, current_session_id, source))

    monkeypatch.setattr(manager, "_run_video", fake_video)
    started = manager.start_video_task(session_id, tmp_path / "clip.mp4")

    assert started["run_id"]
    assert started["runtime_status"] in {"running", "completed"}
    finished = _wait_for(
        lambda: manager.session_state(session_id)
        if manager.session_state(session_id)["phase"] == "segments"
        else None
    )
    assert finished is not None
    run = runtime.run_store.get(started["run_id"])
    assert run is not None
    assert run.status is RunStatus.COMPLETED
    assert run.progress == 100
    assert [event.name for event in runtime.run_store.list_events(run.run_id)] == [
        "task_started",
        "voice_phase_updated",
        "task_completed",
    ]


def test_audio_conversion_failure_uses_stable_public_error(db_session, tmp_path, monkeypatch):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    session_id = manager.create_session()["session_id"]

    def broken_conversion(_session_id, _audio_paths, _cancel):
        raise OSError(r"ffmpeg failed at C:\\secret\\input.wav")

    monkeypatch.setattr(manager, "_convert_audio_files", broken_conversion)
    started = manager.upload_audio_files(session_id, [tmp_path / "input.mp3"])

    failed = _wait_for(
        lambda: manager.session_state(session_id)
        if manager.session_state(session_id)["phase"] == "failed"
        else None
    )
    assert failed is not None
    assert failed["error"] == public_error_message(RuntimeErrorCode.WORKER_FAILED)
    assert "ffmpeg" not in failed["error"]
    run = runtime.run_store.get(started["run_id"])
    assert run is not None
    assert run.status is RunStatus.FAILED
    assert run.error_code == "worker_failed"
    assert run.error_message == failed["error"]
    assert "secret" not in (run.result_json or {})


def test_runtime_cancel_triggers_voice_worker_cancel_event(db_session, tmp_path, monkeypatch):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    session_id = manager.create_session()["session_id"]
    started_worker = Event()
    observed_cancel = Event()

    def long_video(_session_id, _video_path, cancel):
        started_worker.set()
        while not cancel.is_set():
            time.sleep(0.01)
        observed_cancel.set()
        raise RuntimeError("worker stopped")

    monkeypatch.setattr(manager, "_run_video", long_video)
    started = manager.start_video_task(session_id, tmp_path / "clip.mp4")
    assert started_worker.wait(1.0)

    cancelled = runtime.cancel(started["run_id"])
    assert cancelled.status is RunStatus.CANCELLED
    assert observed_cancel.wait(1.0)
    final = _wait_for(
        lambda: manager.session_state(session_id)
        if manager.session_state(session_id)["phase"] == "cancelled"
        else None
    )
    assert final is not None
    assert runtime.run_store.get(started["run_id"]).status is RunStatus.CANCELLED
    assert [event.name for event in runtime.run_store.list_events(started["run_id"])] == [
        "task_started",
        "run_cancelled",
    ]


def test_audio_conversion_completion_is_recorded_in_runtime(db_session, tmp_path, monkeypatch):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    session_id = manager.create_session()["session_id"]

    def fake_conversion(current_session_id, _audio_paths, _cancel):
        work = manager._session_dir(current_session_id) / "work"
        work.mkdir(parents=True, exist_ok=True)
        _wav(work / "audio_44k.wav")
        manager._update_meta(
            current_session_id,
            {
                "phase": "audio_ready",
                "progress": 100,
                "audio_files": [{"name": "input.mp3", "seconds": 1.0}],
            },
        )

    monkeypatch.setattr(manager, "_convert_audio_files", fake_conversion)
    started = manager.upload_audio_files(session_id, [tmp_path / "input.mp3"])
    ready = _wait_for(
        lambda: manager.session_state(session_id)
        if manager.session_state(session_id)["phase"] == "audio_ready"
        else None
    )
    assert ready is not None
    run = runtime.run_store.get(started["run_id"])
    assert run is not None
    assert run.status is RunStatus.COMPLETED
    assert run.current_step == "audio_ready"


def test_recovered_voice_run_is_marked_failed_in_domain_snapshot(db_session, tmp_path):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    session_id = manager.create_session()["session_id"]
    run = runtime.start_task(
        action="voice_studio",
        thread_id=session_id,
        worker="voice_studio",
        current_step="separating",
        metadata={"session_id": session_id},
    )
    manager._update_meta(
        session_id,
        {
            "run_id": run.run_id,
            "operation": "separation",
            "phase": "separating",
            "progress": 40,
        },
    )

    recovered = runtime.run_store.recover_incomplete_runs()
    manager.sync_recovered_runs(recovered)

    state = manager.session_state(session_id)
    assert state is not None
    assert state["phase"] == "failed"
    assert state["error"] == public_error_message(RuntimeErrorCode.RUNTIME_RESTARTED)
    assert runtime.run_store.get(run.run_id).status is RunStatus.FAILED


def test_delete_running_session_cancels_runtime_before_removing_files(db_session, tmp_path, monkeypatch):
    runtime = _runtime(db_session)
    manager = _manager(tmp_path, runtime)
    session_id = manager.create_session()["session_id"]
    started_worker = Event()
    observed_cancel = Event()

    def cancellable_video(_session_id, _video_path, cancel):
        started_worker.set()
        assert cancel.wait(1.0)
        observed_cancel.set()

    monkeypatch.setattr(manager, "_run_video", cancellable_video)
    started = manager.start_video_task(session_id, tmp_path / "clip.mp4")
    assert started_worker.wait(1.0)

    assert manager.delete_session(session_id) is True
    assert observed_cancel.is_set()
    assert runtime.run_store.get(started["run_id"]).status is RunStatus.CANCELLED
    assert not manager._session_dir(session_id).exists()
