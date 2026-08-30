from __future__ import annotations

from typing import Any

from agents.observability import sanitize_details


def sanitize_event_details(details: dict[str, Any] | None) -> dict[str, Any]:
    """复用现有观测层白名单，禁止 Prompt、密钥和原始工具载荷落库。"""

    return sanitize_details(details)
