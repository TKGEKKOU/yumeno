"""SQL 安全防护增强版"""
from __future__ import annotations
import time
import logging
import sqlglot
from typing import Any
from sqlglot import exp

logger = logging.getLogger(__name__)


class SQLSecurityGuard:
    """多层 SQL 安全防护"""
    
    MAX_RESULT_ROWS = 100
    MAX_RESULT_SIZE_BYTES = 10 * 1024 * 1024
    MAX_QUERY_TIME_SEC = 5
    MAX_JOIN_COUNT = 3
    MAX_SUBQUERY_DEPTH = 2
    
    ALLOWED_TABLE_PREFIX = "structured_"
    SYSTEM_TABLES = frozenset({
        "sqlite_master", "sqlite_sequence", "sqlite_stat1", "sqlite_stat4"
    })
    
    DANGEROUS_FUNCTIONS = frozenset({
        "load_extension", "sqlite_compileoption_get",
        "sqlite_compileoption_used", "randomblob", "hex"
    })
    
    def __init__(self):
        self._query_start_time = 0
    
    def validate_sql(self, sql: str, allowed_tables: set[str]) -> tuple[bool, str]:
        """多层验证 SQL 安全性"""
        # 0. 预检查
        sql_lower = sql.lower()
        if "pragma" in sql_lower:
            return False, "不允许使用 PRAGMA 语句"
        if "attach" in sql_lower:
            return False, "不允许使用 ATTACH DATABASE"
        if "recursive" in sql_lower:
            return False, "不支持递归 CTE（WITH RECURSIVE）"
        
        try:
            parsed = sqlglot.parse_one(sql, dialect="sqlite")
            
            if not isinstance(parsed, exp.Select):
                return False, "只允许 SELECT 查询"
            
            join_count = self._count_joins(parsed)
            if join_count > self.MAX_JOIN_COUNT:
                return False, f"JOIN 数量不能超过 {self.MAX_JOIN_COUNT}（当前: {join_count}）"
            
            subquery_depth = self._calculate_subquery_depth(parsed)
            if subquery_depth > self.MAX_SUBQUERY_DEPTH:
                return False, f"子查询嵌套不能超过 {self.MAX_SUBQUERY_DEPTH} 层（当前: {subquery_depth}）"
            
            referenced_tables = self._extract_tables(parsed)
            invalid_tables = referenced_tables - allowed_tables
            if invalid_tables:
                return False, f"不允许访问的表: {', '.join(invalid_tables)}"
            
            if referenced_tables & self.SYSTEM_TABLES:
                return False, "不允许访问系统表"
            
            dangerous_funcs = self._find_dangerous_functions(parsed)
            if dangerous_funcs:
                return False, f"不允许使用函数: {', '.join(dangerous_funcs)}"
            
            return True, "OK"
            
        except sqlglot.errors.ParseError as e:
            return False, f"SQL 语法错误: {e}"
        except Exception as e:
            logger.error(f"SQL validation error: {e}", exc_info=True)
            return False, f"SQL 验证失败: {e}"
    
    def execute_with_limits(
        self, conn: Any, sql: str, timeout_sec: int | None = None
    ) -> list[dict[str, Any]]:
        """带限制执行 SQL"""
        timeout = timeout_sec or self.MAX_QUERY_TIME_SEC
        
        self._query_start_time = time.time()
        conn.set_progress_handler(lambda: self._check_timeout(timeout), 1000)
        
        try:
            cursor = conn.execute(sql)
            rows = []
            total_size = 0
            
            for row in cursor:
                if len(rows) >= self.MAX_RESULT_ROWS:
                    raise ValueError(f"结果集超过 {self.MAX_RESULT_ROWS} 行限制")
                
                row_dict = dict(row)
                row_size = len(str(row_dict).encode('utf-8'))
                total_size += row_size
                
                if total_size > self.MAX_RESULT_SIZE_BYTES:
                    raise ValueError(f"结果集超过 {self.MAX_RESULT_SIZE_BYTES // (1024*1024)}MB 限制")
                
                rows.append(row_dict)
            
            return rows
        finally:
            conn.set_progress_handler(None, 0)
    
    def _check_timeout(self, timeout_sec: int) -> int:
        elapsed = time.time() - self._query_start_time
        if elapsed > timeout_sec:
            logger.warning(f"SQL query timeout after {elapsed:.2f}s")
            raise TimeoutError(f"查询超时（{timeout_sec} 秒）")
        return 0
    
    def _count_joins(self, node: exp.Expression) -> int:
        return len(list(node.find_all(exp.Join)))
    
    def _calculate_subquery_depth(self, node: exp.Expression, depth: int = 0) -> int:
        max_depth = depth
        for subquery in node.find_all(exp.Subquery):
            subquery_depth = self._calculate_subquery_depth(subquery.this, depth + 1)
            max_depth = max(max_depth, subquery_depth)
        return max_depth
    
    def _extract_tables(self, node: exp.Expression) -> set[str]:
        tables = set()
        for table in node.find_all(exp.Table):
            table_name = table.name
            if table_name:
                tables.add(table_name.lower())
        return tables
    
    def _find_dangerous_functions(self, node: exp.Expression) -> set[str]:
        dangerous = set()
        for func in node.find_all(exp.Func):
            func_name = func.sql_name().lower()
            if func_name in self.DANGEROUS_FUNCTIONS:
                dangerous.add(func_name)
        return dangerous


_security_guard = SQLSecurityGuard()


def get_sql_security_guard() -> SQLSecurityGuard:
    return _security_guard
