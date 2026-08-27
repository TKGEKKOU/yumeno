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
    STT = "stt"  # 语音转文字（原 ASR）
    TTS = "tts"
    WEB_SEARCH = "web_search"


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
    "gemini": ProviderMetadata(
        id="gemini",
        name="Google Gemini",
        type=ProviderType.LLM,
        description="Google Gemini 模型",
        default_base_url="https://generativelanguage.googleapis.com/v1beta",
        default_model="gemini-2.0-flash-exp",
        supports_streaming=True,
        icon="sparkles"
    ),
    "anthropic": ProviderMetadata(
        id="anthropic",
        name="Anthropic",
        type=ProviderType.LLM,
        description="Claude 系列模型",
        default_base_url="https://api.anthropic.com",
        default_model="claude-3-7-sonnet-20250219",
        supports_streaming=True,
        icon="message-square"
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
        id="openai_embedding",
        name="OpenAI Embedding",
        type=ProviderType.EMBEDDING,
        description="OpenAI 官方向量模型",
        default_base_url="https://api.openai.com/v1",
        default_model="text-embedding-3-large",
        icon="align-justify"
    ),
    "gemini_embedding": ProviderMetadata(
        id="gemini_embedding",
        name="Gemini Embedding",
        type=ProviderType.EMBEDDING,
        description="Google Gemini 向量模型",
        default_base_url="https://generativelanguage.googleapis.com/v1beta",
        default_model="text-embedding-004",
        icon="sparkles"
    ),
    "nvidia_embedding": ProviderMetadata(
        id="nvidia_embedding",
        name="NVIDIA Embedding",
        type=ProviderType.EMBEDDING,
        description="NVIDIA NeMo Embedding",
        default_base_url="https://integrate.api.nvidia.com/v1",
        default_model="nvidia/nv-embed-v1",
        icon="cpu"
    ),
    "ollama_embedding": ProviderMetadata(
        id="ollama_embedding",
        name="Ollama Embedding",
        type=ProviderType.EMBEDDING,
        description="Ollama 本地向量模型",
        default_base_url="http://127.0.0.1:11434",
        default_model="nomic-embed-text",
        requires_api_key=False,
        icon="hard-drive"
    ),
    "dashscope_embedding": ProviderMetadata(
        id="dashscope_embedding",
        name="DashScope Embedding",
        type=ProviderType.EMBEDDING,
        description="阿里云百炼向量模型",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="text-embedding-v3",
        icon="cloud"
    ),
    "jina_embedding": ProviderMetadata(
        id="jina_embedding",
        name="Jina Embedding（本地）",
        type=ProviderType.EMBEDDING,
        description="本地管理的 Jina 向量模型",
        default_base_url="",
        default_model="Qwen/Qwen3-Embedding-0.6B",
        requires_api_key=False,
        icon="database"
    ),
}

# ==================== Reranker 提供商 ====================
RERANKER_PROVIDERS = {
    "vllm_rerank": ProviderMetadata(
        id="vllm_rerank",
        name="vLLM Rerank",
        type=ProviderType.RERANKER,
        description="vLLM 重排序服务",
        default_base_url="http://127.0.0.1:8000/v1",
        default_model="BAAI/bge-reranker-v2-m3",
        icon="list-ordered"
    ),
    "jina_rerank": ProviderMetadata(
        id="jina_rerank",
        name="Jina AI Rerank",
        type=ProviderType.RERANKER,
        description="Jina AI 重排序 API",
        default_base_url="https://api.jina.ai/v1",
        default_model="jina-reranker-v2-base-multilingual",
        icon="shuffle"
    ),
    "cohere_rerank": ProviderMetadata(
        id="cohere_rerank",
        name="Cohere Rerank",
        type=ProviderType.RERANKER,
        description="Cohere 重排序 API",
        default_base_url="https://api.cohere.ai/v1",
        default_model="rerank-multilingual-v3.0",
        icon="layers"
    ),
    "ppio_rerank": ProviderMetadata(
        id="ppio_rerank",
        name="PPIO Rerank",
        type=ProviderType.RERANKER,
        description="PPIO 重排序服务",
        default_base_url="https://api.ppio.cloud/v1",
        default_model="ppio-rerank",
        icon="network"
    ),
    "xinference_rerank": ProviderMetadata(
        id="xinference_rerank",
        name="Xinference Rerank",
        type=ProviderType.RERANKER,
        description="Xinference 重排序",
        default_base_url="http://127.0.0.1:9997/v1",
        default_model="bge-reranker-v2-m3",
        requires_api_key=False,
        icon="server"
    ),
    "bailian_rerank": ProviderMetadata(
        id="bailian_rerank",
        name="百炼 Rerank",
        type=ProviderType.RERANKER,
        description="阿里云百炼重排序",
        default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        default_model="gte-rerank",
        icon="cloud"
    ),
    "nvidia_rerank": ProviderMetadata(
        id="nvidia_rerank",
        name="NVIDIA Rerank",
        type=ProviderType.RERANKER,
        description="NVIDIA NeMo Rerank",
        default_base_url="https://integrate.api.nvidia.com/v1",
        default_model="nvidia/nv-rerankqa-mistral-4b-v3",
        icon="cpu"
    ),
    "tei_rerank": ProviderMetadata(
        id="tei_rerank",
        name="TEI Rerank",
        type=ProviderType.RERANKER,
        description="HuggingFace Text Embeddings Inference",
        default_base_url="http://127.0.0.1:8080",
        default_model="BAAI/bge-reranker-v2-m3",
        requires_api_key=False,
        icon="container"
    ),
    "local_rerank": ProviderMetadata(
        id="local_rerank",
        name="本地模型",
        type=ProviderType.RERANKER,
        description="自动管理的本地重排序模型",
        default_base_url="",
        default_model="Qwen/Qwen3-Reranker-0.6B",
        requires_api_key=False,
        icon="database"
    ),
}

# ==================== STT 提供商 ====================
STT_PROVIDERS = {
    "whisper_api": ProviderMetadata(
        id="whisper_api",
        name="Whisper(API)",
        type=ProviderType.STT,
        description="OpenAI Whisper API",
        default_base_url="https://api.openai.com/v1",
        default_model="whisper-1",
        icon="mic"
    ),
    "mimo_stt": ProviderMetadata(
        id="mimo_stt",
        name="MiMo STT(API)",
        type=ProviderType.STT,
        description="MiMo 语音识别 API",
        default_base_url="https://api.mimo.run/v1",
        default_model="mimo-whisper-v1",
        icon="audio-lines"
    ),
    "xinference_stt": ProviderMetadata(
        id="xinference_stt",
        name="Xinference STT",
        type=ProviderType.STT,
        description="Xinference 语音识别",
        default_base_url="http://127.0.0.1:9997/v1",
        default_model="whisper-large-v3",
        requires_api_key=False,
        icon="server"
    ),
    "whisper_local": ProviderMetadata(
        id="whisper_local",
        name="Whisper(Local)",
        type=ProviderType.STT,
        description="本地 Whisper 模型",
        default_base_url="http://127.0.0.1:8002",
        default_model="whisper-large-v3",
        requires_api_key=False,
        icon="hard-drive"
    ),
    "sensevoice_local": ProviderMetadata(
        id="sensevoice_local",
        name="SenseVoice(Local)",
        type=ProviderType.STT,
        description="本地 SenseVoice 识别",
        default_base_url="http://127.0.0.1:8002",
        default_model="sensevoice-small",
        requires_api_key=False,
        icon="database"
    ),
}

# ==================== TTS 提供商 ====================
TTS_PROVIDERS = {
    "openai_tts": ProviderMetadata(
        id="openai_tts",
        name="OpenAI TTS(API)",
        type=ProviderType.TTS,
        description="OpenAI 官方 TTS",
        default_base_url="https://api.openai.com/v1",
        default_model="tts-1",
        icon="volume-2"
    ),
    "mimo_tts": ProviderMetadata(
        id="mimo_tts",
        name="MiMo TTS(API)",
        type=ProviderType.TTS,
        description="MiMo 语音合成 API",
        default_base_url="https://api.mimo.run/v1",
        default_model="mimo-tts-v1",
        icon="speaker"
    ),
    "genie_tts": ProviderMetadata(
        id="genie_tts",
        name="Genie TTS",
        type=ProviderType.TTS,
        description="Genie 语音合成",
        default_base_url="https://api.genie.chat/v1",
        default_model="genie-tts-v1",
        icon="wand-sparkles"
    ),
    "edge_tts": ProviderMetadata(
        id="edge_tts",
        name="Edge TTS",
        type=ProviderType.TTS,
        description="微软 Edge 浏览器 TTS（免费）",
        default_base_url="",
        default_model="zh-CN-XiaoxiaoNeural",
        requires_api_key=False,
        icon="globe"
    ),
    "fishaudio_tts": ProviderMetadata(
        id="fishaudio_tts",
        name="FishAudio TTS(API)",
        type=ProviderType.TTS,
        description="FishAudio 语音合成",
        default_base_url="https://api.fish.audio/v1",
        default_model="fishaudio-tts-v1",
        icon="fish"
    ),
    "bailian_tts": ProviderMetadata(
        id="bailian_tts",
        name="阿里云百炼 TTS(API)",
        type=ProviderType.TTS,
        description="阿里云百炼语音合成",
        default_base_url="https://dashscope.aliyuncs.com/api/v1/services/audio/tts",
        default_model="sambert-zhichu-v1",
        icon="cloud"
    ),
    "azure_tts": ProviderMetadata(
        id="azure_tts",
        name="Azure TTS",
        type=ProviderType.TTS,
        description="微软 Azure 语音服务",
        default_base_url="https://{region}.tts.speech.microsoft.com",
        default_model="zh-CN-XiaoxiaoNeural",
        icon="cloud-upload"
    ),
    "minimax_tts": ProviderMetadata(
        id="minimax_tts",
        name="MiniMax TTS(API)",
        type=ProviderType.TTS,
        description="MiniMax 语音合成",
        default_base_url="https://api.minimax.chat/v1",
        default_model="speech-01",
        icon="maximize"
    ),
    "volcengine_tts": ProviderMetadata(
        id="volcengine_tts",
        name="火山引擎 TTS(API)",
        type=ProviderType.TTS,
        description="字节跳动火山引擎 TTS",
        default_base_url="https://openspeech.bytedance.com/api/v1",
        default_model="zh_female_shuangkuaisisi_moon_bigtts",
        icon="flame"
    ),
    "gemini_tts": ProviderMetadata(
        id="gemini_tts",
        name="Gemini TTS",
        type=ProviderType.TTS,
        description="Google Gemini 语音合成",
        default_base_url="https://generativelanguage.googleapis.com/v1beta",
        default_model="gemini-tts-v1",
        icon="sparkles"
    ),
    "elevenlabs_tts": ProviderMetadata(
        id="elevenlabs_tts",
        name="ElevenLabs TTS(API)",
        type=ProviderType.TTS,
        description="高质量英文 TTS",
        default_base_url="https://api.elevenlabs.io/v1",
        default_model="eleven_multilingual_v2",
        icon="headphones"
    ),
    "gsv_tts_local": ProviderMetadata(
        id="gsv_tts_local",
        name="GSV TTS(Local)",
        type=ProviderType.TTS,
        description="本地 GPT-SoVITS",
        default_base_url="http://127.0.0.1:9880",
        default_model="local",
        requires_api_key=False,
        icon="hard-drive"
    ),
    "gsvi_tts_api": ProviderMetadata(
        id="gsvi_tts_api",
        name="GSVI TTS(API)",
        type=ProviderType.TTS,
        description="GPT-SoVITS API 服务",
        default_base_url="",
        default_model="gsvi-tts-v1",
        icon="server"
    ),
}

# ==================== WebSearch 提供商 ====================
WEB_SEARCH_PROVIDERS = {
    "tavily": ProviderMetadata(
        id="tavily",
        name="Tavily Search",
        type=ProviderType.WEB_SEARCH,
        description="AI 优化的搜索 API",
        default_base_url="https://api.tavily.com",
        default_model="tavily-search",
        icon="search"
    ),
    "serper": ProviderMetadata(
        id="serper",
        name="Serper",
        type=ProviderType.WEB_SEARCH,
        description="Google 搜索 API",
        default_base_url="https://google.serper.dev",
        default_model="serper",
        icon="globe"
    ),
    "custom_search": ProviderMetadata(
        id="custom_search",
        name="自定义搜索 API",
        type=ProviderType.WEB_SEARCH,
        description="自定义搜索接口",
        default_base_url="",
        default_model="",
        icon="settings"
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
}


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
