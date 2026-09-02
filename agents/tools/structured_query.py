from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from langchain.tools import ToolRuntime, tool

from agents.sql_security import get_sql_security_guard
from agents.context import PersonaAgentContext
from settings import Settings
from structured_data.service import StructuredQueryService, structured_db_path
from structured_data.sql_guard import SqlPolicyError, validate_read_only_sql


def _root(root: Path | None) -> Path:
    return root or Settings.load().project_root


def _metadata(db_path: Path) -> list[dict]:
    if not db_path.is_file():
        return []
    uri = f"file:{db_path.resolve().as_posix()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True)
    try:
        rows = connection.execute(
            "SELECT physical_name, document_id, display_name, schema_json, row_count "
            "FROM _yumeno_datasets ORDER BY display_name, physical_name"
        ).fetchall()
        return [
            {
                "physical_name": row[0],
                "document_id": row[1],
                "display_name": row[2],
                "columns": json.loads(row[3]),
                "row_count": row[4],
            }
            for row in rows
        ]
    except sqlite3.Error:
        return []
    finally:
        connection.close()


def list_structured_tables_for_context(
    context: PersonaAgentContext,
    *,
    root: Path | None = None,
) -> list[dict]:
    tables: list[dict] = []
    for knowledge_space_id in context.knowledge_space_ids:
        db_path = structured_db_path(
            _root(root), context.workspace_id, knowledge_space_id
        )
        for table in _metadata(db_path):
            tables.append({**table, "knowledge_space_id": knowledge_space_id})
    return tables


def query_structured_data_for_context(
    context: PersonaAgentContext,
    sql: str,
    *,
    root: Path | None = None,
) -> dict:
    candidates: list[tuple[str, Path, list[dict]]] = []
    all_tables: set[str] = set()
    for knowledge_space_id in context.knowledge_space_ids:
        db_path = structured_db_path(
            _root(root), context.workspace_id, knowledge_space_id
        )
        tables = _metadata(db_path)
        candidates.append((knowledge_space_id, db_path, tables))
        all_tables.update(table["physical_name"] for table in tables)
    if not all_tables:
        return {
            "specialist": "knowledge",
            "status": "insufficient",
            "answer": "",
            "rows": [],
            "uncertainties": ["当前角色没有可查询的结构化表格。"],
        }
        # 增强安全验证
    security_guard = get_sql_security_guard()
    is_valid, error_msg = security_guard.validate_sql(sql, all_tables)
    if not is_valid:
        raise ValueError(f"query_denied:{error_msg}")
    
    try:
        validated = validate_read_only_sql(sql, allowed_tables=all_tables)
    except SqlPolicyError as exc:
        raise ValueError(f"query_denied:{exc}") from exc
    requested = set(validated.tables)
    selected = next(
        (
            (knowledge_space_id, db_path, tables)
            for knowledge_space_id, db_path, tables in candidates
            if requested.issubset({table["physical_name"] for table in tables})
        ),
        None,
    )
    if selected is None:
        raise ValueError("query_denied:cross_knowledge_space_query")
    knowledge_space_id, db_path, tables = selected
    allowed = {table["physical_name"] for table in tables}
    result = StructuredQueryService(db_path).query(sql, allowed_tables=allowed)
    data = result.as_dict()
    evidence_content = json.dumps(
        {"columns": data["columns"], "rows": data["rows"][:20]},
        ensure_ascii=False,
    )
    return {
        "specialist": "knowledge",
        "answer": evidence_content,
        **data,
        "status": "accepted",
        "source": {
            "type": "structured_data",
            "knowledge_space_id": knowledge_space_id,
            "tables": list(validated.tables),
        },
        "evidence": [
            {
                "source": "structured_data",
                "content": evidence_content,
                "tables": list(validated.tables),
            }
        ],
        "uncertainties": ["结果已按行数和大小上限截断。"] if result.truncated else [],
    }


@tool("list_structured_tables")
def list_structured_tables(runtime: ToolRuntime[PersonaAgentContext]) -> list[dict]:
    """List structured tables and physical column names in the active persona scope."""

    return list_structured_tables_for_context(runtime.context)


@tool("query_structured_data")
def query_structured_data(
    sql: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict:
    """Run one bounded read-only SELECT against an active structured table."""

    return query_structured_data_for_context(runtime.context, sql)
