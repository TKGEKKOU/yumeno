import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from starlette.requests import HTTPConnection

from app.chat_store import try_persist_text_message
from agents.context import PersonaAgentContext
from agents.contracts import resolve_error_fields
from agents.context_factory import persona_agent_context_from_session
from app.conversation_summary import schedule_summary_after_turn
from app.database import get_session
from app.schemas import AgentQueryPayload, AgentResumePayload, AgentTurnResponse
from persona.service import PersonaNotFound


router = APIRouter(prefix="/api/personas", tags=["agents"])


def context_for(
    connection: HTTPConnection,
    session: Session,
    persona_id: str,
    conversation_id: str,
    attachment_ids: list[str] | tuple[str, ...] = (),
) -> PersonaAgentContext:
    try:
        return persona_agent_context_from_session(
            session,
            connection.app.state.session_factory,
            persona_id,
            conversation_id,
            agent_runtime=getattr(connection.app.state, "agent_runtime", None),
            attachment_ids=tuple(attachment_ids),
        )
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc


def agent_runner_for(app_state):
    """Return the shared Runtime when enabled, with a service fallback for demos/tests."""

    return getattr(app_state, "agent_runtime", None) or app_state.agent_service


def response_for(result) -> AgentTurnResponse:
    # 统一收敛 Agent 输出：只暴露注册工具的调用记录与知识证据，
    # 过滤内部 handoff ToolMessage 与图内部状态，保持 API 契约稳定。
    worker = result.worker or result.specialist
    error_code, error_message = resolve_error_fields(
        result.error, result.error_code, result.error_message
    )
    return AgentTurnResponse(
        status=result.status,
        answer=result.answer,
        specialist=result.specialist,
        worker=worker,
        pending_action=result.pending_action,
        tool_calls=list(result.tool_calls),
        worker_results=list(result.worker_results or result.tool_calls),
        evidence=list(result.evidence),
        artifacts=list(result.artifacts),
        citations=list(result.citations),
        uncertainties=list(result.uncertainties),
        trace=list(result.trace),
        confidence=float((result.metrics or {}).get("confidence") or 0.0),
        requires_approval=result.status == "pending_confirmation",
        error=result.error,
        error_code=error_code,
        error_message=error_message,
        duration_seconds=result.duration_seconds,
        loaded_skills=list(result.loaded_skills),
        events=list(result.events),
        metrics=dict(result.metrics),
        workflow=result.workflow,
        task_type=result.task_type,
        input_refs=dict(result.input_refs),
        selected_options=dict(result.selected_options),
        waiting_inputs=list(result.waiting_inputs),
        result_refs=list(result.result_refs),
        task_id=result.task_id,
    )


def _public_stream_event(event: dict) -> dict:
    """把 service 层事件收敛为 SSE 可序列化的公开合同。

    AgentTurnResult 是内部 dataclass，不能依赖 json.dumps(default=str)，
    否则浏览器会收到字符串而不是 result 对象，导致答案、附件和 workflow 丢失。
    """
    if not isinstance(event, dict):
        return {"kind": "error", "message": "无效的 Agent 事件"}
    result = event.get("result")
    if result is not None and hasattr(result, "status"):
        return {**event, "result": response_for(result).model_dump(by_alias=True)}
    return event


def _sse(event: dict) -> str:
    return f"data: {json.dumps(_public_stream_event(event), ensure_ascii=False, default=str)}\n\n"


def _workflow_event_for_result(result) -> dict | None:
    flow = getattr(result, "workflow", None)
    if not flow:
        return None
    task_id = str(result.task_id) if getattr(result, "task_id", None) else None
    if task_id is None:
        for artifact in reversed(getattr(result, "artifacts", ()) or ()):
            if isinstance(artifact, dict) and artifact.get("task_id"):
                task_id = str(artifact["task_id"])
                break
    return {"kind": "workflow_update", "task_id": task_id, "flow": flow}


def _result_attachment_ids(result) -> list[str]:
    """提取 Worker 公开返回的结果附件，不把输入附件误挂到 assistant 消息。"""
    ids: list[str] = []
    roots = (
        getattr(result, "artifacts", ()) or (),
        getattr(result, "worker_results", ()) or (),
    )

    def visit(value, *, attachment_context: bool = False) -> None:
        if isinstance(value, list | tuple):
            for item in value:
                visit(item, attachment_context=attachment_context)
            return
        if not isinstance(value, dict):
            return
        item_type = str(value.get("type") or "").lower()
        is_attachment = attachment_context or item_type in {"attachment", "file", "audio", "video", "image", "document"}
        if is_attachment and value.get("file_id"):
            file_id = str(value["file_id"])
            if file_id not in ids:
                ids.append(file_id)
        for key in ("attachment", "attachments", "artifacts", "result", "output", "outputs"):
            child = value.get(key)
            if child is not None:
                visit(child, attachment_context=key in {"attachment", "attachments", "artifacts"})

    for root in roots:
        visit(root)
    return ids[:32]


def _finalize_agent_turn(app, context, result) -> None:
    if result.status == "completed" and result.answer:
        try_persist_text_message(
            app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=context.persona_id,
            conversation_id=context.conversation_id,
            role="assistant",
            content=result.answer,
            attachment_ids=_result_attachment_ids(result),
        )
        schedule_summary_after_turn(
            app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=context.persona_id,
            conversation_id=context.conversation_id,
        )


@router.post("/{persona_id}/agent/stream")
async def stream_agent_query(
    persona_id: str,
    payload: AgentQueryPayload,
    request: Request,
    session: Session = Depends(get_session),
) -> StreamingResponse:
    """SSE 流式查询：stage / token / result / done 事件。"""
    context = context_for(request, session, persona_id, payload.conversation_id, payload.attachment_ids)
    try_persist_text_message(
        request.app.state.session_factory,
        workspace_id=context.workspace_id,
        persona_id=persona_id,
        conversation_id=payload.conversation_id,
        role="user",
        content=payload.question,
        attachment_ids=payload.attachment_ids,
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = agent_runner_for(request.app.state)

    async def generate():
        async for event in request.app.state.realtime_executions.run_stream(
            key,
            lambda: agent_runner.stream_query(payload.question, context),
        ):
            if event.get("kind") == "clone_session":
                if event.get("action") == "request_voice_material":
                    yield _sse({"kind": "upload_request", "purpose": "voice_material"})
                elif event.get("action") == "voice_session_created":
                    yield _sse({
                        "kind": "upload_request",
                        "purpose": "voice_material",
                        "session_id": event["session_id"],
                    })
                continue
            if event.get("kind") == "result":
                workflow_event = _workflow_event_for_result(event["result"])
                if workflow_event is not None:
                    yield _sse(workflow_event)
                _finalize_agent_turn(request.app, context, event["result"])
            yield _sse(event)
        yield _sse({"kind": "done"})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/{persona_id}/agent/stream-resume")
async def stream_agent_resume(
    persona_id: str,
    payload: AgentResumePayload,
    request: Request,
    session: Session = Depends(get_session),
) -> StreamingResponse:
    """SSE 流式恢复确认回合：stage / token / result / done 事件。"""
    context = context_for(
        request, session, persona_id, payload.conversation_id, payload.attachment_ids
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = agent_runner_for(request.app.state)

    async def generate():
        async for event in request.app.state.realtime_executions.run_stream(
            key,
            lambda: agent_runner.stream_resume(
                context,
                payload.specialist,
                payload.approved,
                worker=payload.worker,
                task_id=payload.task_id,
                attachment_ids=tuple(payload.attachment_ids),
                input_values=payload.input_values,
            ),
        ):
            if event.get("kind") == "clone_session":
                if event.get("action") == "request_voice_material":
                    yield _sse({"kind": "upload_request", "purpose": "voice_material"})
                elif event.get("action") == "voice_session_created":
                    yield _sse({
                        "kind": "upload_request",
                        "purpose": "voice_material",
                        "session_id": event["session_id"],
                    })
                continue
            if event.get("kind") == "result":
                workflow_event = _workflow_event_for_result(event["result"])
                if workflow_event is not None:
                    yield _sse(workflow_event)
                _finalize_agent_turn(request.app, context, event["result"])
            yield _sse(event)
        yield _sse({"kind": "done"})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/{persona_id}/agent/query", response_model=AgentTurnResponse)
async def query_agent(
    persona_id: str,
    payload: AgentQueryPayload,
    request: Request,
    session: Session = Depends(get_session),
) -> AgentTurnResponse:
    context = context_for(request, session, persona_id, payload.conversation_id, payload.attachment_ids)
    try_persist_text_message(
        request.app.state.session_factory,
        workspace_id=context.workspace_id,
        persona_id=persona_id,
        conversation_id=payload.conversation_id,
        role="user",
        content=payload.question,
        attachment_ids=payload.attachment_ids,
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = agent_runner_for(request.app.state)
    result = await request.app.state.realtime_executions.run(
        key,
        lambda: agent_runner.query(payload.question, context),
    )
    if result.status == "completed" and result.answer:
        try_persist_text_message(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
            role="assistant",
            content=result.answer,
            attachment_ids=_result_attachment_ids(result),
        )
        schedule_summary_after_turn(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
        )
    return response_for(result)


@router.post("/{persona_id}/agent/resume", response_model=AgentTurnResponse)
async def resume_agent(
    persona_id: str,
    payload: AgentResumePayload,
    request: Request,
    session: Session = Depends(get_session),
) -> AgentTurnResponse:
    context = context_for(
        request,
        session,
        persona_id,
        payload.conversation_id,
        payload.attachment_ids,
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = agent_runner_for(request.app.state)
    def _resume_call():
        # 旧的测试替身/第三方集成可能仍只接受三个位置参数；真实
        # AgentRuntime 支持结构化恢复字段。保持兼容不会改变新路径行为。
        try:
            return agent_runner.resume(
                context,
                payload.specialist,
                payload.approved,
                worker=payload.worker,
                task_id=payload.task_id,
                attachment_ids=tuple(payload.attachment_ids),
                input_values=payload.input_values,
            )
        except TypeError as exc:
            if "unexpected keyword argument" not in str(exc):
                raise
            return agent_runner.resume(context, payload.specialist, payload.approved)

    result = await request.app.state.realtime_executions.run(key, _resume_call)
    if result.status == "completed" and result.answer:
        try_persist_text_message(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
            role="assistant",
            content=result.answer,
            attachment_ids=_result_attachment_ids(result),
        )
        schedule_summary_after_turn(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
        )
    return response_for(result)
