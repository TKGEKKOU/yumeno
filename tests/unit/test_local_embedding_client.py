import threading

import pytest


def test_worker_environment_forces_utf8(monkeypatch):
    from ingestion.local_embedding.client import worker_environment

    monkeypatch.setenv("PERSONALIVE_TEST_ENV", "preserved")

    environment = worker_environment()

    assert environment["PERSONALIVE_TEST_ENV"] == "preserved"
    assert environment["PYTHONIOENCODING"] == "utf-8"
    assert environment["PYTHONUTF8"] == "1"


def test_close_stops_worker_while_startup_handshake_is_pending(tmp_path, monkeypatch):
    from ingestion.local_embedding.client import ManagedLocalEmbeddings

    embeddings = ManagedLocalEmbeddings(tmp_path, "demo/model", "cpu")
    model_dir = embeddings.resources.model_directory("demo/model")
    model_dir.mkdir(parents=True)
    (model_dir / "config.json").write_text("{}", encoding="utf-8")
    embeddings.resources.runtime_python.parent.mkdir(parents=True)
    embeddings.resources.runtime_python.write_text("python", encoding="ascii")

    handshake_started = threading.Event()
    process_released = threading.Event()

    class FakeStream:
        def readline(self):
            handshake_started.set()
            process_released.wait(timeout=1)
            return ""

        def read(self):
            return "worker stopped"

    class FakeProcess:
        def __init__(self):
            self.stdout = FakeStream()
            self.stderr = FakeStream()
            self.stdin = None
            self.terminated = False

        def poll(self):
            return 0 if self.terminated else None

        def terminate(self):
            self.terminated = True
            process_released.set()

        def wait(self, timeout=None):
            process_released.wait(timeout=timeout)
            return 0

        def kill(self):
            self.terminate()

    process = FakeProcess()
    monkeypatch.setattr("ingestion.local_embedding.client.subprocess.Popen", lambda *args, **kwargs: process)

    errors = []
    thread = threading.Thread(target=lambda: _capture_error(embeddings._start, errors))
    thread.start()
    assert handshake_started.wait(timeout=1)

    embeddings.close()
    thread.join(timeout=1)

    assert process.terminated is True
    assert thread.is_alive() is False


def test_close_stops_worker_created_during_popen_window(tmp_path, monkeypatch):
    from ingestion.local_embedding.client import ManagedLocalEmbeddings

    embeddings = ManagedLocalEmbeddings(tmp_path, "demo/model", "cpu")
    model_dir = embeddings.resources.model_directory("demo/model")
    model_dir.mkdir(parents=True)
    (model_dir / "config.json").write_text("{}", encoding="utf-8")
    embeddings.resources.runtime_python.parent.mkdir(parents=True)
    embeddings.resources.runtime_python.write_text("python", encoding="ascii")

    popen_started = threading.Event()
    release_popen = threading.Event()

    class FakeStream:
        def readline(self):
            return '{"ok": true}\n'

        def read(self):
            return ""

    class FakeProcess:
        def __init__(self):
            self.stdout = FakeStream()
            self.stderr = FakeStream()
            self.stdin = None
            self.terminated = False

        def poll(self):
            return 0 if self.terminated else None

        def terminate(self):
            self.terminated = True

        def wait(self, timeout=None):
            del timeout
            return 0

        def kill(self):
            self.terminate()

    process = FakeProcess()

    def blocking_popen(*args, **kwargs):
        del args, kwargs
        popen_started.set()
        release_popen.wait(timeout=1)
        return process

    monkeypatch.setattr(
        "ingestion.local_embedding.client.subprocess.Popen", blocking_popen
    )
    errors = []
    thread = threading.Thread(target=lambda: _capture_error(embeddings._start, errors))
    thread.start()
    assert popen_started.wait(timeout=1)

    embeddings.close()
    release_popen.set()
    thread.join(timeout=1)

    assert process.terminated is True
    assert embeddings._process is None
    assert thread.is_alive() is False
    assert errors and isinstance(errors[0], RuntimeError)


def test_worker_crash_can_restart_without_reopening_closed_instance(tmp_path, monkeypatch):
    from ingestion.local_embedding.client import ManagedLocalEmbeddings

    embeddings = ManagedLocalEmbeddings(tmp_path, "demo/model", "cpu")
    model_dir = embeddings.resources.model_directory("demo/model")
    model_dir.mkdir(parents=True)
    (model_dir / "config.json").write_text("{}", encoding="utf-8")
    embeddings.resources.runtime_python.parent.mkdir(parents=True)
    embeddings.resources.runtime_python.write_text("python", encoding="ascii")

    class FakeInput:
        def write(self, _value):
            return None

        def flush(self):
            return None

    class FakeOutput:
        def __init__(self, lines):
            self.lines = iter(lines)

        def readline(self):
            return next(self.lines, "")

    class FakeProcess:
        def __init__(self, lines):
            self.stdin = FakeInput()
            self.stdout = FakeOutput(lines)
            self.stderr = FakeOutput([])
            self.terminated = False

        def poll(self):
            return 0 if self.terminated else None

        def terminate(self):
            self.terminated = True

        def wait(self, timeout=None):
            del timeout
            return 0

        def kill(self):
            self.terminate()

    processes = iter(
        [
            FakeProcess(['{"ok": true}\n', ""]),
            FakeProcess(['{"ok": true}\n', '{"ok": true, "vectors": [[1.0]]}\n']),
        ]
    )
    monkeypatch.setattr(
        "ingestion.local_embedding.client.subprocess.Popen",
        lambda *args, **kwargs: next(processes),
    )

    with pytest.raises(RuntimeError, match="意外退出"):
        embeddings.embed_query("first")

    assert embeddings.embed_query("second") == [1.0]
    embeddings.close()


def _capture_error(callback, errors):
    try:
        callback()
    except Exception as exc:
        errors.append(exc)
