import asyncio



class FakeWebSocket:
    def __init__(self):
        self.sent = []

    async def send_json(self, payload):
        self.sent.append(payload)


def test_request_action_matches_echo_response():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    async def scenario():
        manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
        socket = FakeWebSocket()
        manager._connections.append(socket)

        request = asyncio.create_task(manager.request_action("get_login_info", {}))
        while not socket.sent:
            await asyncio.sleep(0)
        echo = socket.sent[0]["echo"]
        await manager._handle_action_response({
            "status": "ok",
            "retcode": 0,
            "data": {"user_id": 12345, "nickname": "YUMENO"},
            "echo": echo,
        })
        return await request

    assert asyncio.run(scenario()) == {"user_id": 12345, "nickname": "YUMENO"}


def test_request_action_reports_api_error():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    async def scenario():
        manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
        socket = FakeWebSocket()
        manager._connections.append(socket)

        request = asyncio.create_task(manager.request_action("get_group_list", {}))
        while not socket.sent:
            await asyncio.sleep(0)
        await manager._handle_action_response({
            "status": "failed",
            "retcode": 100,
            "message": "not supported",
            "echo": socket.sent[0]["echo"],
        })
        return request

    async def assert_error():
        request = await scenario()
        try:
            await request
        except RuntimeError as exc:
            assert "not supported" in str(exc)
        else:
            raise AssertionError("request_action should report API errors")

    asyncio.run(assert_error())


def test_send_message_uses_private_text_segment():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    async def scenario():
        manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
        socket = FakeWebSocket()
        manager._connections.append(socket)
        request = asyncio.create_task(manager.send_text("private", "20001", "你好"))
        while not socket.sent:
            await asyncio.sleep(0)
        payload = socket.sent[0]
        await manager._handle_action_response({"status": "ok", "retcode": 0,
            "data": {"message_id": 9}, "echo": payload["echo"]})
        return payload, await request

    payload, result = asyncio.run(scenario())
    assert payload["action"] == "send_private_msg"
    assert payload["params"] == {"user_id": 20001, "message": [{"type": "text", "data": {"text": "你好"}}]}
    assert result == {"message_id": 9}


def test_send_record_uses_group_record_segment():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    async def scenario():
        manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
        socket = FakeWebSocket()
        manager._connections.append(socket)
        request = asyncio.create_task(manager.send_record("group", "30001", "C:/audio/reply.wav"))
        while not socket.sent:
            await asyncio.sleep(0)
        payload = socket.sent[0]
        await manager._handle_action_response({"status": "ok", "retcode": 0,
            "data": {"message_id": 10}, "echo": payload["echo"]})
        return payload, await request

    payload, result = asyncio.run(scenario())
    assert payload["action"] == "send_group_msg"
    assert payload["params"]["group_id"] == 30001
    assert payload["params"]["message"] == [{"type": "record", "data": {"file": "C:/audio/reply.wav"}}]
    assert result == {"message_id": 10}


def test_send_message_rejects_empty_text_without_connecting():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    with_error = None
    try:
        asyncio.run(OneBotConnectionManager(lambda: {"enabled": True}).send_text("private", "1", "  "))
    except RuntimeError as exc:
        with_error = str(exc)
    assert with_error == "消息内容不能为空"
def test_successful_text_send_is_exposed_in_recent_messages():
    from integrations.onebot11.ws_server import OneBotConnectionManager

    async def scenario():
        manager = OneBotConnectionManager(lambda: {"enabled": True, "access_token": ""})
        socket = FakeWebSocket()
        manager._connections.append(socket)
        request = asyncio.create_task(manager.send_text("group", "30001", "真实回复内容"))
        while not socket.sent:
            await asyncio.sleep(0)
        await manager._handle_action_response({
            "status": "ok", "retcode": 0, "data": {"message_id": 11},
            "echo": socket.sent[0]["echo"],
        })
        await request
        return manager.status()["recent_messages"]

    assert asyncio.run(scenario()) == [{
        "target_type": "group",
        "target_id": "30001",
        "content": "真实回复内容",
        "source": "manual",
    }]
