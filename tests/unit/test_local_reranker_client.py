def test_managed_reranker_sends_query_document_pairs(tmp_path, monkeypatch):
    from ingestion.local_reranker.client import ManagedLocalReranker

    reranker = ManagedLocalReranker(tmp_path, "demo/model", "cpu")
    captured = {}
    monkeypatch.setattr(reranker, "_request", lambda query, documents: captured.update(query=query, documents=documents) or [0.8, 0.2])

    assert reranker.score_pairs("问题", ["甲", "乙"]) == [0.8, 0.2]
    assert captured == {"query": "问题", "documents": ["甲", "乙"]}


def test_reranker_worker_crash_is_restarted_on_the_next_request(tmp_path, monkeypatch):
    import pytest

    from ingestion.local_reranker.client import ManagedLocalReranker

    reranker = ManagedLocalReranker(tmp_path, "demo/model", "cpu")
    model_dir = reranker.resources.model_directory("demo/model")
    model_dir.mkdir(parents=True)
    (model_dir / "config.json").write_text("{}", encoding="utf-8")
    reranker.resources.runtime_python.parent.mkdir(parents=True)
    reranker.resources.runtime_python.write_text("python", encoding="ascii")

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

        def read(self):
            return ""

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

    processes = iter([
        FakeProcess(['{"ok": true}\n', ""]),
        FakeProcess(['{"ok": true}\n', '{"ok": true, "scores": [0.75]}\n']),
    ])
    monkeypatch.setattr(
        "ingestion.local_reranker.client.subprocess.Popen",
        lambda *args, **kwargs: next(processes),
    )

    with pytest.raises(RuntimeError, match="exited unexpectedly"):
        reranker.score_pairs("first", ["document"])

    assert reranker.score_pairs("second", ["document"]) == [0.75]
    reranker.close()
