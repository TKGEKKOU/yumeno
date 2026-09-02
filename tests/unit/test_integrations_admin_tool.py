"""聊天内集成状态/重连工具：只读状态 + MCP 热重连。"""

from types import SimpleNamespace


class FakeMcp:
    def __init__(self):
        self.reloaded = []
        self._status = {
            "filesystem": {
                "status": "error",
                "tool_count": 0,
                "error": "stdio exited",
                "last_check": "2026-04-08T12:00:00",
            }
        }

    def status(self):
        return dict(self._status)

    def get_config(self, name):
        if name != "filesystem":
            return None
        return SimpleNamespace(name="filesystem")

    async def reload_server(self, name):
        self.reloaded.append(name)
        self._status[name] = {
            "status": "connected",
            "tool_count": 2,
            "error": "",
            "last_check": "2026-04-08T12:01:00",
        }
        return self._status[name]


class FakeOneBot:
    def __init__(self, connected=False, error="NapCat 未连接"):
        self.connected = connected
        self.error = error
        self.last_event_at = None
        self.reconnects = 0

    def status(self):
        return {
            "connected": self.connected,
            "error": self.error,
            "last_event_at": self.last_event_at,
            "client_count": int(self.connected),
        }

    async def reconnect(self):
        self.reconnects += 1
        self.connected = True
        self.error = None
        return self.status()


class FakeBilibili:
    def __init__(self, connected=False, error="直播间未连接"):
        self.connected = connected
        self.error = error
        self.state = "error" if error else "disconnected"
        self.reconnects = 0

    def status(self):
        return {
            "connected": self.connected,
            "error": self.error,
            "state": self.state,
            "active_room_id": 123 if self.connected else None,
        }

    async def reconnect(self):
        self.reconnects += 1
        self.connected = True
        self.error = None
        self.state = "running"
        return self.status()


def test_list_integration_status_core_reports_mcp_onebot_bilibili():
    from agents.tools.integrations_admin import list_integration_status_core

    result = list_integration_status_core(FakeMcp(), FakeOneBot(), FakeBilibili())
    assert result["mcp"]["items"][0]["name"] == "filesystem"
    assert result["mcp"]["items"][0]["status"] == "error"
    assert result["onebot"]["connected"] is False
    assert result["bilibili"]["error"] == "直播间未连接"


def test_reconnect_mcp_server_core_reloads_existing_and_rejects_missing():
    from agents.tools.integrations_admin import reconnect_mcp_server_core

    manager = FakeMcp()
    ok = reconnect_mcp_server_core("filesystem", manager)
    assert ok["status"] == "ok"
    assert manager.reloaded == ["filesystem"]
    missing = reconnect_mcp_server_core("missing", manager)
    assert missing["status"] == "error"
    assert "不存在" in missing["error"]


def test_reconnect_onebot_and_bilibili_cores_call_managers():
    from agents.tools.integrations_admin import reconnect_bilibili_core, reconnect_onebot_core

    onebot = FakeOneBot()
    bilibili = FakeBilibili()
    assert reconnect_onebot_core(onebot)["connected"] is True
    assert onebot.reconnects == 1
    assert reconnect_bilibili_core(bilibili)["connected"] is True
    assert bilibili.reconnects == 1


def test_list_integration_status_reachable_from_supervisor(monkeypatch):
    from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
    from langchain_core.messages import AIMessage, ToolMessage
    from langgraph.checkpoint.memory import MemorySaver

    from agents.context import PersonaAgentContext
    from agents.tools.integrations_admin import set_integration_managers
    from agents.workflow import build_persona_workflow

    mcp = FakeMcp()
    onebot = FakeOneBot()
    bilibili = FakeBilibili()
    set_integration_managers(mcp, onebot, bilibili)
    try:
        class ToolCallingFake(FakeMessagesListChatModel):
            def bind_tools(self, tools, **kwargs):
                return self

        model = ToolCallingFake(
            responses=[
                AIMessage(
                    content="",
                    tool_calls=[
                        {
                            "name": "list_integration_status",
                            "args": {},
                            "id": "int-1",
                            "type": "tool_call",
                        }
                    ],
                ),
                AIMessage(content="MCP 失败，OneBot 未连接。"),
            ]
        )
        context = PersonaAgentContext(
            persona_id="persona-a",
            workspace_id="local-default",
            knowledge_space_ids=("space-a",),
            conversation_id="thread-a",
            persona_name="Alpha",
            persona_type="character",
        )
        result = build_persona_workflow(model, MemorySaver()).invoke(
            {"messages": [("user", "现在 MCP 和 QQ 连上了吗")], "active_worker": None},
            {"configurable": {"thread_id": "persona-a:thread-a"}},
            context=context,
        )
        messages = result["messages"]
        tool_messages = [message for message in messages if isinstance(message, ToolMessage)]
        assert tool_messages
        assert "filesystem" in str(tool_messages[0].content)
    finally:
        set_integration_managers(None, None, None)
