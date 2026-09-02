import subprocess

import pytest

from desktop.docker_manager import DesktopStartupError, DockerManager


def test_compose_up_uses_project_compose_file(tmp_path):
    calls = []

    def runner(command, **kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 0, "", "")

    (tmp_path / "docker-compose.yml").write_text("services: {}", encoding="utf-8")
    manager = DockerManager(tmp_path, runner=runner, docker_executable="docker")
    manager.compose_up()

    assert calls[-1] == ["docker", "compose", "-f", str(tmp_path / "docker-compose.yml"), "up", "-d"]


def test_missing_docker_cli_has_actionable_error(tmp_path):
    manager = DockerManager(tmp_path, docker_executable="")
    with pytest.raises(DesktopStartupError, match="不会打开 Docker 仪表板"):
        manager.ensure_ready(timeout=0)


def test_ensure_ready_does_not_launch_docker_desktop_gui(tmp_path, monkeypatch):
    launched = []

    def runner(command, **kwargs):
        return subprocess.CompletedProcess(command, 1, "", "engine down")

    def fake_popen(command, **kwargs):
        launched.append(command)
        raise AssertionError(f"must not launch GUI: {command}")

    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    manager = DockerManager(tmp_path, runner=runner, docker_executable="docker")
    with pytest.raises(DesktopStartupError, match="系统托盘"):
        manager.ensure_ready(timeout=0)
    assert launched == []


def test_ensure_ready_when_engine_is_up_skips_wait(tmp_path, monkeypatch):
    def runner(command, **kwargs):
        return subprocess.CompletedProcess(command, 0, "Server Version: 24.0", "")

    monkeypatch.setattr(
        subprocess,
        "Popen",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("engine already up")),
    )
    manager = DockerManager(tmp_path, runner=runner, docker_executable="docker")
    manager.ensure_ready(timeout=0)


def test_compose_stop_keeps_containers(tmp_path):
    calls = []

    def runner(command, **kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 0, "", "")

    (tmp_path / "docker-compose.yml").write_text("services: {}", encoding="utf-8")
    manager = DockerManager(tmp_path, runner=runner, docker_executable="docker")
    manager.compose_stop()

    assert calls[-1] == ["docker", "compose", "-f", str(tmp_path / "docker-compose.yml"), "stop"]


def test_compose_down_removes_containers_but_keeps_volumes(tmp_path):
    calls = []

    def runner(command, **kwargs):
        calls.append(command)
        return subprocess.CompletedProcess(command, 0, "", "")

    (tmp_path / "docker-compose.yml").write_text("services: {}", encoding="utf-8")
    manager = DockerManager(tmp_path, runner=runner, docker_executable="docker")
    manager.compose_down()

    assert calls[-1] == ["docker", "compose", "-f", str(tmp_path / "docker-compose.yml"), "down"]
