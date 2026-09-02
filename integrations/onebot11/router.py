import asyncio
import logging
import random
from dataclasses import replace
from pathlib import Path
from typing import Any
from uuid import uuid4

from agents.context_factory import persona_agent_context
from extensions.events import MessageEvent
from integrations.bindings import (
    bind_persona,
    load_bindings,
    persona_for,
    save_bindings,
)
from integrations.commands import parse_command
from integrations.config import load_integrations, onebot_config
from persona.service import PersonaNotFound, find_persona_by_name
from app.routers.tts import persona_output_language, persona_voice_asset
from settings import Settings
from rag.llm import get_llm


logger = logging.getLogger(__name__)


def _classify_spontaneous_reply(text: str) -> bool:
    """Use a cheap yes/no pass before allowing an unsolicited group reply."""

    prompt = (
        "判断下面这条群聊消息是否值得一个有明确人格的AI角色主动插话。"
        "只回答 YES 或 NO：只有与角色设定、当前话题或可自然回应的问题直接相关时才回答 YES。\n"
        f"群聊消息：{text}"
    )
    try:
        result = get_llm().invoke(prompt)
        content = str(getattr(result, "content", result)).strip().upper()
        return content.startswith("YES")
    except Exception:
        logger.exception("onebot spontaneous reply classification failed")
        return False


class ImMessageRouter:
    def __init__(
        self,
        agent_service,
        session_factory,
        bindings_path: Path,
        integrations_path: Path,
        platform: str = "onebot11",
        tts_synthesis=None,
        agent_runtime=None,
    ) -> None:
        self.agent_service = agent_service
        self.session_factory = session_factory
        self.bindings_path = bindings_path
        self.integrations_path = integrations_path
        self.platform = platform
        self.tts_synthesis = tts_synthesis
        self.agent_runtime = agent_runtime
        self._locks: dict[str, asyncio.Lock] = {}

    def _agent_runner(self):
        return self.agent_runtime or self.agent_service

    def conversation_id(self, chat_type: str, chat_id: str) -> str:
        return f"im:{self.platform}:{chat_type}:{chat_id}"

    def _config(self) -> dict:
        data = load_integrations(self.integrations_path)
        return onebot_config(data)

    def _lock(self, key: str) -> asyncio.Lock:
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]

    async def handle(self, event: MessageEvent) -> None:
        if event.platform != self.platform:
            return
        config = self._config()
        if not config.get("auto_reply_enabled", False):
            return
        explicit_group_trigger = False
        if event.chat_type == "group":
            if config["group_trigger"] == "at" and not event.is_at:
                explicit_group_trigger = False
            elif config["group_trigger"] == "at":
                explicit_group_trigger = True
            if config["group_trigger"] == "prefix":
                prefix = config.get("prefix") or ""
                if not prefix or not event.content.startswith(prefix):
                    explicit_group_trigger = False
                else:
                    explicit_group_trigger = True
                    event = replace(event, content=event.content[len(prefix):].strip())
        async with self._lock(event.chat_id):
            command = parse_command(event.content)
            if command is not None:
                await self._handle_command(event, command)
            else:
                if event.chat_type == "group" and not explicit_group_trigger:
                    authorized = str(event.chat_id) in {
                        str(group_id) for group_id in (config.get("authorized_group_ids") or [])
                    }
                    if not authorized:
                        return
                    probability = float(config.get("spontaneous_reply_probability", 0.05) or 0)
                    if random.random() >= max(0.0, min(1.0, probability)):
                        return
                    suitable = await asyncio.to_thread(
                        _classify_spontaneous_reply, event.content
                    )
                    if not suitable:
                        return
                    event = replace(
                        event,
                        content=f"群成员 {event.user_id}：{event.content}",
                    )
                await self._handle_question(event)

    async def _handle_command(self, event: MessageEvent, command: tuple[str, str]) -> None:
        kind, argument = command
        if kind == "persona":
            self._bind_persona(event, argument)
        elif kind == "approve":
            await self._resume(event, True)
        elif kind == "reject":
            await self._resume(event, False)
        elif kind == "help":
            event.reply("可用命令：/角色 <名称> 绑定角色；/同意、/拒绝 处理待确认操作；/帮助 查看命令。")

    def _bind_persona(self, event: MessageEvent, name: str) -> None:
        with self.session_factory() as session:
            persona = find_persona_by_name(session, name)
        if persona is None:
            event.reply(f"没有找到名为「{name}」的角色，请到资料页确认角色名称。")
            return
        bindings = load_bindings(self.bindings_path)
        bind_persona(bindings, event.chat_type, event.chat_id, persona.id)
        save_bindings(self.bindings_path, bindings)
        event.reply(f"已绑定角色「{persona.name}」。")

    def _default_persona_id(self) -> str:
        return str(self._config().get("default_persona_id") or "")

    def _persona_for(self, event: MessageEvent) -> str | None:
        bindings = load_bindings(self.bindings_path)
        return persona_for(bindings, event.chat_type, event.chat_id, self._default_persona_id())

    def _context(self, event: MessageEvent) -> Any:
        return persona_agent_context(
            self.session_factory,
            self._persona_for(event),
            self.conversation_id(event.chat_type, event.chat_id),
            agent_runtime=self.agent_runtime,
        )

    async def _handle_question(self, event: MessageEvent) -> None:
        if self._persona_for(event) is None:
            event.reply("还没有绑定角色。请先用 /角色 <名称> 绑定，或在设置页配置默认角色。")
            return
        try:
            context = self._context(event)
        except PersonaNotFound:
            event.reply("绑定的角色不存在了，请重新用 /角色 <名称> 绑定。")
            return
        try:
            result = await asyncio.to_thread(
                self._agent_runner().query, event.content, context
            )
        except Exception:
            logger.exception("im agent query failed")
            event.reply("角色暂时无法回复，请稍后再试。")
            return
        if result.status == "pending_confirmation":
            action = result.pending_action or {}
            tool = str(action.get("tool") or "操作")
            event.reply(f"需要确认：{tool}。回复 /同意 或 /拒绝。")
        else:
            await self._reply(event, result.answer or "（空回复）")

    async def _reply(self, event: MessageEvent, text: str) -> None:
        config = self._config()
        reply_mode = config.get("reply_mode") or (
            "voice_only" if config.get("voice_only") else
            "text_voice" if config.get("auto_voice_reply") else "text"
        )
        voice_enabled = reply_mode in {"text_voice", "voice_only"}
        display_text = await self._translate_to_chinese(text) if config.get("chinese_text") else text
        if reply_mode != "voice_only":
            event.reply(display_text)
        if not voice_enabled or event.reply_record is None or self.tts_synthesis is None:
            return
        persona_id = self._persona_for(event)
        if not persona_id:
            return
        try:
            with self.session_factory() as session:
                from app.routers.personas import local_persona_or_404
                persona = local_persona_or_404(session, persona_id)
                asset = persona_voice_asset(persona, session)
                if asset is None:
                    return
                segments = self.tts_synthesis.iter_synthesize_segments(
                    asset,
                    text,
                    default_language=persona_output_language(persona),
                )
            directory = Settings.load().project_root / "data" / "audio" / "napcat-replies"
            directory.mkdir(parents=True, exist_ok=True)
            while True:
                segment = await asyncio.to_thread(next, segments, None)
                if segment is None:
                    break
                path = directory / f"{uuid4().hex}.wav"
                path.write_bytes(segment.audio)
                event.reply_record(str(path))
                asyncio.create_task(self._remove_later(path))
        except Exception:
            logger.exception("onebot voice reply failed")

    @staticmethod
    async def _translate_to_chinese(text: str) -> str:
        prompt = (
            "将下面的回复翻译成自然中文。只输出译文，不要解释；保留原有换行、标点、列表、括号和语气格式，"
            "不要增加或删除信息。原文：\n" + text
        )
        try:
            result = await asyncio.to_thread(get_llm().invoke, prompt)
            content = getattr(result, "content", result)
            return str(content).strip() or text
        except Exception:
            logger.exception("onebot Chinese translation failed")
            return text

    @staticmethod
    async def _remove_later(path: Path) -> None:
        await asyncio.sleep(60)
        try:
            path.unlink(missing_ok=True)
        except OSError:
            logger.warning("failed to remove temporary OneBot audio: %s", path)

    async def _resume(self, event: MessageEvent, approved: bool) -> None:
        if self._persona_for(event) is None:
            event.reply("还没有绑定角色。")
            return
        try:
            context = self._context(event)
            result = await asyncio.to_thread(
                self._agent_runner().resume, context, "conversation", approved
            )
        except Exception:
            logger.exception("im agent resume failed")
            event.reply("操作处理失败，请稍后再试。")
            return
        if result.status == "pending_confirmation" or not result.answer:
            event.reply("当前没有待确认的操作。")
        else:
            event.reply(result.answer)
