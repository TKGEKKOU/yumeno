import asyncio

from extensions.events import EVENT_MESSAGE, EventBus
from integrations.onebot11.ws_server import OneBotConnectionManager


def _payload(**overrides):
    data = {
        "post_type": "message",
        "message_type": "private",
        "message_id": 12345,
        "self_id": 10001,
        "user_id": 20001,
        "time": 1710000000,
        "message": [{"type": "text", "data": {"text": "hello"}}],
        "raw_message": "hello",
    }
    data.update(overrides)
    return data


def test_duplicate_message_id_is_published_once():
    published = []
    bus = EventBus()
    bus.subscribe(EVENT_MESSAGE, published.append)
    manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})

    async def scenario():
        payload = _payload()
        await manager._publish_event(payload, bus)
        await manager._publish_event(payload, bus)

    asyncio.run(scenario())
    assert len(published) == 1
    assert published[0].content == "hello"


def test_missing_message_id_uses_stable_fingerprint():
    published = []
    bus = EventBus()
    bus.subscribe(EVENT_MESSAGE, published.append)
    manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
    payload = _payload()
    payload.pop("message_id")

    async def scenario():
        await manager._publish_event(payload, bus)
        await manager._publish_event(payload, bus)
        await manager._publish_event(
            {
                **payload,
                "raw_message": "other",
                "message": [{"type": "text", "data": {"text": "other"}}],
            },
            bus,
        )

    asyncio.run(scenario())
    assert [event.content for event in published] == ["hello", "other"]
