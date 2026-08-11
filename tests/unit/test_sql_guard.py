import pytest

from structured_data.sql_guard import SqlPolicyError, validate_read_only_sql


def test_sql_guard_accepts_scoped_select_and_adds_limit():
    validated = validate_read_only_sql(
        "SELECT c_001, SUM(c_002) AS total FROM t_sales GROUP BY c_001",
        allowed_tables={"t_sales"},
        row_limit=100,
    )

    assert validated.tables == ("t_sales",)
    assert "LIMIT 100" in validated.sql.upper()


@pytest.mark.parametrize(
    "sql",
    [
        "DELETE FROM t_sales",
        "UPDATE t_sales SET c_001 = 'x'",
        "INSERT INTO t_sales VALUES (1)",
        "DROP TABLE t_sales",
        "PRAGMA table_info(t_sales)",
        "ATTACH DATABASE 'x.db' AS x",
        "SELECT * FROM t_sales; SELECT * FROM t_sales",
        "SELECT * FROM sqlite_master",
        "WITH RECURSIVE x AS (SELECT 1 UNION ALL SELECT 1 FROM x) SELECT * FROM x",
    ],
)
def test_sql_guard_rejects_non_select_and_escape_attempts(sql):
    with pytest.raises(SqlPolicyError):
        validate_read_only_sql(sql, allowed_tables={"t_sales"})


def test_sql_guard_rejects_table_outside_scope():
    with pytest.raises(SqlPolicyError, match="table_not_allowed"):
        validate_read_only_sql(
            "SELECT * FROM t_other",
            allowed_tables={"t_sales"},
        )


def test_sql_guard_allows_non_recursive_cte_over_scoped_table():
    validated = validate_read_only_sql(
        "WITH totals AS (SELECT c_001 FROM t_sales) SELECT * FROM totals",
        allowed_tables={"t_sales"},
    )

    assert validated.tables == ("t_sales",)
