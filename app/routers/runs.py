from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from agents.runtime.approvals import ApprovalService
from agents.runtime.errors import RuntimeErrorCode, RuntimeOperationError, public_error_message
from app.schemas import RunApprovalPayload

router = APIRouter(prefix="/api/runs", tags=["agent-runtime"])


def _error(code: str | RuntimeErrorCode, status_code: int) -> JSONResponse:
    normalized = code.value if isinstance(code, RuntimeErrorCode) else code
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": normalized, "message": public_error_message(normalized)}},
    )


def _status_for_error(code: str) -> int:
    return 404 if code == RuntimeErrorCode.RUN_NOT_FOUND.value else 409


def _run_response(run) -> dict:
    return {"run": run.model_dump(mode="json")}


@router.get("/{run_id}")
def get_run(run_id: str, request: Request):
    run = request.app.state.run_store.get(run_id)
    if run is None:
        return _error(RuntimeErrorCode.RUN_NOT_FOUND, 404)
    return _run_response(run)


@router.get("/{run_id}/events")
def get_run_events(run_id: str, request: Request, after_sequence: int = 0):
    store = request.app.state.run_store
    if store.get(run_id) is None:
        return _error(RuntimeErrorCode.RUN_NOT_FOUND, 404)
    events = store.list_events(run_id, after_sequence=after_sequence)
    return {"run_id": run_id, "events": [event.model_dump(mode="json") for event in events]}


@router.post("/{run_id}/cancel")
def cancel_run(run_id: str, request: Request):
    try:
        run = request.app.state.agent_runtime.cancel(run_id)
    except RuntimeOperationError as exc:
        return _error(exc.code, _status_for_error(exc.code))
    return _run_response(run)


@router.post("/{run_id}/approval")
def decide_approval(run_id: str, payload: RunApprovalPayload, request: Request):
    try:
        approval_service = getattr(request.app.state, "approval_service", None) or ApprovalService(request.app.state.agent_runtime)
        run = approval_service.decide(run_id, payload.approved)
    except RuntimeOperationError as exc:
        return _error(exc.code, _status_for_error(exc.code))
    return {"run": run.model_dump(mode="json"), "approved": payload.approved}

