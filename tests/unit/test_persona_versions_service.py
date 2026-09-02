from app.models import KnowledgeSpace, Persona, PersonaCapabilityPolicy, PersonaVersion
from persona.versions import (
    PersonaRuntimeSnapshot,
    PersonaVersionService,
    build_runtime_snapshot,
    diff_runtime_snapshots,
)


def make_persona(db_session):
    space = KnowledgeSpace(workspace_id="local-default")
    db_session.add(space)
    db_session.flush()
    persona = Persona(
        workspace_id="local-default",
        knowledge_space_id=space.id,
        name="Alice",
        persona_type="character",
        profile_json={"description": "calm", "api_key": "do-not-store"},
    )
    db_session.add(persona)
    db_session.flush()
    db_session.add(
        PersonaCapabilityPolicy(
            persona_id=persona.id,
            capability_id="skill/research",
            enabled=True,
        )
    )
    db_session.commit()
    return persona


def test_build_snapshot_captures_runtime_bindings_and_redacts_secrets(db_session):
    persona = make_persona(db_session)

    snapshot = build_runtime_snapshot(
        db_session,
        persona,
        mcp_server_names=["browser"],
    )

    assert isinstance(snapshot, PersonaRuntimeSnapshot)
    assert snapshot.name == "Alice"
    assert snapshot.knowledge_space_id == persona.knowledge_space_id
    assert snapshot.capability_overrides == {"skill/research": True}
    assert snapshot.mcp_server_names == ["browser"]
    assert snapshot.profile["description"] == "calm"
    assert snapshot.profile["api_key"] == "[已隐藏]"


def test_version_service_creates_monotonic_immutable_snapshots(db_session):
    persona = make_persona(db_session)
    service = PersonaVersionService()

    first = service.create(db_session, persona, label="初始测试", note="第一次检查", mcp_server_names=[])
    second = service.create(db_session, persona, label="第二次测试", note="调整口吻", mcp_server_names=["browser"])
    db_session.commit()

    assert first.version_number == 1
    assert second.version_number == 2
    assert service.list(db_session, persona.id)[0].id == second.id
    assert service.get(db_session, persona.id, first.id).snapshot_json["name"] == "Alice"


def test_diff_reports_nested_changes_without_exposing_secret_values():
    before = PersonaRuntimeSnapshot(
        name="Alice",
        persona_type="character",
        profile={"style": "calm"},
        knowledge_space_id="space-1",
        capability_overrides={"skill/research": True},
        mcp_server_names=[],
    )
    after = before.model_copy(update={"profile": {"style": "bright"}, "mcp_server_names": ["browser"]})

    result = diff_runtime_snapshots(before, after)

    assert result["changed"] is True
    assert {item["path"] for item in result["changes"]} == {"profile.style", "mcp_server_names"}
    assert all("api_key" not in str(item) for item in result["changes"])


def test_publish_applies_profile_and_capabilities_and_marks_version(db_session):
    persona = make_persona(db_session)
    service = PersonaVersionService()
    version = service.create(
        db_session,
        persona,
        label="发布候选",
        note="稳定角色",
        mcp_server_names=["browser"],
    )
    persona.name = "Changed"
    persona.profile_json = {"description": "changed"}
    db_session.query(PersonaCapabilityPolicy).filter_by(persona_id=persona.id).delete()
    db_session.add(PersonaCapabilityPolicy(persona_id=persona.id, capability_id="skill/research", enabled=False))
    db_session.flush()

    service.publish(db_session, persona, version)
    db_session.commit()
    db_session.refresh(persona)

    assert persona.name == "Alice"
    assert persona.profile_json["description"] == "calm"
    policy = db_session.query(PersonaCapabilityPolicy).filter_by(persona_id=persona.id).one()
    assert policy.enabled is True
    assert version.status == "published"
    assert version.published_at is not None
    assert version.snapshot_json["mcp_server_names"] == ["browser"]


