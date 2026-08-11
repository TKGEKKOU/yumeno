import csv
import sqlite3

import pytest

from structured_data.importer import import_structured_file
from structured_data.service import (
    StructuredQueryService,
    delete_structured_document,
    delete_structured_knowledge_space,
    structured_db_path,
)


def test_csv_import_creates_schema_card_and_supports_scoped_query(tmp_path):
    source = tmp_path / "sales.csv"
    with source.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["地区", "销售额"])
        writer.writerow(["华东", "10"])
        writer.writerow(["华东", "20"])
        writer.writerow(["华南", "7"])

    db_path = structured_db_path(tmp_path, "workspace-a", "space-a")
    imported = import_structured_file(
        source,
        db_path=db_path,
        workspace_id="workspace-a",
        knowledge_space_id="space-a",
        document_id="document-a",
    )
    table = imported.tables[0]
    result = StructuredQueryService(db_path).query(
        f"SELECT c_001, SUM(c_002) AS total FROM {table.physical_name} "
        "GROUP BY c_001 ORDER BY total DESC",
        allowed_tables={table.physical_name},
    )

    assert imported.row_count == 3
    assert "地区" in imported.schema_card
    assert result.status == "completed"
    assert result.rows[0] == ["华东", 30]


def test_query_service_blocks_cross_scope_table_even_when_same_file(tmp_path):
    source = tmp_path / "sales.csv"
    source.write_text("name,value\na,1\n", encoding="utf-8")
    db_path = structured_db_path(tmp_path, "workspace-a", "space-a")
    imported = import_structured_file(
        source,
        db_path=db_path,
        workspace_id="workspace-a",
        knowledge_space_id="space-a",
        document_id="document-a",
    )

    with pytest.raises(ValueError, match="query_denied"):
        StructuredQueryService(db_path).query(
            f"SELECT * FROM {imported.tables[0].physical_name}",
            allowed_tables={"t_some_other_document"},
        )


def test_delete_structured_document_preserves_other_documents(tmp_path):
    first = tmp_path / "first.csv"
    second = tmp_path / "second.csv"
    first.write_text("name,value\na,1\n", encoding="utf-8")
    second.write_text("name,value\nb,2\n", encoding="utf-8")
    db_path = structured_db_path(tmp_path, "workspace-a", "space-a")
    first_result = import_structured_file(
        first,
        db_path=db_path,
        workspace_id="workspace-a",
        knowledge_space_id="space-a",
        document_id="document-a",
    )
    second_result = import_structured_file(
        second,
        db_path=db_path,
        workspace_id="workspace-a",
        knowledge_space_id="space-a",
        document_id="document-b",
    )

    assert delete_structured_document(
        tmp_path, "workspace-a", "space-a", "document-a"
    ) == 1
    connection = sqlite3.connect(db_path)
    try:
        tables = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
    finally:
        connection.close()
    assert first_result.tables[0].physical_name not in tables
    assert second_result.tables[0].physical_name in tables

    assert delete_structured_knowledge_space(
        tmp_path, "workspace-a", "space-a"
    ) is True
    assert not db_path.exists()
