from __future__ import annotations

import copy
import queue
import shutil
import subprocess
import threading
import time
import uuid
from pathlib import Path
from typing import Any

from .adapter import RVCAdapter, RVCError
from .audio_ops import AudioOperationError, mix_audio, normalize_audio, trim_audio, waveform
from agents.workflows import workflow_from_task


class RVCTaskManager:
    """Thread-backed task boundary compatible with a future TaskOrchestrator worker."""

    def __init__(self, project_root: Path, adapter: RVCAdapter, timeout_seconds: int = 1800) -> None:
        self.project_root = Path(project_root).resolve()
        self.adapter = adapter
        self.timeout_seconds = timeout_seconds
        self.tasks_root = self.project_root / "data" / "voice" / "rvc" / "tasks"
        self._tasks: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()

    def start(self, input_path: Path, **options) -> str:
        task_id = uuid.uuid4().hex[:12]
        task_dir = self.tasks_root / task_id
        task_dir.mkdir(parents=True, exist_ok=True)
        output_path = task_dir / "output.wav"
        now = time.time()
        record = {
            "task_id": task_id,
            "engine": "rvc",
            "state": "running",
            "phase": "queued",
            "progress": 0,
            "message": "任务已排队，等待启动",
            "error": "",
            "input_path": str(input_path),
            "output_path": str(output_path),
            "created_at": now,
            "started_at": None,
            "updated_at": now,
            "elapsed_seconds": 0,
            "cancel_event": threading.Event(),
            "process": None,
            "options": dict(options),
            "outputs": {},
            "result_refs": [],
            "owner_workspace_id": options.get("owner_workspace_id"),
            "owner_conversation_id": options.get("owner_conversation_id"),
            "owner_session_id": options.get("owner_session_id"),
        }
        record["workflow"] = workflow_from_task("rvc_worker", record, status="running", phase="queued", progress=0)
        with self._lock: self._tasks[task_id] = record
        threading.Thread(target=self._run, args=(record,), daemon=True, name=f"rvc-{task_id}").start()
        return task_id

    def _update_record(self, record: dict[str, Any], **changes: Any) -> None:
        with self._lock:
            record.update(changes)
            # Workflow 是任务的公开视图；只从受控阶段和公开字段生成，不能带出路径。
            record["workflow"] = workflow_from_task(
                "rvc_worker", record, status=record.get("state", "running"),
                phase=record.get("phase"), progress=record.get("progress", 0),
            )
            now = time.time()
            record["updated_at"] = now
            started_at = record.get("started_at")
            if started_at:
                record["elapsed_seconds"] = round(max(0.0, now - started_at), 1)

    def _owner_matches(self, record: dict[str, Any], *, workspace_id: str | None = None,
                       conversation_id: str | None = None, session_id: str | None = None) -> bool:
        for key, value in (("owner_workspace_id", workspace_id), ("owner_conversation_id", conversation_id), ("owner_session_id", session_id)):
            expected = record.get(key)
            if value is not None and (expected is None or str(expected) != str(value)):
                return False
        return True

    def get_for_owner(self, task_id: str, *, workspace_id: str | None = None,
                      conversation_id: str | None = None, session_id: str | None = None) -> dict[str, Any] | None:
        with self._lock:
            record = self._tasks.get(task_id)
            if not record or not self._owner_matches(record, workspace_id=workspace_id, conversation_id=conversation_id, session_id=session_id):
                return None
            result = {k: v for k, v in record.items() if k not in {"cancel_event", "process", "input_path", "output_path", "owner_workspace_id", "owner_conversation_id", "owner_session_id"}}
            return result

    def owner_matches(self, task_id: str, *, workspace_id: str | None = None,
                      conversation_id: str | None = None, session_id: str | None = None) -> bool:
        with self._lock:
            record = self._tasks.get(task_id)
            return bool(record and self._owner_matches(record, workspace_id=workspace_id, conversation_id=conversation_id, session_id=session_id))

    def safe_output_path(self, task_id: str, file_id: str = "rvc_vocal") -> Path:
        if not file_id or Path(file_id).name != file_id or file_id in {".", ".."}:
            raise RVCError("无效的 RVC 输出文件 ID")
        with self._lock:
            record = self._tasks.get(task_id)
            item = (record or {}).get("outputs", {}).get(file_id)
        if not item or not item.get("path"):
            raise RVCError("输出文件不存在")
        path = Path(item["path"]).resolve()
        try:
            path.relative_to(self.tasks_root.resolve() / task_id)
        except ValueError as exc:
            raise RVCError("RVC 输出路径不在受管任务目录内") from exc
        if not path.is_file():
            raise RVCError("RVC 输出文件不存在")
        return path

    def public_get(self, task_id: str) -> dict[str, Any] | None:
        result = self.get(task_id)
        if result is None:
            return None
        # 深拷贝后再脱敏，不能修改任务内存中的 outputs/path；否则后续下载会失效。
        result = copy.deepcopy(result)
        for key in ("input_path", "output_path", "owner_workspace_id", "owner_conversation_id", "owner_session_id"):
            result.pop(key, None)
        for item in (result.get("outputs") or {}).values():
            if isinstance(item, dict):
                item.pop("path", None)
        return result

    def get(self, task_id: str) -> dict[str, Any] | None:
        with self._lock:
            r = self._tasks.get(task_id)
            if not r: return None
            result = {k: v for k, v in r.items() if k not in {"cancel_event", "process"}}
            return result

    def cancel(self, task_id: str) -> bool:
        with self._lock: record = self._tasks.get(task_id)
        if not record or record["state"] != "running": return False
        record["cancel_event"].set()
        process = record.get("process")
        if process is not None and process.poll() is None:
            process.kill()
        self._update_record(record, phase="cancelling", message="正在终止 RVC 推理进程")
        return True

    def cleanup(self, task_id: str) -> bool:
        with self._lock: record = self._tasks.pop(task_id, None)
        if not record: return False
        shutil.rmtree(Path(record["output_path"]).parent, ignore_errors=True)
        return True

    def _task_dir(self, record: dict[str, Any]) -> Path:
        return self.tasks_root / record["task_id"]

    def _perform_mix(self, record: dict[str, Any], instrumental: Path, *, phase_start: int = 0) -> dict:
        vocal = Path(record["output_path"])
        output = self._task_dir(record) / "mixed.wav"
        self._update_record(record, phase="normalizing_instrumental", progress=max(phase_start, 93), message="正在准备 Instrumental")
        if not instrumental.is_file():
            raise RVCError("Instrumental 文件不存在")
        # 无论默认伴奏还是用户上传文件，都先落成受管 WAV，避免不同编码器/采样率
        # 让 amix 在最后阶段才失败；输入不被覆盖。
        normalized = self._task_dir(record) / "instrumental-normalized.wav"
        try:
            normalize_audio(self.project_root, instrumental, normalized, self._task_dir(record))
            instrumental = normalized
            self._update_record(record, phase="mixing", progress=max(phase_start + 2, 95), message="正在合并变声人声与 Instrumental")
            mix_audio(self.project_root, vocal, instrumental, output, self._task_dir(record))
        except AudioOperationError as exc:
            raise RVCError(str(exc)) from exc
        item = {"file_id": "mixed", "kind": "mixed", "name": output.name, "path": str(output), "url": f"/api/voice/rvc/tasks/{record['task_id']}/files/mixed"}
        self._update_record(record, outputs={**record.get("outputs", {}), "mixed": item}, result_refs=sorted(set(record.get("result_refs", [])) | {"mixed"}), phase="encoding_mix", progress=99, message="正在写入混合音频")
        return item

    def mix(self, task_id: str, instrumental_path: Path) -> dict | None:
        with self._lock:
            record = self._tasks.get(task_id)
        if not record or record.get("state") != "succeeded":
            return None
        def work():
            try:
                self._perform_mix(record, Path(instrumental_path))
                self._update_record(record, message="混合音频已生成")
            except Exception as exc:
                self._update_record(record, error=str(exc), message="混合失败")
        threading.Thread(target=work, daemon=True, name=f"rvc-mix-{task_id}").start()
        return self.get(task_id)

    def trim_output(self, task_id: str, file_id: str, start: float, end: float, *, volume_percent: float = 100) -> dict:
        with self._lock:
            record = self._tasks.get(task_id)
        if not record:
            raise RVCError("RVC task not found")
        item = (record.get("outputs") or {}).get(file_id)
        if not item:
            raise RVCError("输出文件不存在")
        source = self.safe_output_path(task_id, file_id)
        output = self._task_dir(record) / f"{source.stem}-trim-{uuid.uuid4().hex[:8]}.wav"
        try:
            trim_audio(self.project_root, source, output, start, end, self._task_dir(record), volume_percent=volume_percent)
        except AudioOperationError as exc:
            raise RVCError(str(exc)) from exc
        new_id = f"{file_id}-trim-{uuid.uuid4().hex[:8]}"
        derived = {"file_id": new_id, "kind": "trimmed_" + item.get("kind", "audio"), "name": output.name, "path": str(output), "parent_file_id": file_id, "trim_start": float(start), "trim_end": float(end), "volume_percent": float(volume_percent), "url": f"/api/voice/rvc/tasks/{task_id}/files/{new_id}"}
        self._update_record(record, outputs={**record.get("outputs", {}), new_id: derived})
        return derived

    def output_item(self, task_id: str, file_id: str = "rvc_vocal") -> dict | None:
        with self._lock:
            record = self._tasks.get(task_id)
            item = (record or {}).get("outputs", {}).get(file_id)
        if not item:
            return None
        # 输出记录可保留内部路径供任务线程使用，但访问边界由统一白名单校验。
        self.safe_output_path(task_id, file_id)
        return item

    def waveform_path(self, task_id: str, file_id: str) -> Path:
        item = self.output_item(task_id, file_id)
        if not item:
            raise RVCError("输出文件不存在")
        output = self._task_dir(self._tasks[task_id]) / "waveforms" / f"{file_id}.png"
        try:
            return waveform(self.project_root, Path(item["path"]), output, self._task_dir(self._tasks[task_id]))
        except AudioOperationError as exc:
            raise RVCError(str(exc)) from exc

    def _run(self, record: dict[str, Any]) -> None:
        try:
            self._update_record(
                record,
                started_at=time.time(),
                phase="preparing",
                progress=10,
                message="正在准备输入音频和模型",
            )
            options = {k: v for k, v in record["options"].items() if k not in {"mix_instrumental", "instrumental_path", "instrumental_trim", "owner_workspace_id", "owner_conversation_id", "owner_session_id"}}
            command = self.adapter.command(
                input_path=Path(record["input_path"]),
                output_path=Path(record["output_path"]),
                **options,
            )
            self._update_record(
                record,
                phase="loading_model",
                progress=25,
                message="正在加载 RVC 模型和 Index",
            )
            # 必须持续消费 stdout：RVC/torch 输出较多时，若等进程结束后才 communicate，
            # 子进程可能因管道缓冲区写满而永久阻塞，页面表现为“卡住”。
            process = subprocess.Popen(
                command,
                cwd=self.adapter.resources.source_root,
                env=self.adapter.environment(),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )
            record["process"] = process
            output_lines: queue.Queue[str] = queue.Queue()

            def read_output() -> None:
                if process.stdout is None:
                    return
                for line in process.stdout:
                    output_lines.put(line)

            reader = threading.Thread(
                target=read_output,
                daemon=True,
                name=f"rvc-log-{record['task_id']}",
            )
            reader.start()
            self._update_record(
                record,
                phase="extracting_features",
                progress=40,
                message="正在提取音高与音频特征",
            )
            started = time.monotonic()
            while process.poll() is None:
                while True:
                    try:
                        record.setdefault("log_lines", []).append(output_lines.get_nowait())
                    except queue.Empty:
                        break
                if record["cancel_event"].is_set():
                    process.kill()
                    process.wait(timeout=10)
                    raise RuntimeError("任务已取消")
                elapsed = time.monotonic() - started
                if elapsed > self.timeout_seconds:
                    process.kill()
                    process.wait(timeout=10)
                    raise TimeoutError(f"RVC 推理超过 {self.timeout_seconds} 秒")
                # 原版 CLI 不提供单文件的可靠百分比，只在转换阶段做缓慢的
                # 阶段型反馈，避免把估算值伪装成精确进度。
                self._update_record(
                    record,
                    phase="converting",
                    progress=min(88, 45 + int(elapsed / max(self.timeout_seconds, 1) * 43)),
                    message="正在进行音色转换；耗时取决于音频时长和显卡负载",
                )
                time.sleep(0.2)
            reader.join(timeout=5)
            while True:
                try:
                    record.setdefault("log_lines", []).append(output_lines.get_nowait())
                except queue.Empty:
                    break
            record["log"] = "".join(record.pop("log_lines", []))[-4000:]
            if process.returncode != 0:
                detail = record.get("log", "").strip()[-1200:]
                raise RVCError(f"RVC 推理进程失败：{detail or '请检查独立运行时与模型资源'}")
            output = Path(record["output_path"])
            if not output.is_file():
                raise RVCError("RVC 未生成输出音频")
            self._update_record(
                record,
                phase="encoding_output",
                progress=92,
                message="正在校验并写入 WAV 文件",
            )
            # 保持任务边界兼容轻量测试/模拟 CLI；真实页面仍通过 WAV 响应提供输出。
            if output.stat().st_size <= 0:
                raise RVCError("RVC 输出音频为空或文件损坏")
            self._update_record(record, outputs={"rvc_vocal": {"file_id": "rvc_vocal", "kind": "rvc_vocal", "name": output.name, "path": str(output), "url": f"/api/voice/rvc/tasks/{record['task_id']}/files/rvc_vocal"}}, result_refs=["rvc_vocal"])
            instrumental = record.get("options", {}).get("instrumental_path")
            if record.get("options", {}).get("mix_instrumental") and instrumental:
                trim_info = record.get("options", {}).get("instrumental_trim") or {}
                if trim_info:
                    synced = self._task_dir(record) / "instrumental-synced.wav"
                    self._update_record(record, phase="trimming", progress=93, message="正在对齐 Instrumental 时间区间")
                    trim_audio(self.project_root, Path(instrumental), synced, trim_info.get("start", 0), trim_info.get("end"), self._task_dir(record))
                    instrumental = synced
                self._perform_mix(record, Path(instrumental), phase_start=93)
            self._update_record(
                record,
                state="succeeded",
                phase="done",
                progress=100,
                message="变声音频已生成",
                output_file=str(output),
            )
        except Exception as exc:
            if record["cancel_event"].is_set() or str(exc) == "任务已取消":
                self._update_record(
                    record, state="cancelled", phase="cancelled", progress=0, message="任务已取消", error=""
                )
            else:
                self._update_record(
                    record, state="failed", phase="failed", progress=max(0, min(99, int(record.get("progress", 0)))), message="RVC 处理失败", error=str(exc)
                )

        finally:
            record["process"] = None
            input_path = Path(record["input_path"])
            if input_path.parent == self.tasks_root / "uploads":
                input_path.unlink(missing_ok=True)


