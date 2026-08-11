from scripts.benchmark_enterprise import run_benchmark


def test_enterprise_benchmark_reports_reproducible_contract(tmp_path):
    report = run_benchmark(
        root=tmp_path,
        rows=200,
        query_iterations=5,
        guard_iterations=2,
    )

    assert report["schema_version"] == 2
    assert report["structured_data"]["rows_imported"] == 200
    assert report["structured_data"]["import_rows_per_second"] > 0
    assert report["structured_data"]["query_p50_ms"] >= 0
    assert report["structured_data"]["query_p95_ms"] >= report["structured_data"]["query_p50_ms"]
    assert report["sql_security"]["attack_pattern_count"] == 4
    assert report["sql_security"]["repetitions_per_pattern"] == 2
    assert report["sql_security"]["attack_attempts"] == 8
    assert report["sql_security"]["blocked_attacks"] == 8
    assert report["sql_security"]["blocked_rate"] == 1.0
    assert report["sql_security"]["cross_scope_attempts"] >= 4
    assert (
        report["sql_security"]["cross_scope_blocked"]
        == report["sql_security"]["cross_scope_attempts"]
    )
    assert report["sql_security"]["cross_scope_isolation_rate"] == 1.0
    assert report["context_budget"]["turns"] == 50
    assert report["context_budget"]["tokens_after"] <= 6000
    assert report["context_budget"]["token_reduction_rate"] > 0
    assert "agent_orchestration" not in report
