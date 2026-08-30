import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from starlette.requests import HTTPConnection

from app.chat_store import try_persist_text_message
from agents.context import PersonaAgentContext
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
) -> PersonaAgentContext:
    try:
        return persona_agent_context_from_session(
            session,
            connection.app.state.session_factory,
            persona_id,
            conversation_id,
        )
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc


def response_for(result) -> AgentTurnResponse:
    # 统一收敛 Agent 输出：只暴露注册工具的调用记录与知识证据，
    # 过滤内部 handoff ToolMessage 与图内部状态，保持 API 契约稳定。
    return AgentTurnResponse(
        status=result.status,
        answer=result.answer,
        specialist=result.specialist,
        pending_action=result.pending_action,
        tool_calls=list(result.tool_calls),
        evidence=list(result.evidence),
        trace=list(result.trace),
        duration_seconds=result.duration_seconds,
        loaded_skills=list(result.loaded_skills),
        events=list(result.events),
        metrics=dict(result.metrics),
    )


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False, default=str)}\n\n"


def _finalize_agent_turn(app, context, result) -> None:
    if result.status == "completed" and result.answer:
        try_persist_text_message(
            app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=context.persona_id,
            conversation_id=context.conversation_id,
            role="assistant",
            content=result.answer,
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
    context = context_for(request, session, persona_id, payload.conversation_id)
    try_persist_text_message(
        request.app.state.session_factory,
        workspace_id=context.workspace_id,
        persona_id=persona_id,
        conversation_id=payload.conversation_id,
        role="user",
        content=payload.question,
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = getattr(request.app.state, "agent_runtime", None) or request.app.state.agent_service

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
    context = context_for(request, session, persona_id, payload.conversation_id)
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = getattr(request.app.state, "agent_runtime", None) or request.app.state.agent_service

    async def generate():
        async for event in request.app.state.realtime_executions.run_stream(
            key,
            lambda: agent_runner.stream_resume(
                context,
                payload.specialist,
                payload.approved,
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
    context = context_for(request, session, persona_id, payload.conversation_id)
    try_persist_text_message(
        request.app.state.session_factory,
        workspace_id=context.workspace_id,
        persona_id=persona_id,
        conversation_id=payload.conversation_id,
        role="user",
        content=payload.question,
    )
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = getattr(request.app.state, "agent_runtime", None) or request.app.state.agent_service
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
    context = context_for(request, session, persona_id, payload.conversation_id)
    key = f"{persona_id}:{payload.conversation_id}"
    agent_runner = getattr(request.app.state, "agent_runtime", None) or request.app.state.agent_service
    result = await request.app.state.realtime_executions.run(
        key,
        lambda: agent_runner.resume(
            context,
            payload.specialist,
            payload.approved,
        ),
    )
    if result.status == "completed" and result.answer:
        try_persist_text_message(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
            role="assistant",
            content=result.answer,
        )
        schedule_summary_after_turn(
            request.app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=payload.conversation_id,
        )
    return response_for(result)

