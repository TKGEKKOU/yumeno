from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models import DocumentJob, Persona, PersonaCapabilityPolicy, PersonaVersion

_SECRET_KEYS = {
    "api_key", "apikey", "access_token", "auth_token", "token", "secret",
    "password", "cookie", "authorization", "headers",
}


def _redact(value: Any, key: str | None = None) -> Any:
    if key and key.lower() in _SECRET_KEYS:
        return "[已隐藏]"
    if isinstance(value, dict):
        return {str(k): _redact(v, str(k)) for k, v in value.items()}
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


class PersonaRuntimeSnapshot(BaseModel):
    """角色运行时快照；只保存可回滚的配置，不保存凭据。"""

    model_config = ConfigDict(extra="ignore")

    schema_version: int = 1
    name: str
    persona_type: str = "knowledge_expert"
    profile: dict[str, Any] = Field(default_factory=dict)
    knowledge_space_id: str
    document_ids: list[str] = Field(default_factory=list)
    capability_overrides: dict[str, bool] = Field(default_factory=dict)
    mcp_server_names: list[str] = Field(default_factory=list)

    @field_validator("profile", mode="before")
    @classmethod
    def sanitize_profile(cls, value: Any) -> dict[str, Any]:
        return _redact(value or {})

    @field_validator("document_ids", "mcp_server_names", mode="after")
    @classmethod
    def normalize_ids(cls, value: list[str]) -> list[str]:
        return sorted(set(str(item) for item in value))

    @field_validator("capability_overrides", mode="after")
    @classmethod
    def normalize_capabilities(cls, value: dict[str, bool]) -> dict[str, bool]:
        return dict(sorted((str(key), bool(item)) for key, item in value.items()))

def build_runtime_snapshot(
    session: Session,
    persona: Persona,
    *,
    mcp_server_names: list[str] | tuple[str, ...] = (),
) -> PersonaRuntimeSnapshot:
    policies = session.scalars(
        select(PersonaCapabilityPolicy).where(PersonaCapabilityPolicy.persona_id == persona.id)
    ).all()
    documents = session.scalars(
        select(DocumentJob.id).where(
            DocumentJob.knowledge_space_id == persona.knowledge_space_id,
            DocumentJob.status != "deleted",
        )
    ).all()
    return PersonaRuntimeSnapshot(
        name=persona.name,
        persona_type=persona.persona_type,
        profile=persona.profile_json or {},
        knowledge_space_id=persona.knowledge_space_id,
        document_ids=[str(item) for item in documents],
        capability_overrides={row.capability_id: bool(row.enabled) for row in policies},
        mcp_server_names=list(mcp_server_names),
    )


def _restore_redacted(current: Any, snapshot: Any) -> Any:
    """恢复快照时保留当前运行时凭据，避免脱敏占位符覆盖真实值。"""

    if snapshot == "[已隐藏]":
        return current
    if isinstance(snapshot, dict):
        current_dict = current if isinstance(current, dict) else {}
        return {
            key: _restore_redacted(current_dict.get(key), value)
            for key, value in snapshot.items()
        }
    if isinstance(snapshot, list):
        current_list = current if isinstance(current, list) else []
        return [
            _restore_redacted(current_list[index] if index < len(current_list) else None, value)
            for index, value in enumerate(snapshot)
        ]
    return snapshot


def _diff_value(before: Any, after: Any, path: str, output: list[dict[str, Any]]) -> None:
    if isinstance(before, dict) and isinstance(after, dict):
        for key in sorted(set(before) | set(after)):
            child = f"{path}.{key}" if path else str(key)
            _diff_value(before.get(key), after.get(key), child, output)
        return
    if before != after:
        output.append({"path": path, "before": _redact(before), "after": _redact(after)})


def diff_runtime_snapshots(
    before: PersonaRuntimeSnapshot | dict[str, Any],
    after: PersonaRuntimeSnapshot | dict[str, Any],
) -> dict[str, Any]:
    left = PersonaRuntimeSnapshot.model_validate(dict(before))
    right = PersonaRuntimeSnapshot.model_validate(dict(after))
    changes: list[dict[str, Any]] = []
    _diff_value(dict(left), dict(right), "", changes)
    return {"changed": bool(changes), "changes": changes}


class PersonaVersionService:
    """角色版本的创建、查询和发布；事务提交由调用方控制。"""

    def create(
        self,
        session: Session,
        persona: Persona,
        *,
        label: str = "",
        note: str = "",
        mcp_server_names: list[str] | tuple[str, ...] = (),
    ) -> PersonaVersion:
        latest = session.scalar(
            select(func.max(PersonaVersion.version_number)).where(PersonaVersion.persona_id == persona.id)
        ) or 0
        row = PersonaVersion(
            persona_id=persona.id,
            version_number=int(latest) + 1,
            status="draft",
            label=(label or f"版本 {int(latest) + 1}").strip(),
            note=(note or "").strip(),
            snapshot_json=build_runtime_snapshot(
                session, persona, mcp_server_names=mcp_server_names
            ).model_dump(mode="json"),
        )
        session.add(row)
        session.flush()
        return row

    def list(self, session: Session, persona_id: str) -> list[PersonaVersion]:
        return list(
            session.scalars(
                select(PersonaVersion)
                .where(PersonaVersion.persona_id == persona_id)
                .order_by(PersonaVersion.version_number.desc())
            )
        )

    def get(self, session: Session, persona_id: str, version_id: str) -> PersonaVersion | None:
        return session.scalar(
            select(PersonaVersion).where(
                PersonaVersion.id == version_id,
                PersonaVersion.persona_id == persona_id,
            )
        )

    def publish(self, session: Session, persona: Persona, version: PersonaVersion) -> PersonaVersion:
        snapshot = PersonaRuntimeSnapshot.model_validate(version.snapshot_json)
        persona.name = snapshot.name
        persona.persona_type = snapshot.persona_type
        persona.profile_json = _restore_redacted(persona.profile_json or {}, snapshot.profile)
        session.execute(delete(PersonaCapabilityPolicy).where(PersonaCapabilityPolicy.persona_id == persona.id))
        session.add_all([
            PersonaCapabilityPolicy(
                persona_id=persona.id,
                capability_id=key,
                enabled=value,
            )
            for key, value in snapshot.capability_overrides.items()
        ])
        session.query(PersonaVersion).filter(
            PersonaVersion.persona_id == persona.id,
            PersonaVersion.id != version.id,
        ).update({"status": "superseded"}, synchronize_session=False)
        version.status = "published"
        version.published_at = datetime.now(timezone.utc)
        session.flush()
        return version

    @staticmethod
    def snapshot(version: PersonaVersion) -> PersonaRuntimeSnapshot:
        return PersonaRuntimeSnapshot.model_validate(version.snapshot_json)

