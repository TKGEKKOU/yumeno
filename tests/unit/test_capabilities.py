import pytest


def _descriptor(**overrides):
    from agents.capabilities import CapabilityDescriptor

    values = {
        "capability_id": "mcp/free-search/search",
        "name": "search",
        "kind": "tool",
        "source": "mcp",
        "specialist": "mcp",
        "requires_confirmation": False,
        "mutates_data": False,
    }
    values.update(overrides)
    return CapabilityDescriptor(**values)


def test_catalog_assigns_unique_model_name_and_rejects_ambiguous_alias():
    from agents.capabilities import CapabilityCatalog, CapabilityConflictError

    catalog = CapabilityCatalog()
    first = _descriptor()
    second = _descriptor(
        capability_id="mcp/other/search",
        source="mcp",
        server="other",
    )
    catalog.register(first)
    assert catalog.resolve("search").capability_id == first.capability_id

    catalog.register(second)
    with pytest.raises(CapabilityConflictError):
        catalog.resolve("search")
    assert catalog.resolve("mcp__other__search").capability_id == second.capability_id


def test_policy_precedence_and_confirmation_are_fail_closed():
    from agents.capabilities import CapabilityPolicy, evaluate_capability

    write = _descriptor(
        capability_id="mcp/filesystem/delete",
        name="delete",
        server="filesystem",
        requires_confirmation=True,
        mutates_data=True,
    )
    policies = [
        CapabilityPolicy("*", "mcp/filesystem/*", True),
        CapabilityPolicy("persona-a", "mcp/filesystem/delete", False),
    ]
    denied = evaluate_capability(write, "persona-a", policies)
    assert denied.allowed is False
    assert denied.requires_confirmation is True

    enabled = evaluate_capability(write, "persona-b", policies)
    assert enabled.allowed is True
    assert enabled.requires_confirmation is True


def test_unknown_mcp_annotation_requires_confirmation():
    from agents.capabilities import evaluate_capability

    descriptor = _descriptor(
        capability_id="mcp/unknown/write",
        name="write",
        mutates_data=False,
        requires_confirmation=False,
    )
    decision = evaluate_capability(descriptor, "persona-a", [])
    assert decision.allowed is True
    assert decision.requires_confirmation is True


def test_builtin_registry_exposes_stable_capability_ids():
    from agents.registry import capability_catalog

    descriptor = capability_catalog().resolve("search_persona_knowledge")
    assert descriptor.capability_id == "builtin/search_persona_knowledge"
    assert descriptor.source == "builtin"


def test_execution_guard_centralizes_confirmation_for_writes():
    from agents.capabilities import CapabilityPolicy, guard_capability

    descriptor = _descriptor(
        capability_id="builtin/update",
        name="update",
        source="builtin",
        requires_confirmation=True,
        mutates_data=True,
    )
    seen = []
    decision = guard_capability(
        descriptor,
        "persona-a",
        [CapabilityPolicy("persona-a", descriptor.capability_id, True)],
        confirmer=lambda action: seen.append(action) or True,
        arguments={"value": 1},
    )
    assert decision.allowed is True
    assert decision.requires_confirmation is True
    assert seen[0]["capability_id"] == descriptor.capability_id
