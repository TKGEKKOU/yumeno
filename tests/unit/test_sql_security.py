"""测试 SQL 安全防护"""
import pytest
from agents.sql_security import SQLSecurityGuard


def test_sql_guard_blocks_non_select():
    """拒绝非 SELECT 语句"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql("INSERT INTO test VALUES (1)", {"test"})
    assert not valid
    assert "只允许 SELECT" in msg


def test_sql_guard_blocks_recursive_cte():
    """拒绝递归 CTE"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql(
        "WITH RECURSIVE bomb AS (SELECT 1 UNION ALL SELECT 1 FROM bomb) SELECT * FROM bomb",
        {"bomb"}
    )
    assert not valid
    assert "递归" in msg.lower()


def test_sql_guard_blocks_too_many_joins():
    """拒绝过多 JOIN"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql(
        """
        SELECT * FROM t1
        JOIN t2 ON t1.id = t2.id
        JOIN t3 ON t2.id = t3.id
        JOIN t4 ON t3.id = t4.id
        JOIN t5 ON t4.id = t5.id
        """,
        {"t1", "t2", "t3", "t4", "t5"}
    )
    assert not valid
    assert "JOIN" in msg


def test_sql_guard_blocks_deep_subqueries():
    """拒绝过深嵌套子查询"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql(
        "SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM test)))",
        {"test"}
    )
    assert not valid
    assert "子查询" in msg


def test_sql_guard_blocks_unauthorized_tables():
    """拒绝访问未授权的表"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql("SELECT * FROM secret_table", {"allowed_table"})
    assert not valid
    assert "不允许访问的表" in msg


def test_sql_guard_blocks_system_tables():
    """拒绝访问系统表"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql("SELECT * FROM sqlite_master", {"sqlite_master"})
    assert not valid
    assert "系统表" in msg


def test_sql_guard_blocks_pragma():
    """拒绝 PRAGMA 语句"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql("PRAGMA table_info(test)", {"test"})
    assert not valid
    assert "PRAGMA" in msg


def test_sql_guard_allows_simple_select():
    """允许简单 SELECT"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql(
        "SELECT id, name FROM users WHERE age > 18 LIMIT 10",
        {"users"}
    )
    assert valid
    assert msg == "OK"


def test_sql_guard_allows_moderate_joins():
    """允许适度 JOIN"""
    guard = SQLSecurityGuard()
    valid, msg = guard.validate_sql(
        """
        SELECT * FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN products p ON o.product_id = p.id
        """,
        {"orders", "customers", "products"}
    )
    assert valid


def test_sql_guard_enforces_result_limit():
    """强制结果集限制"""
    import sqlite3
    
    guard = SQLSecurityGuard()
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE test (id INTEGER, value TEXT)")
    
    for i in range(200):
        conn.execute("INSERT INTO test VALUES (?, ?)", (i, f"value_{i}"))
    
    with pytest.raises(ValueError, match="结果集超过.*行"):
        guard.execute_with_limits(conn, "SELECT * FROM test")
    
    conn.close()
