"""Derive user-facing capability packages from the runtime catalogs."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from agents.capabilities import (
    CapabilityDescriptor,
    CapabilityPolicy,
    evaluate_capability,
    skill_policy_value,
)


_CORE_RAG_TOOLS = {
    "search_persona_knowledge",
    "list_structured_tables",
    "query_structured_data",
}
_HIGH_RISK_SIGNALS = ("delete", "install", "run_script", "execute", "shell", "command")
_EXTERNAL_RETRIEVAL_SIGNALS = ("search", "research", "fetch", "web", "browser", "crawl")


def classify_capability(descriptor: CapabilityDescriptor) -> int:
    """Return the conservative L0-L4 execution level for one capability."""

    name = descriptor.name.lower()
    if descriptor.source == "builtin" and name in _CORE_RAG_TOOLS:
        return 0
    if any(signal in name for signal in _HIGH_RISK_SIGNALS):
        return 4
    if descriptor.mutates_data or descriptor.confirmation_required:
        return 3
    if descriptor.source == "mcp" or any(
        signal in name for signal in _EXTERNAL_RETRIEVAL_SIGNALS
    ):
        return 2
    return 1


def _skill_assigned(skill, persona_id: str, policies: list[CapabilityPolicy]) -> bool:
    explicit = skill_policy_value(skill.name, persona_id, policies)
    if explicit is not None:
        return explicit
    return bool(skill.builtin)


def _server_reason(server: Mapping[str, Any] | None) -> str | None:
    if server is None:
        return "mcp_server_missing"
    if not server.get("enabled", False):
        return "mcp_server_disabled"
    if not server.get("connected", False):
        return "mcp_server_disconnected"
    if not server.get("authorized", False):
        return "mcp_not_authorized"
    return None


def build_capability_packages(
    *,
    skills: Iterable,
    capabilities: Iterable[CapabilityDescriptor],
    persona_id: str,
    policies: list[CapabilityPolicy],
    server_states: Mapping[str, Mapping[str, Any]],
) -> list[dict[str, Any]]:
    """Build stable package contracts without persisting another data model."""

    capability_items = list(capabilities)
    by_name: dict[str, list[CapabilityDescriptor]] = {}
    for descriptor in capability_items:
        by_name.setdefault(descriptor.name, []).append(descriptor)
    packages: list[dict[str, Any]] = []
    referenced: set[str] = set()

    for skill in skills:
        assigned = _skill_assigned(skill, persona_id, policies)
        dependencies: list[dict[str, Any]] = []
        levels = [4 if getattr(skill, "scripts", ()) else 1]
        for tool_name in getattr(skill, "tool_names", ()):
            referenced.add(tool_name)
            matches = by_name.get(tool_name, [])
            if len(matches) != 1:
                dependencies.append(
                    {
                        "id": "",
                        "name": tool_name,
                        "source": "missing",
                        "server": "",
                        "level": 3,
                        "effective": False,
                        "reason": "tool_missing" if not matches else "tool_ambiguous",
                    }
                )
                levels.append(3)
                continue
            descriptor = matches[0]
            level = classify_capability(descriptor)
            levels.append(level)
            decision = evaluate_capability(descriptor, persona_id, policies)
            reason = "available"
            effective = assigned and decision.allowed
            if not assigned:
                reason = "package_not_assigned"
            elif not decision.allowed:
                reason = "tool_not_assigned"
            elif descriptor.server:
                server_reason = _server_reason(server_states.get(descriptor.server))
                if server_reason:
                    effective = False
                    reason = server_reason
            dependencies.append(
                {
                    "id": descriptor.capability_id,
                    "name": descriptor.name,
                    "source": descriptor.source,
                    "server": descriptor.server,
                    "level": level,
                    "effective": effective,
                    "reason": reason,
                }
            )

        trusted = bool(getattr(skill, "trusted", False))
        enabled = bool(getattr(skill, "enabled", False))
        if not enabled:
            status = "blocked"
            issue = "skill_disabled"
        elif not trusted:
            status = "blocked"
            issue = "skill_untrusted"
        elif any(item["reason"] in {"tool_missing", "tool_ambiguous"} for item in dependencies):
            status = "blocked"
            issue = "dependency_missing"
        elif not assigned:
            status = "unassigned"
            issue = "package_not_assigned"
        elif all(item["effective"] for item in dependencies):
            status = "available"
            issue = ""
        else:
            status = "blocked"
            issue = next((item["reason"] for item in dependencies if not item["effective"]), "blocked")
        packages.append(
            {
                "id": f"skill/{skill.name}",
                "name": skill.name,
                "description": getattr(skill, "description", ""),
                "kind": "skill",
                "builtin": bool(getattr(skill, "builtin", False)),
                "level": max(levels),
                "assigned": assigned,
                "status": status,
                "reason": issue,
                "dependencies": dependencies,
                "required_servers": sorted(
                    {item["server"] for item in dependencies if item["server"]}
                ),
            }
        )

    for descriptor in capability_items:
        if descriptor.name in referenced:
            continue
        decision = evaluate_capability(descriptor, persona_id, policies)
        level = classify_capability(descriptor)
        assigned = decision.allowed
        server_reason = _server_reason(server_states.get(descriptor.server)) if descriptor.server else None
        status = "available" if assigned and not server_reason else "unassigned" if not assigned else "blocked"
        packages.append(
            {
                "id": descriptor.capability_id,
                "name": descriptor.name,
                "description": "",
                "kind": "tool",
                "builtin": descriptor.source == "builtin",
                "level": level,
                "assigned": assigned,
                "status": status,
                "reason": server_reason or ("" if assigned else "package_not_assigned"),
                "dependencies": [],
                "required_servers": [descriptor.server] if descriptor.server else [],
            }
        )

    return sorted(packages, key=lambda item: (item["level"], item["name"].lower()))
