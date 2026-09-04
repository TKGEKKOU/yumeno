"""统一能力目录与角色策略判定。

该模块只负责描述、解析和授权决策，不执行工具。执行层可以把决策接到
LangChain Tool middleware 或对话确认流程中，避免各工具自行实现一套权限规则。
"""

from __future__ import annotations

from dataclasses import dataclass


class CapabilityConflictError(ValueError):
    """A display/model alias maps to more than one capability."""


@dataclass(frozen=True)
class CapabilityDescriptor:
    capability_id: str
    name: str
    kind: str = "tool"
    source: str = "builtin"
    specialist: str = "conversation"
    requires_confirmation: bool = False
    mutates_data: bool = False
    server: str = ""
    read_only_confirmed: bool = False
    default_allowed: bool = True

    @property
    def model_name(self) -> str:
        if self.source == "mcp":
            server = self.server or self.capability_id.split("/")[1]
            return f"mcp__{server}__{self.name}"
        return self.name

    @property
    def confirmation_required(self) -> bool:
        # MCP metadata is untrusted unless the server explicitly declares the
        # operation read-only. Built-in descriptors keep their declared policy.
        if self.source == "mcp" and not self.read_only_confirmed:
            return True
        return self.requires_confirmation


@dataclass(frozen=True)
class CapabilityPolicy:
    persona_id: str
    capability_id: str
    enabled: bool


@dataclass(frozen=True)
class CapabilityDecision:
    allowed: bool
    requires_confirmation: bool
    reason: str


class CapabilityCatalog:
    def __init__(self) -> None:
        self._items: dict[str, CapabilityDescriptor] = {}

    def register(self, descriptor: CapabilityDescriptor) -> None:
        existing = self._items.get(descriptor.capability_id)
        if existing is not None and existing != descriptor:
            raise ValueError(f"Capability already registered: {descriptor.capability_id}")
        self._items[descriptor.capability_id] = descriptor

    def unregister(self, capability_id: str) -> None:
        self._items.pop(capability_id, None)

    def list(self) -> tuple[CapabilityDescriptor, ...]:
        return tuple(self._items.values())

    def get(self, capability_id: str) -> CapabilityDescriptor | None:
        return self._items.get(capability_id)

    def resolve(self, name: str) -> CapabilityDescriptor:
        exact = self._items.get(name)
        if exact is not None:
            return exact
        matches = [item for item in self._items.values() if item.name == name or item.model_name == name]
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            ids = ", ".join(item.capability_id for item in matches)
            raise CapabilityConflictError(f"Ambiguous capability alias {name}: {ids}")
        raise KeyError(name)


def _policy_value(descriptor: CapabilityDescriptor, persona_id: str, policies: list[CapabilityPolicy]) -> bool | None:
    candidates = (
        (persona_id, descriptor.capability_id),
        (persona_id, _wildcard_for(descriptor)),
        ("*", descriptor.capability_id),
        ("*", _wildcard_for(descriptor)),
    )
    for persona, capability in candidates:
        for policy in policies:
            if policy.persona_id == persona and policy.capability_id == capability:
                return policy.enabled
    return None


def skill_policy_value(skill_name: str, persona_id: str, policies: list[CapabilityPolicy]) -> bool | None:
    """Resolve the optional role override for a named Skill."""

    capability_id = f"skill/{skill_name}"
    for persona, capability in (
        (persona_id, capability_id),
        ("*", capability_id),
    ):
        for policy in policies:
            if policy.persona_id == persona and policy.capability_id == capability:
                return policy.enabled
    return None


def skill_is_assigned(skill, persona_id: str, policies: list[CapabilityPolicy]) -> bool:
    """Built-ins inherit allow; user-installed Skills require an explicit role grant."""

    explicit = skill_policy_value(skill.name, persona_id, policies)
    if explicit is not None:
        return explicit
    return bool(getattr(skill, "builtin", False))


def _wildcard_for(descriptor: CapabilityDescriptor) -> str:
    if descriptor.source == "mcp":
        server = descriptor.server or descriptor.capability_id.split("/")[1]
        return f"mcp/{server}/*"
    return f"{descriptor.kind}/*"


def evaluate_capability(
    descriptor: CapabilityDescriptor,
    persona_id: str,
    policies: list[CapabilityPolicy],
) -> CapabilityDecision:
    enabled = _policy_value(descriptor, persona_id, policies)
    allowed = descriptor.default_allowed if enabled is None else enabled
    if not allowed:
        return CapabilityDecision(False, descriptor.confirmation_required, "disabled_by_persona_policy")
    return CapabilityDecision(True, descriptor.confirmation_required, "allowed")


def guard_capability(
    descriptor: CapabilityDescriptor,
    persona_id: str,
    policies: list[CapabilityPolicy],
    *,
    confirmer=None,
    arguments: dict | None = None,
) -> CapabilityDecision:
    """Authorize a call and invoke the shared HITL confirmer when required."""

    decision = evaluate_capability(descriptor, persona_id, policies)
    if not decision.allowed:
        return decision
    if decision.requires_confirmation:
        if confirmer is None:
            return CapabilityDecision(False, True, "confirmation_required")
        approved = confirmer(
            {
                "tool": descriptor.model_name,
                "capability_id": descriptor.capability_id,
                "title": f"需要确认：{descriptor.name}",
                "target": descriptor.capability_id,
                "arguments": dict(arguments or {}),
            }
        )
        if not approved:
            return CapabilityDecision(False, True, "confirmation_denied")
    return decision
