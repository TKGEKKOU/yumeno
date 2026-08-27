from types import SimpleNamespace


def test_explicit_web_fallback_runs_directly():
    from agents.confirmation_policy import decide_web_fallback
    from agents.intent_funnel import analyze_intents

    decision = decide_web_fallback(analyze_intents("直接搜薇欧拉"))

    assert decision.mode == "direct"
    assert decision.reason == "explicit_web_request"


def test_implicit_knowledge_fallback_requires_confirmation():
    from agents.confirmation_policy import decide_web_fallback
    from agents.intent_funnel import analyze_intents

    decision = decide_web_fallback(analyze_intents("她出生在哪里？"))

    assert decision.mode == "confirm"
    assert decision.reason == "local_knowledge_insufficient"


def test_negated_web_fallback_is_rejected_without_confirmation():
    from agents.confirmation_policy import decide_web_fallback
    from agents.intent_funnel import analyze_intents

    decision = decide_web_fallback(analyze_intents("不要联网，根据资料回答"))

    assert decision.mode == "reject"
    assert decision.reason == "web_explicitly_denied"


def test_capability_confirmation_policy_has_three_clear_outcomes():
    from agents.confirmation_policy import decide_capability

    allowed_read = SimpleNamespace(allowed=True, requires_confirmation=False)
    allowed_write = SimpleNamespace(allowed=True, requires_confirmation=True)
    denied = SimpleNamespace(allowed=False, requires_confirmation=True)

    assert decide_capability(allowed_read).mode == "direct"
    assert decide_capability(allowed_write).mode == "confirm"
    assert decide_capability(denied).mode == "reject"
