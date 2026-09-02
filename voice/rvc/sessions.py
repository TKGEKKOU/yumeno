from __future__ import annotations

import json
import shutil
import threading
import time
import uuid
from pathlib import Path
from typing import Callable

from voice.clone_pipeline import ClonePipelineError, convert_wav, extract_audio, find_ffmpeg
from .audio_ops import AudioOperationError, trim_audio

SESSION_ID_RE = __import__("re").compile(r"^[A-Za-z0-9_-]{1,64}$")


class RVCSessionError(RuntimeError):
    pass


class RVCSessionManager:
    """Managed input-preparation sessions for the standalone RVC producer."""

    def __init__(self, project_root: Path, separator_factory: Callable[[], object]):
        self.project_root = Path(project_root)
        self.root = self.project_root / "data" / "voice" / "rvc" / "sessions"
        self.root.mkdir(parents=True, exist_ok=True)
        self.separator_factory = separator_factory
        self._lock = threading.RLock()
        self._workers: dict[str, threading.Thread] = {}
        self._cancel_events: dict[str, threading.Event] = {}

    def _dir(self, session_id: str) -> Path:
        if not SESSION_ID_RE.match(session_id):
            raise RVCSessionError("无效的 RVC 会话 ID")
        return self.root / session_id

    def _meta_path(self, session_id: str) -> Path:
        return self._dir(session_id) / "meta.json"

    def _load(self, session_id: str) -> dict:
        path = self._meta_path(session_id)
        if not path.is_file():
            raise RVCSessionError("RVC 会话不存在或已过期")
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            raise RVCSessionError("RVC 会话数据损坏") from exc

    def _save(self, session_id: str, meta: dict) -> dict:
        meta["updated_at"] = time.time()
        path = self._meta_path(session_id)
        # 轮询线程可能与后台 FFmpeg/分离线程同时读写 meta.json。
        # 直接 write_text 会先截断文件，读者会偶发得到空 JSON，表现为
        # 进度卡住或“处理失败”。使用同目录临时文件 + 原子替换，保证
        # session 状态始终是完整 JSON。
        temp = path.with_suffix(".json.tmp")
        payload = json.dumps(meta, ensure_ascii=False, indent=2)
        temp.write_text(payload, encoding="utf-8")
        temp.replace(path)
        return meta

    @staticmethod
    def _file(path: Path, *, selected=False, kind=None) -> dict:
        # 持久化绝对路径，避免分离器或旧会话写入相对路径后无法安全回读。
        resolved = Path(path).resolve()
        return {"file_id": resolved.name, "name": resolved.name, "path": str(resolved), "kind": kind, "selected_for_rvc": selected}

    def create(self) -> dict:
        sid = uuid.uuid4().hex[:12]
        directory = self._dir(sid)
        (directory / "uploads").mkdir(parents=True)
        (directory / "work").mkdir()
        now = time.time()
        meta = {"session_id": sid, "phase": "idle", "progress": 0, "message": "", "error": "", "source": None,
                "normalized_wav": None, "vocals": None, "instrumental": None, "derived_files": [], "selected_input": None,
                "created_at": now, "updated_at": now}
        return self._save(sid, meta)

    def state(self, session_id: str) -> dict:
        return dict(self._load(session_id))

    def _cancelled(self, session_id: str) -> bool:
        event = self._cancel_events.get(session_id)
        return bool(event and event.is_set())

    def cancel(self, session_id: str) -> dict:
        """请求停止提取/标准化/分离线程，并把会话置为终态。"""
        with self._lock:
            self._load(session_id)
            event = self._cancel_events.setdefault(session_id, threading.Event())
            event.set()
            meta = self._load(session_id)
            meta.update({"phase": "cancelled", "progress": 0, "message": "任务已中止", "error": ""})
            return self._save(session_id, meta)

    def upload_source(self, session_id: str, filename: str, payload: bytes) -> dict:
        meta = self._load(session_id)
        suffix = Path(filename).suffix.lower()
        if not suffix:
            raise RVCSessionError("素材必须包含扩展名")
        target = self._dir(session_id) / "uploads" / f"source{suffix}"
        target.write_bytes(payload)
        meta.update({"source": self._file(target, kind="video" if suffix in {".mp4", ".mkv", ".webm", ".mov", ".avi"} else "audio"), "phase": "uploaded", "error": ""})
        return self._save(session_id, meta)

    def _run(self, session_id: str, operation: str, fn) -> None:
        try:
            self._update(session_id, {"phase": operation, "progress": 5, "error": ""})
            if self._cancelled(session_id):
                return
            fn()
            if self._cancelled(session_id):
                return
        except Exception as exc:
            if self._cancelled(session_id) or str(exc) == "任务已中止":
                self._update(session_id, {"phase": "cancelled", "progress": 0, "message": "任务已中止", "error": ""})
            else:
                self._update(session_id, {
                    "phase": "failed",
                    "progress": 0,
                    "message": "音频处理失败",
                    "error": str(exc),
                })
        finally:
            with self._lock:
                self._workers.pop(session_id, None)
                self._cancel_events.pop(session_id, None)

    def _update(self, session_id: str, changes: dict) -> dict:
        with self._lock:
            meta = self._load(session_id)
            meta.update(changes)
            return self._save(session_id, meta)

    def start_extract(self, session_id: str, then_separate: bool = False) -> dict:
        meta = self._load(session_id)
        if not meta.get("source"):
            raise RVCSessionError("请先上传音频或视频")
        with self._lock:
            if session_id in self._workers and self._workers[session_id].is_alive():
                raise RVCSessionError("当前会话已有任务进行中")
            self._cancel_events[session_id] = threading.Event()
            # 在线程启动前先落盘真实运行阶段，避免返回 uploaded/0% 让前端误判未启动。
            self._update(session_id, {
                "phase": "extracting" if meta.get("source", {}).get("kind") == "video" else "normalizing",
                "progress": 1,
                "message": "已提交音频准备任务，等待处理线程启动",
                "error": "",
            })
            def work():
                source = Path(meta["source"]["path"])
                target = self._dir(session_id) / "work" / "normalized.wav"
                ffmpeg = find_ffmpeg(self.project_root)
                self._update(session_id, {
                    "phase": "extracting" if meta["source"]["kind"] == "video" else "normalizing",
                    "progress": 15,
                    "message": "正在读取上传素材",
                })
                if meta["source"]["kind"] == "video":
                    self._update(session_id, {
                        "phase": "extracting",
                        "progress": 35,
                        "message": "正在从视频提取音轨",
                    })
                    extract_audio(ffmpeg, source, target)
                    if self._cancelled(session_id): return
                else:
                    self._update(session_id, {
                        "phase": "normalizing",
                        "progress": 35,
                        "message": "正在检查并标准化音频",
                    })
                    convert_wav(ffmpeg, source, target, 44100, 2)
                    if self._cancelled(session_id): return
                result = self._file(target, selected=True, kind="normalized_wav")
                self._update(session_id, {
                    "phase": "ready",
                    "progress": 100,
                    "message": "音频已准备，请点击“处理音频”继续" if not then_separate else "音频已准备，正在分离人声",
                    "normalized_wav": result,
                    "selected_input": result["file_id"],
                    "vocals": None,
                    "instrumental": None,
                })
                # 对话页确认处理是一个原子工作流：标准化完成后在同一
                # 受管线程中继续分离，避免异步 prepare 尚未完成时过早
                # 调用 separate 导致会话停在 uploaded/0%。
                if then_separate and not self._cancelled(session_id):
                    self._separate(session_id)
            thread = threading.Thread(target=self._run, args=(session_id, "extracting", work), daemon=True, name=f"rvc-extract-{session_id}")
            self._workers[session_id] = thread
            thread.start()
        return self.state(session_id)

    def _finish_separation(self, session_id: str, vocals: Path, instrumental: Path) -> dict:
        # 分离器返回的路径最终仍由 file_path/_managed_file_path 做受管校验。
        meta = self._load(session_id)
        vocals_meta = self._file(vocals, selected=True, kind="vocals")
        instrumental_meta = self._file(instrumental, selected=False, kind="instrumental")
        return self._update(session_id, {
            "phase": "separated",
            "progress": 100,
            "message": "Vocal 已识别，可进行下一步",
            "vocals": vocals_meta,
            "instrumental": instrumental_meta,
            "selected_input": vocals_meta["file_id"],
        })

    def _separate(self, session_id: str) -> dict:
        meta = self._load(session_id)
        normalized = Path(meta["normalized_wav"]["path"])
        work = self._dir(session_id) / "work"
        ffmpeg = find_ffmpeg(self.project_root)
        vocals = work / "vocals.wav"
        instrumental = work / "instrumental.wav"
        separator = self.separator_factory()
        last_percent = -1
        last_write = 0.0

        def report_progress(current: int, total: int) -> None:
            nonlocal last_percent, last_write
            if self._cancelled(session_id):
                raise RVCSessionError("任务已中止")
            total = max(int(total), 1)
            current = max(0, min(int(current), total))
            percent = 10 + int((current / total) * 82)
            now = time.monotonic()
            if percent == 92 or percent - last_percent >= 2 or now - last_write >= 0.5:
                last_percent = percent
                last_write = now
                self._update(session_id, {
                    "phase": "separating",
                    "progress": percent,
                    "message": f"正在分离音频片段 {current}/{total}",
                })

        self._update(session_id, {
            "phase": "separating",
            "progress": 10,
            "message": "正在加载人声分离模型",
        })
        if hasattr(separator, "separate_stems"):
            separator.separate_stems(normalized, vocals, instrumental, progress=report_progress)
        else:
            separator.separate(normalized, vocals)
            # Compatibility fallback for older separators: retain the normalized mix.
            shutil.copy2(normalized, instrumental)
        return self._finish_separation(session_id, vocals, instrumental)

    def start_separation(self, session_id: str) -> dict:
        meta = self._load(session_id)
        if not meta.get("normalized_wav"):
            raise RVCSessionError("请先完成音频标准化")
        # 已经有完整分离结果时不要重复启动分离线程；重复提交会覆盖同名
        # vocals/instrumental，前端也可能在竞态期间收到空卡片。
        if meta.get("vocals") and meta.get("instrumental"):
            try:
                if self._managed_file_path(session_id, meta["vocals"]).is_file() and self._managed_file_path(session_id, meta["instrumental"]).is_file():
                    return self.state(session_id)
            except RVCSessionError:
                pass
        with self._lock:
            if session_id in self._workers and self._workers[session_id].is_alive():
                raise RVCSessionError("当前会话已有任务进行中")
            self._cancel_events[session_id] = threading.Event()
            self._update(session_id, {"phase": "separating", "progress": 5, "message": "正在准备人声分离"})
            thread = threading.Thread(target=self._run, args=(session_id, "separating", lambda: self._separate(session_id)), daemon=True, name=f"rvc-separate-{session_id}")
            self._workers[session_id] = thread
            thread.start()
        return self.state(session_id)

    def _managed_file_path(self, session_id: str, item: dict) -> Path:
        raw_path = Path(item["path"])
        # 兼容早期会话中仅保存文件名的记录；文件仍只能从该会话 work 目录解析。
        path = (self._dir(session_id) / "work" / raw_path.name if not raw_path.is_absolute() else raw_path).resolve()
        try:
            path.relative_to(self._dir(session_id).resolve())
        except ValueError as exc:
            raise RVCSessionError("文件路径不在 RVC 会话目录内") from exc
        if not path.is_file():
            raise RVCSessionError("文件尚未生成")
        return path

    def _all_files(self, meta: dict) -> list[dict]:
        files = []
        for key in ("source", "normalized_wav", "vocals", "instrumental"):
            item = meta.get(key)
            if item:
                files.append(item)
        files.extend(meta.get("derived_files") or [])
        return files

    def _find_file(self, session_id: str, file_id: str) -> dict:
        meta = self._load(session_id)
        for item in self._all_files(meta):
            if item.get("file_id") == file_id:
                return item
        raise RVCSessionError("文件不属于该 RVC 会话")

    def input_path(self, session_id: str, file_id: str) -> Path:
        item = self._find_file(session_id, file_id)
        if item.get("kind") == "instrumental":
            raise RVCSessionError("背景音 / 伴奏不能作为 RVC 推理输入")
        if item.get("kind") not in {"normalized_wav", "vocals", "trimmed_normalized_wav", "trimmed_vocals"}:
            raise RVCSessionError("只能使用标准 WAV 或分离后的人声进行 RVC 推理")
        return self._managed_file_path(session_id, item)

    def file_path(self, session_id: str, file_id: str) -> Path:
        return self._managed_file_path(session_id, self._find_file(session_id, file_id))

    def trim_file(self, session_id: str, file_id: str, start: float, end: float, *, volume_percent: float = 100, replace_current: bool = False) -> dict:
        item = self._find_file(session_id, file_id)
        if item.get("kind") == "source":
            raise RVCSessionError("请先将源素材转换为 WAV")
        source = self._managed_file_path(session_id, item)
        output = self._dir(session_id) / "work" / f"{source.stem}-trim-{uuid.uuid4().hex[:8]}.wav"
        try:
            trim_audio(self.project_root, source, output, start, end, self._dir(session_id), volume_percent=volume_percent)
        except AudioOperationError as exc:
            raise RVCSessionError(str(exc)) from exc
        kind = str(item.get("kind") or "audio")
        if kind in {"normalized_wav", "trimmed_normalized_wav"}:
            derived_kind = "trimmed_normalized_wav"
        elif kind in {"vocals", "trimmed_vocals"}:
            derived_kind = "trimmed_vocals"
        elif kind in {"instrumental", "trimmed_instrumental"}:
            derived_kind = "trimmed_instrumental"
        else:
            derived_kind = "trimmed_audio"
        result = self._file(output, selected=derived_kind == "trimmed_vocals", kind=derived_kind)
        result.update({"parent_file_id": file_id, "trim_start": float(start), "trim_end": float(end), "duration": float(end) - float(start), "volume_percent": float(volume_percent)})
        meta = self._load(session_id)
        if replace_current and kind in {"normalized_wav", "trimmed_normalized_wav"}:
            # 只清理“当前标准化音频”及其派生结果；绝不遍历删除整个会话目录，
            # 这样用户上传的原始素材和新生成文件不会被误删。
            stale_items = []
            for key in ("normalized_wav", "vocals", "instrumental"):
                old = meta.get(key)
                # normalized_wav 就是本次裁剪的源文件时，也要清理旧版本；
                # 只有新输出本身不能被加入待清理列表。
                if old and old.get("path") != str(output.resolve()):
                    stale_items.append(old)
            stale_items.extend(meta.get("derived_files") or [])

            # 新文件已经完成写入和校验，之后才切换会话指针。
            result["kind"] = "normalized_wav"
            result["selected_for_rvc"] = True
            meta["normalized_wav"] = result
            meta["selected_input"] = result["file_id"]
            meta["vocals"] = None
            meta["instrumental"] = None
            meta["selected_input_trim"] = None
            meta["derived_files"] = []
            meta["phase"] = "ready"
            meta["progress"] = 100
            meta["message"] = "已更新当前音频，下一步将基于此版本进行人声分离。"
            saved = self._save(session_id, meta)

            warnings = []
            for old in stale_items:
                try:
                    old_path = self._managed_file_path(session_id, old)
                    if old_path.resolve() != output.resolve():
                        old_path.unlink(missing_ok=True)
                except (RVCSessionError, OSError) as exc:
                    warnings.append(str(exc))
            waveforms = self._dir(session_id) / "waveforms"
            if waveforms.is_dir():
                for old_wave in waveforms.glob("*"):
                    try:
                        old_wave.unlink(missing_ok=True)
                    except OSError as exc:
                        warnings.append(str(exc))
            if warnings:
                saved["cleanup_warning"] = "；".join(warnings[:3])
                return self._save(session_id, saved)
            return saved
        meta.setdefault("derived_files", []).append(result)
        if derived_kind == "trimmed_vocals":
            for old in self._all_files(meta):
                old["selected_for_rvc"] = False
            meta["selected_input"] = result["file_id"]
            meta["selected_input_trim"] = {"start": float(start), "end": float(end), "source_file_id": file_id}
        return self._save(session_id, meta)
