from dataclasses import dataclass
import json
import re
from pathlib import Path
import sys

from dotenv import dotenv_values

SUPPORTED_WEB_SEARCH_PROVIDERS = frozenset({"off", "tavily", "bocha", "custom"})
SUPPORTED_EMBEDDING_PROVIDERS = frozenset({"qwen", "managed_local", "custom"})
SUPPORTED_EMBEDDING_SOURCES = frozenset({"modelscope", "huggingface"})
SUPPORTED_EMBEDDING_DEVICES = frozenset({"auto", "cuda", "cpu"})
DEFAULT_LOCAL_EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-0.6B"
DEFAULT_LOCAL_RERANKER_MODEL = "Qwen/Qwen3-Reranker-0.6B"


_API_KEY_PLACEHOLDERS = frozenset({
    "",
    "...",
    "…",
    "***",
    "your-api-key",
    "your_api_key",
    "your-api-key-here",
    "your_api_key_here",
    "api-key",
    "api_key",
    "apikey",
    "changeme",
    "change-me",
    "replace-me",
    "replace_with_your_api_key",
    "sk-...",
    "<api-key>",
    "<your-api-key>",
})


def text_setting(value: object, default: str = "") -> str:
    """只接受字符串设置，避免 JSON 预设对象被误转成运行时参数。"""
    return value.strip() if isinstance(value, str) else default


def is_real_api_key(value: object) -> bool:
    """判断设置中是否存在真实填写的 API Key，而不是模板占位值。

    这里不以长度判断有效性：不同服务的 Key 长度不同；该函数只负责
    区分“已填写”与“空值/模板值”，连通性仍需通过实际服务测试确认。
    """
    if not isinstance(value, str):
        return False
    candidate = value.strip()
    lowered = candidate.casefold()
    if lowered in _API_KEY_PLACEHOLDERS:
        return False
    normalized = re.sub(r"[\s_.-]+", "", lowered)
    if normalized in {"apikey", "yourapikey", "yourkey", "replacewithyourapikey"}:
        return False
    if lowered.startswith(("your-", "your_", "<", "${")):
        return False
    if lowered.endswith(("...", "…")):
        return False
    return bool(candidate)


def configured_api_key(value: object) -> str:
    """返回可用于运行时的明文 Key；模板和非字符串值统一视为空。"""
    return text_setting(value) if is_real_api_key(value) else ""


def setting_bool(value: object, default: bool = False) -> bool:
    """解析 JSON/.env 中的布尔值，避免 bool("false") 被误判为 True。"""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().casefold()
        if normalized in {"1", "true", "yes", "on"}:
            return True
        if normalized in {"0", "false", "no", "off", ""}:
            return False
    return default


def normalize_milvus_uri(raw_uri: str, project_root: Path) -> str:
    """Return a pymilvus-compatible URI for remote servers and milvus-lite."""
    uri = str(raw_uri or "").strip()
    if uri.lower().startswith(("http://", "https://", "tcp://", "unix://")):
        return uri
    candidate = Path(uri)
    if not candidate.suffix:
        candidate = candidate / "milvus_local.db"
    if not candidate.is_absolute():
        candidate = project_root / candidate
    try:
        candidate.resolve().relative_to(project_root.resolve())
    except ValueError as exc:
        raise ValueError("MILVUS_DB_URI 本地文件必须位于项目目录内") from exc
    return "./" + candidate.relative_to(project_root).as_posix()


@dataclass(frozen=True)
class Settings:
    project_root: Path
    app_host: str
    app_port: int
    workspace_id: str
    sqlite_path: Path
    milvus_uri: str
    milvus_user: str
    milvus_password: str
    collection_name: str
    embedding_provider: str
    embedding_model_source: str
    embedding_device: str
    embedding_dimensions: int
    embedding_send_dimensions: bool
    chunk_size: int
    chunk_overlap: int
    rag_pipeline: str
    confidence_threshold: float
    max_rewrite_count: int
    max_generation_retry: int
    max_upload_mb: int
    enable_web_fallback: bool
    mcp_allow_arbitrary_stdio: bool
    web_search_provider: str
    web_search_api_key: str
    web_search_base_url: str
    openai_api_key: str
    openai_base_url: str
    openai_model: str
    stt_provider: str
    stt_api_key: str
    stt_base_url: str
    stt_model: str
    tts_provider: str
    tts_api_key: str
    tts_base_url: str
    tts_model: str
    tts_voice: str
    embedding_api_key: str
    embedding_base_url: str
    embedding_model: str
    reranker_provider: str
    reranker_api_key: str
    reranker_base_url: str
    reranker_model: str
    reranker_model_source: str
    reranker_device: str
    chunker_version: str

    @classmethod
    def load(cls, root: Path | None = None) -> "Settings":
        """合并基础设施配置与 UI 配置，并返回不可变的运行时快照。
        `.env` 只负责 SQLite、Milvus、监听地址和 RAG 控制参数；模型、Embedding
        与联网搜索凭据来自 `data/local_settings.json`，避免页面保存后仍被旧环境
        变量覆盖。
        """

        default_root = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent
        project_root = root or default_root
        values = dotenv_values(project_root / ".env")
        get = lambda name, default: str(values.get(name) or default)
        local_path = project_root / "data" / "local_settings.json"
        # 本地设置文件损坏时回退为空配置，让设置页仍可启动并修正配置。
        try:
            local_values = json.loads(local_path.read_text(encoding="utf-8")) if local_path.is_file() else {}
        except (OSError, json.JSONDecodeError):
            local_values = {}
        local_get = lambda name, default: text_setting(local_values.get(name), default) or default
        local_bool = lambda name, default: setting_bool(local_values.get(name), default)
        # 兼容旧版 Tavily 开关；保存新格式后统一以 provider 是否为 off 判断。
        legacy_web_enabled = local_bool("enable_web_fallback", False)
        web_search_provider = local_get("web_search_provider", "") or ("tavily" if legacy_web_enabled else "off")
        if web_search_provider not in SUPPORTED_WEB_SEARCH_PROVIDERS:
            web_search_provider = "off"
        web_search_api_key = configured_api_key(
            local_values.get("web_search_api_key", local_values.get("tavily_api_key", ""))
        )
        web_search_base_url = local_get("web_search_base_url", "")
        embedding_base_url = local_get("embedding_base_url", "")
        embedding_provider = local_get("embedding_provider", "")
        if embedding_provider not in SUPPORTED_EMBEDDING_PROVIDERS:
            embedding_provider = "qwen" if "dashscope.aliyuncs.com" in embedding_base_url else "custom" if embedding_base_url else "managed_local"
        embedding_model_source = local_get("embedding_model_source", "modelscope")
        if embedding_model_source not in SUPPORTED_EMBEDDING_SOURCES:
            embedding_model_source = "modelscope"
        embedding_device = local_get("embedding_device", "auto")
        if embedding_device not in SUPPORTED_EMBEDDING_DEVICES:
            embedding_device = "auto"
        default_embedding_model = DEFAULT_LOCAL_EMBEDDING_MODEL if embedding_provider == "managed_local" else ""
        default_dimensions = 1024 if embedding_provider == "managed_local" else 512
        return cls(
            project_root=project_root,
            app_host=get("APP_HOST", "127.0.0.1"),
            app_port=int(get("APP_PORT", "17000")),
            workspace_id="local-default",
            sqlite_path=project_root / str(get("DB_PATH", "data/yumeno.db")),
            milvus_uri=normalize_milvus_uri(
                get("MILVUS_DB_URI", "./data/milvus_local.db"), project_root
            ),
            milvus_user=get("MILVUS_USER", ""),
            milvus_password=get("MILVUS_PASSWORD", ""),
            collection_name=get("COLLECTION_NAME", "yumeno_knowledge_v1"),
            embedding_provider=embedding_provider,
            embedding_model_source=embedding_model_source,
            embedding_device=embedding_device,
            embedding_dimensions=int(local_values.get("embedding_dimensions", default_dimensions)),
            embedding_send_dimensions=local_bool("embedding_send_dimensions", True),
            chunk_size=int(local_values.get("chunk_size", 1000)),
            chunk_overlap=int(local_values.get("chunk_overlap", 150)),
            rag_pipeline=get("RAG_PIPELINE", "default").lower(),
            confidence_threshold=float(get("DEFAULT_CONFIDENCE_THRESHOLD", "0.75")),
            max_rewrite_count=int(get("MAX_REWRITE_COUNT", "1")),
            max_generation_retry=int(get("MAX_GENERATION_RETRY", "1")),
            max_upload_mb=int(get("MAX_UPLOAD_MB", "50")),
            enable_web_fallback=web_search_provider != "off",
            mcp_allow_arbitrary_stdio=str(values.get("MCP_ALLOW_ARBITRARY_STDIO") or "false").lower() in {"1", "true", "yes", "on"},
            web_search_provider=web_search_provider,
            web_search_api_key=web_search_api_key,
            web_search_base_url=web_search_base_url,
            openai_api_key=configured_api_key(local_values.get("openai_api_key", "")),
            openai_base_url=local_get("openai_base_url", ""),
            openai_model=local_get("openai_model", ""),
            stt_provider=local_get("stt_provider", local_get("asr_provider", "local_stt")),
            stt_api_key=configured_api_key(local_values.get("stt_api_key", local_values.get("asr_api_key", ""))),
            stt_base_url=local_get("stt_base_url", local_get("asr_base_url", "")),
            stt_model=local_get("stt_model", local_get("asr_model", "whisper-1")),
            tts_provider=local_get("tts_provider", "gsv_tts_local"),
            tts_api_key=configured_api_key(local_values.get("tts_api_key", "")),
            tts_base_url=local_get("tts_base_url", ""),
            tts_model=local_get("tts_model", "tts-1"),
            tts_voice=local_get("tts_voice", "alloy"),
            embedding_api_key=configured_api_key(local_values.get("embedding_api_key", "")),
            embedding_base_url=embedding_base_url,
            embedding_model=local_get("embedding_model", default_embedding_model),
            reranker_provider=local_get("reranker_provider", "local_rerank"),
            reranker_api_key=configured_api_key(local_values.get("reranker_api_key", "")),
            reranker_base_url=local_get("reranker_base_url", ""),
            reranker_model=local_get("reranker_model", DEFAULT_LOCAL_RERANKER_MODEL),
            reranker_model_source=local_get("reranker_model_source", "modelscope"),
            reranker_device=local_get("reranker_device", embedding_device),
            chunker_version=local_get("chunker_version", "semantic-v1"),
        )
