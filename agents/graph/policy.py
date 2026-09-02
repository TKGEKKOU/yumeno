"""Request-local web authorization and search-usage policy."""

from langchain.messages import HumanMessage, ToolMessage

from agents.intent_funnel import IntentAnalysis
from agents.graph.state import WORKERS, canonicalize_worker_name, worker_node_name

_DIRECT_WORKER_INTENTS = {"memory", "document", "profile", "voice", "rvc", "rvc_worker", "live2d", "config", "management"}


def direct_worker_for_intent(intent: dict | None) -> str | None:
    """Return the deterministic worker for strong intents, else None."""

    primary = str((intent or {}).get("primary") or "")
    primary = canonicalize_worker_name(primary) or primary
    if primary not in _DIRECT_WORKER_INTENTS or primary not in WORKERS:
        return None
    return worker_node_name(primary)


_SEARCH_TOOL_NAMES = {"web_search", "search", "research"}
_WEB_TOOL_NAMES = _SEARCH_TOOL_NAMES


def _web_authorized(state: dict) -> bool:
    """Web tools are allowed only when the intent funnel authorized this turn."""

    return IntentAnalysis.from_state(state.get("intent_decision")).web_authorized


def _web_tool_allowed(tool_name: str, state: dict) -> bool:
    return tool_name not in _WEB_TOOL_NAMES or _web_authorized(state)


def _search_already_used(state: dict) -> bool:
    messages = list(state.get("messages", []))
    for index in range(len(messages) - 1, -1, -1):
        if isinstance(messages[index], HumanMessage):
            messages = messages[index:]
            break
    return any(
        isinstance(message, ToolMessage) and message.name in _SEARCH_TOOL_NAMES
        for message in messages
    )
