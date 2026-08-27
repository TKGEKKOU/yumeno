from enum import Enum
from typing import Literal

# LLM 提供商
class LLMProvider(str, Enum):
    OPENAI = "openai"
    DEEPSEEK = "deepseek"
    ZHIPU = "zhipu"
    QWEN = "qwen"
    CUSTOM = "custom"

# Embedding 提供商
class EmbeddingProvider(str, Enum):
    QWEN = "qwen"
    MANAGED_LOCAL = "managed_local"
    CUSTOM = "custom"

# TTS 提供商  
class TTSProvider(str, Enum):
    GPT_SOVITS = "gpt_sovits"
    CUSTOM = "custom"

# ASR 提供商
class ASRProvider(str, Enum):
    QWEN = "qwen"
    CUSTOM = "custom"

# 预设提供商配置
LLM_PRESETS = {
    "openai": {
        "name": "OpenAI",
        "base_url": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini"
    },
    "deepseek": {
        "name": "DeepSeek",
        "base_url": "https://api.deepseek.com",
        "default_model": "deepseek-chat"
    },
    "zhipu": {
        "name": "智谱 AI",
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "default_model": "glm-4-flash"
    },
    "qwen": {
        "name": "通义千问",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "default_model": "qwen-plus"
    }
}

EMBEDDING_PRESETS = {
    "qwen": {
        "name": "通义千问 Embedding",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "default_model": "text-embedding-v3"
    }
}

TTS_PRESETS = {
    "gpt_sovits": {
        "name": "GPT-SoVITS（本地）",
        "base_url": "http://127.0.0.1:9880",
        "default_model": "local"
    }
}

ASR_PRESETS = {
    "qwen": {
        "name": "通义千问 ASR",
        "base_url": "https://dashscope.aliyuncs.com/api/v1/services/audio/asr",
        "default_model": "paraformer-v2"
    }
}
