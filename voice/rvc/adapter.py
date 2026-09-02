from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Any

from .resources import RVCResourceManager


class RVCError(RuntimeError):
    pass


_AUDIO_EXTENSIONS = frozenset({".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".webm", ".wma", ".aiff", ".aif", ".mp4", ".mkv"})


def _inside(path: Path, roots: list[Path]) -> Path:
    candidate = path.expanduser().resolve()
    for root in roots:
        try:
            candidate.relative_to(root.resolve())
            return candidate
        except ValueError:
            continue
    raise RVCError("路径不在 RVC 受管目录内")


class RVCAdapter:
    engine_id = "rvc"
    display_name = "RVC（本地音色转换）"

    def __init__(self, resources: RVCResourceManager) -> None:
        self.resources = resources

    def status(self) -> dict:
        return self.resources.status()

    def list_models(self) -> list[dict[str, Any]]:
        result = []
        for path in self.resources.model_paths():
            result.append({"id": path.name, "name": path.stem, "path": str(path), "source": "managed" if str(path).startswith(str(self.resources.managed_root)) else "external"})
        return result

    def list_indices(self) -> list[dict[str, str]]:
        return [{"id": p.name, "name": p.name, "path": str(p)} for p in self.resources.index_paths()]

    def model_metadata(self, value: str) -> dict[str, Any]:
        path = self.resolve_model(value)
        try:
            import torch
            try:
                checkpoint = torch.load(path, map_location="cpu", weights_only=False)
            except TypeError:
                checkpoint = torch.load(path, map_location="cpu")
        except Exception as exc:
            raise RVCError(f"无法读取 RVC 模型：{exc}") from exc
        weight = checkpoint.get("weight", {}) if isinstance(checkpoint, dict) else {}
        embedding = weight.get("emb_g.weight") if isinstance(weight, dict) else None
        shape = getattr(embedding, "shape", ())
        if not shape or int(shape[0]) < 1:
            raise RVCError("RVC 模型缺少 weight/emb_g.weight，无法确定 Speaker 范围")
        speaker_count = int(shape[0])
        version = checkpoint.get("version") if isinstance(checkpoint, dict) else None
        sample_rate = checkpoint.get("f0sr") or checkpoint.get("sr") if isinstance(checkpoint, dict) else None
        speaker_info = checkpoint.get("speaker_info") if isinstance(checkpoint, dict) else None
        speakers = []
        # 与原版 RVC infer/cli.py 保持兼容：新模型通常使用
        # [{"id": 0, "name": "..."}]，部分旧模型使用 {"0": "..."}。
        if isinstance(speaker_info, dict):
            speakers = [{"id": int(k), "name": str(v)} for k, v in speaker_info.items()]
        elif isinstance(speaker_info, list):
            for item in speaker_info:
                if isinstance(item, dict) and "id" in item and "name" in item:
                    try:
                        speakers.append({"id": int(item["id"]), "name": str(item["name"])})
                    except (TypeError, ValueError):
                        continue
        speakers = [item for item in speakers if 0 <= item["id"] < speaker_count]
        speakers.sort(key=lambda item: item["id"])
        if not speakers:
            speakers = [{"id": index, "name": f"Speaker {index}"} for index in range(speaker_count)]
        if isinstance(sample_rate, str):
            text = sample_rate.lower().strip()
            sample_rate = int(float(text[:-1]) * 1000) if text.endswith("k") else int(float(text))
        return {"id": path.name, "name": path.stem, "version": version, "sample_rate": int(sample_rate) if sample_rate else None, "f0": bool(checkpoint.get("f0", True)) if isinstance(checkpoint, dict) else True, "speaker_count": speaker_count, "speakers": speakers, "has_index": bool(self.list_indices())}

    def validate_input(self, path: Path) -> Path:
        path = path.resolve()
        if path.suffix.lower() not in _AUDIO_EXTENSIONS:
            raise RVCError("不支持的音频格式")
        if not path.is_file():
            raise RVCError("输入音频不存在")
        return path

    def resolve_model(self, value: str) -> Path:
        if not value:
            raise RVCError("必须选择 RVC 模型")
        candidates = [p for p in self.resources.model_paths() if p.name == Path(value).name or str(p) == value]
        if not candidates:
            raise RVCError("RVC 模型不存在或未被资源管理器发现")
        return _inside(candidates[0], [self.resources.source_root, self.resources.managed_root, self.resources.external_model_root])

    def resolve_index(self, value: str | None) -> Path | None:
        if not value:
            return None
        candidates = [p for p in self.resources.index_paths() if p.name == Path(value).name or str(p) == value]
        if not candidates:
            raise RVCError("Index 文件不存在或未被资源管理器发现")
        return _inside(candidates[0], [self.resources.source_root, self.resources.managed_root, self.resources.external_model_root])

    def command(self, input_path: Path, output_path: Path, model: str, index: str | None = None, speaker_id: int = 0, pitch: int = 0, f0_method: str = "rmvpe", index_rate: float = 0.75, resample_sr: int = 0, rms_mix_rate: float = 1.0, protect: float = 0.33) -> list[str]:
        if speaker_id < 0: raise RVCError("Speaker ID 不能小于 0")
        if f0_method not in {"pm", "rmvpe"}: raise RVCError("不支持的 F0 算法")
        if not -24 <= pitch <= 24: raise RVCError("音高必须在 -24 到 24 之间")
        if not 0 <= index_rate <= 1 or not 0 <= rms_mix_rate <= 1 or not 0 <= protect <= .5: raise RVCError("RVC 参数范围无效")
        model_path = self.resolve_model(model)
        index_path = self.resolve_index(index)
        python = self.resources.python_path()
        if not python.is_file():
            raise RVCError("RVC 独立 Python 运行时未准备，不能回退到 YUMENO 主环境")
        cli = self.resources.runner_path
        if not cli.is_file():
            raise RVCError("RVC 受管 runner 未准备，请先在提供商配置中完成安装")
        output_path = _inside(output_path, [self.resources.project_root / "data" / "voice" / "rvc", self.resources.managed_root])
        args = [str(python), str(cli), "--model", str(model_path), "--input", str(self.validate_input(input_path)), "--output", str(output_path), "--speaker-id", str(speaker_id), "--pitch", str(pitch), "--f0-method", f0_method, "--index-rate", str(index_rate), "--rms-mix-rate", str(rms_mix_rate), "--protect", str(protect), "--format", "wav", "--overwrite"]
        if index_path: args += ["--index", str(index_path)]
        if resample_sr:
            if resample_sr < 16000: raise RVCError("重采样率必须为 0 或不低于 16000")
            args += ["--resample-sr", str(resample_sr)]
        return args


    def environment(self) -> dict[str, str]:
        env = os.environ.copy()
        env["PYTHONUNBUFFERED"] = "1"
        # RVC 的推理核心会调用 ffmpeg-python/系统 ffmpeg。YUMENO 自带
        # 的 ffmpeg 不依赖全局 PATH，避免用户机器上未安装 ffmpeg 时失败。
        ffmpeg_dir = self.resources.project_root / "runtime" / "ffmpeg"
        if ffmpeg_dir.is_dir():
            env["PATH"] = str(ffmpeg_dir) + os.pathsep + env.get("PATH", "")
        env["YUMENO_RVC_DEVICE"] = os.getenv("YUMENO_RVC_DEVICE", "cuda")
        # CUDA Graph 会为 HubERT 建立长期 private pool；在 8 GiB 级显卡上，
        # 处理较长音频时容易把可用显存吃光。RVC 仍默认使用 CUDA，
        # 但关闭 Graph 以优先保证稳定完成；可由高级用户显式覆盖。
        env["RVC_CUDA_GRAPH"] = os.getenv("RVC_CUDA_GRAPH", "0")
        env.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")
        env["weight_root"] = str(self.resources.managed_assets("weights") if self.resources.managed_assets("weights").is_dir() else self.resources.source_root / "assets" / "weights")
        env["index_root"] = str(self.resources.source_root / "logs")
        env["outside_index_root"] = str(self.resources.managed_assets("indices") if self.resources.managed_assets("indices").is_dir() else self.resources.source_root / "assets" / "indices")
        env["YUMENO_RVC_SOURCE_DIR"] = str(self.resources.source_root)
        env["YUMENO_RVC_CORE_DIR"] = str(self.resources.core_root)
        hubert = self.resources.hubert_dir()
        if hubert:
            env["YUMENO_RVC_HUBERT_DIR"] = str(hubert)
        rmvpe = self.resources.rmvpe_dir()
        if rmvpe:
            env["rmvpe_root"] = str(rmvpe)
        return env

    def convert(self, **kwargs) -> Path:
        command = self.command(**kwargs)
        output_path = Path(kwargs["output_path"]).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        env = self.environment()
        result = subprocess.run(command, cwd=self.resources.source_root, env=env, capture_output=True, text=True, timeout=kwargs.get("timeout", 1800))
        if result.returncode != 0:
            raise RVCError((result.stderr or result.stdout or "RVC 推理失败")[-4000:])
        if not output_path.is_file(): raise RVCError("RVC 未生成输出音频")
        return output_path
