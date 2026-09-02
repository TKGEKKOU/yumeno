from __future__ import annotations

import subprocess
import uuid
from pathlib import Path

from voice.clone_pipeline import ClonePipelineError, find_ffmpeg


class AudioOperationError(RuntimeError):
    pass


def _safe_output(output: Path, root: Path) -> Path:
    output = Path(output).resolve()
    root = Path(root).resolve()
    try:
        output.relative_to(root)
    except ValueError as exc:
        raise AudioOperationError("输出文件必须位于受管目录内") from exc
    output.parent.mkdir(parents=True, exist_ok=True)
    return output


def _run(ffmpeg: Path, args: list[str]) -> None:
    command = [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", *args]
    try:
        subprocess.run(command, check=True, capture_output=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", b"")
        if isinstance(detail, bytes):
            detail = detail.decode("utf-8", errors="replace")
        raise AudioOperationError(f"FFmpeg 音频处理失败：{str(detail).strip()[-500:]}") from exc


def trim_audio(project_root: Path, source: Path, output: Path, start: float, end: float, root: Path, *, volume_percent: float = 100) -> Path:
    start = float(start)
    end = float(end)
    volume_percent = float(volume_percent)
    if start < 0 or end <= start:
        raise AudioOperationError("裁剪结束时间必须大于开始时间，且开始时间不能小于 0")
    if not 0 <= volume_percent <= 200:
        raise AudioOperationError("音量必须在 0% 到 200% 之间")
    output = _safe_output(output, root)
    if Path(source).resolve() == output:
        raise AudioOperationError("裁剪不能覆盖原始文件")
    ffmpeg = find_ffmpeg(Path(project_root))
    filters = [f"volume={volume_percent / 100:.4f}"]
    if volume_percent > 100:
        filters.append("alimiter=limit=0.95:level=disabled")
    _run(ffmpeg, ["-ss", f"{start:.3f}", "-i", str(Path(source).resolve()), "-t", f"{end - start:.3f}", "-vn", "-af", ",".join(filters), "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", str(output)])
    if not output.is_file() or output.stat().st_size <= 44:
        raise AudioOperationError("裁剪没有生成有效的 WAV 文件")
    return output


def normalize_audio(project_root: Path, source: Path, output: Path, root: Path) -> Path:
    output = _safe_output(output, root)
    ffmpeg = find_ffmpeg(Path(project_root))
    _run(ffmpeg, ["-i", str(Path(source).resolve()), "-vn", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", str(output)])
    if not output.is_file() or output.stat().st_size <= 44:
        raise AudioOperationError("背景音标准化失败")
    return output


def mix_audio(project_root: Path, vocal: Path, instrumental: Path, output: Path, root: Path, *, instrumental_start: float = 0.0, instrumental_duration: float | None = None) -> Path:
    output = _safe_output(output, root)
    if Path(vocal).resolve() == output or Path(instrumental).resolve() == output:
        raise AudioOperationError("混合输出不能覆盖输入文件")
    ffmpeg = find_ffmpeg(Path(project_root))
    bg_filters = []
    if instrumental_start > 0:
        bg_filters.append(f"atrim=start={float(instrumental_start):.3f}")
    if instrumental_duration is not None and instrumental_duration > 0:
        bg_filters.append(f"atrim=duration={float(instrumental_duration):.3f}")
    bg_filters.extend(["apad", "asetpts=N/SR/TB"])
    bg = ",".join(bg_filters)
    filter_complex = f"[1:a]{bg}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95:level=disabled[out]"
    _run(ffmpeg, ["-i", str(Path(vocal).resolve()), "-i", str(Path(instrumental).resolve()), "-filter_complex", filter_complex, "-map", "[out]", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", str(output)])
    if not output.is_file() or output.stat().st_size <= 44:
        raise AudioOperationError("没有生成有效的混合音频")
    return output


def waveform(project_root: Path, source: Path, output: Path, root: Path) -> Path:
    source = Path(source).resolve()
    output = _safe_output(output, root)
    if not source.is_file():
        raise AudioOperationError("音频文件尚未准备好，暂时无法生成波形")
    # 波形是派生缓存：已有完整缓存直接复用，避免页面刷新/重试时并发覆盖同一 PNG。
    if output.is_file() and output.stat().st_size > 0 and output.stat().st_mtime >= source.stat().st_mtime:
        return output
    ffmpeg = find_ffmpeg(Path(project_root))
    temporary = output.with_name(output.name + ".generating")
    temporary.unlink(missing_ok=True)
    try:
        _run(ffmpeg, ["-i", str(source), "-filter_complex", "aformat=channel_layouts=mono,showwavespic=s=1400x180:colors=0x39c5bb", "-frames:v", "1", "-f", "image2", str(temporary)])
        if not temporary.is_file() or temporary.stat().st_size <= 0:
            raise AudioOperationError("波形生成失败")
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    return output


def derived_name(source: Path, suffix: str) -> str:
    return f"{Path(source).stem}-{suffix}-{uuid.uuid4().hex[:8]}.wav"
