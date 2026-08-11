"""Lightweight, reproducible enterprise Agent/RAG micro-benchmarks."""

from __future__ import annotations

import json
import platform
import time
from pathlib import Path

from agents.context_budget import ContextBudget, build_bounded_context, estimate_messages_tokens
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from agents.context import PersonaAgentContext
from structured_data.importer import import_structured_file
from structured_data.service import StructuredQueryService, structured_db_path
from structured_data.sql_guard import SqlPolicyError, validate_read_only_sql


def _percentile(values: list[float], quantile: float) -> float:
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, int(len(ordered) * quantile + 0.999999) - 1))
    return round(ordered[index], 3)


def _measure_cross_scope_isolation(root: Path, primary_table: str) -> tuple[int, int]:
    cases = [
        ("benchmark-workspace", "other-space", "other-space-document"),
        ("other-workspace", "benchmark-space", "other-workspace-document"),
    ]
    foreign: list[tuple[StructuredQueryService, str]] = []
    for workspace_id, knowledge_space_id, document_id in cases:
        source = root / f"{document_id}.csv"
        source.write_text("name,value\nforeign,1\n", encoding="utf-8")
        db_path = structured_db_path(root, workspace_id, knowledge_space_id)
        imported = import_structured_file(
            source,
            db_path=db_path,
            workspace_id=workspace_id,
            knowledge_space_id=knowledge_space_id,
            document_id=document_id,
        )
        foreign.append((StructuredQueryService(db_path), imported.tables[0].physical_name))

    primary_service = StructuredQueryService(
        structured_db_path(root, "benchmark-workspace", "benchmark-space")
    )
    probes = [
        (primary_service, table_name)
        for _, table_name in foreign
    ] + [
        (service, primary_table)
        for service, _ in foreign
    ]
    blocked = 0
    for service, table_name in probes:
        try:
            service.query(
                f"SELECT * FROM {table_name}",
                allowed_tables={table_name},
            )
        except ValueError:
            blocked += 1
    return len(probes), blocked


def run_benchmark(
    *,
    root: Path,
    rows: int = 1000,
    query_iterations: int = 20,
    guard_iterations: int = 20,
) -> dict:
    root = Path(root)
    root.mkdir(parents=True, exist_ok=True)
    source = root / "benchmark.csv"
    source.write_text(
        "region,amount\n" + "\n".join(f"region-{i % 5},{i}" for i in range(rows)),
        encoding="utf-8",
    )
    started = time.perf_counter()
    imported = import_structured_file(
        source,
        db_path=structured_db_path(root, "benchmark-workspace", "benchmark-space"),
        workspace_id="benchmark-workspace",
        knowledge_space_id="benchmark-space",
        document_id="benchmark-document",
    )
    import_ms = (time.perf_counter() - started) * 1000
    table = imported.tables[0]
    query_service = StructuredQueryService(
        structured_db_path(root, "benchmark-workspace", "benchmark-space")
    )
    query_sql = (
        f"SELECT c_001, SUM(c_002) AS total FROM {table.physical_name} "
        "GROUP BY c_001 ORDER BY total DESC"
    )
    query_times = []
    for _ in range(max(1, query_iterations)):
        started = time.perf_counter()
        result = query_service.query(query_sql, allowed_tables={table.physical_name})
        query_times.append((time.perf_counter() - started) * 1000)

    malicious = [
        f"DELETE FROM {table.physical_name}",
        f"SELECT * FROM {table.physical_name}; DROP TABLE {table.physical_name}",
        "PRAGMA user_version",
        "SELECT * FROM sqlite_master",
    ]
    blocked = 0
    for _ in range(max(1, guard_iterations)):
        for sql in malicious:
            try:
                validate_read_only_sql(sql, allowed_tables={table.physical_name})
            except SqlPolicyError:
                blocked += 1

    cross_scope_attempts, cross_scope_blocked = _measure_cross_scope_isolation(
        root, table.physical_name
    )

    context_messages = [SystemMessage(content="YUMENO")]
    for index in range(50):
        call_id = f"benchmark-{index}"
        context_messages.extend(
            [
                HumanMessage(content=f"question {index} " + "x" * 500),
                AIMessage(content="", tool_calls=[{"name": "search", "args": {}, "id": call_id}]),
                ToolMessage(content="evidence " + "y" * 500, tool_call_id=call_id),
                AIMessage(content=f"answer {index}"),
            ]
        )
    bounded = build_bounded_context(context_messages, ContextBudget(max_tokens=6000))
    before = estimate_messages_tokens(context_messages)
    after = bounded.tokens_after

    return {
        "schema_version": 2,
        "environment": {"python": platform.python_version(), "rows": rows},
        "structured_data": {
            "rows_imported": imported.row_count,
            "import_ms": round(import_ms, 3),
            "import_rows_per_second": round(imported.row_count / max(import_ms / 1000, 0.000001), 3),
            "query_p50_ms": _percentile(query_times, 0.50),
            "query_p95_ms": _percentile(query_times, 0.95),
            "result_rows": result.row_count,
        },
        "sql_security": {
            "attack_pattern_count": len(malicious),
            "repetitions_per_pattern": max(1, guard_iterations),
            "attack_attempts": len(malicious) * max(1, guard_iterations),
            "blocked_attacks": blocked,
            "blocked_rate": round(blocked / (len(malicious) * max(1, guard_iterations)), 4),
            "cross_scope_attempts": cross_scope_attempts,
            "cross_scope_blocked": cross_scope_blocked,
            "cross_scope_isolation_rate": round(
                cross_scope_blocked / cross_scope_attempts, 4
            ),
        },
        "context_budget": {
            "turns": 50,
            "tokens_before": before,
            "tokens_after": after,
            "token_reduction_rate": round(1 - after / before, 4) if before else 0.0,
            "dropped_messages": bounded.dropped_messages,
        },
    }


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("docs/benchmarks/enterprise.json"),
    )
    parser.add_argument("--rows", type=int, default=1000)
    args = parser.parse_args()
    report = run_benchmark(root=Path("data/benchmarks/run"), rows=args.rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
