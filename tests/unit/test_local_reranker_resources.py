from pathlib import Path
import subprocess

import pytest

from ingestion.local_reranker.resources import LocalRerankerResourceManager


def test_reranker_model_directory_is_scoped_to_project_models(tmp_path: Path):
    manager = LocalRerankerResourceManager(tmp_path)

    assert manager.model_directory("Qwen/Qwen3-Reranker-0.6B") == (
        tmp_path / "models" / "Qwen--Qwen3-Reranker-0.6B"
    ).resolve()


@pytest.mark.parametrize("model_id", ["../outside", "Qwen/../../outside", "C:/outside", "/outside"])
def test_reranker_model_id_rejects_path_escape(tmp_path: Path, model_id: str):
    manager = LocalRerankerResourceManager(tmp_path)

    with pytest.raises(ValueError):
        manager.model_directory(model_id)


def test_reranker_runtime_install_uses_shared_embedding_runtime_and_domestic_sources(tmp_path: Path, monkeypatch):
    manager = LocalRerankerResourceManager(tmp_path)
    manager.runtime_python.parent.mkdir(parents=True)
    manager.runtime_python.write_text("python", encoding="ascii")
    commands = []

    def fake_run(command, **kwargs):
        del kwargs
        commands.append(list(command))
        if command[-1] == "import torch, transformers, modelscope, huggingface_hub":
            raise RuntimeError("missing dependencies")
        return subprocess.CompletedProcess(command, 0, "", "")

    monkeypatch.setattr(manager, "_run", fake_run)

    manager._install_runtime()

    assert manager.runtime_dir == tmp_path / "runtime" / "embedding"
    assert "https://mirrors.aliyun.com/pypi/simple/" in commands[1]
    assert "https://mirrors.aliyun.com/pytorch-wheels/cu128/" in commands[1]
    assert all("download.pytorch.org" not in item for command in commands for item in command)
    assert (manager.runtime_dir / ".reranker-requirements-ready").is_file()


def test_reranker_runtime_install_does_not_fall_back_overseas(tmp_path: Path, monkeypatch):
    manager = LocalRerankerResourceManager(tmp_path)
    manager.runtime_python.parent.mkdir(parents=True)
    manager.runtime_python.write_text("python", encoding="ascii")
    commands = []

    def fail_domestic(command, **kwargs):
        del kwargs
        commands.append(list(command))
        raise RuntimeError("No matching distribution found for torch")

    monkeypatch.setattr(manager, "_run", fail_domestic)

    with pytest.raises(RuntimeError, match="国内镜像"):
        manager._install_runtime()

    assert len(commands) == 2
    assert all("download.pytorch.org" not in item for command in commands for item in command)


def test_reranker_runtime_skips_pip_when_shared_dependencies_are_ready(tmp_path: Path, monkeypatch):
    manager = LocalRerankerResourceManager(tmp_path)
    manager.runtime_python.parent.mkdir(parents=True)
    manager.runtime_python.write_text("python", encoding="ascii")
    commands = []

    def fake_run(command, **kwargs):
        del kwargs
        commands.append(list(command))
        return subprocess.CompletedProcess(command, 0, "", "")

    monkeypatch.setattr(manager, "_run", fake_run)

    manager._install_runtime()

    assert len(commands) == 1
    assert commands[0][-1] == "import torch, transformers, modelscope, huggingface_hub"
    assert (manager.runtime_dir / ".reranker-requirements-ready").is_file()


def test_reranker_cancel_install_terminates_active_process(tmp_path: Path):
    manager = LocalRerankerResourceManager(tmp_path)

    class FakeProcess:
        terminated = False

        def poll(self):
            return None

        def terminate(self):
            self.terminated = True

    process = FakeProcess()
    manager._installing = True
    manager._process = process

    assert manager.cancel_install() is True
    assert manager.status()["cancelling"] is True
    assert process.terminated is True
