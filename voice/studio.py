"""Voice studio: stepwise draft pipeline for building named reference voices."""

from __future__ import annotations

import json
import re
import shutil
import threading
import time
import uuid
from pathlib import Path
from typing import Any, Callable, Iterable

from agents.runtime.errors import RuntimeErrorCode, public_error_message
from voice.clone_pipeline import (
    ClonePipelineError,
    REFERENCE_RATE,
    build_reference_from_segments,
    convert_wav,
    find_ffmpeg,
    run_audio_to_segments,
    run_video_to_segments,
)

SESSION_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")
VOICE_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


class VoiceStudioError(RuntimeError):
    pass


def _empty_meta(session_id: str) -> dict:
    return {
        "session_id": session_id,
        "created_at": time.time(),
        "updated_at": time.time(),
        "phase": "idle",
        "progress": 0,
        "error": "",
        "source_kind": None,
        "source_name": "",
        "audio_files": [],
        "source_duration": None,
        "segments": [],
        "selected": [],
        "reference_file": None,
        "reference_seconds": None,
        "reference_source": None,
        "voice_id": None,
        "voice_name": None,
        "run_id": None,
        "operation": None,
    }


class VoiceStudioManager:
    def __init__(
        self,
        project_root: Path,
        separator_factory: Callable[[], object],
        vad_factory: Callable,
        voices_root: Path | None = None,
        agent_runtime: Any | None = None,
    ) -> None:
        self.project_root = Path(project_root)
        self.sessions_dir = self.project_root / "data" / "voice_studio" / "sessions"
        self.meta_dir = self.project_root / "data" / "voice_studio" / "voices"
        self.voices_root = Path(voices_root) if voices_root else self.project_root / "data" / "tts" / "voices"
        self.separator_factory = separator_factory
        self.vad_factory = vad_factory
        self.agent_runtime = agent_runtime
        self._cancel: dict[str, threading.Event] = {}
        self._workers: dict[str, threading.Thread] = {}
        self._lock = threading.Lock()

    def attach_runtime(self, agent_runtime: Any | None) -> None:
        """Attach the shared Runtime after application startup has initialized it."""

        self.agent_runtime = agent_runtime

    @staticmethod
    def _phase_label(phase: str) -> str:
        return {
            "queued": "等待处理",
            "convert": "转换音频",
            "audio_ready": "音频已准备",
            "separating": "分离人声",
            "segments": "生成语音片段",
            "reference": "生成参考音色",
            "done": "音色已保存",
            "failed": "处理失败",
            "cancelled": "已取消",
        }.get(phase, "处理声音素材")

    def _resume_state(self, meta: dict) -> dict[str, Any]:
        """Return only restart-safe, non-sensitive state for the Runtime."""

        return {
            "session_id": str(meta.get("session_id") or ""),
            "operation": str(meta.get("operation") or ""),
            "phase": str(meta.get("phase") or ""),
            "source_kind": meta.get("source_kind"),
        }

    def _runtime_start(self, session_id: str, operation: str, source_kind: str | None) -> str | None:
        runtime = self.agent_runtime
        if runtime is None:
            return None
        run = runtime.start_task(
            action="voice_studio",
            thread_id=session_id,
            worker="voice_studio",
            current_step="queued",
            status_text=self._phase_label("queued"),
            resume_state={
                "session_id": session_id,
                "operation": operation,
                "phase": "queued",
                "source_kind": source_kind,
            },
            metadata={
                "session_id": session_id,
                "operation": operation,
                "source_kind": source_kind,
            },
        )
        register = getattr(runtime, "register_cancel_handler", None)
        if callable(register):
            register(run.run_id, lambda: self._signal_cancel(session_id))
        return run.run_id

    def _signal_cancel(self, session_id: str) -> None:
        with self._lock:
            cancel = self._cancel.get(session_id)
            if cancel is not None:
                cancel.set()

    def _runtime_progress(self, meta: dict) -> None:
        runtime = self.agent_runtime
        run_id = meta.get("run_id")
        if runtime is None or not run_id:
            return
        try:
            runtime.update_task_progress(
                run_id,
                current_step=str(meta.get("phase") or ""),
                status_text=self._phase_label(str(meta.get("phase") or "")),
                progress=max(0, int(meta.get("progress") or 0)),
                resume_state=self._resume_state(meta),
                event_name="voice_phase_updated",
                event_label=self._phase_label(str(meta.get("phase") or "")),
            )
        except Exception:
            # Runtime 持久化故障不应破坏声音领域的兼容快照和正在执行的 Worker。
            return

    def _runtime_finish(self, session_id: str) -> None:
        runtime = self.agent_runtime
        meta = self._load_meta(session_id)
        run_id = meta.get("run_id")
        if runtime is None or not run_id:
            return
        try:
            runtime.finish_task(
                run_id,
                current_step=str(meta.get("phase") or ""),
                status_text=self._phase_label(str(meta.get("phase") or "")),
                progress=100,
                resume_state=self._resume_state(meta),
                result={
                    "session_id": session_id,
                    "operation": meta.get("operation"),
                    "phase": meta.get("phase"),
                },
            )
        finally:
            unregister = getattr(runtime, "unregister_cancel_handler", None)
            if callable(unregister):
                unregister(run_id)

    def _runtime_fail(self, session_id: str) -> None:
        runtime = self.agent_runtime
        meta = self._load_meta(session_id)
        run_id = meta.get("run_id")
        if runtime is None or not run_id:
            return
        try:
            runtime.fail_task(
                run_id,
                error_code=RuntimeErrorCode.WORKER_FAILED,
                status_text=self._phase_label("failed"),
                result={"session_id": session_id, "operation": meta.get("operation")},
            )
        finally:
            unregister = getattr(runtime, "unregister_cancel_handler", None)
            if callable(unregister):
                unregister(run_id)

    def _runtime_cancel(self, session_id: str) -> None:
        runtime = self.agent_runtime
        meta = self._load_meta(session_id)
        run_id = meta.get("run_id")
        if runtime is None or not run_id:
            return
        try:
            cancel = getattr(runtime, "cancel", None)
            if callable(cancel):
                cancel(run_id)
        except Exception:
            return
        finally:
            unregister = getattr(runtime, "unregister_cancel_handler", None)
            if callable(unregister):
                unregister(run_id)

    def sync_recovered_runs(self, runs: Iterable[Any]) -> None:
        """将服务重启时遗留的声音领域快照同步为公开失败状态。"""

        message = public_error_message(RuntimeErrorCode.RUNTIME_RESTARTED)
        active_phases = {"queued", "convert", "separating"}
        for run in runs:
            if getattr(run, "action", None) != "voice_studio" or not getattr(run, "thread_id", None):
                continue
            session_id = str(run.thread_id)
            try:
                meta = self._load_meta(session_id)
            except VoiceStudioError:
                continue
            if meta.get("run_id") != run.run_id and meta.get("phase") not in active_phases:
                continue
            self._save_meta(
                session_id,
                {
                    **meta,
                    "run_id": run.run_id,
                    "phase": "failed",
                    "progress": int(meta.get("progress") or 0),
                    "error": message,
                },
            )

    def _assert_not_running(self, session_id: str) -> None:
        with self._lock:
            if session_id in self._cancel and not self._cancel[session_id].is_set():
                raise VoiceStudioError("该草稿已有任务进行中")

    # ------------------------------------------------------------------
    # sessions
    # ------------------------------------------------------------------

    def create_session(self, origin: str = "studio") -> dict:
        session_id = uuid.uuid4().hex[:12]
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        (session_dir / "work").mkdir(exist_ok=True)
        (session_dir / "uploads").mkdir(exist_ok=True)
        meta = _empty_meta(session_id)
        meta["origin"] = origin
        self._save_meta(session_id, meta)
        return self.session_state(session_id)

    def _session_dir(self, session_id: str) -> Path:
        if not SESSION_ID_RE.match(session_id):
            raise VoiceStudioError("无效的会话 ID")
        return self.sessions_dir / session_id

    def _meta_path(self, session_id: str) -> Path:
        return self._session_dir(session_id) / "meta.json"

    def _load_meta(self, session_id: str) -> dict:
        path = self._meta_path(session_id)
        if not path.is_file():
            raise VoiceStudioError("会话不存在或已过期")
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            raise VoiceStudioError("会话数据损坏") from exc

    def _save_meta(self, session_id: str, meta: dict) -> None:
        meta["updated_at"] = time.time()
        path = self._meta_path(session_id)
        # 使用每次独立的临时文件，避免 Windows 下并发读写共享同一个
        # ``meta.tmp`` 导致 replace 命中 WinError 5；替换失败时短暂重试。
        temporary = path.with_name(f"{path.stem}.{uuid.uuid4().hex}.tmp")
        temporary.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        try:
            for attempt in range(4):
                try:
                    temporary.replace(path)
                    break
                except PermissionError:
                    if attempt == 3:
                        raise
                    time.sleep(0.01)
        finally:
            temporary.unlink(missing_ok=True)
    def session_state(self, session_id: str) -> dict | None:
        # Windows 下后台线程用临时文件替换 meta.json 时，读线程可能恰好
        # 命中极短的 replace 窗口；重试可避免取消收束阶段出现瞬时 None。
        meta = None
        for attempt in range(3):
            try:
                meta = self._load_meta(session_id)
                break
            except VoiceStudioError:
                if attempt == 2:
                    return None
                time.sleep(0.005)
        meta = dict(meta)
        local_running = session_id in self._cancel and self._cancel[session_id].is_set() is False
        runtime = self.agent_runtime
        run_id = meta.get("run_id")
        runtime_run = None
        if runtime is not None and run_id:
            store = getattr(runtime, "run_store", None)
            getter = getattr(store, "get", None)
            if callable(getter):
                try:
                    runtime_run = getter(run_id)
                except Exception:
                    runtime_run = None
        if runtime_run is not None:
            status = runtime_run.status.value if hasattr(runtime_run.status, "value") else str(runtime_run.status)
            meta.update(
                {
                    "runtime_status": status,
                    "runtime_progress": runtime_run.progress,
                    "runtime_status_text": runtime_run.status_text,
                    "runtime_error_code": runtime_run.error_code,
                    "runtime_error_message": runtime_run.error_message,
                }
            )
            meta["running"] = status in {"queued", "running"}
        else:
            meta["running"] = local_running
        return meta

    def list_sessions(self) -> list[dict]:
        sessions: list[dict] = []
        if not self.sessions_dir.is_dir():
            return sessions
        for entry in sorted(self.sessions_dir.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
            if not entry.is_dir() or not (entry / "meta.json").is_file():
                continue
            state = self.session_state(entry.name)
            if state is not None:
                sessions.append(
                    {
                        "session_id": state["session_id"],
                        "phase": state["phase"],
                        "progress": state["progress"],
                        "source_kind": state["source_kind"],
                        "source_name": state["source_name"],
                        "updated_at": state["updated_at"],
                        "run_id": state.get("run_id"),
                        "runtime_status": state.get("runtime_status"),
                    }
                )
        return sessions

    def delete_session(self, session_id: str) -> bool:
        directory = self._session_dir(session_id)
        try:
            meta = self._load_meta(session_id)
        except VoiceStudioError:
            meta = {}

        # 先发出统一 Runtime 取消，再等待领域 Worker 退出，避免后台线程
        # 在 rmtree 之后继续读写会话目录，或留下 running 的孤儿运行记录。
        with self._lock:
            cancel = self._cancel.get(session_id)
            worker = self._workers.get(session_id)
            if cancel is not None:
                cancel.set()

        runtime = self.agent_runtime
        run_id = meta.get("run_id")
        if runtime is not None and run_id:
            try:
                current = runtime.run_store.get(run_id)
                if current is not None and getattr(current.status, "value", current.status) in {
                    "queued",
                    "running",
                    "waiting_approval",
                    "paused",
                }:
                    runtime.cancel(run_id)
            except Exception:
                # 本地删除不能因为 Runtime 已经收口或暂时不可用而阻塞；
                # Worker 仍会在 finally 中清理本地运行状态。
                pass

        if worker is not None and worker is not threading.current_thread():
            worker.join(timeout=5.0)
            if worker.is_alive():
                raise VoiceStudioError("后台任务尚未退出，请稍后再试")

        with self._lock:
            self._cancel.pop(session_id, None)
            self._workers.pop(session_id, None)
        if directory.is_dir():
            shutil.rmtree(directory)
            return True
        return False

    def cancel_session(self, session_id: str) -> dict:
        """Stop a running Voice Studio job without deleting session files."""
        self._signal_cancel(session_id)
        worker = None
        with self._lock:
            worker = self._workers.get(session_id)
        if worker is not None and worker is not threading.current_thread():
            worker.join(timeout=5.0)
        state = self.session_state(session_id)
        phase = str((state or {}).get("phase") or "").lower()
        if phase != "cancelled":
            try:
                self._update_meta(session_id, {"phase": "cancelled", "error": ""})
            except VoiceStudioError:
                pass
            self._runtime_cancel(session_id)
            state = self.session_state(session_id)
        return state or {"session_id": session_id, "phase": "cancelled"}

    # ------------------------------------------------------------------
    # pipeline tasks
    # ------------------------------------------------------------------

    def start_video_task(self, session_id: str, video_path: Path) -> dict:
        self._assert_not_running(session_id)
        meta = self._load_meta(session_id)
        run_id = self._runtime_start(session_id, "video", "video")
        meta.update(
            {
                "claimed_at": time.time(),
                "phase": "queued",
                "progress": 0,
                "error": "",
                "source_kind": "video",
                "source_name": Path(video_path).name,
                "operation": "video",
                "run_id": run_id,
            }
        )
        self._save_meta(session_id, meta)
        try:
            self._spawn(session_id, lambda cancel: self._run_video(session_id, video_path, cancel))
        except Exception:
            if run_id:
                self._runtime_fail(session_id)
            raise
        return self.session_state(session_id)

    def upload_audio_files(self, session_id: str, audio_paths: list[Path]) -> dict:
        self._assert_not_running(session_id)
        meta = self._load_meta(session_id)
        run_id = self._runtime_start(session_id, "audio_conversion", "audio")
        meta.update(
            {
                "claimed_at": time.time(),
                "phase": "convert",
                "progress": 0,
                "error": "",
                "source_kind": "audio",
                "source_name": "；".join(Path(path).name for path in audio_paths[:2]) + (f" 等 {len(audio_paths)} 个" if len(audio_paths) > 2 else ""),
                "audio_files": [],
                "segments": [],
                "selected": [],
                "reference_file": None,
                "reference_seconds": None,
                "operation": "audio_conversion",
                "run_id": run_id,
            }
        )
        self._save_meta(session_id, meta)
        try:
            self._spawn(session_id, lambda cancel: self._convert_audio_files(session_id, list(audio_paths), cancel))
        except Exception:
            if run_id:
                self._runtime_fail(session_id)
            raise
        return self.session_state(session_id)

    def start_separation(self, session_id: str) -> dict:
        self._assert_not_running(session_id)
        meta = self._load_meta(session_id)
        audio_wav = self._session_dir(session_id) / "work" / "audio_44k.wav"
        if not audio_wav.is_file():
            raise VoiceStudioError("请先上传音频")
        run_id = self._runtime_start(session_id, "separation", meta.get("source_kind"))
        self._update_meta(session_id, {"phase": "queued", "progress": 0, "error": "", "operation": "separation", "run_id": run_id})
        try:
            self._spawn(session_id, lambda cancel: self._run_separation(session_id, audio_wav, cancel))
        except Exception:
            if run_id:
                self._runtime_fail(session_id)
            raise
        return self.session_state(session_id)

    def _spawn(self, session_id: str, target: Callable[[threading.Event], None]) -> None:
        with self._lock:
            if session_id in self._cancel and not self._cancel[session_id].is_set():
                raise VoiceStudioError("该草稿已有任务进行中")
            cancel = threading.Event()
            worker = threading.Thread(
                target=self._guard,
                args=(session_id, cancel, target),
                daemon=True,
                name=f"voice-studio-{session_id}",
            )
            self._cancel[session_id] = cancel
            self._workers[session_id] = worker
        try:
            worker.start()
        except Exception:
            with self._lock:
                self._cancel.pop(session_id, None)
                self._workers.pop(session_id, None)
            raise

    def _guard(self, session_id: str, cancel: threading.Event, target: Callable[[threading.Event], None]) -> None:
        try:
            target(cancel)
            meta = self._load_meta(session_id)
            if cancel.is_set():
                self._update_meta(session_id, {"phase": "cancelled", "error": ""})
                self._runtime_cancel(session_id)
            elif meta.get("phase") in {"audio_ready", "segments"}:
                self._runtime_finish(session_id)
            else:
                self._update_meta(session_id, {"phase": "failed", "error": public_error_message(RuntimeErrorCode.WORKER_FAILED)})
                self._runtime_fail(session_id)
        except Exception:  # noqa: BLE001 - 后台任务兜底，公开错误由 Runtime 统一生成
            if cancel.is_set():
                self._update_meta(session_id, {"phase": "cancelled", "error": ""})
                self._runtime_cancel(session_id)
            else:
                self._update_meta(session_id, {"phase": "failed", "error": public_error_message(RuntimeErrorCode.WORKER_FAILED)})
                self._runtime_fail(session_id)
        finally:
            with self._lock:
                self._cancel.pop(session_id, None)
                if self._workers.get(session_id) is threading.current_thread():
                    self._workers.pop(session_id, None)

    def _update_meta(self, session_id: str, changes: dict) -> None:
        with self._lock:
            meta = self._load_meta(session_id)
            meta.update(changes)
            self._save_meta(session_id, meta)
        if changes.get("phase") is not None or changes.get("progress") is not None:
            self._runtime_progress(meta)

    def _run_video(self, session_id: str, video_path: Path, cancel: threading.Event) -> None:
        session_dir = self._session_dir(session_id)
        ffmpeg = find_ffmpeg(self.project_root)

        def report(phase: str, percent: int) -> None:
            if cancel.is_set():
                raise RuntimeError("任务已取消")
            self._update_meta(session_id, {"phase": phase, "progress": percent})

        result = run_video_to_segments(
            video_path,
            session_dir,
            ffmpeg=ffmpeg,
            separator=self.separator_factory(),
            vad_factory=self.vad_factory,
            on_progress=report,
        )
        self._store_segments(session_id, result)

    def _convert_audio_files(self, session_id: str, audio_paths: list[Path], cancel: threading.Event) -> None:
        session_dir = self._session_dir(session_id)
        ffmpeg = find_ffmpeg(self.project_root)
        work = session_dir / "work"
        work.mkdir(parents=True, exist_ok=True)
        converted: list[Path] = []
        files_meta: list[dict] = []
        for index, audio_path in enumerate(audio_paths):
            if cancel.is_set():
                raise RuntimeError("任务已取消")
            target = work / f"audio_{index + 1}.wav"
            convert_wav(ffmpeg, audio_path, target, 44100, 2)
            files_meta.append({"name": Path(audio_path).name, "seconds": wave_open_duration(target)})
            converted.append(target)
            self._update_meta(session_id, {"phase": "convert", "progress": int(20 + 70 * (index + 1) / len(audio_paths))})
        if not converted:
            raise VoiceStudioError("没有可用的音频文件")
        audio_wav = work / "audio_44k.wav"
        if len(converted) == 1:
            shutil.copy2(converted[0], audio_wav)
        else:
            inputs: list[str] = []
            for path in converted:
                inputs.extend(["-i", str(path)])
            filter_parts = [f"[{i}:a]" for i in range(len(converted))]
            filter_expr = f"{''.join(filter_parts)}concat=n={len(converted)}:v=0:a=1[a]"
            _run_ffmpeg_capture(
                ffmpeg,
                [*inputs, "-filter_complex", filter_expr, "-map", "[a]", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", str(audio_wav)],
            )
        self._update_meta(
            session_id,
            {
                "phase": "audio_ready",
                "progress": 100,
                "audio_files": files_meta,
                "source_duration": wave_open_duration(audio_wav),
            },
        )

    def _run_separation(self, session_id: str, audio_wav: Path, cancel: threading.Event) -> None:
        session_dir = self._session_dir(session_id)
        ffmpeg = find_ffmpeg(self.project_root)

        def report(phase: str, percent: int) -> None:
            if cancel.is_set():
                raise RuntimeError("任务已取消")
            self._update_meta(session_id, {"phase": phase, "progress": percent})

        result = run_audio_to_segments(
            audio_wav,
            session_dir,
            ffmpeg=ffmpeg,
            separator=self.separator_factory(),
            vad_factory=self.vad_factory,
            on_progress=report,
        )
        result["audio_44k"] = audio_wav
        self._store_segments(session_id, result)

    def upload_segments(self, session_id: str, audio_paths: list[Path]) -> dict:
        """Accept user-uploaded clean clips as extra reference segments."""
        session_dir = self._session_dir(session_id)
        ffmpeg = find_ffmpeg(self.project_root)
        segments_dir = session_dir / "segments"
        segments_dir.mkdir(parents=True, exist_ok=True)
        meta = self._load_meta(session_id)
        next_index = max((segment["index"] for segment in meta["segments"]), default=-1) + 1
        added: list[dict] = []
        for offset, audio_path in enumerate(audio_paths):
            target = segments_dir / f"upload_{uuid.uuid4().hex[:8]}.wav"
            converted = segments_dir / f"upload_{uuid.uuid4().hex[:8]}.convert.wav"
            convert_wav(ffmpeg, audio_path, converted, REFERENCE_RATE, 1)
            seconds = wav_seconds(converted)
            if seconds > 30.0:
                _run_ffmpeg_capture(ffmpeg, ["-i", str(converted), "-t", "30", "-c:a", "pcm_s16le", str(target)])
                seconds = 30.0
            else:
                shutil.copy2(converted, target)
            converted.unlink(missing_ok=True)
            added.append(
                {
                    "index": next_index + offset,
                    "seconds": round(seconds, 2),
                    "rms": 0.0,
                    "start_24k": 0,
                    "end_24k": int(REFERENCE_RATE * seconds),
                    "file": target.name,
                    "source": "upload",
                }
            )
        if not added:
            raise VoiceStudioError("没有可用的音频片段")
        meta["segments"] = [*meta["segments"], *added]
        if not meta.get("reference_file"):
            meta["phase"] = "segments"
            meta["progress"] = 100
        self._save_meta(session_id, meta)
        return self.session_state(session_id)

    def delete_segment(self, session_id: str, index: int) -> bool:
        """Remove a user-uploaded segment; auto segments are kept."""
        meta = self._load_meta(session_id)
        item = next((segment for segment in meta["segments"] if segment["index"] == index), None)
        if item is None or item.get("source") != "upload":
            return False
        path = self._session_dir(session_id) / "segments" / item["file"]
        path.unlink(missing_ok=True)
        meta["segments"] = [segment for segment in meta["segments"] if segment["index"] != index]
        meta["selected"] = [value for value in meta["selected"] if value != index]
        self._save_meta(session_id, meta)
        return True

    def _run_audio(self, session_id: str, audio_path: Path, cancel: threading.Event) -> None:
        audio_wav = convert_wav(find_ffmpeg(self.project_root), audio_path, self._session_dir(session_id) / "work" / "audio_44k.wav", 44100, 2)
        self._run_separation(session_id, audio_wav, cancel)

    def _store_segments(self, session_id: str, result: dict) -> None:
        segments = result["segments"]
        if not segments:
            raise ClonePipelineError("未能截取到可用的干净语音片段，请换一段说话更清晰、背景更安静的视频或音频")
        source_duration = wave_open_duration(result["audio_44k"])
        self._update_meta(
            session_id,
            {
                "phase": "segments",
                "progress": 100,
                "segments": segments,
                "selected": [],
                "reference_file": None,
                "reference_seconds": None,
                "source_duration": source_duration,
            },
        )

    # ------------------------------------------------------------------
    # segments / reference
    # ------------------------------------------------------------------

    def segment_path(self, session_id: str, index: int) -> Path | None:
        meta = self._load_meta(session_id)
        item = next((segment for segment in meta["segments"] if segment["index"] == index), None)
        if item is None:
            return None
        path = self._session_dir(session_id) / "segments" / item["file"]
        return path if path.is_file() else None

    def select_segments(self, session_id: str, indices: list[int]) -> dict:
        meta = self._load_meta(session_id)
        if not meta["segments"]:
            raise VoiceStudioError("没有可用片段，请先完成音频处理")
        reference = build_reference_from_segments(
            meta["segments"],
            self._session_dir(session_id) / "segments",
            [int(index) for index in indices],
            self._session_dir(session_id) / "reference.wav",
        )
        seconds = wave_open_duration(reference)
        self._update_meta(
            session_id,
            {
                "selected": [int(index) for index in indices],
                "reference_file": reference.name,
                "reference_seconds": seconds,
                "reference_source": "segments",
                "phase": "reference",
            },
        )
        return self.session_state(session_id)

    def upload_reference(self, session_id: str, audio_path: Path) -> dict:
        """Accept a directly-uploaded clean audio clip as the reference."""
        session_dir = self._session_dir(session_id)
        ffmpeg = find_ffmpeg(self.project_root)
        converted = session_dir / "work" / "reference_upload.wav"
        convert_wav(ffmpeg, audio_path, converted, REFERENCE_RATE, 1)
        seconds = wav_seconds(converted)
        if seconds > 30.0:
            trimmed = session_dir / "reference.wav"
            _run_ffmpeg_capture(ffmpeg, ["-i", str(converted), "-t", "30", "-c:a", "pcm_s16le", str(trimmed)])
            seconds = 30.0
        else:
            trimmed = session_dir / "reference.wav"
            shutil.copy2(converted, trimmed)
        self._update_meta(
            session_id,
            {
                "selected": [],
                "reference_file": trimmed.name,
                "reference_seconds": round(seconds, 1),
                "reference_source": "upload",
                "phase": "reference",
                "progress": 100,
            },
        )
        return self.session_state(session_id)

    def reference_path(self, session_id: str) -> Path | None:
        meta = self._load_meta(session_id)
        if not meta.get("reference_file"):
            return None
        path = self._session_dir(session_id) / meta["reference_file"]
        return path if path.is_file() else None

    # ------------------------------------------------------------------
    # named voices
    # ------------------------------------------------------------------

    def complete_session(self, session_id: str, name: str) -> dict:
        meta = self._load_meta(session_id)
        reference = self.reference_path(session_id)
        if reference is None:
            raise VoiceStudioError("尚未生成参考音色")
        name = name.strip()
        if not name:
            raise VoiceStudioError("请为音色命名")
        voice_id = uuid.uuid4().hex[:12]
        self.voices_root.mkdir(parents=True, exist_ok=True)
        self.meta_dir.mkdir(parents=True, exist_ok=True)
        target = self.voices_root / f"{voice_id}.wav"
        shutil.copy2(reference, target)
        info = {
            "voice_id": voice_id,
            "name": name,
            "created_at": time.time(),
            "duration_seconds": meta.get("reference_seconds"),
            "segment_count": len(meta.get("selected") or []),
            "reference_source": meta.get("reference_source"),
            "session_id": session_id,
        }
        (self.meta_dir / f"{voice_id}.json").write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")
        self._update_meta(session_id, {"phase": "done", "progress": 100, "voice_id": voice_id, "voice_name": name})
        return self.list_voices_by_id(voice_id)

    def list_voices(self) -> list[dict]:
        voices: list[dict] = []
        if not self.meta_dir.is_dir():
            return voices
        for path in sorted(self.meta_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
            try:
                info = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            if (self.voices_root / f"{info.get('voice_id')}.wav").is_file():
                voices.append(info)
        return voices

    def list_voices_by_id(self, voice_id: str) -> dict:
        for voice in self.list_voices():
            if voice["voice_id"] == voice_id:
                return voice
        raise VoiceStudioError("音色不存在")

    def voice_path(self, voice_id: str) -> Path | None:
        if not VOICE_ID_RE.match(voice_id):
            return None
        path = self.voices_root / f"{voice_id}.wav"
        return path if path.is_file() else None

    def delete_voice(self, voice_id: str) -> bool:
        if not VOICE_ID_RE.match(voice_id):
            return False
        deleted = False
        wav = self.voices_root / f"{voice_id}.wav"
        if wav.is_file():
            wav.unlink()
            deleted = True
        meta = self.meta_dir / f"{voice_id}.json"
        if meta.is_file():
            meta.unlink()
            deleted = True
        return deleted


def wave_open_duration(path: Path) -> float:
    import wave

    with wave.open(str(path), "rb") as source:
        return round(source.getnframes() / float(source.getframerate()), 2)


def wav_seconds(path: Path) -> float:
    return wave_open_duration(path)


def _run_ffmpeg_capture(ffmpeg: Path, args: list[str]) -> None:
    import subprocess

    subprocess.run(
        [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", *args],
        check=True,
        capture_output=True,
    )
