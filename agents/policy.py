"""Persistence adapter for persona capability policies."""

from __future__ import annotations

from collections.abc import Mapping

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, sessionmaker

from agents.capabilities import CapabilityPolicy
from app.models import PersonaCapabilityPolicy


class CapabilityPolicyStore:
    def __init__(self, session_factory: sessionmaker[Session]) -> None:
        self._session_factory = session_factory

    def list_for_persona(
        self,
        persona_id: str,
        *,
        session: Session | None = None,
    ) -> list[CapabilityPolicy]:
        if session is not None:
            return self._list_for_persona(session, persona_id)
        with self._session_factory() as owned_session:
            return self._list_for_persona(owned_session, persona_id)

    @staticmethod
    def _list_for_persona(session: Session, persona_id: str) -> list[CapabilityPolicy]:
        rows = session.scalars(
            select(PersonaCapabilityPolicy).where(
                PersonaCapabilityPolicy.persona_id.in_(["*", persona_id])
            )
        )
        return [
            CapabilityPolicy(row.persona_id, row.capability_id, row.enabled)
            for row in rows
        ]

    def replace_for_persona(
        self, persona_id: str, values: Mapping[str, bool]
    ) -> list[CapabilityPolicy]:
        invalid = [key for key, enabled in values.items() if not isinstance(enabled, bool)]
        if invalid:
            raise ValueError("Capability policy values must be booleans")
        normalized = {
            str(capability_id).strip(): enabled
            for capability_id, enabled in values.items()
            if str(capability_id).strip()
        }
        with self._session_factory() as session:
            session.execute(
                delete(PersonaCapabilityPolicy).where(
                    PersonaCapabilityPolicy.persona_id == persona_id
                )
            )
            session.add_all(
                [
                    PersonaCapabilityPolicy(
                        persona_id=persona_id,
                        capability_id=capability_id,
                        enabled=enabled,
                    )
                    for capability_id, enabled in sorted(normalized.items())
                ]
            )
            session.commit()
        return self.list_for_persona(persona_id)
