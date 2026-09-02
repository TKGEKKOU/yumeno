from __future__ import annotations

import shutil
import re
import copy
import subprocess
import sys

from pathlib import Path
from fastapi import APIRouter, File, Header, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, Field, ValidationError
from fastapi.responses import FileResponse
from voice.rvc.sessions import RVCSessionError
from voice.rvc.audio_ops import normalize_audio

from app.routers.settings import require_local
from app.attachments import resolve_attachment

router = APIRouter(prefix="/api/voice/rvc", tags=["voice-rvc"])
provider_router = APIRouter(prefix="/api/providers/rvc", tags=["provider-rvc"])



audio_resource_router = APIRouter(prefix="/api/providers/resources", tags=["audio-resources"])

@audio_resource_router.get("/ffmpeg/status")
def ffmpeg_status(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return request.app.state.ffmpeg_resources.status()

@audio_resource_router.post("/ffmpeg/install", status_code=status.HTTP_202_ACCEPTED)
def ffmpeg_install(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return request.app.state.ffmpeg_resources.install()

@audio_resource_router.delete("/ffmpeg")
def ffmpeg_remove(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return request.app.state.ffmpeg_resources.remove()

@audio_resource_router.get("/ffmpeg/directory")
def ffmpeg_directory(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return request.app.state.ffmpeg_resources.directory()

AUDIO_EXTENSIONS = frozenset({".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".webm", ".wma", ".aiff", ".aif", ".mp4", ".mkv"})
MAX_AUDIO_BYTES = 200 * 1024 * 1024


class RVCConvertRequest(BaseModel):
    session_id: str | None = None
    input_file_id: str | None = None
    model_id: str = ""
    index_id: str | None = None
    speaker_id: int = Field(default=0, ge=0)
    pitch: int = Field(default=0, ge=-24, le=24)
    f0_method: str = "rmvpe"
    index_rate: float = Field(default=0.75, ge=0, le=1)
    protect: float = Field(default=0.33, ge=0, le=0.5)
    resample_sr: int = Field(default=0, ge=0)
    rms_mix_rate: float = Field(default=1.0, ge=0, le=1)
    mix_instrumental: bool = False


def _form_value(form, name: str, default=None):
    value = form.get(name, default)
    return default if value in {None, ""} else value


def _validate_conversion(adapter, payload: RVCConvertRequest) -> None:
    adapter.resolve_model(payload.model_id)
    metadata = adapter.model_metadata(payload.model_id)
    speaker_count = int(metadata.get("speaker_count") or 0)
    if speaker_count < 1:
        raise ValueError("RVC 模型没有可用的 Speaker")
    if payload.speaker_id >= speaker_count:
        raise ValueError(f"Speaker ID 超出模型范围，应为 0 到 {speaker_count - 1}")
    if payload.index_rate > 0 and not payload.index_id:
        raise ValueError("Index 比例大于 0 时必须选择有效的 Index 文件")
    if payload.index_id:
        adapter.resolve_index(payload.index_id)


def guard(request: Request, header: str) -> None:
    require_local(request)
    if header != "web":
        raise HTTPException(status_code=403, detail="Missing same-origin request header")


def file_guard(request: Request) -> None:
    """校验受管音频文件的本地访问，不要求浏览器无法附带的自定义 Header。

    文件 ID 仍会在 session manager 中严格解析并限制在对应会话目录内；
    这里仅放宽 GET 文件响应，确保 <audio> 和 <a download> 能正常工作。
    """
    require_local(request)


def manager(request: Request): return request.app.state.rvc_resources

def tasks(request: Request): return request.app.state.rvc_tasks

@provider_router.get("/status")
def provider_status(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return manager(request).status()

@provider_router.post("/install", status_code=status.HTTP_202_ACCEPTED)
def provider_install(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return manager(request).start_install()

@provider_router.delete("/install/cancel", status_code=status.HTTP_202_ACCEPTED)
def provider_install_cancel(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return manager(request).cancel_install()

@provider_router.delete("/install")
def provider_install_remove(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    if manager(request)._state.get("installing"): raise HTTPException(status_code=409, detail="请先取消安装")
    # 仅删除 YUMENO 自己创建的运行时/目录，不触碰外部源码或用户模型。
    shutil.rmtree(manager(request).runtime_root, ignore_errors=True)
    return manager(request).status()

@provider_router.get("/directory")
def provider_directory(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return {"source_root": str(manager(request).source_root), "managed_root": str(manager(request).managed_root), "runtime_root": str(manager(request).runtime_root), "weights_dir": str(manager(request).weights_dir), "indices_dir": str(manager(request).indices_dir)}


@provider_router.post("/open-model-directory")
def open_model_directory(request: Request, x_yumeno_request: str = Header(default="")):
    """打开已配置的 RVC 音色目录；不接受前端任意路径。"""
    guard(request, x_yumeno_request)
    resource = manager(request)
    candidates = [resource.external_model_root, resource.weights_dir]
    directory = next((Path(path).resolve() for path in candidates if Path(path).is_dir()), None)
    if directory is None:
        directory = Path(resource.weights_dir).resolve()
        directory.mkdir(parents=True, exist_ok=True)
    if sys.platform == "win32":
        try:
            subprocess.Popen(["explorer.exe", str(directory)], close_fds=True)
        except OSError as exc:
            raise HTTPException(status_code=500, detail=f"打开音色目录失败：{exc}") from exc
    return {"directory": str(directory), "opened": sys.platform == "win32"}


@provider_router.post("/models/import", status_code=status.HTTP_201_CREATED)
async def import_models(
    request: Request,
    files: list[UploadFile] = File(...),
    x_yumeno_request: str = Header(default=""),
):
    """导入用户已有的 RVC .pth/.index，不虚构或自动下载第三方音色模型。

    RVC 官方项目将用户音色模型放在 assets/weights、assets/indices；
    YUMENO 复制到自己的受管目录后再参与枚举，删除运行时不会触碰源目录。
    """
    guard(request, x_yumeno_request)
    resource = manager(request)
    resource.weights_dir.mkdir(parents=True, exist_ok=True)
    resource.indices_dir.mkdir(parents=True, exist_ok=True)
    imported = []
    limits = {".pth": 4 * 1024 * 1024 * 1024, ".index": 2 * 1024 * 1024 * 1024}
    for upload in files:
        name = Path(upload.filename or "").name
        suffix = Path(name).suffix.lower()
        if not name or name in {".", ".."} or not re.fullmatch(r"[^\\/:*?\"<>|]+", name):
            raise HTTPException(status_code=422, detail="模型文件名无效")
        if suffix not in limits:
            raise HTTPException(status_code=415, detail="只支持 .pth 音色模型和 .index 索引文件")
        target_root = resource.weights_dir if suffix == ".pth" else resource.indices_dir
        target = (target_root / name).resolve()
        try:
            target.relative_to(target_root.resolve())
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="模型路径无效") from exc
        temp = target.with_suffix(target.suffix + ".uploading")
        total = 0
        try:
            with temp.open("wb") as output:
                while True:
                    chunk = await upload.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > limits[suffix]:
                        raise HTTPException(status_code=413, detail=f"{name} 超过导入大小限制")
                    output.write(chunk)
            temp.replace(target)
        except HTTPException:
            temp.unlink(missing_ok=True)
            raise
        except OSError as exc:
            temp.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"保存 {name} 失败：{exc}") from exc
        finally:
            await upload.close()
        imported.append({"name": name, "kind": "model" if suffix == ".pth" else "index", "path": str(target), "size": total})
    return {"imported": imported, "models": request.app.state.rvc_adapter.list_models(), "indices": request.app.state.rvc_adapter.list_indices()}

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_session(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    return request.app.state.rvc_sessions.create()


@router.post("/sessions/{session_id}/source", status_code=status.HTTP_202_ACCEPTED)
async def upload_session_source(session_id: str, request: Request, file: UploadFile = File(...), x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in AUDIO_EXTENSIONS:
        raise HTTPException(status_code=415, detail="不支持的音频或视频格式")
    payload = await file.read(MAX_AUDIO_BYTES + 1)
    if len(payload) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="文件过大")
    try:
        return request.app.state.rvc_sessions.upload_source(session_id, file.filename or "source", payload)
    except RVCSessionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/sessions/{session_id}/attachment", status_code=status.HTTP_202_ACCEPTED)
async def attach_conversation_attachment(session_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    """将当前会话附件登记为 RVC source，避免浏览器再次上传同一文件。"""
    guard(request, x_yumeno_request)
    form = await request.form()
    attachment_id = str(form.get("attachment_id") or "").strip()
    conversation_id = str(form.get("conversation_id") or "").strip()
    if not attachment_id or not conversation_id:
        raise HTTPException(status_code=422, detail="attachment_id 和 conversation_id 必填")
    try:
        with request.app.state.session_factory() as db:
            item = resolve_attachment(db, request.app.state.rvc_sessions.project_root, conversation_id, attachment_id)
            payload = Path(item.storage_path).read_bytes()
        return request.app.state.rvc_sessions.upload_source(session_id, item.name, payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="附件不存在或不属于当前对话") from exc
    except RVCSessionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@router.delete("/sessions/{session_id}", status_code=status.HTTP_202_ACCEPTED)
def cancel_session(session_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        return request.app.state.rvc_sessions.cancel(session_id)
    except RVCSessionError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/sessions/{session_id}/extract", status_code=status.HTTP_202_ACCEPTED)
def extract_session(session_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        return request.app.state.rvc_sessions.start_extract(session_id)
    except RVCSessionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/sessions/{session_id}/separate", status_code=status.HTTP_202_ACCEPTED)
def separate_session(session_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        return request.app.state.rvc_sessions.start_separation(session_id)
    except RVCSessionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/sessions/{session_id}")
def session_status(session_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        return request.app.state.rvc_sessions.state(session_id)
    except RVCSessionError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/sessions/{session_id}/files/{file_id}/waveform")
def session_waveform(session_id: str, file_id: str, request: Request):
    file_guard(request)
    from voice.rvc.audio_ops import waveform
    try:
        source = request.app.state.rvc_sessions.file_path(session_id, file_id)
        root = request.app.state.rvc_sessions._dir(session_id)
        output = root / "waveforms" / f"{file_id}.png"
        return FileResponse(waveform(request.app.state.rvc_sessions.project_root, source, output, root), media_type="image/png")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@router.post("/sessions/{session_id}/files/{file_id}/trim")
async def trim_session_file(session_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        body = await request.json()
        return request.app.state.rvc_sessions.trim_file(session_id, file_id, body.get("start"), body.get("end"), volume_percent=body.get("volume_percent", 100), replace_current=bool(body.get("replace_current", False)))
    except (RVCSessionError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@router.get("/sessions/{session_id}/files/{file_id}")
def session_file(session_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    file_guard(request)
    try:
        path = request.app.state.rvc_sessions.file_path(session_id, file_id)
    except RVCSessionError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(path, media_type="audio/wav", filename=path.name)

@router.get("/status")
def rvc_status(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return manager(request).status()

@router.get("/models/{model_id}/metadata")
def model_metadata(model_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        return request.app.state.rvc_adapter.model_metadata(model_id)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/models")
def models(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request); return {"models": request.app.state.rvc_adapter.list_models(), "indices": request.app.state.rvc_adapter.list_indices()}

@router.post("/convert", status_code=status.HTTP_202_ACCEPTED)
async def convert(request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    if not request.app.state.rvc_resources.status()["ready"]:
        raise HTTPException(status_code=409, detail="RVC 资源尚未就绪")

    input_path: Path | None = None
    cleanup_upload = False
    try:
        content_type = request.headers.get("content-type", "").lower()
        if content_type.startswith("application/json"):
            payload = RVCConvertRequest.model_validate(await request.json())
            if not payload.session_id or not payload.input_file_id:
                raise ValueError("必须提供 RVC 会话和受管输入文件")
            input_path = request.app.state.rvc_sessions.input_path(payload.session_id, payload.input_file_id)
        else:
            form = await request.form()
            file = form.get("file")
            if file is None or not hasattr(file, "read"):
                raise ValueError("必须上传输入音频")
            filename = getattr(file, "filename", "") or "input.wav"
            suffix = Path(filename).suffix.lower()
            if suffix not in AUDIO_EXTENSIONS:
                raise HTTPException(status_code=415, detail="不支持的音频格式")
            raw = await file.read(MAX_AUDIO_BYTES + 1)
            if len(raw) > MAX_AUDIO_BYTES:
                raise HTTPException(status_code=413, detail="文件过大")
            payload = RVCConvertRequest.model_validate({
                "model_id": _form_value(form, "model", ""),
                "index_id": _form_value(form, "index"),
                "speaker_id": _form_value(form, "speaker_id", 0),
                "pitch": _form_value(form, "pitch", 0),
                "f0_method": _form_value(form, "f0_method", "rmvpe"),
                "index_rate": _form_value(form, "index_rate", 0.75),
                "protect": _form_value(form, "protect", 0.33),
                "resample_sr": _form_value(form, "resample_sr", 0),
                "rms_mix_rate": _form_value(form, "rms_mix_rate", 1.0),
                "mix_instrumental": _form_value(form, "mix_instrumental", False),
            })
            upload_dir = request.app.state.rvc_tasks.tasks_root / "uploads"
            upload_dir.mkdir(parents=True, exist_ok=True)
            input_path = upload_dir / f"upload_{__import__('uuid').uuid4().hex}{suffix}"
            input_path.write_bytes(raw)
            cleanup_upload = True

        _validate_conversion(request.app.state.rvc_adapter, payload)
        options = dict(model=payload.model_id, index=payload.index_id, speaker_id=payload.speaker_id,
                       pitch=payload.pitch, f0_method=payload.f0_method, index_rate=payload.index_rate,
                       resample_sr=payload.resample_sr, rms_mix_rate=payload.rms_mix_rate, protect=payload.protect,
                       mix_instrumental=payload.mix_instrumental)
        if payload.session_id and payload.mix_instrumental:
            session_meta = request.app.state.rvc_sessions.state(payload.session_id)
            instrumental = session_meta.get("instrumental") or {}
            if instrumental:
                options["instrumental_path"] = str(request.app.state.rvc_sessions.file_path(payload.session_id, instrumental["file_id"]))
            trim_info = session_meta.get("selected_input_trim")
            if trim_info:
                options["instrumental_trim"] = trim_info
        if payload.session_id:
            options.update({"owner_session_id": payload.session_id})
        task_id = tasks(request).start(input_path, **options)
        public_task = tasks(request).public_get(task_id) or {}
        return {"task_id": task_id, "status_url": f"/api/voice/rvc/tasks/{task_id}", "result_refs": public_task.get("result_refs", []), "workflow": public_task.get("workflow")}
    except HTTPException:
        if cleanup_upload and input_path is not None:
            input_path.unlink(missing_ok=True)
        raise
    except (ValidationError, RVCSessionError, ValueError, RuntimeError) as exc:
        if cleanup_upload and input_path is not None:
            input_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@router.get("/tasks/{task_id}")
def task_status(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    record = tasks(request).public_get(task_id)
    if not record: raise HTTPException(status_code=404, detail="RVC task not found")
    if record.get("state") == "succeeded": record["output_url"] = f"/api/voice/rvc/tasks/{task_id}/output"
    return record

@router.delete("/tasks/{task_id}", status_code=status.HTTP_202_ACCEPTED)
def cancel_task(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    if not tasks(request).cancel(task_id): raise HTTPException(status_code=404, detail="RVC task not running")
    return tasks(request).get(task_id)

@router.get("/output/{task_id}")
def output_by_task(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    return output(task_id, request, x_yumeno_request)

@router.get("/tasks/{task_id}/files/{file_id}")
def task_file(task_id: str, file_id: str, request: Request):
    file_guard(request)
    try:
        path = tasks(request).safe_output_path(task_id, file_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(path, media_type="audio/wav", filename=path.name)

@router.get("/tasks/{task_id}/files/{file_id}/waveform")
def task_waveform(task_id: str, file_id: str, request: Request):
    file_guard(request)
    try: return FileResponse(tasks(request).waveform_path(task_id, file_id), media_type="image/png")
    except Exception as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.post("/tasks/{task_id}/files/{file_id}/trim")
async def trim_task_file(task_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    try:
        body = await request.json()
        return tasks(request).trim_output(task_id, file_id, body.get("start"), body.get("end"), volume_percent=body.get("volume_percent", 100))
    except Exception as exc: raise HTTPException(status_code=422, detail=str(exc)) from exc

@router.post("/tasks/{task_id}/mix", status_code=status.HTTP_202_ACCEPTED)
async def mix_task(task_id: str, request: Request, background: UploadFile | None = File(default=None), x_yumeno_request: str = Header(default="")):
    guard(request, x_yumeno_request)
    record = tasks(request).get(task_id)
    if not record: raise HTTPException(status_code=404, detail="RVC task not found")
    instrumental = None
    if background is not None:
        suffix = Path(background.filename or "").suffix.lower()
        if suffix not in AUDIO_EXTENSIONS: raise HTTPException(status_code=415, detail="不支持的背景音格式")
        raw = await background.read(MAX_AUDIO_BYTES + 1)
        if len(raw) > MAX_AUDIO_BYTES: raise HTTPException(status_code=413, detail="背景音文件过大")
        task_dir = tasks(request).tasks_root / task_id
        raw_path = task_dir / f"background-upload-{__import__('uuid').uuid4().hex[:8]}{suffix}"
        raw_path.write_bytes(raw)
        # 先标准化为受管 WAV，避免自定义背景音以压缩格式直接进入混音，
        # 也让它与默认 Instrumental 走同一条 FFmpeg 音频边界。
        instrumental = task_dir / "background-normalized.wav"
        try:
            normalize_audio(request.app.state.rvc_tasks.project_root, raw_path, instrumental, task_dir)
        except Exception as exc:
            raw_path.unlink(missing_ok=True)
            instrumental.unlink(missing_ok=True)
            raise HTTPException(status_code=422, detail=f"背景音标准化失败：{exc}") from exc
        raw_path.unlink(missing_ok=True)
    else:
        options = record.get("options", {})
        if options.get("instrumental_path"): instrumental = Path(options["instrumental_path"])
    if instrumental is None: raise HTTPException(status_code=422, detail="没有可用的 Instrumental")
    result = tasks(request).mix(task_id, instrumental)
    if result is None: raise HTTPException(status_code=409, detail="任务尚未完成")
    return result

@router.get("/tasks/{task_id}/output")
def output(task_id: str, request: Request, x_yumeno_request: str = Header(default="")):
    file_guard(request)
    try:
        path = tasks(request).safe_output_path(task_id, "rvc_vocal")
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(path, media_type="audio/wav", filename=f"rvc-{task_id}.wav")




