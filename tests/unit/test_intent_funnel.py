from langchain.messages import HumanMessage


def test_negated_knowledge_and_web_intents_are_not_selected():
    from agents.intent_funnel import analyze_intents

    result = analyze_intents("不要查资料，也不用联网，直接陪我聊聊")

    assert result.primary == "conversation"
    assert "knowledge" not in result.candidates
    assert "web" not in result.candidates
    assert set(result.negated) >= {"knowledge", "web"}


def test_multiple_intents_are_scanned_without_early_exit():
    from agents.intent_funnel import analyze_intents

    result = analyze_intents("根据角色资料说明她的经历，再查一下今天北京天气")

    assert result.primary == "knowledge"
    assert result.candidates == ("knowledge", "web")


def test_explicit_ui_command_is_structured_without_calling_a_model():
    from agents.intent_funnel import analyze_intents

    result = analyze_intents("打开系统设置")

    assert result.primary == "ui"
    assert result.ui_command == "open_settings"
    assert result.requires_model is False


def test_elliptical_followup_inherits_previous_web_intent():
    from agents.intent_funnel import analyze_message_history

    result = analyze_message_history(
        [HumanMessage(content="查一下北京天气"), HumanMessage(content="那上海呢？")]
    )

    assert result.primary == "web"
    assert result.inherited is True
    assert result.web_authorized is True


def test_complete_new_question_does_not_inherit_previous_intent():
    from agents.intent_funnel import analyze_message_history

    result = analyze_message_history(
        [HumanMessage(content="查一下北京天气"), HumanMessage(content="介绍一下你自己")]
    )

    assert result.primary == "conversation"
    assert result.inherited is False


def test_prompt_hint_is_advisory_and_preserves_negation():
    from agents.intent_funnel import analyze_intents

    hint = analyze_intents("不要联网，根据资料回答").as_prompt_hint()

    assert "advisory" in hint
    assert "primary=knowledge" in hint
    assert "negated=web" in hint


def test_supervisor_prompt_can_include_the_advisory_hint():
    from agents.context import PersonaAgentContext
    from agents.workflow import _supervisor_prompt

    context = PersonaAgentContext(
        persona_id="p1",
        workspace_id="w1",
        knowledge_space_ids=("k1",),
        conversation_id="c1",
        persona_name="Viola",
        persona_type="character",
    )
    prompt = _supervisor_prompt(context, '<intent_funnel advisory="true">primary=web</intent_funnel>')

    assert '<intent_funnel advisory="true">primary=web</intent_funnel>' in prompt
    assert "advisory signal, not authorization" in prompt


def test_explicit_web_wording_is_part_of_the_shared_intent_decision():
    from agents.intent_funnel import analyze_intents

    for question in ("直接搜薇欧拉", "帮我搜一下薇欧拉", "搜索薇欧拉"):
        result = analyze_intents(question)

        assert result.primary == "web"
        assert result.explicit_web is True
        assert "explicit_web=true" in result.as_prompt_hint()


def test_fresh_external_fact_authorizes_web_without_claiming_explicit_wording():
    from agents.intent_funnel import analyze_intents

    result = analyze_intents("今天潍坊天气怎么样")

    assert result.primary == "web"
    assert result.web_authorized is True
    assert result.explicit_web is False

    requested = analyze_intents("查一下北京天气")
    assert requested.web_authorized is True
    assert requested.explicit_web is False

    local = analyze_intents("查一下角色资料")
    assert local.web_authorized is False


def test_negated_web_request_is_never_authorized():
    from agents.intent_funnel import analyze_intents

    result = analyze_intents("不要联网，按角色资料回答")

    assert result.web_authorized is False
    assert "web" in result.negated
