from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from agents.context_budget import ContextBudget, build_bounded_context


def _tool_turn(index: int):
    call_id = f"call-{index}"
    return [
        HumanMessage(content=f"question {index} " + "x" * 80),
        AIMessage(
            content="",
            tool_calls=[{"name": "search", "args": {}, "id": call_id}],
        ),
        ToolMessage(content="result " + "y" * 80, tool_call_id=call_id),
        AIMessage(content=f"answer {index}"),
    ]


def test_bounded_context_keeps_system_and_latest_complete_turns():
    messages = [SystemMessage(content="system")]
    for index in range(8):
        messages.extend(_tool_turn(index))

    result = build_bounded_context(messages, ContextBudget(max_tokens=180))

    assert isinstance(result.messages[0], SystemMessage)
    assert any(
        isinstance(message, HumanMessage) and "question 7" in str(message.content)
        for message in result.messages
    )
    assert result.tokens_after <= 180
    assert result.tokens_before > result.tokens_after
    assert result.dropped_messages > 0

    kept_call_ids = {
        call["id"]
        for message in result.messages
        if isinstance(message, AIMessage)
        for call in message.tool_calls
    }
    kept_result_ids = {
        message.tool_call_id
        for message in result.messages
        if isinstance(message, ToolMessage)
    }
    assert kept_call_ids == kept_result_ids


def test_bounded_context_never_drops_the_current_user_message():
    current = HumanMessage(content="current " + "z" * 2000)

    result = build_bounded_context([current], ContextBudget(max_tokens=40))

    assert len(result.messages) == 1
    assert isinstance(result.messages[0], HumanMessage)
    assert str(result.messages[0].content).startswith("current")


def test_context_budget_is_deterministic_for_long_conversations():
    messages = []
    for index in range(50):
        messages.extend(_tool_turn(index))

    first = build_bounded_context(messages, ContextBudget(max_tokens=600))
    second = build_bounded_context(messages, ContextBudget(max_tokens=600))

    assert [message.content for message in first.messages] == [
        message.content for message in second.messages
    ]
    assert first.tokens_after == second.tokens_after
