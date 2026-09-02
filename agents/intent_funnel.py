"""Cheap, deterministic intent hints for the persona Supervisor."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Iterable

from langchain.messages import HumanMessage


_SIGNALS = {
    "management": ("修改角色", "删除角色", "角色设定", "上传资料", "删除资料"),
    "memory": ("记住", "记忆", "忘掉", "别记", "清空记忆"),
    # canonical voice Worker：覆盖所有声音相关能力；保留“克隆”只是其中一组强信号。
    # RVC 只处理用户明确要求的音频文件变声；角色语音、TTS 和一般音频请求仍走 voice/GPT-SoVITS。
    # RVC 是受条件约束的专项意图，不能因为单独提到术语就触发。
    "voice": (
        "声音", "语音", "音色", "音频", "tts", "asr", "语音合成", "语音识别",
        "实时语音", "语音克隆", "音色克隆", "克隆音色", "克隆声音", "声音克隆",
        "训练音色", "音色训练", "gpt-sovits", "gpt sovits",
    ),
    "live2d": ("live2d", "live 2d", "vtube studio", "vts", "模型立绘", "虚拟形象"),
    "knowledge": ("资料", "文档", "知识库", "根据设定", "根据内容", "经历"),
    "web": ("天气", "新闻", "实时", "最新", "联网", "搜索网络", "汇率", "当前价格"),
    "capability": ("工具", "能力", "能调用", "会调用", "可以调用"),
    "conversation": (
        "你好", "您好", "嗨", "在吗", "谢谢", "再见", "你是谁", "介绍一下你自己",
        "介绍自己", "陪我", "聊聊", "心情", "讲个笑话", "你喜欢", "你讨厌",
    ),
}
_PRIORITY = ("management", "memory", "rvc_worker", "voice", "live2d", "knowledge", "web", "capability", "conversation")
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
_PROFILE_MUTATION_RE = re.compile(
    r"(?:把|将)?(?:你的|自己的|我的)?(?:名字|名称|称呼|人设|设定|形象|资料)(?:改成|改为|换成|设为|设置为|更新为|改成|改为)(?:.+?)(?:吗|？|\?)?$"
    r"|(?:我想给你改名|想给你改名|给你改名|帮你改名|给自己改名|改名字|更新设定|修改设定|调整设定|改写设定|更新人设|修改人设|调整人设|改写人设)"
)
_RENAME_RE = re.compile(r"改名成(?:.+?)$|(?:名字|名称|称呼)(?:改成|改为|换成|设为|设置为|更新为)(.+?)")
_PROFILE_SET_RE = re.compile(r"(?:加上|补充|更新|修改|调整|改写)(?:一些)?(?:人设|设定|形象|资料)(?:[:：])?(.*)")
_PROFILE_NEGATION_PREFIX_RE = re.compile(r"(?:不要|不用|无需|别|不必|不是|不想|禁止)[^，。！!？?；;]{0,10}$")



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
    # Advisory metadata for Core Agent; never a final routing decision.
    configuration_hint: bool = False
    configuration_subject: str | None = None
    requested_action: str | None = None

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
            # Keep advisory configuration metadata in the graph checkpoint.
            # Without these fields the Core Agent only receives primary/candidates
            # and may mistake “检查 RVC 配置” for an RVC production request.
            "configuration_hint": self.configuration_hint,
            "configuration_subject": self.configuration_subject,
            "requested_action": self.requested_action,
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
            configuration_hint=bool(value.get("configuration_hint")),
            configuration_subject=value.get("configuration_subject"),
            requested_action=value.get("requested_action"),
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
            f"configuration_hint={str(self.configuration_hint).lower()}; "
            f"configuration_subject={self.configuration_subject or 'none'}; "
            f"requested_action={self.requested_action or 'none'}; "
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
    # Configuration is advisory context for the Core Agent, not a hard route.
    config_action_map = (
        ("status", ("检查", "查询", "查看", "是否配置", "配置状态", "缺什么", "依赖")),
        ("install", ("安装", "下载", "补全", "更新", "升级")),
        ("cancel", ("取消下载", "停止安装", "中止下载")),
        ("clean", ("清理", "卸载", "删除缓存")),
    )
    configuration_hint = any(token in normalized for _, tokens in config_action_map for token in tokens)
    requested_action = next((action for action, tokens in config_action_map if any(token in normalized for token in tokens)), None)
    configuration_subject = next((subject for subject, tokens in (("rvc", ("rvc", "变声")), ("ffmpeg", ("ffmpeg",)), ("asr", ("asr", "语音识别")), ("embedding", ("embedding", "嵌入模型")), ("gpt_sovits", ("gpt-sovits", "gpt sovits"))) if any(token in normalized for token in tokens)), None)
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
    # 明确提出 RVC 处理动作时，由 Core Agent → Supervisor → rvc_worker 接管。
    # 这里只提供确定性的意图提示，不绕过 Agent，也不在前端直接创建卡片。
    rvc_named = "rvc" in normalized or ".pth" in normalized or "pth" in normalized
    rvc_action = any(signal in normalized for signal in (
        "变声", "变成", "转换音色", "音色转换", "生成变声",
        "人声分离", "分离人声", "纯人声", "伴奏", "音频文件", "视频文件",
        "mp3", "wav", "m4a", "flac", "ogg", "输入音频", "参考音频",
    ))
    explicit_rvc_signal = rvc_named and rvc_action
    if "rvc_worker" not in negated and explicit_rvc_signal:
        found.add("rvc_worker")
    if (explicit_web or fresh_external or requested_external) and "web" not in negated:
        found.add("web")
    candidates = tuple(intent for intent in _PRIORITY if intent in found)
    has_profile_mutation = (
        bool(_PROFILE_MUTATION_RE.search(normalized))
        or bool(_RENAME_RE.search(normalized))
        or bool(_PROFILE_SET_RE.search(normalized))
    )
    if has_profile_mutation and not _PROFILE_NEGATION_PREFIX_RE.search(normalized):
        return IntentAnalysis("management", ("management",))
    if candidates:
        return IntentAnalysis(
            candidates[0],
            candidates,
            tuple(intent for intent in _PRIORITY if intent in negated),
            explicit_web=explicit_web,
            web_authorized=(explicit_web or fresh_external or requested_external),
            configuration_hint=configuration_hint,
            configuration_subject=configuration_subject,
            requested_action=requested_action,
        )
    if previous and previous.primary not in {None, "ui"} and _ELLIPSIS_RE.fullmatch(normalized):
        return IntentAnalysis(
            previous.primary,
            previous.candidates or (previous.primary,),
            tuple(intent for intent in _PRIORITY if intent in negated),
            inherited=True,
            web_authorized=previous.web_authorized,
        )
    return IntentAnalysis(None, (), tuple(intent for intent in _PRIORITY if intent in negated), configuration_hint=configuration_hint, configuration_subject=configuration_subject, requested_action=requested_action)


def _message_text(message) -> str:
    content = getattr(message, "content", "")
    return content if isinstance(content, str) else ""


def analyze_message_history(messages: Iterable) -> IntentAnalysis:
    user_messages = [message for message in messages if isinstance(message, HumanMessage)]
    if not user_messages:
        return IntentAnalysis(None)
    previous = analyze_intents(_message_text(user_messages[-2])) if len(user_messages) > 1 else None
    return analyze_intents(_message_text(user_messages[-1]), previous)
