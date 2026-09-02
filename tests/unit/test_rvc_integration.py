from pathlib import Path
import sys

import pytest

from providers import ProviderType, get_provider_metadata, runtime_support
from voice.rvc.adapter import RVCAdapter, RVCError
from voice.rvc.resources import RVCResourceManager
from voice.rvc.tasks import RVCTaskManager


def make_source(tmp_path: Path) -> Path:
    source = tmp_path / "rvc-source"
    (source / "infer").mkdir(parents=True)
    (source / "assets" / "weights").mkdir(parents=True)
    (source / "assets" / "weights" / "voice.pth").write_bytes(b"model")
    (source / "infer" / "cli.py").write_text("# fake cli", encoding="utf-8")
    return source


def test_rvc_provider_is_local_and_runtime_supported():
    metadata = get_provider_metadata(ProviderType.VOICE_CONVERSION, "rvc")
    assert metadata is not None
    assert metadata.mode == "local"
    assert metadata.resource_kind == "rvc"
    assert runtime_support(ProviderType.VOICE_CONVERSION, "rvc")[0] is True


def test_resource_manager_discovers_external_models(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    status = manager.status()
    assert status["source_configured"] is True
    assert status["model_count"] == 1
    assert status["ready"] is False  # isolated venv has not been provisioned


def test_adapter_rejects_unmanaged_model_and_path(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    adapter = RVCAdapter(manager)
    with pytest.raises(RVCError):
        adapter.resolve_model("..\\secret.pth")
    with pytest.raises(RVCError):
        adapter.command(tmp_path / "voice.wav", tmp_path / "outside.wav", "voice.pth")


def test_task_manager_runs_and_reports_a_structured_result(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    adapter = RVCAdapter(manager)
    output_root = tmp_path / "data" / "voice" / "rvc" / "tasks"

    def fake_command(**kwargs):
        script = "from pathlib import Path; Path(r'%s').write_bytes(b'RIFFfake')" % kwargs["output_path"]
        return [sys.executable, "-c", script]

    adapter.command = fake_command  # type: ignore[method-assign]
    input_path = tmp_path / "voice.wav"
    input_path.write_bytes(b"audio")
    tasks = RVCTaskManager(tmp_path, adapter, timeout_seconds=5)
    task_id = tasks.start(input_path, model="voice.pth")
    import time
    for _ in range(50):
        record = tasks.get(task_id)
        if record and record["state"] != "running":
            break
        time.sleep(.05)
    record = tasks.get(task_id)
    assert record["state"] == "succeeded"
    assert Path(record["output_path"]).is_file()


def test_requirements_file_prefers_explicit_device_and_available_variant(tmp_path, monkeypatch):
    source = make_source(tmp_path)
    cpu = source / "requirments_cpu_py312.txt"
    cu = source / "requirments_cu128_py312.txt"
    cpu.write_text("cpu", encoding="utf-8")
    cu.write_text("cuda", encoding="utf-8")
    manager = RVCResourceManager(tmp_path, source)
    monkeypatch.setenv("YUMENO_RVC_DEVICE", "cuda")
    assert manager.requirements_file() == cu
    monkeypatch.setenv("YUMENO_RVC_DEVICE", "cpu")
    assert manager.requirements_file() == cpu


def test_status_exposes_install_components_without_claiming_ready(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    status = manager.status()
    assert status["components"]["source"]["ready"] is True
    assert status["components"]["runtime"]["ready"] is False
    assert status["components"]["hubert"]["ready"] is False
    assert status["components"]["rmvpe"]["ready"] is False
    assert status["components"]["voice_models"]["count"] == 1


def test_command_passes_speaker_id_for_multispeaker_model(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    manager.python_path = lambda: Path(sys.executable)  # type: ignore[method-assign]
    manager.runner_path.parent.mkdir(parents=True, exist_ok=True)
    manager.runner_path.write_text("# runner", encoding="utf-8")
    adapter = RVCAdapter(manager)
    model = manager.model_paths()[0]
    (tmp_path / "voice.wav").write_bytes(b"RIFF")
    # Metadata is supplied by the real model loader only in production; the CLI
    # argument itself must remain explicit and structured.
    command = adapter.command(tmp_path / "voice.wav", tmp_path / "data" / "voice" / "rvc" / "out.wav", model.name, speaker_id=3)
    assert "--speaker-id" in command
    assert command[command.index("--speaker-id") + 1] == "3"





def test_model_metadata_rejects_checkpoint_without_speaker_embedding(tmp_path, monkeypatch):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    adapter = RVCAdapter(manager)
    monkeypatch.setattr("torch.load", lambda *args, **kwargs: {"weight": {}, "version": "v2", "sr": 48000})

    with pytest.raises(RVCError, match="emb_g.weight"):
        adapter.model_metadata("voice.pth")


def test_status_does_not_claim_runtime_ready_when_dependencies_were_not_verified(tmp_path):
    source = make_source(tmp_path)
    manager = RVCResourceManager(tmp_path, source)
    manager.python_path().parent.mkdir(parents=True, exist_ok=True)
    manager.python_path().write_bytes(b"python")
    manager.runner_path.parent.mkdir(parents=True, exist_ok=True)
    manager.runner_path.write_text("# runner", encoding="utf-8")

    status = manager.status()

    assert status["installed"] is False
    assert status["components"]["runtime"]["ready"] is False
    assert "runtime" in status["missing"]

def test_bundled_core_does_not_require_external_source(tmp_path, monkeypatch):
    monkeypatch.delenv("YUMENO_RVC_SOURCE_DIR", raising=False)
    core_cli = tmp_path / "voice" / "rvc" / "vendor" / "infer" / "cli.py"
    core_cli.parent.mkdir(parents=True)
    core_cli.write_text("# bundled core", encoding="utf-8")
    manager = RVCResourceManager(tmp_path, source_root=tmp_path / "missing-source")
    status = manager.status()
    assert status["components"]["source"]["ready"] is True
    assert "rvc_source" not in status["missing"]
