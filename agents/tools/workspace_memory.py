from __future__ import annotations

from langchain.tools import ToolRuntime, tool
from sqlalchemy import select

from agents.context import PersonaAgentContext
from app.models import WorkspaceMemory


def _session(context: PersonaAgentContext):
    if context.session_factory is None:
        raise RuntimeError("Database session is unavailable")
    return context.session_factory()


def workspace_memories_for_context(
    context: PersonaAgentContext,
    limit: int = 12,
) -> list[dict]:
    session = _session(context)
    try:
        statement = (
            select(WorkspaceMemory)
            .where(WorkspaceMemory.workspace_id == context.workspace_id)
            .order_by(WorkspaceMemory.id.desc())
            .limit(max(1, min(int(limit), 50)))
        )
        return [
            {
                "id": memory.id,
                "content": memory.content,
                "updated_at": memory.updated_at.isoformat() if memory.updated_at else None,
            }
            for memory in session.scalars(statement)
        ]
    finally:
        session.close()


def save_workspace_memory_for_context(
    context: PersonaAgentContext,
    content: str,
) -> dict:
    content = content.strip()
    if not content:
        raise ValueError("workspace memory content must not be empty")
    if len(content) > 2000:
        raise ValueError("workspace memory content is too long")
    session = _session(context)
    try:
        memory = WorkspaceMemory(workspace_id=context.workspace_id, content=content)
        session.add(memory)
        session.commit()
        session.refresh(memory)
        return {"status": "saved", "memory_id": memory.id, "content": memory.content}
    finally:
        session.close()


def delete_workspace_memory_for_context(
    context: PersonaAgentContext,
    memory_id: str,
) -> dict:
    session = _session(context)
    try:
        memory = session.scalar(
            select(WorkspaceMemory).where(
                WorkspaceMemory.id == memory_id,
                WorkspaceMemory.workspace_id == context.workspace_id,
            )
        )
        if memory is None:
            raise LookupError("Workspace memory not found")
        session.delete(memory)
        session.commit()
        return {"status": "deleted", "memory_id": memory_id}
    finally:
        session.close()


@tool("read_workspace_memories")
def read_workspace_memories(runtime: ToolRuntime[PersonaAgentContext]) -> list[dict]:
    """Read bounded global memories for the active workspace."""

    return workspace_memories_for_context(runtime.context)


@tool("save_workspace_memory")
def save_workspace_memory(
    content: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict:
    """Save a shared workspace fact after user confirmation."""

    return save_workspace_memory_for_context(runtime.context, content)


@tool("delete_workspace_memory")
def delete_workspace_memory(
    memory_id: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict:
    """Delete a shared workspace fact after user confirmation."""

    return delete_workspace_memory_for_context(runtime.context, memory_id)
