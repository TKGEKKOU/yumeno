from agents.runtime.native import NativeAgentLoop


class FakeService:
    def __init__(self):
        self.calls = []

    def query(self, question, context):
        self.calls.append(("query", question, context))
        return {"answer": "ok"}

    def resume(self, context, specialist, approved=None, **kwargs):
        self.calls.append(("resume", context, specialist, approved, kwargs))
        return {"answer": "resumed"}

    def stream_query(self, question, context):
        self.calls.append(("stream_query", question, context))
        yield {"kind": "token", "text": "a"}
        yield {"kind": "result"}

    def stream_resume(self, context, specialist, approved=None, **kwargs):
        self.calls.append(("stream_resume", context, specialist, approved, kwargs))
        yield {"kind": "result"}


def test_native_loop_preserves_service_and_releases_sync_job():
    service = FakeService()
    engine = NativeAgentLoop(service)
    assert engine.query("hello", "ctx", job_id="job-1") == {"answer": "ok"}
    assert engine.resume("ctx", "rvc_worker", job_id="job-2", input_values={"x": 1}) == {"answer": "resumed"}
    assert engine.active_jobs() == ()
    assert service.calls[0][0] == "query"
    assert service.calls[1][-1] == {"input_values": {"x": 1}}


def test_native_loop_streams_events_without_changing_business_payload():
    engine = NativeAgentLoop(FakeService())
    assert list(engine.stream_query("hello", "ctx", job_id="job-1")) == [
        {"kind": "token", "text": "a"},
        {"kind": "result"},
    ]
    assert engine.active_jobs() == ()


def test_native_loop_cancel_marks_job_and_stream_emits_terminal_cancel():
    service = FakeService()
    engine = NativeAgentLoop(service)
    stream = engine.stream_query("hello", "ctx", job_id="job-1")
    assert next(stream) == {"kind": "token", "text": "a"}
    assert engine.cancel("job-1") is True
    assert next(stream) == {"kind": "cancelled", "job_id": "job-1"}
    assert engine.active_jobs() == ()


def test_native_loop_cancel_unknown_job_is_safe():
    assert NativeAgentLoop(FakeService()).cancel("missing") is False
