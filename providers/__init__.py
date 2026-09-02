"""
YUMENO Provider System - 完整提供商配置
支持 LLM、Embedding、Reranker、STT、TTS、WebSearch
"""

from enum import Enum
from typing import Any
from dataclasses import dataclass, field


class ProviderType(str, Enum):
    """提供商类型 - 按用户要求的顺序"""
    LLM = "llm"
    EMBEDDING = "embedding"
    RERANKER = "reranker"
    STT = "stt"  # 语音转文字
    TTS = "tts"
    WEB_SEARCH = "web_search"
    VOICE_CONVERSION = "voice_conversion"  # 音色转换


@dataclass
class ProviderMetadata:
    """提供商元数据"""
    id: str
    name: str
    type: ProviderType
    description: str
    default_base_url: str
    default_model: str = ""
    requires_api_key: bool = True
    supports_streaming: bool = False
    icon: str = ""  # Lucide 图标名称
    custom_fields: dict[str, Any] = field(default_factory=dict)
    mode: str = "api"  # api 或 local
    resource_kind: str | None = None


# ==================== LLM 提供商 ====================
LLM_PROVIDERS = {
    "openai": ProviderMetadata(
        id="openai",
        name="OpenAI Compatible",
        type=ProviderType.LLM,
        description="OpenAI 兼容 API",
        default_base_url="https://api.openai.com/v1",
        default_model="gpt-4o",
        supports_streaming=True,
        icon="bot"
    ),
    "deepseek": ProviderMetadata(
        id="deepseek",
        name="DeepSeek",
        type=ProviderType.LLM,
        description="DeepSeek Responses",
        default_base_url="https://api.deepseek.com",
        default_model="deepseek-reasoner",
        supports_streaming=True,
        icon="brain"
    ),
    "zhipu": ProviderMetadata(
        id="zhipu",
        name="Zhipu",
        type=ProviderType.LLM,
        description="智谱 GLM 系列模型",
        default_base_url="https://open.bigmodel.cn/api/paas/v4",
        default_model="glm-4-plus",
        supports_streaming=True,
        icon="zap"
    ),
    "qwen": ProviderMetadata(
        id="qwen",
        name="通义千问",
        type=ProviderType.LLM,
        description="阿里云通义千问大模型",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="qwen-max",
        supports_streaming=True,
        icon="cloud"
    ),
    "kimi": ProviderMetadata(
        id="kimi",
        name="Kimi",
        type=ProviderType.LLM,
        description="Moonshot Kimi 长文本模型",
        default_base_url="https://api.moonshot.cn/v1",
        default_model="moonshot-v1-32k",
        supports_streaming=True,
        icon="moon"
    ),
    "moonshot": ProviderMetadata(
        id="moonshot",
        name="Moonshot",
        type=ProviderType.LLM,
        description="Moonshot AI",
        default_base_url="https://api.moonshot.cn/v1",
        default_model="moonshot-v1-32k",
        supports_streaming=True,
        icon="moon-star"
    ),
    "minimax": ProviderMetadata(
        id="minimax",
        name="MiniMax",
        type=ProviderType.LLM,
        description="MiniMax 大模型",
        default_base_url="https://api.minimax.chat/v1",
        default_model="abab6.5g-chat",
        supports_streaming=True,
        icon="maximize"
    ),
    "minimax_token": ProviderMetadata(
        id="minimax_token",
        name="MiniMax Token Plan",
        type=ProviderType.LLM,
        description="MiniMax 令牌计费",
        default_base_url="https://api.minimax.chat/v1",
        default_model="abab6.5g-chat",
        supports_streaming=True,
        icon="coins"
    ),
    "xiaomi": ProviderMetadata(
        id="xiaomi",
        name="Xiaomi",
        type=ProviderType.LLM,
        description="小米大模型",
        default_base_url="https://api.xiaoai.xiaomi.com/v1",
        default_model="xiaomi-chat",
        supports_streaming=True,
        icon="smartphone"
    ),
    "xiaomi_token": ProviderMetadata(
        id="xiaomi_token",
        name="Xiaomi Token Plan",
        type=ProviderType.LLM,
        description="小米令牌计费",
        default_base_url="https://api.xiaoai.xiaomi.com/v1",
        default_model="xiaomi-chat",
        supports_streaming=True,
        icon="credit-card"
    ),
    "openrouter": ProviderMetadata(
        id="openrouter",
        name="OpenRouter",
        type=ProviderType.LLM,
        description="OpenRouter 多模型聚合",
        default_base_url="https://openrouter.ai/api/v1",
        default_model="openai/gpt-3.5-turbo",
        supports_streaming=True,
        icon="route"
    ),
    "ollama": ProviderMetadata(
        id="ollama",
        name="Ollama（本地）",
        type=ProviderType.LLM,
        description="本地部署的 Ollama 服务",
        default_base_url="http://127.0.0.1:11434",
        default_model="qwen2.5:14b",
        requires_api_key=False,
        supports_streaming=True,
        icon="hard-drive"
    ),
}

# ==================== Embedding 提供商 ====================
EMBEDDING_PROVIDERS = {
    "openai_embedding": ProviderMetadata(
        id="openai_embedding", name="OpenAI Embedding", type=ProviderType.EMBEDDING,
        description="OpenAI 兼容向量接口", default_base_url="https://api.openai.com/v1",
        default_model="text-embedding-3-large", icon="align-justify"
    ),
    "nvidia_embedding": ProviderMetadata(
        id="nvidia_embedding", name="NVIDIA Embedding", type=ProviderType.EMBEDDING,
        description="NVIDIA 兼容向量接口", default_base_url="https://integrate.api.nvidia.com/v1",
        default_model="nvidia/nv-embed-v1", icon="cpu"
    ),
    "dashscope_embedding": ProviderMetadata(
        id="dashscope_embedding", name="DashScope Embedding", type=ProviderType.EMBEDDING,
        description="阿里云百炼兼容向量接口", default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="text-embedding-v3", icon="cloud"
    ),
    "local_embedding": ProviderMetadata(
        id="local_embedding", name="本地 Embedding", type=ProviderType.EMBEDDING,
        description="受管本地向量模型，支持下载、设备选择和独立 Worker",
        default_base_url="", default_model="Qwen/Qwen3-Embedding-0.6B",
        requires_api_key=False, icon="hard-drive", mode="local", resource_kind="embedding"
    ),
}

# ==================== Reranker 提供商 ====================
RERANKER_PROVIDERS = {
    "bailian_rerank": ProviderMetadata(
        id="bailian_rerank",
        name="百炼 Rerank",
        type=ProviderType.RERANKER,
        description="阿里云百炼 Rerank API",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="gte-rerank",
        icon="cloud"
    ),
    "local_rerank": ProviderMetadata(
        id="local_rerank",
        name="本地 Rerank",
        type=ProviderType.RERANKER,
        description="受管本地重排序模型",
        default_base_url="",
        default_model="Qwen/Qwen3-Reranker-0.6B",
        requires_api_key=False,
        icon="database",
        mode="local",
        resource_kind="reranker"
    ),
}
# ==================== STT 提供商 ====================
STT_PROVIDERS = {
    "whisper_api": ProviderMetadata(
        id="whisper_api", name="Whisper STT(API)", type=ProviderType.STT,
        description="OpenAI-compatible 语音转文字接口", default_base_url="https://api.openai.com/v1",
        default_model="whisper-1", icon="mic"
    ),
    "mimo_stt": ProviderMetadata(
        id="mimo_stt", name="MiMo STT(API)", type=ProviderType.STT,
        description="MiMo 语音转文字接口", default_base_url="https://api.xiaomimimo.com/v1",
        default_model="mimo-v2.5-asr", icon="audio-lines"
    ),
    "xinference_stt": ProviderMetadata(
        id="xinference_stt", name="Xinference STT(API)", type=ProviderType.STT,
        description="Xinference 语音转文字服务", default_base_url="http://127.0.0.1:9997/v1",
        default_model="whisper-large-v3", requires_api_key=False, icon="server"
    ),
    "local_stt": ProviderMetadata(
        id="local_stt", name="本地 STT", type=ProviderType.STT,
        description="受管本地 Qwen3 语音转文字模型",
        default_base_url="", default_model="Qwen/Qwen3-ASR-0.6B",
        requires_api_key=False, icon="hard-drive", mode="local", resource_kind="stt"
    ),
}

# ==================== TTS 提供商 ====================
# 仅保留已经接入正式运行链路的实现；实验性供应商不在配置页制造
# “看起来可用、实际不会被调用”的冗余选项。
TTS_PROVIDERS = {
    "openai_tts": ProviderMetadata(
        id="openai_tts", name="OpenAI TTS(API)", type=ProviderType.TTS,
        description="OpenAI-compatible 语音合成 API",
        default_base_url="https://api.openai.com/v1", default_model="tts-1", icon="volume-2"
    ),
    "mimo_tts": ProviderMetadata(
        id="mimo_tts", name="MiMo TTS(API)", type=ProviderType.TTS,
        description="MiMo 语音合成 API",
        default_base_url="https://api.xiaomimimo.com/v1", default_model="mimo-v2.5-tts", icon="speaker"
    ),
    "gsv_tts_local": ProviderMetadata(
        id="gsv_tts_local", name="GPT-SoVITS（本地）", type=ProviderType.TTS,
        description="本地 GPT-SoVITS，支持角色 VoiceAsset 音色",
        default_base_url="http://127.0.0.1:9880", default_model="local",
        requires_api_key=False, icon="hard-drive", mode="local", resource_kind="tts"
    ),
}

# ==================== Voice Conversion 提供商 ====================
VOICE_CONVERSION_PROVIDERS = {
    "rvc": ProviderMetadata(
        id="rvc", name="RVC（本地音色转换）", type=ProviderType.VOICE_CONVERSION,
        description="将已有音频转换为目标音色；不直接根据文字生成语音",
        default_base_url="", default_model="", requires_api_key=False,
        icon="audio-lines", mode="local", resource_kind="rvc",
    ),
    "separator": ProviderMetadata(
        id="separator", name="人声分离（HT-Demucs）", type=ProviderType.VOICE_CONVERSION,
        description="将音频拆分为人声与伴奏，为声音工坊和数据集处理提供前处理能力",
        default_base_url="", default_model="", requires_api_key=False,
        icon="scissors", mode="local", resource_kind="separator",
    ),
}

# ==================== WebSearch 提供商 ====================
WEB_SEARCH_PROVIDERS = {
    "tavily": ProviderMetadata(
        id="tavily", name="Tavily Search", type=ProviderType.WEB_SEARCH,
        description="AI 优化的联网搜索 API", default_base_url="https://api.tavily.com",
        default_model="tavily-search", icon="search"
    ),
    "bocha": ProviderMetadata(
        id="bocha", name="Bocha Search", type=ProviderType.WEB_SEARCH,
        description="博查联网搜索 API", default_base_url="https://api.bocha.cn/v1/web-search",
        default_model="", icon="globe"
    ),
    "custom_search": ProviderMetadata(
        id="custom_search", name="Custom Search", type=ProviderType.WEB_SEARCH,
        description="兼容项目约定请求格式的自定义搜索接口", default_base_url="",
        default_model="", icon="settings"
    ),
}

# ==================== 汇总 ====================
ALL_PROVIDERS = {
    ProviderType.LLM: LLM_PROVIDERS,
    ProviderType.EMBEDDING: EMBEDDING_PROVIDERS,
    ProviderType.RERANKER: RERANKER_PROVIDERS,
    ProviderType.STT: STT_PROVIDERS,
    ProviderType.TTS: TTS_PROVIDERS,
    ProviderType.WEB_SEARCH: WEB_SEARCH_PROVIDERS,
    ProviderType.VOICE_CONVERSION: VOICE_CONVERSION_PROVIDERS,
}


# 正式运行链路能力边界。配置页可以保存更多实验性 Provider，
# 但只有下列项目会被当前 Agent/RAG/语音运行时真正消费。
_RUNTIME_SUPPORT: dict[ProviderType, dict[str, str]] = {
    ProviderType.LLM: {
        "openai": "通过 ChatOpenAI 的 OpenAI-compatible Chat Completions 调用。",
        "deepseek": "通过 OpenAI-compatible Chat Completions 调用。",
        "zhipu": "通过 OpenAI-compatible Chat Completions 调用。",
        "qwen": "通过 OpenAI-compatible Chat Completions 调用。",
        "kimi": "通过 OpenAI-compatible Chat Completions 调用。",
        "moonshot": "通过 OpenAI-compatible Chat Completions 调用。",
        "minimax": "通过 OpenAI-compatible Chat Completions 调用。",
        "minimax_token": "通过 OpenAI-compatible Chat Completions 调用。",
        "xiaomi": "通过 OpenAI-compatible Chat Completions 调用。",
        "xiaomi_token": "通过 OpenAI-compatible Chat Completions 调用。",
        "openrouter": "通过 OpenAI-compatible Chat Completions 调用。",
        "ollama": "通过本地 OpenAI-compatible Chat Completions 调用。",
    },
    ProviderType.EMBEDDING: {
        "openai_embedding": "通过 OpenAIEmbeddings 调用 OpenAI-compatible Embeddings。",
        "nvidia_embedding": "按 OpenAI-compatible Embeddings 接口调用。",
        "dashscope_embedding": "按 OpenAI-compatible Embeddings 接口调用。",
        "local_embedding": "使用项目内置 managed_local Embedding Worker。",
    },
    ProviderType.RERANKER: {
        "local_rerank": "使用项目内置本地 Reranker Worker。",
        "bailian_rerank": "通过阿里云百炼 Rerank API 正式调用。",
    },
    ProviderType.STT: {
        "local_stt": "使用项目内置本地 STT Worker。",
        "whisper_api": "通过 OpenAI Audio Transcriptions 接口正式调用。",
        "xinference_stt": "通过 Xinference 的 OpenAI-compatible 音频转写接口正式调用。",
        "mimo_stt": "通过 MiMo 的 OpenAI-compatible Audio Transcriptions 接口正式调用。",
    },
    ProviderType.TTS: {
        "gsv_tts_local": "使用项目内置 GPT-SoVITS 服务。",
        "openai_tts": "通过 OpenAI-compatible /audio/speech 接口生成 WAV。",
        "mimo_tts": "通过 MiMo /chat/completions 音频接口生成 WAV。",
    },
    ProviderType.VOICE_CONVERSION: {
        "rvc": "独立音频生产工具：将已有音频转换为目标音色并生成文件，不参与角色对话。",
        "separator": "通过 YUMENO 人声分离任务管理器调用。",
    },
    ProviderType.WEB_SEARCH: {
        "tavily": "由 RAG 联网搜索适配器直接调用。",
        "bocha": "由 RAG 联网搜索适配器直接调用。",
        "custom_search": "按项目约定的 Bocha-compatible POST 接口调用。",
    },
}


def runtime_support(provider_type: ProviderType, provider_id: str) -> tuple[bool, str]:
    note = _RUNTIME_SUPPORT.get(provider_type, {}).get(provider_id)
    if note:
        return True, note
    return False, "可以保存和测试配置，但当前正式运行链路尚未接入，不会被 Agent/RAG/语音运行时自动使用。"


def get_provider_metadata(provider_type: ProviderType, provider_id: str) -> ProviderMetadata | None:
    """获取提供商元数据"""
    providers = ALL_PROVIDERS.get(provider_type, {})
    return providers.get(provider_id)


def list_providers_by_type(provider_type: ProviderType) -> dict[str, ProviderMetadata]:
    """按类型列出提供商"""
    return ALL_PROVIDERS.get(provider_type, {})


def get_all_provider_count() -> int:
    """获取所有提供商总数"""
    return sum(len(providers) for providers in ALL_PROVIDERS.values())
