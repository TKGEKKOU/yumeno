from collections.abc import Callable

from agents.context import PersonaAgentContext
from agents.policy import CapabilityPolicyStore
from app.conversation_summary import get_conversation_summary
from app.models import ConversationAttachment, Persona
from sqlalchemy import select
from persona.service import PersonaNotFound, resolve_knowledge_scope


def persona_agent_context_from_session(
    session,
    session_factory: Callable,
    persona_id: str,
    conversation_id: str,
    agent_runtime=None,
    attachment_ids: tuple[str, ...] = (),
) -> PersonaAgentContext:
    """Build the authoritative context shared by HTTP and integration adapters."""

    scope = resolve_knowledge_scope(session, persona_id)
    persona = session.get(Persona, persona_id)
    if persona is None:
        raise PersonaNotFound(persona_id)
    attachments = session.scalars(select(ConversationAttachment).where(
        ConversationAttachment.workspace_id == scope.workspace_id,
        ConversationAttachment.conversation_id == conversation_id,
        ConversationAttachment.status == "ready",
    )).all()
    selected = set(attachment_ids)
    manifest = tuple({
        "file_id": item.id, "name": item.name, "mime_type": item.mime_type,
        "kind": item.kind, "size": item.size, "duration": item.duration,
        "width": item.width, "height": item.height,
        "source": item.source, "status": item.status,
        "selected": item.id in selected,
        "uses": (["rvc"] if item.kind in {"audio", "video"} else ["rag"] if item.kind == "document" else ["vision"] if item.kind == "image" else ["file"]),
    } for item in attachments)
    return PersonaAgentContext(
        persona_id=persona.id,
        workspace_id=scope.workspace_id,
        knowledge_space_ids=scope.knowledge_space_ids,
        conversation_id=conversation_id,
        attachment_ids=tuple(item["file_id"] for item in manifest if item["selected"]),
        attachment_manifest=manifest,
        persona_name=persona.name,
        persona_type=persona.persona_type,
        persona_profile=persona.profile_json,
        session_factory=session_factory,
        conversation_summary=get_conversation_summary(
            session, scope.workspace_id, persona.id, conversation_id
        ),
        capability_policies=tuple(
            CapabilityPolicyStore(session_factory).list_for_persona(
                persona.id, session=session
            )
        ),
        agent_runtime=agent_runtime,
    )


def persona_agent_context(
    session_factory: Callable,
    persona_id: str,
    conversation_id: str,
    agent_runtime=None,
    attachment_ids: tuple[str, ...] = (),
) -> PersonaAgentContext:
    with session_factory() as session:
        return persona_agent_context_from_session(
            session,
            session_factory,
            persona_id,
            conversation_id,
            agent_runtime=agent_runtime,
            attachment_ids=attachment_ids,
        )


def build_agent_runner(session_factory: Callable, agent_service):
    """把 Agent 查询包装成同步 runner，供插件与 IM 路由复用。"""

    def run(question: str, persona_id: str, conversation_id: str) -> dict:
        context = persona_agent_context(
            session_factory,
            persona_id,
            conversation_id,
            agent_runtime=getattr(agent_service, "runtime", None),
        )
        result = agent_service.query(question, context)
        return {
            "status": result.status,
            "answer": result.answer,
            "specialist": result.specialist,
            "pending_action": result.pending_action,
            "tool_calls": list(result.tool_calls),
            "evidence": list(result.evidence),
            "trace": list(result.trace),
            "duration_seconds": result.duration_seconds,
            "loaded_skills": list(result.loaded_skills),
            "events": list(result.events),
            "metrics": dict(result.metrics),
        }

    return run
