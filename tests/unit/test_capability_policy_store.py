from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def test_persona_capability_policies_round_trip_with_precedence():
    from agents.capabilities import evaluate_capability
    from agents.policy import CapabilityPolicyStore
    from app.database import Base

    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    store = CapabilityPolicyStore(sessions)
    store.replace_for_persona(
        "persona-a",
        {
            "mcp/filesystem/*": True,
            "mcp/filesystem/delete": False,
        },
    )
    policies = store.list_for_persona("persona-a")
    descriptor = __import__("agents.capabilities", fromlist=["CapabilityDescriptor"]).CapabilityDescriptor(
        capability_id="mcp/filesystem/delete",
        name="delete",
        source="mcp",
        server="filesystem",
        requires_confirmation=True,
        mutates_data=True,
    )
    decision = evaluate_capability(descriptor, "persona-a", policies)
    assert decision.allowed is False
    assert {item.capability_id for item in policies} == {
        "mcp/filesystem/*",
        "mcp/filesystem/delete",
    }
