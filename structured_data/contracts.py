from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class StructuredColumn:
    physical_name: str
    display_name: str
    data_type: str


@dataclass(frozen=True)
class StructuredTable:
    physical_name: str
    display_name: str
    columns: tuple[StructuredColumn, ...]
    row_count: int


@dataclass(frozen=True)
class StructuredImportResult:
    document_id: str
    tables: tuple[StructuredTable, ...]
    row_count: int
    schema_card: str


@dataclass(frozen=True)
class StructuredQueryResult:
    status: str
    columns: tuple[str, ...]
    rows: tuple[list[Any], ...]
    row_count: int
    truncated: bool
    duration_ms: float

    def as_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "columns": list(self.columns),
            "rows": list(self.rows),
            "row_count": self.row_count,
            "truncated": self.truncated,
            "duration_ms": round(self.duration_ms, 1),
        }
