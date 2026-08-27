"""Cheap, deterministic intent hints for the persona Supervisor."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Iterable

from langchain.messages import HumanMessage


_SIGNALS = {
    "management": ("修改角色", "删除角色", "角色设定", "上传资料", "删除资料"),
    "memory": ("记住", "记忆", "忘掉", "别记", "清空记忆"),
    "knowledge": ("资料", "文档", "知识库", "根据设定", "根据内容", "经历"),
    "web": ("天气", "新闻", "实时", "最新", "联网", "搜索网络", "汇率", "当前价格"),
    "capability": ("工具", "能力", "能调用", "会调用", "可以调用"),
    "conversation": (
        "你好", "您好", "嗨", "在吗", "谢谢", "再见", "你是谁", "介绍一下你自己",
        "介绍自己", "陪我", "聊聊", "心情", "讲个笑话", "你喜欢", "你讨厌",
    ),
}
_PRIORITY = ("management", "memory", "knowledge", "web", "capability", "conversation")
_NEGATORS = ("不要", "不用", "无需", "别", "不必", "不是", "不想", "禁止")
_UI_COMMANDS = (
    (re.compile(r"^(?:请)?(?:打开|进入|切换到?)(?:系统)?设置(?:页|页面)?[。！!？?]*$"), "open_settings"),
    (re.compile(r"^(?:请)?(?:打开|进入|切换到?)角色管理(?:页|页面)?[。！!？?]*$"), "open_manage"),
)
_ELLIPSIS_RE = re.compile(r"^(?:那|那么|然后|就|换成|改成|还是|这个|那个).{0,16}(?:呢|吧|吗|？|\?)?$", re.S)
_EXPLICIT_WEB_RE = re.compile(
    r"(?:直接搜|帮(?:我)?搜(?:一下)?|搜一下|搜一搜|搜索|联网查|上网查|查网页|查网络)"
)
_WEB_FRESHNESS_SIGNALS = ("今天", "现在", "最新", "当前", "最近")
_EXTERNAL_FACT_OBJECTS = (
    "天气", "新闻", "价格", "汇率", "股价", "赛事", "票价", "交通", "开放时间",
)
_EXTERNAL_LOOKUP_SIGNALS = ("查", "查询", "看看", "了解")


@dataclass(frozen=True)
class IntentAnalysis:
    primary: str | None
    candidates: tuple[str, ...] = ()
    negated: tuple[str, ...] = ()
    ui_command: str | None = None
    inherited: bool = False
    requires_model: bool = True
    explicit_web: bool = False
    web_authorized: bool = False

    def to_state(self) -> dict:
        return {
            "primary": self.primary,
            "candidates": list(self.candidates),
            "negated": list(self.negated),
            "ui_command": self.ui_command,
            "inherited": self.inherited,
            "requires_model": self.requires_model,
            "explicit_web": self.explicit_web,
            "web_authorized": self.web_authorized,
        }

    @classmethod
    def from_state(cls, value: dict | None) -> "IntentAnalysis":
        value = value or {}
        return cls(
            primary=value.get("primary"),
            candidates=tuple(value.get("candidates") or ()),
            negated=tuple(value.get("negated") or ()),
            ui_command=value.get("ui_command"),
            inherited=bool(value.get("inherited")),
            requires_model=bool(value.get("requires_model", True)),
            explicit_web=bool(value.get("explicit_web")),
            web_authorized=bool(value.get("web_authorized")),
        )

    def as_prompt_hint(self) -> str:
        candidates = ",".join(self.candidates) or "none"
        negated = ",".join(self.negated) or "none"
        return (
            "<intent_funnel advisory=\"true\">"
            f"primary={self.primary or 'ambiguous'}; candidates={candidates}; "
            f"negated={negated}; inherited={str(self.inherited).lower()}; "
            f"explicit_web={str(self.explicit_web).lower()}; "
            f"web_authorized={str(self.web_authorized).lower()}; "
            f"ui_command={self.ui_command or 'none'}"
            "</intent_funnel>"
        )


def _signal_is_negated(text: str, start: int) -> bool:
    prefix = text[max(0, start - 8):start]
    boundary = max(prefix.rfind(mark) for mark in ("，", ",", "。", "！", "!", "？", "?", "；", ";"))
    clause_prefix = prefix[boundary + 1:]
    return any(negator in clause_prefix for negator in _NEGATORS)


def analyze_intents(text: str, previous: IntentAnalysis | None = None) -> IntentAnalysis:
    normalized = re.sub(r"\s+", "", str(text or "")).lower()
    # 无上下文时也按保守的知识续接处理，避免上一轮联网结果被模型错误继承。
    if normalized in {"继续", "接着说", "然后呢", "再说说"}:
        return IntentAnalysis("knowledge", ("knowledge",), inherited=True)
    for pattern, command in _UI_COMMANDS:
        if pattern.fullmatch(normalized):
            return IntentAnalysis("ui", ("ui",), ui_command=command, requires_model=False)

    explicit_web = bool(_EXPLICIT_WEB_RE.search(normalized))
    fresh_external = (
        any(signal in normalized for signal in _WEB_FRESHNESS_SIGNALS)
        and any(subject in normalized for subject in _EXTERNAL_FACT_OBJECTS)
    )
    requested_external = (
        any(signal in normalized for signal in _EXTERNAL_LOOKUP_SIGNALS)
        and any(subject in normalized for subject in _EXTERNAL_FACT_OBJECTS)
    )
    found: set[str] = set()
    negated: set[str] = set()
    for intent, signals in _SIGNALS.items():
        for signal in signals:
            for match in re.finditer(re.escape(signal), normalized):
                if _signal_is_negated(normalized, match.start()):
                    negated.add(intent)
                else:
                    found.add(intent)
    found -= negated
    if (explicit_web or fresh_external or requested_external) and "web" not in negated:
        found.add("web")
    candidates = tuple(intent for intent in _PRIORITY if intent in found)
    if candidates:
        return IntentAnalysis(
            candidates[0],
            candidates,
            tuple(intent for intent in _PRIORITY if intent in negated),
            explicit_web=explicit_web,
            web_authorized=(explicit_web or fresh_external or requested_external),
        )
    if previous and previous.primary not in {None, "ui"} and _ELLIPSIS_RE.fullmatch(normalized):
        return IntentAnalysis(
            previous.primary,
            previous.candidates or (previous.primary,),
            tuple(intent for intent in _PRIORITY if intent in negated),
            inherited=True,
            web_authorized=previous.web_authorized,
        )
    return IntentAnalysis(None, (), tuple(intent for intent in _PRIORITY if intent in negated))


def _message_text(message) -> str:
    content = getattr(message, "content", "")
    return content if isinstance(content, str) else ""


def analyze_message_history(messages: Iterable) -> IntentAnalysis:
    user_messages = [message for message in messages if isinstance(message, HumanMessage)]
    if not user_messages:
        return IntentAnalysis(None)
    previous = analyze_intents(_message_text(user_messages[-2])) if len(user_messages) > 1 else None
    return analyze_intents(_message_text(user_messages[-1]), previous)
