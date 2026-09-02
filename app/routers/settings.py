import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import APIRouter, Header, HTTPException, Request, Response

from app.schemas import (
    ApiKeyRevealRequest,
    ApiKeyRevealResponse,
    LLMConnectionTestPayload,
    LLMConnectionTestResponse,
    LocalSettingsResponse,
    LocalSettingsUpdate,
)
from rag.llm import probe_llm
from settings import (
    DEFAULT_LOCAL_EMBEDDING_MODEL,
    SUPPORTED_EMBEDDING_DEVICES,
    SUPPORTED_EMBEDDING_PROVIDERS,
    SUPPORTED_EMBEDDING_SOURCES,
    SUPPORTED_WEB_SEARCH_PROVIDERS,
    Settings,
    configured_api_key,
    setting_bool,
    text_setting,
)


router = APIRouter(prefix="/api/settings", tags=["settings"])
SETTINGS_PATH = Settings.load().project_root / "data" / "local_settings.json"
LOCAL_CLIENT_HOSTS = {"127.0.0.1", "::1", "localhost", "testclient"}
LOCAL_REQUEST_HOSTS = {"127.0.0.1", "::1", "localhost"}


def effective_port(scheme: str, port: int | None) -> int | None:
    if port is not None:
        return port
    return {"http": 80, "https": 443}.get(scheme.lower())


def require_local(request: Request) -> None:
    client_host = request.client.host if request.client else ""
    if client_host not in LOCAL_CLIENT_HOSTS:
        raise HTTPException(status_code=403, detail="Local settings are available on localhost only")
    try:
        request_host = urlsplit(f"//{request.headers.get('host', '')}")
        request_hostname = (request_host.hostname or "").lower()
        request_port = effective_port(request.url.scheme, request_host.port)
    except ValueError as exc:
        raise HTTPException(status_code=403, detail="Local settings are available on localhost only") from exc
    if request_hostname not in LOCAL_REQUEST_HOSTS:
        raise HTTPException(status_code=403, detail="Local settings are available on localhost only")

    origin = request.headers.get("origin")
    if not origin:
        return
    try:
        parsed_origin = urlsplit(origin)
        origin_hostname = (parsed_origin.hostname or "").lower()
        origin_port = effective_port(parsed_origin.scheme, parsed_origin.port)
    except ValueError as exc:
        raise HTTPException(status_code=403, detail="Local settings are available on localhost only") from exc
    if (
        parsed_origin.scheme.lower() != request.url.scheme.lower()
        or origin_hostname not in LOCAL_REQUEST_HOSTS
        or origin_port != request_port
    ):
        raise HTTPException(status_code=403, detail="Local settings are available on localhost only")


def read_settings(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail="Local settings file is invalid") from exc
    return value if isinstance(value, dict) else {}


def settings_response(path: Path, restart_required: bool = False) -> LocalSettingsResponse:
    values = read_settings(path)
    legacy_enabled = setting_bool(values.get("enable_web_fallback"), False)
    web_search_provider = text_setting(values.get("web_search_provider")) or ("tavily" if legacy_enabled else "off")
    if web_search_provider not in SUPPORTED_WEB_SEARCH_PROVIDERS:
        web_search_provider = "off"
    web_search_api_key = configured_api_key(values.get("web_search_api_key") or values.get("tavily_api_key"))
    embedding_base_url = text_setting(values.get("embedding_base_url"))
    embedding_provider = text_setting(values.get("embedding_provider"))
    if embedding_provider not in SUPPORTED_EMBEDDING_PROVIDERS:
        embedding_provider = "qwen" if "dashscope.aliyuncs.com" in embedding_base_url else "custom" if embedding_base_url else "managed_local"
    embedding_source = text_setting(values.get("embedding_model_source"), "modelscope")
    embedding_device = text_setting(values.get("embedding_device"), "auto")
    return LocalSettingsResponse(
        openai_api_key=configured_api_key(values.get("openai_api_key")),
        openai_api_key_configured=bool(configured_api_key(values.get("openai_api_key"))),
        openai_base_url=text_setting(values.get("openai_base_url")),
        openai_model=text_setting(values.get("openai_model")),
        embedding_api_key=configured_api_key(values.get("embedding_api_key")),
        embedding_api_key_configured=bool(configured_api_key(values.get("embedding_api_key"))),
        embedding_provider=embedding_provider,
        embedding_model_source=embedding_source if embedding_source in SUPPORTED_EMBEDDING_SOURCES else "modelscope",
        embedding_device=embedding_device if embedding_device in SUPPORTED_EMBEDDING_DEVICES else "auto",
        embedding_base_url=embedding_base_url,
        embedding_model=text_setting(values.get("embedding_model")) or (DEFAULT_LOCAL_EMBEDDING_MODEL if embedding_provider == "managed_local" else ""),
        embedding_dimensions=int(values.get("embedding_dimensions") or (1024 if embedding_provider == "managed_local" else 512)),
        embedding_send_dimensions=setting_bool(values.get("embedding_send_dimensions"), True),
        chunk_size=int(values.get("chunk_size") or 1000),
        chunk_overlap=int(values.get("chunk_overlap") or 150),
        web_search_provider=web_search_provider,
        web_search_api_key=web_search_api_key,
        web_search_api_key_configured=bool(web_search_api_key),
        web_search_base_url=text_setting(values.get("web_search_base_url")),
        enable_web_fallback=web_search_provider != "off",
        restart_required=restart_required,
    )


def update_local_settings(path: Path, updates: dict) -> None:
    values = read_settings(path)
    values.update(updates)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=path.parent, prefix=".settings.", suffix=".tmp", delete=False
    ) as temporary:
        json.dump(values, temporary, ensure_ascii=False, indent=2)
        temporary.write("\n")
        temporary_path = Path(temporary.name)
    os.replace(temporary_path, path)


def delete_local_settings(path: Path) -> None:
    if path.is_file():
        path.unlink()


def invalidate_runtime_clients() -> None:
    """让配置页保存后的下一次请求使用新配置。

    LangChain 客户端、Milvus 检索器可能跨请求缓存；Settings.load() 本身是
    新快照，但只清配置文件仍会留下旧对象。清缓存不会中断正在执行的请求。
    """
    from ingestion.embeddings import clear_embedding_cache
    from rag.llm import clear_llm_cache
    from rag.retriever import clear_retriever_cache

    clear_llm_cache()
    clear_embedding_cache()
    clear_retriever_cache()


@router.get("", response_model=LocalSettingsResponse)
def get_settings(request: Request, response: Response) -> LocalSettingsResponse:
    require_local(request)
    response.headers["Cache-Control"] = "no-store"
    return settings_response(SETTINGS_PATH)


@router.post("/llm/test", response_model=LLMConnectionTestResponse)
def test_llm_connection(
    payload: LLMConnectionTestPayload,
    request: Request,
    x_yumeno_request: str = Header(default=""),
) -> LLMConnectionTestResponse:
    require_local(request)
    if x_yumeno_request != "web":
        raise HTTPException(status_code=403, detail="缺少同源请求标识")
    values = read_settings(SETTINGS_PATH)
    api_key = configured_api_key(payload.api_key) or configured_api_key(values.get("openai_api_key"))
    if not api_key:
        raise HTTPException(status_code=422, detail="请先填写 API Key，或保存一个已有 Key")
    if not payload.base_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=422, detail="Base URL 必须是 HTTP(S) 地址")
    try:
        probe_llm(api_key, payload.base_url, payload.model)
    except Exception as exc:
        status_code = getattr(exc, "status_code", None)
        if status_code in {401, 403}:
            detail = "API Key 无效或没有访问该模型的权限"
        elif status_code == 404:
            detail = "接口地址或模型不存在，请检查 Base URL 和模型名"
        elif status_code == 429:
            detail = "服务返回限流，请稍后重试"
        else:
            detail = f"连接失败：{str(exc)[:300]}"
        raise HTTPException(status_code=502, detail=detail) from exc
    return LLMConnectionTestResponse(
        ok=True,
        model=payload.model,
        base_url=payload.base_url,
        message="连接成功，模型已返回文本。",
    )


@router.post("/reveal-key", response_model=ApiKeyRevealResponse)
def reveal_api_key(
    payload: ApiKeyRevealRequest,
    request: Request,
    response: Response,
    x_yumeno_request: str = Header(default=""),
) -> ApiKeyRevealResponse:
    require_local(request)
    if x_yumeno_request != "web":
        raise HTTPException(status_code=403, detail="Missing same-origin request header")
    response.headers["Cache-Control"] = "no-store"
    values = read_settings(SETTINGS_PATH)
    value = configured_api_key(values.get(payload.field))
    if not value and payload.field == "web_search_api_key":
        value = configured_api_key(values.get("tavily_api_key"))
    return ApiKeyRevealResponse(value=value)


@router.patch("", response_model=LocalSettingsResponse)
def save_settings(payload: LocalSettingsUpdate, request: Request, response: Response) -> LocalSettingsResponse:
    require_local(request)
    response.headers["Cache-Control"] = "no-store"
    submitted = payload.model_dump(exclude_none=True)
    provider = submitted.get("web_search_provider")
    if provider is not None and provider not in SUPPORTED_WEB_SEARCH_PROVIDERS:
        raise HTTPException(status_code=422, detail="Unsupported web search provider")
    if "web_search_api_key" not in submitted and submitted.get("tavily_api_key"):
        submitted["web_search_api_key"] = submitted["tavily_api_key"]
    if provider is None and submitted.get("tavily_api_key") and submitted.get("enable_web_fallback"):
        submitted["web_search_provider"] = "tavily"
        provider = "tavily"
    if provider is None and submitted.get("enable_web_fallback") is False:
        submitted["web_search_provider"] = "off"
        provider = "off"
    if submitted.get("embedding_provider") not in (None, *SUPPORTED_EMBEDDING_PROVIDERS):
        raise HTTPException(status_code=422, detail="Unsupported embedding provider")
    if submitted.get("embedding_model_source") not in (None, *SUPPORTED_EMBEDDING_SOURCES):
        raise HTTPException(status_code=422, detail="Unsupported embedding model source")
    if submitted.get("embedding_device") not in (None, *SUPPORTED_EMBEDDING_DEVICES):
        raise HTTPException(status_code=422, detail="Unsupported embedding device")
    current = read_settings(SETTINGS_PATH)
    chunk_size = int(submitted.get("chunk_size") or current.get("chunk_size") or 1000)
    chunk_overlap = int(
        submitted.get("chunk_overlap")
        if submitted.get("chunk_overlap") is not None
        else current.get("chunk_overlap", 150)
    )
    if chunk_overlap > chunk_size // 4:
        raise HTTPException(status_code=422, detail="切分重叠不能超过切分长度的 25%")
    updates = {}
    for field, value in submitted.items():
        if isinstance(value, bool) or isinstance(value, int):
            updates[field] = value
        elif isinstance(value, str) and value.strip():
            updates[field] = value.strip()
    updates.pop("tavily_api_key", None)
    if provider is not None:
        updates["enable_web_fallback"] = provider != "off"
    if updates:
        update_local_settings(SETTINGS_PATH, updates)
        invalidate_runtime_clients()
    return settings_response(SETTINGS_PATH, restart_required=False)


@router.delete("", response_model=LocalSettingsResponse)
def reset_settings(request: Request) -> LocalSettingsResponse:
    require_local(request)
    delete_local_settings(SETTINGS_PATH)
    invalidate_runtime_clients()
    return settings_response(SETTINGS_PATH, restart_required=False)
