"""Pure execution-policy decisions for actions that may need user approval."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Protocol

from agents.intent_funnel import IntentAnalysis


DecisionMode = Literal["direct", "confirm", "reject"]


@dataclass(frozen=True)
class ConfirmationDecision:
    mode: DecisionMode
    reason: str


class CapabilityDecisionLike(Protocol):
    allowed: bool
    requires_confirmation: bool


def decide_capability(decision: CapabilityDecisionLike) -> ConfirmationDecision:
    if not decision.allowed:
        return ConfirmationDecision("reject", "capability_not_allowed")
    if decision.requires_confirmation:
        return ConfirmationDecision("confirm", "capability_requires_confirmation")
    return ConfirmationDecision("direct", "capability_allowed")


def decide_web_fallback(intent: IntentAnalysis) -> ConfirmationDecision:
    if "web" in intent.negated:
        return ConfirmationDecision("reject", "web_explicitly_denied")
    if intent.web_authorized:
        reason = "explicit_web_request" if intent.explicit_web else "fresh_external_fact"
        return ConfirmationDecision("direct", reason)
    return ConfirmationDecision("confirm", "local_knowledge_insufficient")
