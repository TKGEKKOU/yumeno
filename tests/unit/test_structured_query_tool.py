from agents.context import PersonaAgentContext
from agents.registry import READ_ONLY_TOOL_NAMES
from agents.tools.structured_query import (
    list_structured_tables_for_context,
    query_structured_data_for_context,
)
from structured_data.importer import import_structured_file
from structured_data.service import structured_db_path


def _context() -> PersonaAgentContext:
    return PersonaAgentContext(
        persona_id="persona-a",
        workspace_id="workspace-a",
        knowledge_space_ids=("space-a",),
        conversation_id="thread-a",
        persona_name="Ames",
        persona_type="character",
    )


def test_structured_query_tool_lists_schema_and_returns_standard_contract(tmp_path):
    source = tmp_path / "data.csv"
    source.write_text("name,value\na,1\nb,2\n", encoding="utf-8")
    imported = import_structured_file(
        source,
        db_path=structured_db_path(tmp_path, "workspace-a", "space-a"),
        workspace_id="workspace-a",
        knowledge_space_id="space-a",
        document_id="document-a",
    )
    table_name = imported.tables[0].physical_name

    tables = list_structured_tables_for_context(_context(), root=tmp_path)
    result = query_structured_data_for_context(
        _context(),
        f"SELECT c_001, c_002 FROM {table_name} ORDER BY c_002 DESC",
        root=tmp_path,
    )

    assert tables[0]["physical_name"] == table_name
    assert result["specialist"] == "knowledge_worker"
    assert result["status"] == "accepted"
    assert result["rows"][0] == ["b", 2]
    assert result["source"]["knowledge_space_id"] == "space-a"


def test_structured_query_tools_are_read_only_capabilities():
    assert "list_structured_tables" in READ_ONLY_TOOL_NAMES
    assert "query_structured_data" in READ_ONLY_TOOL_NAMES
