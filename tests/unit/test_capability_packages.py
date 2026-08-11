from types import SimpleNamespace

from agents.capabilities import CapabilityDescriptor, CapabilityPolicy
from agents.capability_packages import build_capability_packages, classify_capability


def _skill(name, tools=(), *, builtin=False, scripts=(), trusted=True, enabled=True):
    return SimpleNamespace(
        name=name,
        description=f"{name} description",
        tool_names=tuple(tools),
        builtin=builtin,
        scripts=tuple(scripts),
        trusted=trusted,
        enabled=enabled,
    )


def test_capability_levels_are_conservative():
    assert classify_capability(CapabilityDescriptor(
        "builtin/search_persona_knowledge", "search_persona_knowledge"
    )) == 0
    assert classify_capability(CapabilityDescriptor(
        "mcp/free-search/search", "search", source="mcp", server="free-search",
        read_only_confirmed=True, default_allowed=False,
    )) == 2
    assert classify_capability(CapabilityDescriptor(
        "mcp/demo/send", "send", source="mcp", server="demo",
        mutates_data=True, default_allowed=False,
    )) == 3


def test_packages_report_assignment_and_dependencies():
    tools = [
        CapabilityDescriptor(
            "mcp/free-search/search", "search", source="mcp", server="free-search",
            read_only_confirmed=True, default_allowed=False,
        )
    ]
    packages = build_capability_packages(
        skills=[_skill("web-research", ("search",), builtin=False)],
        capabilities=tools,
        persona_id="persona-a",
        policies=[CapabilityPolicy("persona-a", "skill/web-research", True)],
        server_states={"free-search": {"enabled": True, "connected": True, "authorized": True}},
    )

    package = packages[0]
    assert package["id"] == "skill/web-research"
    assert package["level"] == 2
    assert package["assigned"] is True
    assert package["status"] == "blocked"
    assert package["dependencies"][0]["reason"] == "tool_not_assigned"


def test_script_skill_is_l4_and_missing_tool_is_reported():
    packages = build_capability_packages(
        skills=[_skill("external-script", ("missing",), scripts=("run.py",))],
        capabilities=[],
        persona_id="persona-a",
        policies=[],
        server_states={},
    )

    package = packages[0]
    assert package["level"] == 4
    assert package["assigned"] is False
    assert package["status"] == "blocked"
    assert package["dependencies"][0]["reason"] == "tool_missing"
