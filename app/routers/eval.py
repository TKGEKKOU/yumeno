"""RAG 评测任务端点：后台线程运行离线评测，前端轮询进度与结果。

评测领域快照保存在 ``RagEvaluationRun``，统一运行状态、进度和公开事件保存在
``AgentRun`` / ``AgentRunEvent``。``app.state.eval_job`` 只作为当前进程的实时缓存，
进程重启后接口会回退到 SQLite 中的统一运行记录。
"""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select
from fastapi.responses import Response
from pydantic import BaseModel, Field

from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError, public_error_message
from agents.runtime.models import AgentRun, RunEvent, RunStatus
from app.models import DocumentJob, Persona, RagEvaluationCase, RagEvaluationRun
from app.run_store import RunStore
from app.routers.settings import require_local
from persona.service import resolve_knowledge_scope
from rag.eval.question_generator import DEFAULT_TIER

EvalDatasetMode = Literal["generated", "manual", "combined"]

router = APIRouter(prefix="/api/eval", tags=["eval"])

class EvalRunPayload(BaseModel):
    persona_id: str
    max_cases: int | None = Field(default=None, ge=1, le=100)
    web_fallback: bool = False
    tier: str = DEFAULT_TIER
    dataset_mode: EvalDatasetMode = "generated"


def _job(request: Request) -> dict[str, Any]:
    job = getattr(request.app.state, "eval_job", None)
    if job is None:
        job = {}
        request.app.state.eval_job = job
    return job


def _runtime_store(request: Request) -> RunStore:
    store = getattr(request.app.state, "run_store", None)
    if store is None:
        store = RunStore(request.app.state.session_factory)
        request.app.state.run_store = store
    return store


def _legacy_eval_state(status_value: RunStatus | str) -> str:
    """把统一状态映射回旧评测 API 的状态，保持已有前端兼容。"""

    try:
        status = RunStatus(status_value)
    except (TypeError, ValueError):
        return "error"
    return {
        RunStatus.QUEUED: "pending",
        RunStatus.RUNNING: "running",
        RunStatus.WAITING_APPROVAL: "waiting_approval",
        RunStatus.PAUSED: "paused",
        RunStatus.COMPLETED: "done",
        RunStatus.FAILED: "error",
        RunStatus.CANCELLED: "cancelled",
    }[status]


def _runtime_event(store: RunStore, run_id: str | None, *, name: str, label: str,
                   status: str = "completed", details: dict[str, Any] | None = None) -> None:
    if not run_id:
        return
    try:
        store.append_event(
            RunEvent(
                run_id=run_id,
                sequence=1,
                category="eval",
                name=name,
                label=label,
                status=status,
                details=details or {},
            )
        )
    except Exception:
        # 评测的结果快照仍是主流程；公开运行记录属于旁路但必须尽量写入。
        return


def _runtime_update(store: RunStore, run_id: str | None, **fields: Any) -> None:
    if not run_id:
        return
    try:
        store.update_progress(run_id, **fields)
    except Exception:
        return


def _runtime_transition(store: RunStore, run_id: str | None, status: RunStatus, **fields: Any) -> None:
    if not run_id:
        return
    try:
        store.update_status(run_id, status, **fields)
    except Exception:
        return


def _persisted_eval_snapshot(request: Request, run_id: str | None = None) -> tuple[Any, Any] | None:
    """返回统一运行记录与评测快照，供重启后的轮询/导出/分析使用。"""

    runtime = _runtime_store(request)
    runtime_run = runtime.get(run_id) if run_id else runtime.latest(action="rag_eval")
    if runtime_run is None:
        return None
    with request.app.state.session_factory() as session:
        evaluation = session.get(RagEvaluationRun, runtime_run.run_id)
    return runtime_run, evaluation


def _runtime_status_payload(runtime_run) -> dict[str, Any]:
    progress = max(0, int(runtime_run.progress or 0))
    total = max(0, int(runtime_run.total or 0))
    question = runtime_run.current_question or ""
    return {
        "run_id": runtime_run.run_id,
        "state": _legacy_eval_state(runtime_run.status),
        "phase": runtime_run.current_step or _legacy_eval_state(runtime_run.status),
        "status_text": runtime_run.status_text or "",
        "current_question": f"第 {progress}/{total} 题" if total else "",
        "current_step": runtime_run.current_step or "",
        "current_question_text": question[:28],
        "progress": progress,
        "total": total,
        "error": runtime_run.error_message or "",
    }


def _public_eval_error(exc: Exception) -> tuple[str, str]:
    """将评测线程异常收敛为稳定的公开错误合同。

    评测可能触发模型、向量库和本地文件等多个边界；原始异常只适合
    服务器日志，不应进入轮询接口、运行摘要或领域快照。
    """

    if isinstance(exc, RuntimeOperationError):
        try:
            code = RuntimeErrorCode(exc.code)
        except (TypeError, ValueError):
            code = RuntimeErrorCode.WORKER_FAILED
    elif isinstance(exc, TimeoutError):
        code = RuntimeErrorCode.WORKER_TIMEOUT
    else:
        code = RuntimeErrorCode.WORKER_FAILED
    return code.value, public_error_message(code)


def sync_recovered_evaluation_runs(session_factory, recovered_runs: list[AgentRun]) -> None:
    """把服务启动时收口的 Runtime 状态同步到 RAG 评测领域快照。

    ``RunStore`` 是运行状态的事实来源，但历史接口仍直接读取
    ``RagEvaluationRun``。两者必须同时结束，否则重启后会出现 Runtime 已失败、
    评测历史仍显示 pending/running 的矛盾。
    """

    if not recovered_runs:
        return
    now = datetime.now(timezone.utc)
    error_code = RuntimeErrorCode.RUNTIME_RESTARTED.value
    error_message = public_error_message(error_code)
    with session_factory() as session:
        for runtime_run in recovered_runs:
            evaluation = session.get(RagEvaluationRun, runtime_run.run_id)
            if evaluation is None or evaluation.status in {"done", "error", "cancelled"}:
                continue
            evaluation.status = "error"
            evaluation.error_message = runtime_run.error_message or error_message
            evaluation.finished_at = runtime_run.finished_at or now
        session.commit()


def _job_payload(job: dict[str, Any]) -> dict[str, Any]:
    """兼容没有统一 Runtime 记录的旧测试/旧调用方缓存。"""

    return {
        "run_id": job.get("run_id"),
        "state": job.get("state", "idle"),
        "phase": job.get("phase", "idle"),
        "status_text": job.get("status_text", ""),
        "current_question": job.get("current_question", ""),
        "current_step": job.get("current_step", ""),
        "current_question_text": job.get("current_question_text", ""),
        "progress": job.get("progress", 0),
        "total": job.get("total", 0),
        "error": job.get("error", ""),
    }


def _reconcile_worker_cache(session_factory, job: dict[str, Any]) -> None:
    """为旧 Worker 适配层兜底：线程返回后把终态缓存一次性写回 Runtime。

    正常的 ``_execute`` 会在每个阶段主动写 Runtime；该适配只用于旧的
    测试替身或外部调用方仍只更新 ``eval_job`` 的情况，不作为运行中的状态源。
    """

    run_id = job.get("run_id")
    if not run_id:
        return
    state = job.get("state")
    store = RunStore(session_factory)
    # 旧 Worker 可能直接返回终态，先补齐 queued -> running，满足 Runtime
    # 状态机约束，再收口到 completed/failed。
    current = store.get(run_id)
    if current is not None and current.status is RunStatus.QUEUED:
        _runtime_transition(
            store,
            run_id,
            RunStatus.RUNNING,
            current_step="evaluation",
            status_text="开始评测…",
        )
    if state == "done":
        metrics = dict(job.get("metrics") or {})
        cases = list(job.get("cases") or [])
        _runtime_transition(
            store,
            run_id,
            RunStatus.COMPLETED,
            current_step="",
            current_question="",
            progress=max(0, int(job.get("progress") or 0)),
            total=max(0, int(job.get("total") or 0)),
            status_text=job.get("status_text") or "评测完成",
            resume_state={"phase": "completed", "case_index": len(cases)},
            result_json={
                "run_id": run_id,
                "status": RunStatus.COMPLETED.value,
                "config": dict(job.get("config") or {}),
                "metrics": metrics,
                "cases": cases,
            },
        )
        _persist_run(
            session_factory,
            run_id,
            status="done",
            metrics_json=metrics,
            cases_json=cases,
            finished_at=datetime.now(timezone.utc),
        )
    elif state == "error":
        code = job.get("error_code") or RuntimeErrorCode.WORKER_FAILED.value
        try:
            normalized_code = RuntimeErrorCode(code)
        except (TypeError, ValueError):
            normalized_code = RuntimeErrorCode.WORKER_FAILED
        message = public_error_message(normalized_code)
        error = {"code": normalized_code.value, "message": message}
        _runtime_transition(
            store,
            run_id,
            RunStatus.FAILED,
            current_step="",
            status_text="评测失败",
            error_code=normalized_code.value,
            error_message=message,
            result_json={
                "run_id": run_id,
                "status": RunStatus.FAILED.value,
                "error": error,
                "error_code": normalized_code.value,
                "error_message": message,
            },
        )
        _persist_run(
            session_factory,
            run_id,
            status="error",
            error_message=message,
            finished_at=datetime.now(timezone.utc),
        )


def _run_eval_thread(payload: EvalRunPayload, session_factory, job: dict[str, Any]) -> None:
    """运行评测 Worker，并在旧适配层返回后做一次终态收口。"""

    try:
        _execute(payload, session_factory, job)
    finally:
        _reconcile_worker_cache(session_factory, job)


def _persist_run(session_factory, run_id: str | None, **updates: Any) -> None:
    if not run_id:
        return
    try:
        with session_factory() as session:
            run = session.get(RagEvaluationRun, run_id)
            if run is None:
                return
            for key, value in updates.items():
                setattr(run, key, value)
            session.commit()
    except Exception:
        # 历史记录属于旁路能力，数据库异常不应改变评测线程的结果。
        return


def _load_manual_dataset(
    session_factory,
    workspace_id: str,
    knowledge_space_ids: list[str],
    status_callback: Any | None = None,
) -> list[dict[str, Any]]:
    """读取当前角色作用域内启用的人工题，并尽可能解析到 chunk 标注。

    人工题保存的是稳定的 DocumentJob id；Milvus 中的评测指标需要 chunk_id。
    因此这里先做数据库归属解析，再按文档批量查询 chunk。没有可用向量时，
    题目仍会以无标注问题运行，runner 会退回自动相关性判定。
    """

    with session_factory() as session:
        cases = list(
            session.scalars(
                select(RagEvaluationCase)
                .where(
                    RagEvaluationCase.workspace_id == workspace_id,
                    RagEvaluationCase.knowledge_space_id.in_(knowledge_space_ids),
                    RagEvaluationCase.enabled.is_(True),
                )
                .order_by(RagEvaluationCase.created_at, RagEvaluationCase.id)
            )
        )
        if not cases:
            return []
        jobs = list(
            session.scalars(
                select(DocumentJob).where(
                    DocumentJob.workspace_id == workspace_id,
                    DocumentJob.knowledge_space_id.in_(knowledge_space_ids),
                    DocumentJob.status != "deleted",
                )
            )
        )

    jobs_by_id = {job.id: job for job in jobs}
    document_ids = {
        jobs_by_id[document_id].document_id
        for case in cases
        for document_id in (case.relevant_document_ids_json or [])
        if document_id in jobs_by_id
    }
    chunks_by_document: dict[str, list[str]] = {}
    if document_ids:
        if status_callback is not None:
            status_callback("读取人工题集关联片段")
        try:
            from ingestion.milvus_store import MilvusRagStore, quote_filter_value
            from rag.contracts import RagQueryContext
            from rag.retriever import build_scope_expression

            store = MilvusRagStore()
            if store.collection_exists():
                expression = build_scope_expression(
                    RagQueryContext(
                        persona_id="eval-dataset",
                        workspace_id=workspace_id,
                        knowledge_space_ids=tuple(knowledge_space_ids),
                    )
                )
                document_filter = ", ".join(quote_filter_value(value) for value in sorted(document_ids))
                rows = store.client().query(
                    collection_name=store.settings.collection_name,
                    filter=f"{expression} and document_id in [{document_filter}]",
                    output_fields=["document_id", "chunk_id"],
                    limit=16384,
                )
                for row in rows:
                    document_id = str(row.get("document_id") or "")
                    chunk_id = str(row.get("chunk_id") or "")
                    if document_id and chunk_id:
                        chunks_by_document.setdefault(document_id, []).append(chunk_id)
        except Exception:
            # 评测不应因本地 Milvus 暂不可用而丢失人工题；无标注仍可执行。
            chunks_by_document = {}

    dataset: list[dict[str, Any]] = []
    for case in cases:
        expected_chunk_ids: list[str] = []
        for document_job_id in case.relevant_document_ids_json or []:
            document_job = jobs_by_id.get(document_job_id)
            if document_job is None:
                continue
            for chunk_id in chunks_by_document.get(document_job.document_id, []):
                if chunk_id not in expected_chunk_ids:
                    expected_chunk_ids.append(chunk_id)
        dataset.append(
            {
                "question": case.question,
                "expected_chunk_ids": expected_chunk_ids,
                "reference_answer": case.expected_answer or None,
                "_manual_case_id": case.id,
                "_difficulty": case.difficulty,
                "_source": case.source,
            }
        )
    return dataset


def _execute(payload: EvalRunPayload, session_factory, job: dict[str, Any]) -> None:
    """后台线程：派生角色作用域 -> 跑离线评测 -> 同步写回领域与运行状态。"""

    from rag.eval.metrics import summarize_generation, summarize_retrieval
    from rag.eval.runner import check_scope_isolation, load_dataset, run_eval

    run_id = job.get("run_id")
    runtime_store = RunStore(session_factory)
    _runtime_transition(
        runtime_store,
        run_id,
        RunStatus.RUNNING,
        current_step="scope",
        status_text="准备评测",
        resume_state={"phase": "scope", "case_index": 0},
    )
    _runtime_event(runtime_store, run_id, name="eval_started", label="评测开始", details={"action": "rag_eval"})
    _persist_run(session_factory, run_id, status="running", started_at=datetime.now(timezone.utc))
    try:
        session = session_factory()
        try:
            scope = resolve_knowledge_scope(session, payload.persona_id)
        finally:
            session.close()

        _runtime_update(
            runtime_store,
            run_id,
            current_step="scope",
            status_text="已确定知识范围",
            resume_state={"phase": "scope", "case_index": 0},
        )
        _runtime_event(
            runtime_store,
            run_id,
            name="scope_resolved",
            label="知识范围已确定",
            details={"knowledge_spaces": len(scope.knowledge_space_ids)},
        )

        def progress(done: int, count: int) -> None:
            job["state"] = "running"
            job["progress"] = done
            job["total"] = count
            _runtime_update(
                runtime_store,
                run_id,
                progress=done,
                total=count,
                resume_state={"phase": "evaluation", "case_index": done},
            )
            if done:
                _runtime_event(
                    runtime_store,
                    run_id,
                    name="case_completed",
                    label="完成一题",
                    details={"case_index": done, "total": count},
                )

        def status(text: str) -> None:
            job["status_text"] = text
            _runtime_update(runtime_store, run_id, status_text=text)

        def step_callback(index: int, question: str, step: str) -> None:
            job["current_question"] = f"第 {index}/{len(cases)} 题"
            job["current_step"] = step
            job["current_question_text"] = question[:28]
            _runtime_update(
                runtime_store,
                run_id,
                current_step=step,
                current_question=question,
                progress=max(0, index - 1),
                total=len(cases),
                status_text=step,
                resume_state={"phase": "evaluation", "case_index": max(0, index - 1)},
            )
            _runtime_event(
                runtime_store,
                run_id,
                name="eval_step",
                label=step,
                status="started",
                details={"case_index": index, "total": len(cases), "step": step},
            )

        knowledge_space_ids = list(scope.knowledge_space_ids)
        manual_cases: list[dict[str, Any]] = []
        if payload.dataset_mode in {"manual", "combined"}:
            _runtime_update(runtime_store, run_id, current_step="dataset", status_text="读取人工题集")
            manual_cases = _load_manual_dataset(
                session_factory,
                scope.workspace_id,
                knowledge_space_ids,
                status_callback=status,
            )
            if payload.dataset_mode == "manual" and not manual_cases:
                raise ValueError("当前知识空间没有启用的人工评测题")

        generated_cases: list[dict[str, Any]] = []
        if payload.dataset_mode in {"generated", "combined"}:
            # 自动题集含固定无关探针，适合检查角色知识边界。
            from rag.eval.question_generator import generate_questions_for_persona

            job["state"] = "generating"
            job["phase"] = "generating"
            job["status_text"] = "准备生成问题…"
            _runtime_update(
                runtime_store,
                run_id,
                current_step="dataset",
                status_text="准备生成问题…",
                resume_state={"phase": "dataset", "case_index": 0},
            )
            dataset_path = generate_questions_for_persona(
                persona_id=payload.persona_id,
                workspace_id=scope.workspace_id,
                knowledge_space_ids=knowledge_space_ids,
                tier=payload.tier,
                status=status,
            )
            generated_cases = load_dataset(dataset_path)

        dataset = manual_cases + generated_cases
        cases = dataset[: payload.max_cases] if payload.max_cases else dataset
        if not cases:
            raise ValueError("没有可运行的评测题")

        job["phase"] = "running"
        job["status_text"] = "开始评测…"
        job["current_question"] = ""
        job["current_step"] = ""
        job["total"] = len(cases)
        _runtime_transition(
            runtime_store,
            run_id,
            RunStatus.RUNNING,
            current_step="evaluation",
            total=len(cases),
            progress=0,
            status_text="开始评测…",
            resume_state={"phase": "evaluation", "case_index": 0},
        )
        _runtime_event(
            runtime_store,
            run_id,
            name="dataset_loaded",
            label="题集已加载",
            details={"total": len(cases), "dataset_mode": payload.dataset_mode},
        )
        results = run_eval(
            cases,
            persona_id=payload.persona_id,
            workspace_id=scope.workspace_id,
            knowledge_space_ids=knowledge_space_ids,
            progress=progress,
            enable_web_fallback=payload.web_fallback,
            include_probes=False,  # 生成的题集已含固定无关探针
            step_callback=step_callback,
        )
        case_dicts = [result.as_dict() for result in results]
        job["state"] = "done"
        job["phase"] = "done"
        job["status_text"] = "评测完成"
        job["current_question"] = ""
        job["current_step"] = ""
        job["progress"] = len(results)
        job["total"] = len(results)
        job["metrics"] = {
            **summarize_retrieval(case_dicts),
            **summarize_generation(case_dicts),
            "scope_isolation_ok": check_scope_isolation(
                scope.workspace_id,
                knowledge_space_ids,
            ),
        }
        job["cases"] = case_dicts
        _runtime_transition(
            runtime_store,
            run_id,
            RunStatus.COMPLETED,
            current_step="",
            current_question="",
            progress=len(results),
            total=len(results),
            status_text="评测完成",
            resume_state={"phase": "completed", "case_index": len(results)},
            result_json={
                "run_id": run_id,
                "status": RunStatus.COMPLETED.value,
                "config": dict(job.get("config") or {}),
                "metrics": job["metrics"],
                "cases": case_dicts,
            },
        )
        _runtime_event(
            runtime_store,
            run_id,
            name="eval_completed",
            label="评测完成",
            details={"total": len(results)},
        )
        _persist_run(
            session_factory,
            run_id,
            status="done",
            metrics_json=job["metrics"],
            cases_json=case_dicts,
            finished_at=datetime.now(timezone.utc),
        )
    except Exception as exc:  # noqa: BLE001 - 后台任务错误只上报公开合同
        error_code, error_message = _public_eval_error(exc)
        error = {"code": error_code, "message": error_message}
        job["state"] = "error"
        job["error_code"] = error_code
        job["error"] = error_message
        _runtime_transition(
            runtime_store,
            run_id,
            RunStatus.FAILED,
            current_step="",
            status_text="评测失败",
            error_code=error_code,
            error_message=error_message,
            result_json={
                "run_id": run_id,
                "status": RunStatus.FAILED.value,
                "error": error,
                "error_code": error_code,
                "error_message": error_message,
            },
        )
        _runtime_event(
            runtime_store,
            run_id,
            name="eval_failed",
            label="评测失败",
            status="failed",
            details={"error_code": error_code},
        )
        _persist_run(
            session_factory,
            run_id,
            status="error",
            error_message=error_message,
            finished_at=datetime.now(timezone.utc),
        )


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
def start_eval(payload: EvalRunPayload, request: Request) -> dict:
    require_local(request)
    job = _job(request)
    if job.get("state") in {"pending", "generating", "running"}:
        raise HTTPException(status_code=409, detail="已有评测任务在运行")

    runtime_store = _runtime_store(request)
    active_runtime = runtime_store.latest(
        action="rag_eval",
        statuses={
            RunStatus.QUEUED,
            RunStatus.RUNNING,
            RunStatus.WAITING_APPROVAL,
            RunStatus.PAUSED,
        },
    )
    if active_runtime is not None and active_runtime.run_id != job.get("run_id"):
        raise HTTPException(status_code=409, detail="已有评测任务在运行")

    job.clear()
    run_id = None
    config = {
        "persona_id": payload.persona_id,
        "tier": payload.tier,
        "max_cases": payload.max_cases,
        "web_fallback": payload.web_fallback,
        "dataset_mode": payload.dataset_mode,
        "metric_k": 3,
    }
    # 保留无效角色异步启动后再报告错误的历史行为；有效角色与评测快照在同一事务创建。
    with request.app.state.session_factory() as session:
        persona = session.get(Persona, payload.persona_id)
        if persona is not None:
            runtime_run = AgentRun(
                action="rag_eval",
                status=RunStatus.QUEUED,
                workspace_id=persona.workspace_id,
                persona_id=persona.id,
                current_step="queued",
                status_text="等待开始",
                resume_state={"phase": "queued", "case_index": 0},
            )
            persisted = RagEvaluationRun(
                id=runtime_run.run_id,
                workspace_id=persona.workspace_id,
                persona_id=persona.id,
                status="pending",
                config_json=config,
            )
            session.add(persisted)
            runtime_store.create_in_session(session, runtime_run)
            session.commit()
            run_id = runtime_run.run_id

    job.update(
        {
            "run_id": run_id,
            "state": "pending",
            "phase": "pending",
            "status_text": "等待开始",
            "current_question": "",
            "current_step": "",
            "current_question_text": "",
            "progress": 0,
            "total": 0,
            "metrics": {},
            "cases": [],
            "error": "",
            "config": config,
        }
    )
    threading.Thread(
        target=_run_eval_thread,
        args=(payload, request.app.state.session_factory, job),
        daemon=True,
    ).start()
    return {"state": "pending", "run_id": run_id}


@router.get("/status")
def eval_status(request: Request) -> dict:
    require_local(request)
    job = _job(request)
    if job.get("run_id"):
        snapshot = _persisted_eval_snapshot(request, job["run_id"])
        if snapshot is not None:
            runtime_run, _ = snapshot
            return _runtime_status_payload(runtime_run)
    elif job.get("state") not in {None, "", "idle"}:
        return _job_payload(job)
    snapshot = _persisted_eval_snapshot(request)
    if snapshot is not None:
        runtime_run, _ = snapshot
        return _runtime_status_payload(runtime_run)
    return {
        "run_id": None,
        "state": "idle",
        "phase": "idle",
        "status_text": "",
        "current_question": "",
        "current_step": "",
        "current_question_text": "",
        "progress": 0,
        "total": 0,
        "error": "",
    }


@router.get("/results")
def eval_results(request: Request) -> dict:
    require_local(request)
    job = _job(request)
    if job.get("run_id"):
        snapshot = _persisted_eval_snapshot(request, job["run_id"])
        if snapshot is not None:
            runtime_run, evaluation = snapshot
            result = dict(runtime_run.result_json or {})
            return {
                "run_id": runtime_run.run_id,
                "state": _legacy_eval_state(runtime_run.status),
                "metrics": dict((evaluation.metrics_json if evaluation is not None else None) or result.get("metrics") or {}),
                "cases": list((evaluation.cases_json if evaluation is not None else None) or result.get("cases") or []),
            }
    elif job.get("state") not in {None, "", "idle"}:
        return {
            "run_id": job.get("run_id"),
            "state": job.get("state", "idle"),
            "metrics": job.get("metrics", {}),
            "cases": job.get("cases", []),
        }
    snapshot = _persisted_eval_snapshot(request)
    if snapshot is not None:
        runtime_run, evaluation = snapshot
        result = dict(runtime_run.result_json or {})
        return {
            "run_id": runtime_run.run_id,
            "state": _legacy_eval_state(runtime_run.status),
            "metrics": dict((evaluation.metrics_json if evaluation is not None else None) or result.get("metrics") or {}),
            "cases": list((evaluation.cases_json if evaluation is not None else None) or result.get("cases") or []),
        }
    return {"run_id": None, "state": "idle", "metrics": {}, "cases": []}


@router.get("/history")
def eval_history(
    request: Request,
    persona_id: str | None = None,
    limit: int = 20,
) -> list[dict]:
    require_local(request)
    limit = max(1, min(limit, 100))
    with request.app.state.session_factory() as session:
        statement = select(RagEvaluationRun).order_by(
            RagEvaluationRun.created_at.desc(), RagEvaluationRun.id.desc()
        ).limit(limit)
        if persona_id:
            statement = statement.where(RagEvaluationRun.persona_id == persona_id)
        runs = list(session.scalars(statement))
        return [_run_summary(run) for run in runs]


def _run_summary(run: RagEvaluationRun) -> dict:
    return {
        "id": run.id,
        "persona_id": run.persona_id,
        "status": run.status,
        "config": dict(run.config_json or {}),
        "metrics": dict(run.metrics_json or {}),
        "analysis": run.analysis,
        "error_message": run.error_message,
        "created_at": run.created_at,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
    }


@router.get("/history/{run_id}")
def eval_history_detail(run_id: str, request: Request) -> dict:
    require_local(request)
    with request.app.state.session_factory() as session:
        run = session.get(RagEvaluationRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="评测记录不存在")
        return {**_run_summary(run), "cases": list(run.cases_json or [])}


@router.get("/export")
def export_eval(request: Request) -> Response:
    require_local(request)
    job = _job(request)
    snapshot = (
        _persisted_eval_snapshot(request, job["run_id"])
        if job.get("run_id")
        else _persisted_eval_snapshot(request)
    )
    if snapshot is not None:
        runtime_run, evaluation = snapshot
        if runtime_run.status is not RunStatus.COMPLETED:
            raise HTTPException(status_code=409, detail="评测尚未完成，无法导出")
        result = dict(runtime_run.result_json or {})
        config = dict(evaluation.config_json or {}) if evaluation is not None else dict(result.get("config") or {})
        metrics = dict((evaluation.metrics_json if evaluation is not None else None) or result.get("metrics") or {})
        cases = list((evaluation.cases_json if evaluation is not None else None) or result.get("cases") or [])
    elif job.get("state") not in {None, "", "idle"}:
        state = job.get("state", "idle")
        if state != "done":
            raise HTTPException(status_code=409, detail="评测尚未完成，无法导出")
        config = job.get("config", {})
        metrics = job.get("metrics", {})
        cases = job.get("cases", [])
    else:
        raise HTTPException(status_code=409, detail="评测尚未完成，无法导出")
    payload = {
        "schema_version": 1,
        "config": config,
        "metrics": metrics,
        "cases": cases,
    }
    return Response(
        content=json.dumps(payload, ensure_ascii=False, indent=2, default=str),
        media_type="application/json; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="yumeno-rag-eval.json"'},
    )


@router.post("/analyze")
def analyze_eval(request: Request) -> dict:
    """对已完成的评测结果做 AI 分析：异常、性能、功能与建议。"""

    require_local(request)
    job = _job(request)
    snapshot = (
        _persisted_eval_snapshot(request, job["run_id"])
        if job.get("run_id")
        else _persisted_eval_snapshot(request)
    )
    if snapshot is not None:
        runtime_run, evaluation = snapshot
        if runtime_run.status is not RunStatus.COMPLETED:
            raise HTTPException(status_code=409, detail="评测未完成，暂不能分析")
        result = dict(runtime_run.result_json or {})
        run_id = runtime_run.run_id
        metrics = dict((evaluation.metrics_json if evaluation is not None else None) or result.get("metrics") or {})
        cases = list((evaluation.cases_json if evaluation is not None else None) or result.get("cases") or [])
    elif job.get("state") not in {None, "", "idle"}:
        if job.get("state") != "done":
            raise HTTPException(status_code=409, detail="评测未完成，暂不能分析")
        run_id = job.get("run_id")
        metrics = job.get("metrics", {})
        cases = job.get("cases", [])
    else:
        raise HTTPException(status_code=409, detail="评测未完成，暂不能分析")
    from rag.eval.analyzer import analyze_results

    analysis = analyze_results(metrics, cases)
    job["analysis"] = analysis
    _persist_run(request.app.state.session_factory, run_id, analysis=analysis)
    return {"analysis": analysis}
