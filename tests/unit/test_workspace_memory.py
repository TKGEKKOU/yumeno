from sqlalchemy import func, select

from agents.context import PersonaAgentContext
from agents.registry import MUTATION_TOOL_NAMES
from agents.tools.workspace_memory import (
    save_workspace_memory_for_context,
    workspace_memories_for_context,
)
from app.models import WorkspaceMemory


def _context(db_session, workspace_id: str) -> PersonaAgentContext:
    return PersonaAgentContext(
        persona_id="persona-a",
        workspace_id=workspace_id,
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
        session_factory=lambda: db_session,
    )


def test_workspace_memory_is_isolated_by_workspace(db_session):
    created = save_workspace_memory_for_context(
        _context(db_session, "workspace-a"), "公司统一使用 UTC"
    )

    assert created["status"] == "saved"
    assert workspace_memories_for_context(_context(db_session, "workspace-b")) == []
    assert [item["content"] for item in workspace_memories_for_context(
        _context(db_session, "workspace-a")
    )] == ["公司统一使用 UTC"]
    assert db_session.scalar(select(func.count()).select_from(WorkspaceMemory)) == 1


def test_workspace_memory_read_is_bounded_to_recent_items(db_session):
    context = _context(db_session, "workspace-a")
    for index in range(5):
        save_workspace_memory_for_context(context, f"fact-{index}")

    results = workspace_memories_for_context(context, limit=2)

    assert [item["content"] for item in results] == ["fact-4", "fact-3"]


def test_workspace_memory_mutation_requires_confirmation():
    assert "save_workspace_memory" in MUTATION_TOOL_NAMES
    assert "delete_workspace_memory" in MUTATION_TOOL_NAMES
