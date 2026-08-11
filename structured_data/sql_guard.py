from __future__ import annotations

from dataclasses import dataclass

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError


class SqlPolicyError(ValueError):
    pass


@dataclass(frozen=True)
class ValidatedSql:
    sql: str
    tables: tuple[str, ...]


DISALLOWED_FUNCTIONS = frozenset(
    {"load_extension", "readfile", "writefile", "randomblob"}
)


def validate_read_only_sql(
    sql: str,
    *,
    allowed_tables: set[str],
    row_limit: int = 100,
) -> ValidatedSql:
    if not sql.strip() or len(sql) > 12000:
        raise SqlPolicyError("invalid_sql_length")
    try:
        statements = sqlglot.parse(sql, read="sqlite")
    except ParseError as exc:
        raise SqlPolicyError("invalid_sql") from exc
    if len(statements) != 1 or not isinstance(statements[0], exp.Select):
        raise SqlPolicyError("select_only")
    tree = statements[0]
    with_clause = tree.args.get("with")
    if with_clause is not None and with_clause.args.get("recursive"):
        raise SqlPolicyError("recursive_cte_denied")
    if sum(1 for _ in tree.walk()) > 300:
        raise SqlPolicyError("query_too_complex")
    if sum(1 for _ in tree.find_all(exp.Join)) > 4:
        raise SqlPolicyError("too_many_joins")
    if sum(1 for _ in tree.find_all(exp.Subquery)) > 4:
        raise SqlPolicyError("too_many_subqueries")

    cte_names = {
        cte.alias_or_name.lower()
        for cte in tree.find_all(exp.CTE)
        if cte.alias_or_name
    }
    physical_tables: list[str] = []
    allowed_lower = {table.lower() for table in allowed_tables}
    for table in tree.find_all(exp.Table):
        name = table.name.lower()
        if name in cte_names:
            continue
        if name.startswith("sqlite_") or name not in allowed_lower:
            raise SqlPolicyError("table_not_allowed")
        physical_tables.append(name)

    for function in tree.find_all(exp.Func):
        name = function.sql_name().lower()
        if name in DISALLOWED_FUNCTIONS:
            raise SqlPolicyError("function_not_allowed")

    row_limit = max(1, min(int(row_limit), 500))
    limit = tree.args.get("limit")
    limit_value = None
    if limit is not None and isinstance(limit.expression, exp.Literal):
        try:
            limit_value = int(limit.expression.this)
        except (TypeError, ValueError):
            limit_value = None
    if limit_value is None or limit_value > row_limit:
        tree.set("limit", exp.Limit(expression=exp.Literal.number(row_limit)))
    return ValidatedSql(
        sql=tree.sql(dialect="sqlite"),
        tables=tuple(dict.fromkeys(physical_tables)),
    )
