"""LangGraph persona conversation workflow.

Compatibility facade. Implementation lives in `agents.graph`.
Only `persona_supervisor` is user-visible. Workers return contracts
through `finalize_*` and never go directly to END.
"""

from agents.graph.build import build_persona_workflow
from agents.graph.knowledge import (
    _default_web_search_executor,
    _knowledge_specialist_result,
    _knowledge_subgraph,
    _knowledge_workflow,
)
from agents.graph.middleware import (
    build_capability_guard_middleware,
    build_runtime_observability_middleware,
    build_single_search_visibility_middleware,
    build_skill_middleware,
)
from agents.graph.policy import _search_already_used, _web_authorized, _web_tool_allowed
from agents.graph.state import WORKERS, PersonaWorkflowState, SupervisorAgentState, Worker
from agents.graph.supervisor import (
    _finalize_worker,
    _handoff_tool,
    _supervisor_prompt,
    _worker_prompt,
    worker_tools,
)
from agents.mcp_grants import is_mcp_tool_visible
from agents.registry import tool_specs
from agents.tools.management import request_confirmation
from rag.web_search import web_search_documents

__all__ = [
    "WORKERS",
    "PersonaWorkflowState",
    "SupervisorAgentState",
    "Worker",
    "_default_web_search_executor",
    "_finalize_worker",
    "_handoff_tool",
    "_knowledge_specialist_result",
    "_knowledge_subgraph",
    "_knowledge_workflow",
    "_search_already_used",
    "_supervisor_prompt",
    "_web_authorized",
    "_web_tool_allowed",
    "_worker_prompt",
    "build_capability_guard_middleware",
    "build_persona_workflow",
    "build_runtime_observability_middleware",
    "build_single_search_visibility_middleware",
    "build_skill_middleware",
    "is_mcp_tool_visible",
    "request_confirmation",
    "tool_specs",
    "web_search_documents",
    "worker_tools",
]
