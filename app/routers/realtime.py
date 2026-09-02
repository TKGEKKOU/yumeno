import asyncio
import json

from fastapi import APIRouter, HTTPException, Path, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.chat_store import try_persist_text_message
from app.routers.agents import agent_runner_for, context_for, response_for
from agents.service import AgentTurnResult
from realtime.protocol import (
    CancelEvent,
    ConfirmationEvent,
    PingEvent,
    TextSubmitEvent,
    parse_client_event,
    server_event,
)
from realtime.session import RealtimeSession, TurnInProgressError


router = APIRouter(tags=["realtime"])


@router.websocket("/ws/personas/{persona_id}/conversations/{conversation_id}")
async def persona_realtime(
    websocket: WebSocket,
    persona_id: str,
    conversation_id: str = Path(min_length=1, max_length=255),
) -> None:
    await websocket.accept()
    realtime = RealtimeSession()
    send_lock = asyncio.Lock()

    try:
        try:
            with websocket.app.state.session_factory() as db:
                context = context_for(websocket, db, persona_id, conversation_id)
        except HTTPException as exc:
            code = "persona_not_found" if exc.status_code == 404 else "invalid_context"
            await websocket.send_json(
                server_event("error", code=code, message=str(exc.detail))
            )
            await websocket.close(code=1008)
            return

        await websocket.send_json(
            server_event("session.ready", conversation_id=conversation_id)
        )

        async def send(event_type: str, *, turn_id: str | None = None, **payload) -> None:
            async with send_lock:
                await websocket.send_json(
                    server_event(event_type, turn_id=turn_id, **payload)
                )

        async def send_if_current(
            turn_id: str,
            event_type: str,
            **payload,
        ) -> None:
            async with send_lock:
                if realtime.is_current(turn_id):
                    await websocket.send_json(
                        server_event(event_type, turn_id=turn_id, **payload)
                    )

        async def run_query(turn_id: str, question: str, attachment_ids: tuple[str, ...] = ()) -> None:
            try:
                await send_if_current(turn_id, "turn.started")
                await send_if_current(turn_id, "agent.status", status="thinking")
                with websocket.app.state.session_factory() as db:
                    turn_context = context_for(websocket, db, persona_id, conversation_id, attachment_ids)
                try_persist_text_message(
                    websocket.app.state.session_factory,
                    workspace_id=turn_context.workspace_id,
                    persona_id=persona_id,
                    conversation_id=conversation_id,
                    role="user",
                    content=question,
                    attachment_ids=attachment_ids,
                )
                result: AgentTurnResult | None = None
                last_workflow_signature: str | None = None
                pending_workflow_task_id: str | None = None
                agent_runner = agent_runner_for(websocket.app.state)
                async for event in websocket.app.state.realtime_executions.run_stream(
                    f"{persona_id}:{conversation_id}",
                    lambda: agent_runner.stream_query(question, turn_context),
                ):
                    if not realtime.is_current(turn_id):
                        continue
                    if event.get("kind") == "clone_session":
                        if event.get("action") == "request_voice_material":
                            await send_if_current(turn_id, "upload.request", purpose="voice_material")
                        elif event.get("action") == "voice_session_created":
                            await send_if_current(
                                turn_id,
                                "upload.request",
                                purpose="voice_material",
                                session_id=event["session_id"],
                            )
                        continue
                    if event.get("kind") == "stage":
                        if event.get("action") == "request_voice_material":
                            await send_if_current(turn_id, "upload.request", purpose="voice_material")
                        stage_event = {"stage": event.get("stage") or ""}
                        if event.get("details"):
                            stage_event["details"] = event["details"]
                        await send_if_current(turn_id, "agent.stage", **stage_event)
                    elif event.get("kind") == "workflow_update" and event.get("flow"):
                        # workflow_update 可能来自 graph 的中间 updates/custom 事件。
                        # 在 AgentTurnResult 到达前，它不能证明 Core Agent 已完成
                        # supervisor -> worker handoff；尤其不能在“正在分析请求…”
                        # 阶段公开创建 RVC 工作区。最终 workflow 只从 result 发送。
                        # 仅暂存 task_id，等最终结果通过门禁后作为标识使用。
                        pending_workflow_task_id = event.get("task_id") or pending_workflow_task_id
                        continue
                    elif event.get("kind") == "token":
                        await send_if_current(turn_id, "text.delta", text=event.get("text") or "")
                    elif event.get("kind") == "result":
                        result = event.get("result")
                if result is None:
                    raise RuntimeError("Agent turn finished without a result")
                if not realtime.is_current(turn_id):
                    return
                response = response_for(result).model_dump(by_alias=True)
                workflow = response.get("workflow")
                workflow_worker = str(workflow.get("worker") or "").strip() if isinstance(workflow, dict) else ""
                result_worker = str(response.get("worker") or "").strip()
                # RVC 的公开门禁必须同时满足：最终结果携带 workflow，且最终
                # Agent 结果明确声明 worker=rvc_worker。不能只凭中间 flow/task
                # payload 或 specialist=management 激活 RVC UI。
                if workflow and (workflow_worker != "rvc_worker" or result_worker == "rvc_worker"):
                    signature = json.dumps(workflow, ensure_ascii=False, sort_keys=True, default=str)
                    if signature != last_workflow_signature:
                        last_workflow_signature = signature
                        await send_if_current(
                            turn_id,
                            "workflow.update",
                            task_id=next(
                                (
                                    str(item["task_id"])
                                    for item in reversed(response.get("artifacts") or [])
                                    if isinstance(item, dict) and item.get("task_id")
                                ),
                                pending_workflow_task_id,
                            ),
                            flow=workflow,
                        )
                if response["status"] == "completed":
                    try_persist_text_message(
                        websocket.app.state.session_factory,
                        workspace_id=context.workspace_id,
                        persona_id=persona_id,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=response["answer"],
                    )
                if response["status"] in {"pending_confirmation", "waiting_input"}:
                    await send_if_current(
                        turn_id,
                        "input.required" if response["status"] == "waiting_input" else "confirmation.required",
                        **response,
                    )
                    return
                await send_if_current(turn_id, "text.final", **response)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                await send_if_current(
                    turn_id,
                    "error",
                    code="agent_error",
                    message=str(exc),
                )
            finally:
                was_cancelled = not realtime.is_current(turn_id)
                await realtime.finish(turn_id)
                if was_cancelled:
                    try:
                        await send("session.ready", conversation_id=conversation_id)
                    except RuntimeError:
                        pass

        async def run_resume(
            turn_id: str,
            event: ConfirmationEvent,
        ) -> None:
            try:
                await send_if_current(turn_id, "turn.started")
                result: AgentTurnResult | None = None
                last_workflow_signature: str | None = None
                pending_workflow_task_id: str | None = None
                agent_runner = agent_runner_for(websocket.app.state)
                # 恢复时重新从数据库构建上下文：附件可能是在 WebSocket 建立后
                # 才上传的，不能继续复用连接建立时的旧 manifest。
                with websocket.app.state.session_factory() as db:
                    resume_context = context_for(
                        websocket,
                        db,
                        persona_id,
                        conversation_id,
                        tuple(event.attachment_ids),
                    )
                async for ev in websocket.app.state.realtime_executions.run_stream(
                    f"{persona_id}:{conversation_id}",
                    lambda: agent_runner.stream_resume(
                        resume_context,
                        event.specialist,
                        event.approved,
                        worker=event.worker,
                        task_id=event.task_id,
                        attachment_ids=tuple(event.attachment_ids),
                        input_values=event.input_values,
                    ),
                ):
                    if not realtime.is_current(turn_id):
                        continue
                    if ev.get("kind") == "clone_session":
                        if ev.get("action") == "request_voice_material":
                            await send_if_current(turn_id, "upload.request", purpose="voice_material")
                        elif ev.get("action") == "voice_session_created":
                            await send_if_current(
                                turn_id,
                                "upload.request",
                                purpose="voice_material",
                                session_id=ev["session_id"],
                            )
                        continue
                    if ev.get("kind") == "stage":
                        if ev.get("action") == "request_voice_material":
                            await send_if_current(turn_id, "upload.request", purpose="voice_material")
                        stage_event = {"stage": ev.get("stage") or ""}
                        if ev.get("details"):
                            stage_event["details"] = ev["details"]
                        await send_if_current(turn_id, "agent.stage", **stage_event)
                    elif ev.get("kind") == "workflow_update" and ev.get("flow"):
                        # 与普通查询一致：恢复流中的中间 workflow 不直接公开。
                        # 必须等最终 AgentTurnResult 确认 handoff 后再发送。
                        # 仅暂存 task_id，等最终结果通过门禁后作为标识使用。
                        pending_workflow_task_id = ev.get("task_id") or pending_workflow_task_id
                        continue
                    elif ev.get("kind") == "token":
                        await send_if_current(turn_id, "text.delta", text=ev.get("text") or "")
                    elif ev.get("kind") == "result":
                        result = ev.get("result")
                if result is None:
                    raise RuntimeError("Agent turn finished without a result")
                if not realtime.is_current(turn_id):
                    return
                response = response_for(result).model_dump(by_alias=True)
                workflow = response.get("workflow")
                workflow_worker = str(workflow.get("worker") or "").strip() if isinstance(workflow, dict) else ""
                result_worker = str(response.get("worker") or "").strip()
                # RVC 的公开门禁必须同时满足：最终结果携带 workflow，且最终
                # Agent 结果明确声明 worker=rvc_worker。不能只凭中间 flow/task
                # payload 或 specialist=management 激活 RVC UI。
                if workflow and (workflow_worker != "rvc_worker" or result_worker == "rvc_worker"):
                    signature = json.dumps(workflow, ensure_ascii=False, sort_keys=True, default=str)
                    if signature != last_workflow_signature:
                        last_workflow_signature = signature
                        await send_if_current(
                            turn_id,
                            "workflow.update",
                            task_id=next(
                                (
                                    str(item["task_id"])
                                    for item in reversed(response.get("artifacts") or [])
                                    if isinstance(item, dict) and item.get("task_id")
                                ),
                                pending_workflow_task_id,
                            ),
                            flow=workflow,
                        )
                if response["status"] == "completed":
                    try_persist_text_message(
                        websocket.app.state.session_factory,
                        workspace_id=context.workspace_id,
                        persona_id=persona_id,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=response["answer"],
                    )
                if response["status"] in {"pending_confirmation", "waiting_input"}:
                    await send_if_current(
                        turn_id,
                        "input.required" if response["status"] == "waiting_input" else "confirmation.required",
                        **response,
                    )
                    return
                await send_if_current(turn_id, "text.final", **response)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                await send_if_current(
                    turn_id,
                    "error",
                    code="agent_error",
                    message=str(exc),
                )
            finally:
                was_cancelled = not realtime.is_current(turn_id)
                await realtime.finish(turn_id)
                if was_cancelled:
                    try:
                        await send("session.ready", conversation_id=conversation_id)
                    except RuntimeError:
                        pass

        while True:
            try:
                event = parse_client_event(await websocket.receive_json())
            except (ValidationError, ValueError) as exc:
                await send(
                    "error",
                    code="invalid_event",
                    message=str(exc),
                )
                continue

            if isinstance(event, PingEvent):
                await send("session.pong")
            elif isinstance(event, CancelEvent):
                cancelled = await realtime.cancel()
                if cancelled:
                    await send("turn.cancelled", turn_id=cancelled)
            elif isinstance(event, TextSubmitEvent):
                try:
                    await realtime.start(
                        lambda turn_id: run_query(turn_id, event.question, tuple(event.attachment_ids))
                    )
                except TurnInProgressError as exc:
                    await send("error", code="turn_in_progress", message=str(exc))
            elif isinstance(event, ConfirmationEvent):
                try:
                    await realtime.start(
                        lambda turn_id: run_resume(turn_id, event)
                    )
                except TurnInProgressError as exc:
                    await send("error", code="turn_in_progress", message=str(exc))
    except WebSocketDisconnect:
        pass
    finally:
        await realtime.close()
