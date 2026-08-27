"""
YUMENO Provider System
仿照 AstrBot 的多提供商架构，支持 LLM、Embedding、TTS、ASR、Reranker 等多种服务提供商
"""

from enum import Enum
from typing import Any, Literal
from dataclasses import dataclass


class ProviderType(str, Enum):
    """提供商类型"""
    LLM = "llm"
    EMBEDDING = "embedding"
    TTS = "tts"
    ASR = "asr"
    RERANKER = "reranker"
    WEB_SEARCH = "web_search"


@dataclass
class ProviderMetadata:
    """提供商元数据"""
    id: str  # 提供商唯一标识
    name: str  # 显示名称
    type: ProviderType  # 提供商类型
    description: str  # 描述
    default_base_url: str  # 默认 API 地址
    default_model: str  # 默认模型
    requires_api_key: bool = True  # 是否需要 API Key
    supports_streaming: bool = False  # 是否支持流式输出
    custom_fields: dict[str, Any] = None  # 自定义配置字段


# LLM 提供商预设
LLM_PROVIDERS = {
    "openai": ProviderMetadata(
        id="openai",
        name="OpenAI",
        type=ProviderType.LLM,
        description="OpenAI 官方 API",
        default_base_url="https://api.openai.com/v1",
        default_model="gpt-4o-mini",
        supports_streaming=True
    ),
    "deepseek": ProviderMetadata(
        id="deepseek",
        name="DeepSeek",
        type=ProviderType.LLM,
        description="DeepSeek 高性价比大模型",
        default_base_url="https://api.deepseek.com",
        default_model="deepseek-chat",
        supports_streaming=True
    ),
    "zhipu": ProviderMetadata(
        id="zhipu",
        name="智谱 AI",
        type=ProviderType.LLM,
        description="智谱 GLM 系列模型",
        default_base_url="https://open.bigmodel.cn/api/paas/v4",
        default_model="glm-4-flash",
        supports_streaming=True
    ),
    "qwen": ProviderMetadata(
        id="qwen",
        name="通义千问",
        type=ProviderType.LLM,
        description="阿里云通义千问大模型",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="qwen-plus",
        supports_streaming=True
    ),
    "moonshot": ProviderMetadata(
        id="moonshot",
        name="Moonshot AI",
        type=ProviderType.LLM,
        description="Kimi 长文本模型",
        default_base_url="https://api.moonshot.cn/v1",
        default_model="moonshot-v1-8k",
        supports_streaming=True
    ),
    "anthropic": ProviderMetadata(
        id="anthropic",
        name="Anthropic Claude",
        type=ProviderType.LLM,
        description="Claude 系列模型",
        default_base_url="https://api.anthropic.com",
        default_model="claude-3-5-sonnet-20241022",
        supports_streaming=True
    ),
    "gemini": ProviderMetadata(
        id="gemini",
        name="Google Gemini",
        type=ProviderType.LLM,
        description="Google Gemini 模型",
        default_base_url="https://generativelanguage.googleapis.com/v1beta",
        default_model="gemini-1.5-flash",
        supports_streaming=True
    ),
    "ollama": ProviderMetadata(
        id="ollama",
        name="Ollama（本地）",
        type=ProviderType.LLM,
        description="本地部署的 Ollama 服务",
        default_base_url="http://127.0.0.1:11434",
        default_model="qwen2.5:7b",
        requires_api_key=False,
        supports_streaming=True
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义 OpenAI 兼容",
        type=ProviderType.LLM,
        description="任何兼容 OpenAI API 的服务",
        default_base_url="",
        default_model="",
        supports_streaming=True
    )
}

# Embedding 提供商预设
EMBEDDING_PROVIDERS = {
    "qwen": ProviderMetadata(
        id="qwen",
        name="通义千问 Embedding",
        type=ProviderType.EMBEDDING,
        description="阿里云通义千问向量模型",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="text-embedding-v3"
    ),
    "openai": ProviderMetadata(
        id="openai",
        name="OpenAI Embedding",
        type=ProviderType.EMBEDDING,
        description="OpenAI 官方向量模型",
        default_base_url="https://api.openai.com/v1",
        default_model="text-embedding-3-small"
    ),
    "jina": ProviderMetadata(
        id="jina",
        name="Jina AI",
        type=ProviderType.EMBEDDING,
        description="Jina 多语言向量模型",
        default_base_url="https://api.jina.ai/v1",
        default_model="jina-embeddings-v3"
    ),
    "managed_local": ProviderMetadata(
        id="managed_local",
        name="本地模型（自动管理）",
        type=ProviderType.EMBEDDING,
        description="自动下载和管理的本地向量模型",
        default_base_url="",
        default_model="Qwen/Qwen3-Embedding-0.6B",
        requires_api_key=False
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义 OpenAI 兼容",
        type=ProviderType.EMBEDDING,
        description="任何兼容 OpenAI Embedding API 的服务",
        default_base_url="",
        default_model=""
    )
}

# TTS 提供商预设
TTS_PROVIDERS = {
    "gpt_sovits": ProviderMetadata(
        id="gpt_sovits",
        name="GPT-SoVITS（本地）",
        type=ProviderType.TTS,
        description="本地部署的 GPT-SoVITS 语音合成",
        default_base_url="http://127.0.0.1:9880",
        default_model="local",
        requires_api_key=False
    ),
    "edge_tts": ProviderMetadata(
        id="edge_tts",
        name="Edge TTS（免费）",
        type=ProviderType.TTS,
        description="微软 Edge 浏览器 TTS",
        default_base_url="",
        default_model="zh-CN-XiaoxiaoNeural",
        requires_api_key=False
    ),
    "azure_tts": ProviderMetadata(
        id="azure_tts",
        name="Azure TTS",
        type=ProviderType.TTS,
        description="微软 Azure 语音服务",
        default_base_url="https://{region}.tts.speech.microsoft.com",
        default_model="zh-CN-XiaoxiaoNeural"
    ),
    "openai_tts": ProviderMetadata(
        id="openai_tts",
        name="OpenAI TTS",
        type=ProviderType.TTS,
        description="OpenAI 官方 TTS",
        default_base_url="https://api.openai.com/v1",
        default_model="tts-1"
    ),
    "elevenlabs": ProviderMetadata(
        id="elevenlabs",
        name="ElevenLabs",
        type=ProviderType.TTS,
        description="高质量英文 TTS",
        default_base_url="https://api.elevenlabs.io/v1",
        default_model="eleven_multilingual_v2"
    ),
    "volcengine": ProviderMetadata(
        id="volcengine",
        name="火山引擎",
        type=ProviderType.TTS,
        description="字节跳动火山引擎 TTS",
        default_base_url="https://openspeech.bytedance.com/api/v1",
        default_model="zh_female_shuangkuaisisi_moon_bigtts"
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义 API",
        type=ProviderType.TTS,
        description="自定义 TTS API 接口",
        default_base_url="",
        default_model=""
    )
}

# ASR 提供商预设
ASR_PROVIDERS = {
    "qwen": ProviderMetadata(
        id="qwen",
        name="通义千问 ASR",
        type=ProviderType.ASR,
        description="阿里云通义千问语音识别",
        default_base_url="https://dashscope.aliyuncs.com/api/v1/services/audio/asr",
        default_model="paraformer-v2"
    ),
    "openai_whisper": ProviderMetadata(
        id="openai_whisper",
        name="OpenAI Whisper",
        type=ProviderType.ASR,
        description="OpenAI 官方 Whisper API",
        default_base_url="https://api.openai.com/v1",
        default_model="whisper-1"
    ),
    "azure_stt": ProviderMetadata(
        id="azure_stt",
        name="Azure STT",
        type=ProviderType.ASR,
        description="微软 Azure 语音识别",
        default_base_url="https://{region}.stt.speech.microsoft.com",
        default_model="zh-CN"
    ),
    "sensevoice": ProviderMetadata(
        id="sensevoice",
        name="SenseVoice（本地）",
        type=ProviderType.ASR,
        description="本地部署的 SenseVoice 识别",
        default_base_url="http://127.0.0.1:8002",
        default_model="sensevoice-small",
        requires_api_key=False
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义 API",
        type=ProviderType.ASR,
        description="自定义 ASR API 接口",
        default_base_url="",
        default_model=""
    )
}

# Reranker 提供商预设
RERANKER_PROVIDERS = {
    "qwen": ProviderMetadata(
        id="qwen",
        name="通义千问 Reranker",
        type=ProviderType.RERANKER,
        description="阿里云通义千问重排序模型",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="gte-rerank"
    ),
    "cohere": ProviderMetadata(
        id="cohere",
        name="Cohere Rerank",
        type=ProviderType.RERANKER,
        description="Cohere 重排序 API",
        default_base_url="https://api.cohere.ai/v1",
        default_model="rerank-multilingual-v3.0"
    ),
    "jina": ProviderMetadata(
        id="jina",
        name="Jina Reranker",
        type=ProviderType.RERANKER,
        description="Jina AI 重排序模型",
        default_base_url="https://api.jina.ai/v1",
        default_model="jina-reranker-v2-base-multilingual"
    ),
    "managed_local": ProviderMetadata(
        id="managed_local",
        name="本地模型（自动管理）",
        type=ProviderType.RERANKER,
        description="自动下载和管理的本地重排序模型",
        default_base_url="",
        default_model="Qwen/Qwen3-Reranker-0.6B",
        requires_api_key=False
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义 API",
        type=ProviderType.RERANKER,
        description="自定义 Reranker API 接口",
        default_base_url="",
        default_model=""
    )
}

# Web Search 提供商预设
WEB_SEARCH_PROVIDERS = {
    "tavily": ProviderMetadata(
        id="tavily",
        name="Tavily Search",
        type=ProviderType.WEB_SEARCH,
        description="AI 优化的搜索 API",
        default_base_url="https://api.tavily.com",
        default_model="tavily-search"
    ),
    "serper": ProviderMetadata(
        id="serper",
        name="Serper",
        type=ProviderType.WEB_SEARCH,
        description="Google 搜索 API",
        default_base_url="https://google.serper.dev",
        default_model="serper"
    ),
    "custom": ProviderMetadata(
        id="custom",
        name="自定义搜索 API",
        type=ProviderType.WEB_SEARCH,
        description="自定义搜索接口",
        default_base_url="",
        default_model=""
    )
}

# 所有提供商汇总
ALL_PROVIDERS = {
    ProviderType.LLM: LLM_PROVIDERS,
    ProviderType.EMBEDDING: EMBEDDING_PROVIDERS,
    ProviderType.TTS: TTS_PROVIDERS,
    ProviderType.ASR: ASR_PROVIDERS,
    ProviderType.RERANKER: RERANKER_PROVIDERS,
    ProviderType.WEB_SEARCH: WEB_SEARCH_PROVIDERS
}


def get_provider_metadata(provider_type: ProviderType, provider_id: str) -> ProviderMetadata | None:
    """获取提供商元数据"""
    providers = ALL_PROVIDERS.get(provider_type, {})
    return providers.get(provider_id)


def list_providers_by_type(provider_type: ProviderType) -> dict[str, ProviderMetadata]:
    """列出指定类型的所有提供商"""
    return ALL_PROVIDERS.get(provider_type, {})
