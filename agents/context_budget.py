from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from typing import Iterable

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage


@dataclass(frozen=True)
class ContextBudget:
    max_tokens: int = 6000

    def __post_init__(self) -> None:
        if self.max_tokens < 32:
            raise ValueError("max_tokens must be at least 32")


@dataclass(frozen=True)
class BoundedContext:
    messages: tuple[BaseMessage, ...]
    tokens_before: int
    tokens_after: int
    dropped_messages: int


@lru_cache(maxsize=1)
def _encoding():
    try:
        import tiktoken

        return tiktoken.get_encoding("cl100k_base")
    except Exception:
        return None


def _content_text(message: BaseMessage) -> str:
    content = message.content
    if isinstance(content, str):
        value = content
    else:
        try:
            value = json.dumps(content, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            value = str(content)
    tool_calls = getattr(message, "tool_calls", None) or []
    if tool_calls:
        value += json.dumps(tool_calls, ensure_ascii=False, default=str)
    return value


def estimate_message_tokens(message: BaseMessage) -> int:
    text = _content_text(message)
    encoding = _encoding()
    if encoding is not None:
        return 4 + len(encoding.encode(text))
    return 4 + max(1, (len(text) + 3) // 4)


def estimate_messages_tokens(messages: Iterable[BaseMessage]) -> int:
    return sum(estimate_message_tokens(message) for message in messages)


def _conversation_blocks(messages: list[BaseMessage]) -> list[list[BaseMessage]]:
    blocks: list[list[BaseMessage]] = []
    current: list[BaseMessage] = []
    for message in messages:
        if isinstance(message, HumanMessage) and current:
            blocks.append(current)
            current = []
        current.append(message)
    if current:
        blocks.append(current)
    return blocks


def build_bounded_context(
    messages: Iterable[BaseMessage],
    budget: ContextBudget | None = None,
) -> BoundedContext:
    """Trim the model-facing view by complete user turns, never checkpoint state."""

    policy = budget or ContextBudget()
    source = list(messages)
    tokens_before = estimate_messages_tokens(source)
    system_messages = [message for message in source if isinstance(message, SystemMessage)]
    conversational = [message for message in source if not isinstance(message, SystemMessage)]
    fixed_tokens = estimate_messages_tokens(system_messages)
    remaining = max(0, policy.max_tokens - fixed_tokens)

    kept_reversed: list[list[BaseMessage]] = []
    used = 0
    blocks = _conversation_blocks(conversational)
    for block in reversed(blocks):
        block_tokens = estimate_messages_tokens(block)
        if used + block_tokens <= remaining:
            kept_reversed.append(block)
            used += block_tokens
            continue
        if not kept_reversed:
            # The active user turn is mandatory even if one unusually large message
            # exceeds the configured soft budget.
            kept_reversed.append(block)
            used += block_tokens
        break

    kept_blocks = list(reversed(kept_reversed))
    kept = system_messages + [message for block in kept_blocks for message in block]
    tokens_after = estimate_messages_tokens(kept)
    return BoundedContext(
        messages=tuple(kept),
        tokens_before=tokens_before,
        tokens_after=tokens_after,
        dropped_messages=max(0, len(source) - len(kept)),
    )
