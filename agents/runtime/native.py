from __future__ import annotations

"""YUMENO 内置 Agent Runtime 的执行生命周期原语。

这里吸收 Harness 的 Session/Job/Event/Cancel/Resume 抽象，但不依赖外部
源码、Node runtime 或额外可执行文件。业务仍由现有 Core/Supervisor/Worker
服务负责。
"""

from dataclasses import dataclass, field
from threading import Event, RLock
from typing import Any, Iterator


@dataclass(slots=True)
class RuntimeSession:
    session_id: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RuntimeJob:
    job_id: str
    session_id: str
    cancelled: Event = field(default_factory=Event)
    status: str = "running"


class NativeAgentLoop:
    """为 PersonaAgentService 提供统一的 Job 生命周期。"""

    def __init__(self, service: Any) -> None:
        self.service = service
        self._jobs: dict[str, RuntimeJob] = {}
        self._finished: dict[str, RuntimeJob] = {}
        self._finished_limit = 128
        self._lock = RLock()

    def session(self, session_id: str, **metadata: Any) -> RuntimeSession:
        return RuntimeSession(session_id=session_id, metadata=metadata)

    def begin(self, job_id: str, session_id: str) -> RuntimeJob:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                job = RuntimeJob(job_id=job_id, session_id=session_id)
                self._jobs[job_id] = job
            return job

    def active_jobs(self) -> tuple[RuntimeJob, ...]:
        """返回当前 Job 快照；调用方不能直接修改内核字典。"""
        with self._lock:
            return tuple(self._jobs.values())

    def get_job(self, job_id: str) -> RuntimeJob | None:
        """Query a Job without exposing the kernel dictionaries.

        Finished Jobs stay queryable for wait/status, while active_jobs()
        still only lists in-flight work.
        """
        with self._lock:
            return self._jobs.get(job_id) or self._finished.get(job_id)

    def cancel(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return False
            job.cancelled.set()
            job.status = "cancelled"
            return True

    def finish(self, job_id: str, status: str = "completed") -> None:
        with self._lock:
            job = self._jobs.pop(job_id, None)
            if job is None:
                return
            job.status = status
            self._finished[job_id] = job
            while len(self._finished) > self._finished_limit:
                oldest = next(iter(self._finished))
                self._finished.pop(oldest, None)

    def query(self, question: str, context: Any, *, job_id: str) -> Any:
        job = self.begin(job_id, self._session_id(context))
        try:
            if job.cancelled.is_set():
                return None
            return self.service.query(question, context)
        finally:
            self.finish(job_id, "cancelled" if job.cancelled.is_set() else "completed")

    def resume(
        self,
        context: Any,
        specialist: str,
        approved: bool | None = None,
        *,
        job_id: str,
        **kwargs: Any,
    ) -> Any:
        job = self.begin(job_id, self._session_id(context))
        try:
            if job.cancelled.is_set():
                return None
            return self.service.resume(context, specialist, approved, **kwargs)
        finally:
            self.finish(job_id, "cancelled" if job.cancelled.is_set() else "completed")

    def stream_query(self, question: str, context: Any, *, job_id: str) -> Iterator[dict[str, Any]]:
        job = self.begin(job_id, self._session_id(context))
        try:
            for event in self.service.stream_query(question, context):
                if job.cancelled.is_set():
                    self.finish(job_id, "cancelled")
                    yield {"kind": "cancelled", "job_id": job_id}
                    return
                yield event
        finally:
            self.finish(job_id, "cancelled" if job.cancelled.is_set() else "completed")

    def stream_resume(
        self,
        context: Any,
        specialist: str,
        approved: bool | None = None,
        *,
        job_id: str,
        **kwargs: Any,
    ) -> Iterator[dict[str, Any]]:
        job = self.begin(job_id, self._session_id(context))
        try:
            for event in self.service.stream_resume(context, specialist, approved, **kwargs):
                if job.cancelled.is_set():
                    self.finish(job_id, "cancelled")
                    yield {"kind": "cancelled", "job_id": job_id}
                    return
                yield event
        finally:
            self.finish(job_id, "cancelled" if job.cancelled.is_set() else "completed")

    @staticmethod
    def _session_id(context: Any) -> str:
        return f"{getattr(context, 'persona_id', '')}:{getattr(context, 'conversation_id', '')}"
