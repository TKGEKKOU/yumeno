from __future__ import annotations

import hashlib
import sqlite3
import time
from pathlib import Path
from typing import Any

from structured_data.contracts import StructuredQueryResult
from structured_data.sql_guard import SqlPolicyError, validate_read_only_sql


def structured_db_path(root: Path, workspace_id: str, knowledge_space_id: str) -> Path:
    workspace = hashlib.sha256(workspace_id.encode()).hexdigest()[:16]
    knowledge_space = hashlib.sha256(knowledge_space_id.encode()).hexdigest()[:16]
    return root / "data" / "structured" / workspace / f"{knowledge_space}.db"


def delete_structured_document(
    root: Path,
    workspace_id: str,
    knowledge_space_id: str,
    document_id: str,
) -> int:
    """Delete only the tables owned by one document and keep sibling datasets."""

    db_path = structured_db_path(root, workspace_id, knowledge_space_id)
    if not db_path.is_file():
        return 0
    connection = sqlite3.connect(db_path)
    removed = 0
    empty = False
    try:
        tables = connection.execute(
            "SELECT physical_name FROM _yumeno_datasets WHERE document_id = ?",
            (document_id,),
        ).fetchall()
        for (table_name,) in tables:
            if str(table_name).startswith("t_"):
                connection.execute(f'DROP TABLE IF EXISTS "{table_name}"')
                removed += 1
        connection.execute(
            "DELETE FROM _yumeno_datasets WHERE document_id = ?", (document_id,)
        )
        empty = (
            connection.execute("SELECT COUNT(*) FROM _yumeno_datasets").fetchone()[0]
            == 0
        )
        connection.commit()
    except sqlite3.OperationalError as exc:
        if "no such table" not in str(exc).lower():
            raise
        connection.rollback()
    finally:
        connection.close()
    if empty:
        delete_structured_knowledge_space(root, workspace_id, knowledge_space_id)
    return removed


def delete_structured_knowledge_space(
    root: Path,
    workspace_id: str,
    knowledge_space_id: str,
) -> bool:
    """Delete one knowledge space database and its SQLite sidecar files."""

    db_path = structured_db_path(root, workspace_id, knowledge_space_id)
    removed = False
    for path in (db_path, Path(f"{db_path}-wal"), Path(f"{db_path}-shm")):
        for attempt in range(3):
            if not path.is_file():
                break
            try:
                path.unlink()
                removed = True
                break
            except PermissionError:
                if attempt == 2:
                    raise
                time.sleep(0.05)
    return removed


class StructuredQueryService:
    def __init__(
        self,
        db_path: Path,
        *,
        row_limit: int = 100,
        column_limit: int = 50,
        byte_limit: int = 256_000,
        timeout_seconds: float = 2.0,
    ) -> None:
        self.db_path = db_path
        self.row_limit = max(1, min(int(row_limit), 500))
        self.column_limit = max(1, min(int(column_limit), 100))
        self.byte_limit = max(1024, int(byte_limit))
        self.timeout_seconds = max(0.05, float(timeout_seconds))

    def query(self, sql: str, *, allowed_tables: set[str]) -> StructuredQueryResult:
        try:
            validated = validate_read_only_sql(
                sql,
                allowed_tables=allowed_tables,
                row_limit=self.row_limit,
            )
        except SqlPolicyError as exc:
            raise ValueError(f"query_denied:{exc}") from exc
        if not self.db_path.is_file():
            raise ValueError("structured_database_not_found")

        started = time.perf_counter()
        deadline = started + self.timeout_seconds
        uri = f"file:{self.db_path.resolve().as_posix()}?mode=ro"
        connection = sqlite3.connect(uri, uri=True)
        allowed_lower = {table.lower() for table in allowed_tables}
        write_actions = {
            sqlite3.SQLITE_INSERT,
            sqlite3.SQLITE_UPDATE,
            sqlite3.SQLITE_DELETE,
            sqlite3.SQLITE_CREATE_INDEX,
            sqlite3.SQLITE_CREATE_TABLE,
            sqlite3.SQLITE_CREATE_TEMP_INDEX,
            sqlite3.SQLITE_CREATE_TEMP_TABLE,
            sqlite3.SQLITE_CREATE_TEMP_TRIGGER,
            sqlite3.SQLITE_CREATE_TEMP_VIEW,
            sqlite3.SQLITE_CREATE_TRIGGER,
            sqlite3.SQLITE_CREATE_VIEW,
            sqlite3.SQLITE_DROP_INDEX,
            sqlite3.SQLITE_DROP_TABLE,
            sqlite3.SQLITE_DROP_TEMP_INDEX,
            sqlite3.SQLITE_DROP_TEMP_TABLE,
            sqlite3.SQLITE_DROP_TEMP_TRIGGER,
            sqlite3.SQLITE_DROP_TEMP_VIEW,
            sqlite3.SQLITE_DROP_TRIGGER,
            sqlite3.SQLITE_DROP_VIEW,
            sqlite3.SQLITE_ALTER_TABLE,
            sqlite3.SQLITE_ATTACH,
            sqlite3.SQLITE_DETACH,
            sqlite3.SQLITE_PRAGMA,
        }

        def authorize(action, arg1, arg2, _database, _trigger):
            if action in write_actions:
                return sqlite3.SQLITE_DENY
            if action == sqlite3.SQLITE_READ:
                table = str(arg1 or "").lower()
                if table.startswith("sqlite_") or table not in allowed_lower:
                    return sqlite3.SQLITE_DENY
            if action == sqlite3.SQLITE_FUNCTION:
                function = str(arg2 or arg1 or "").lower()
                if function in {"load_extension", "readfile", "writefile", "randomblob"}:
                    return sqlite3.SQLITE_DENY
            return sqlite3.SQLITE_OK

        try:
            connection.execute("PRAGMA query_only = ON")
            connection.set_authorizer(authorize)
            connection.set_progress_handler(
                lambda: 1 if time.perf_counter() > deadline else 0,
                1000,
            )
            cursor = connection.execute(validated.sql)
            columns = tuple(item[0] for item in (cursor.description or ()))
            if len(columns) > self.column_limit:
                raise ValueError("query_result_column_limit_exceeded")
            fetched = cursor.fetchmany(self.row_limit + 1)
            truncated = len(fetched) > self.row_limit
            rows = fetched[: self.row_limit]
            size = 0
            safe_rows: list[list[Any]] = []
            for row in rows:
                safe_row = [self._safe_value(value) for value in row]
                size += len(str(safe_row).encode("utf-8"))
                if size > self.byte_limit:
                    truncated = True
                    break
                safe_rows.append(safe_row)
            duration = (time.perf_counter() - started) * 1000
            return StructuredQueryResult(
                status="completed",
                columns=columns,
                rows=tuple(safe_rows),
                row_count=len(safe_rows),
                truncated=truncated,
                duration_ms=duration,
            )
        except sqlite3.Error as exc:
            raise ValueError("query_failed") from exc
        finally:
            connection.close()

    @staticmethod
    def _safe_value(value: Any) -> Any:
        if value is None or isinstance(value, (str, int, float, bool)):
            return value
        if isinstance(value, bytes):
            return f"<bytes:{len(value)}>"
        return str(value)
