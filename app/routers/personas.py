from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.database import get_session
from app.models import DocumentJob, Persona
from app.schemas import DocumentJobResponse, PersonaCreate, PersonaResponse, PersonaUpdate
from agents.policy import CapabilityPolicyStore
from agents.registry import capability_catalog
from agents.skills import list_skills
from agents.capability_packages import build_capability_packages
from integrations.mcp.config import GLOBAL_ALL
from persona.service import LOCAL_WORKSPACE_ID, PersonaNotFound, create_persona
from settings import Settings
from rag.retrieval_config import validate_retrieval_config

router = APIRouter(prefix="/api/personas", tags=["personas"])


@router.post("", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
def create(payload: PersonaCreate, session: Session = Depends(get_session)) -> Persona:
    persona = create_persona(session, payload.name, payload.profile)
    session.commit()
    session.refresh(persona)
    return persona


@router.get("", response_model=list[PersonaResponse])
def list_personas(session: Session = Depends(get_session)) -> list[Persona]:
    statement = (
        select(Persona)
        .where(Persona.workspace_id == LOCAL_WORKSPACE_ID)
        .order_by(Persona.created_at, Persona.id)
    )
    return list(session.scalars(statement))


def local_persona_or_404(session: Session, persona_id: str) -> Persona:
    persona = session.get(Persona, persona_id)
    if persona is None or persona.workspace_id != LOCAL_WORKSPACE_ID:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


def _mcp_manager(request: Request):
    manager = getattr(request.app.state, "mcp_manager", None)
    if manager is None:
        raise HTTPException(status_code=503, detail="MCP 管理器尚未就绪")
    return manager


@router.get("/{persona_id}/mcp-grants")
def get_mcp_grants(persona_id: str, request: Request) -> dict:
    """返回角色可用的 MCP 服务器及当前授权状态。"""

    manager = _mcp_manager(request)
    return {
        "persona_id": persona_id,
        "servers": [
            {
                "name": server.name,
                "description": server.description,
                "enabled": server.enabled,
                "global": GLOBAL_ALL in server.allowed_persona_ids,
                "authorized": (
                    GLOBAL_ALL in server.allowed_persona_ids
                    or persona_id in server.allowed_persona_ids
                ),
            }
            for server in manager.list_configs()
        ],
    }


@router.put("/{persona_id}/mcp-grants")
def put_mcp_grants(persona_id: str, request: Request, payload: dict) -> dict:
    """保存角色授权并即时刷新可见性（无需重启）。"""

    manager = _mcp_manager(request)
    wanted = set(str(name) for name in payload.get("server_names") or [])
    servers = manager.list_configs()
    for server in servers:
        # 平台级全局服务器不参与按角色授权，保持对所有角色可见
        if GLOBAL_ALL in server.allowed_persona_ids:
            continue
        ids = set(server.allowed_persona_ids)
        if server.name in wanted:
            ids.add(persona_id)
        else:
            ids.discard(persona_id)
        server.allowed_persona_ids = sorted(ids)
    try:
        manager.save_configs(servers)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    from agents.mcp_grants import refresh_grants

    refresh_grants()
    return {"persona_id": persona_id, "server_names": sorted(wanted)}


@router.get("/{persona_id}/capabilities")
def get_persona_capabilities(
    persona_id: str,
    request: Request,
    session: Session = Depends(get_session),
) -> dict:
    """Return the unified Tool/MCP capability catalog and persona overrides."""

    local_persona_or_404(session, persona_id)
    store = CapabilityPolicyStore(
        sessionmaker(bind=session.get_bind(), autoflush=False, expire_on_commit=False)
    )
    policies = store.list_for_persona(persona_id)
    overrides = {
        policy.capability_id: policy.enabled
        for policy in policies
        if policy.persona_id == persona_id
    }
    catalog = capability_catalog()
    skills = list(list_skills())
    server_states = {}
    manager = getattr(request.app.state, "mcp_manager", None)
    if manager is not None:
        statuses = manager.status()
        for server in manager.list_configs():
            runtime_status = statuses.get(server.name, {})
            server_states[server.name] = {
                "enabled": server.enabled,
                "connected": runtime_status.get("status") == "connected",
                "authorized": (
                    GLOBAL_ALL in server.allowed_persona_ids
                    or persona_id in server.allowed_persona_ids
                ),
            }
    return {
        "persona_id": persona_id,
        "overrides": overrides,
        "skills": [
            {
                "id": f"skill/{skill.name}",
                "name": skill.name,
                "description": skill.description,
                "builtin": skill.builtin,
                "enabled": skill.enabled,
                "trusted": skill.trusted,
                "tool_names": list(skill.tool_names),
            }
            for skill in skills
        ],
        "capabilities": [
            {
                "id": item.capability_id,
                "name": item.name,
                "model_name": item.model_name,
                "source": item.source,
                "server": item.server,
                "requires_confirmation": item.confirmation_required,
                "mutates_data": item.mutates_data,
                "default_allowed": item.default_allowed,
            }
            for item in catalog.list()
        ],
        "packages": build_capability_packages(
            skills=skills,
            capabilities=catalog.list(),
            persona_id=persona_id,
            policies=policies,
            server_states=server_states,
        ),
    }


@router.put("/{persona_id}/capabilities")
def put_persona_capabilities(
    persona_id: str,
    payload: dict,
    session: Session = Depends(get_session),
) -> dict:
    """Atomically replace explicit capability overrides for one persona."""

    local_persona_or_404(session, persona_id)
    values = payload.get("overrides") or {}
    if not isinstance(values, dict):
        raise HTTPException(status_code=422, detail="overrides must be an object")
    known = {item.capability_id for item in capability_catalog().list()}
    known.update(f"skill/{skill.name}" for skill in list_skills())
    invalid = [key for key in values if key not in known and not str(key).endswith("/*")]
    if invalid:
        raise HTTPException(status_code=422, detail=f"Unknown capabilities: {', '.join(invalid)}")
    store = CapabilityPolicyStore(
        sessionmaker(bind=session.get_bind(), autoflush=False, expire_on_commit=False)
    )
    try:
        saved = store.replace_for_persona(persona_id, values)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "persona_id": persona_id,
        "overrides": {
            item.capability_id: item.enabled
            for item in saved
            if item.persona_id == persona_id
        },
    }


@router.get("/{persona_id}", response_model=PersonaResponse)
def get_persona(persona_id: str, session: Session = Depends(get_session)) -> Persona:
    return local_persona_or_404(session, persona_id)


@router.patch("/{persona_id}", response_model=PersonaResponse)
def update_persona(
    persona_id: str,
    payload: PersonaUpdate,
    session: Session = Depends(get_session),
) -> Persona:
    persona = local_persona_or_404(session, persona_id)
    if payload.name is not None:
        persona.name = payload.name
    if payload.profile is not None:
        merged = {**(persona.profile_json or {}), **payload.profile}
        if "rag" in merged:
            try:
                merged["rag"] = validate_retrieval_config(merged["rag"]).__dict__
            except (TypeError, ValueError) as exc:
                raise HTTPException(status_code=422, detail=f"Invalid RAG configuration: {exc}") from exc
        persona.profile_json = merged
    session.commit()
    session.refresh(persona)
    return persona


@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(
    persona_id: str,
    request: Request,
    session: Session = Depends(get_session),
) -> Response:
    try:
        request.app.state.persona_delete_service.delete(session, persona_id)
    except PersonaNotFound as exc:
        raise HTTPException(status_code=404, detail="Persona not found") from exc
    voice = Settings.load().project_root / "data" / "tts" / "voices" / f"{persona_id}.wav"
    voice.unlink(missing_ok=True)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{persona_id}/documents", response_model=list[DocumentJobResponse])
def list_persona_documents(
    persona_id: str,
    session: Session = Depends(get_session),
) -> list[DocumentJob]:
    persona = local_persona_or_404(session, persona_id)
    statement = (
        select(DocumentJob)
        .where(
            DocumentJob.workspace_id == LOCAL_WORKSPACE_ID,
            DocumentJob.knowledge_space_id == persona.knowledge_space_id,
            DocumentJob.status != "deleted",
        )
        .order_by(DocumentJob.created_at, DocumentJob.id)
    )
    return list(session.scalars(statement))
