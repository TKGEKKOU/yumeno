from __future__ import annotations

import hashlib
import json
import mimetypes
import re
import shutil
import subprocess
import wave
from pathlib import Path
from uuid import uuid4

from app.models import ConversationAttachment

ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".md", ".docx", ".xlsx", ".pptx", ".csv", ".json",
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".wav", ".mp3", ".m4a", ".flac", ".ogg", ".opus", ".aac",
    ".mp4", ".mkv", ".webm", ".mov", ".avi",
}
MAX_ATTACHMENT_BYTES = 512 * 1024 * 1024

_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".opus", ".aac"}
_VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".mov", ".avi"}
_DOCUMENT_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".xlsx", ".pptx", ".csv", ".json"}


def safe_name(name: str) -> str:
    base = Path(name or "attachment").name
    base = re.sub(r"[\x00-\x1f\\/:*?\"<>|]", "_", base).strip(" .")
    return (base or "attachment")[:255]


def kind_for(name: str, mime: str) -> str:
    ext = Path(name).suffix.lower()
    if mime.startswith("image/") or ext in _IMAGE_EXTENSIONS:
        return "image"
    if mime.startswith("audio/") or ext in _AUDIO_EXTENSIONS:
        return "audio"
    if mime.startswith("video/") or ext in _VIDEO_EXTENSIONS:
        return "video"
    if ext in _DOCUMENT_EXTENSIONS:
        return "document"
    return "file"


def _signature_kind(data: bytes, suffix: str) -> str | None:
    head = data[:64]
    if head.startswith(b"MZ") or head.startswith(b"\x7fELF"):
        return "executable"
    if head.startswith(b"%PDF-"):
        return "document"
    if head.startswith(b"\x89PNG\r\n\x1a\n") or head.startswith((b"GIF87a", b"GIF89a")) or head.startswith(b"\xff\xd8\xff"):
        return "image"
    if head.startswith(b"RIFF") and head[8:12] == b"WAVE":
        return "audio"
    if head.startswith(b"RIFF") and head[8:12] == b"AVI ":
        return "video"
    if head.startswith(b"fLaC") or head.startswith(b"OggS") or head.startswith(b"ID3"):
        return "audio"
    if head.startswith(b"\x1aE\xdf\xa3"):
        return "video"
    if len(head) >= 12 and head[4:8] == b"ftyp":
        return "audio" if suffix == ".m4a" else "video"
    if head.startswith(b"PK\x03\x04") and suffix in {".docx", ".xlsx", ".pptx"}:
        return "document"
    return None


def validate_attachment_content(name: str, data: bytes) -> None:
    suffix = Path(name).suffix.lower()
    detected = _signature_kind(data, suffix)
    expected = kind_for(name, "")
    if detected == "executable":
        raise ValueError("文件内容是可执行程序，不能作为附件上传")
    if detected and detected != expected:
        raise ValueError(f"文件内容与扩展名不匹配：期望 {expected}，检测为 {detected}")


def attachment_root(project_root: Path, conversation_id: str) -> Path:
    digest = hashlib.sha256(conversation_id.encode("utf-8")).hexdigest()[:32]
    root = project_root / "data" / "attachments" / digest
    root.mkdir(parents=True, exist_ok=True)
    return root


def _ffprobe_path(project_root: Path) -> str | None:
    managed = Path(project_root) / "runtime" / "ffmpeg" / ("ffprobe.exe" if __import__("os").name == "nt" else "ffprobe")
    if managed.is_file():
        return str(managed)
    return shutil.which("ffprobe")


def probe_attachment_metadata(project_root: Path, path: Path, kind: str) -> dict[str, float | int | None]:
    metadata: dict[str, float | int | None] = {"duration": None, "width": None, "height": None}
    if kind == "audio" and path.suffix.lower() == ".wav":
        try:
            with wave.open(str(path), "rb") as audio:
                rate = audio.getframerate()
                metadata["duration"] = audio.getnframes() / rate if rate else None
        except (wave.Error, OSError):
            pass
    if kind == "image":
        try:
            from PIL import Image
            with Image.open(path) as image:
                metadata["width"], metadata["height"] = image.size
        except Exception:
            pass
    probe = _ffprobe_path(project_root) if kind in {"audio", "video"} else None
    if probe and (metadata["duration"] is None or kind == "video"):
        try:
            completed = subprocess.run(
                [probe, "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", str(path)],
                capture_output=True, text=True, timeout=8, check=True,
            )
            payload = json.loads(completed.stdout or "{}")
            duration = (payload.get("format") or {}).get("duration")
            if duration is not None:
                metadata["duration"] = float(duration)
            video_stream = next((stream for stream in payload.get("streams", []) if stream.get("codec_type") == "video"), None)
            if video_stream:
                metadata["width"] = int(video_stream.get("width") or 0) or None
                metadata["height"] = int(video_stream.get("height") or 0) or None
        except (OSError, subprocess.SubprocessError, ValueError, TypeError, json.JSONDecodeError):
            pass
    return metadata


def resolve_attachment(session, project_root: Path, conversation_id: str, file_id: str, *, workspace_id: str | None = None) -> ConversationAttachment:
    item = session.get(ConversationAttachment, file_id)
    if (not item or item.conversation_id != conversation_id or item.status != "ready"
            or (workspace_id is not None and item.workspace_id != workspace_id)):
        raise FileNotFoundError(file_id)
    path = Path(item.storage_path).resolve()
    try:
        path.relative_to(attachment_root(project_root, conversation_id).resolve())
    except ValueError as exc:
        raise FileNotFoundError(file_id) from exc
    if not path.is_file():
        raise FileNotFoundError(file_id)
    return item


def public_attachment(item: ConversationAttachment, base_url: str = "") -> dict:
    return {
        "file_id": item.id, "name": item.name, "mime_type": item.mime_type,
        "kind": item.kind, "size": item.size, "duration": item.duration,
        "width": item.width, "height": item.height, "status": item.status,
        "source": item.source, "metadata": item.metadata_json or {},
        "created_at": item.created_at, "updated_at": item.updated_at,
        "url": f"{base_url}/api/conversations/{item.conversation_id}/attachments/{item.id}",
    }


def _new_item(*, file_id: str, workspace_id: str, conversation_id: str, name: str, mime_type: str, size: int, path: Path, source: str, metadata: dict | None, project_root: Path) -> ConversationAttachment:
    attachment_kind = kind_for(name, mime_type)
    media = probe_attachment_metadata(project_root, path, attachment_kind)
    return ConversationAttachment(
        id=file_id, workspace_id=workspace_id, conversation_id=conversation_id,
        name=name, mime_type=mime_type, kind=attachment_kind, size=size,
        duration=media["duration"], width=media["width"], height=media["height"],
        storage_path=str(path), source=source, metadata_json=dict(metadata or {}),
    )


def create_attachment(session, project_root: Path, conversation_id: str, filename: str, mime_type: str, data: bytes, *, workspace_id: str, source: str = "chat") -> ConversationAttachment:
    if not data:
        raise ValueError("文件为空")
    if len(data) > MAX_ATTACHMENT_BYTES:
        raise ValueError("文件超过 512 MB 限制")
    name = safe_name(filename)
    suffix = Path(name).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("不支持的文件格式")
    validate_attachment_content(name, data)
    file_id = str(uuid4())
    root = attachment_root(project_root, conversation_id)
    path = root / f"{file_id}{suffix}"
    path.write_bytes(data)
    detected_mime = mimetypes.guess_type(name)[0] or mime_type or "application/octet-stream"
    item = _new_item(
        file_id=file_id, workspace_id=workspace_id, conversation_id=conversation_id,
        name=name, mime_type=detected_mime, size=len(data), path=path, source=source,
        metadata=None, project_root=project_root,
    )
    session.add(item)
    session.flush()
    return item


def create_attachment_from_path(
    session,
    project_root: Path,
    conversation_id: str,
    source_path: Path,
    *,
    workspace_id: str,
    filename: str | None = None,
    mime_type: str = "",
    source: str = "generated",
    metadata: dict | None = None,
) -> ConversationAttachment:
    source_path = Path(source_path).resolve()
    if not source_path.is_file():
        raise ValueError("生成文件不存在")
    size = source_path.stat().st_size
    if size <= 0:
        raise ValueError("生成文件为空")
    if size > MAX_ATTACHMENT_BYTES:
        raise ValueError("文件超过 512 MB 限制")
    name = safe_name(filename or source_path.name)
    suffix = Path(name).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("不支持的文件格式")
    with source_path.open("rb") as stream:
        validate_attachment_content(name, stream.read(64))
    file_id = str(uuid4())
    root = attachment_root(project_root, conversation_id)
    target = root / f"{file_id}{suffix}"
    temporary = root / f".{file_id}.tmp"
    try:
        shutil.copyfile(source_path, temporary)
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)
    detected_mime = mime_type or mimetypes.guess_type(name)[0] or "application/octet-stream"
    item = _new_item(
        file_id=file_id, workspace_id=workspace_id, conversation_id=conversation_id,
        name=name, mime_type=detected_mime, size=size, path=target, source=source,
        metadata=metadata, project_root=project_root,
    )
    session.add(item)
    session.flush()
    return item


def delete_attachment(session, project_root: Path, item: ConversationAttachment) -> None:
    path = Path(item.storage_path)
    session.delete(item)
    session.flush()
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
