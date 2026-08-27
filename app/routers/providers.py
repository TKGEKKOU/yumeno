"""
提供商配置管理 API
支持列出、配置、测试多个提供商
配置存储：每个提供商单独保存配置到 data/providers/{provider_id}.json
"""

from pathlib import Path
import json
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from providers import (
    ProviderType,
    get_provider_metadata,
    list_providers_by_type,
    ALL_PROVIDERS
)
from providers.testers import (
    test_llm_provider,
    test_embedding_provider,
    test_tts_provider,
    test_asr_provider,
    test_reranker_provider,
    test_web_search_provider,
)

from app.routers.settings import require_local, read_settings, update_local_settings, SETTINGS_PATH


router = APIRouter(prefix="/api/providers", tags=["providers"])

# 提供商配置目录
PROVIDER_CONFIG_DIR = Path("data/providers")
PROVIDER_CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def _get_provider_config_path(provider_id: str) -> Path:
    """获取提供商配置文件路径"""
    return PROVIDER_CONFIG_DIR / f"{provider_id}.json"


def _load_provider_config(provider_id: str) -> dict:
    """加载提供商配置"""
    config_path = _get_provider_config_path(provider_id)
    if not config_path.exists():
        return {}
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_provider_config(provider_id: str, config: dict):
    """保存提供商配置"""
    config_path = _get_provider_config_path(provider_id)
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def _get_active_provider(provider_type: str) -> str | None:
    """获取当前激活的提供商"""
    settings = read_settings(SETTINGS_PATH)
    return settings.get(f"{provider_type}_provider")


def _set_active_provider(provider_type: str, provider_id: str | None):
    """设置当前激活的提供商"""
    update_local_settings(SETTINGS_PATH, {f"{provider_type}_provider": provider_id})


class ProviderInfo(BaseModel):
    """提供商信息"""
    id: str
    name: str
    type: str
    description: str
    default_base_url: str
    default_model: str
    requires_api_key: bool
    supports_streaming: bool
    is_configured: bool = False
    is_active: bool = False
    current_api_key: str = ""
    current_base_url: str = ""
    current_model: str = ""


class ProviderListResponse(BaseModel):
    """提供商列表响应"""
    providers: list[ProviderInfo]


class ProviderConfigUpdate(BaseModel):
    """提供商配置更新"""
    provider_type: str = Field(..., description="提供商类型: llm, embedding, tts, stt, reranker, web_search")
    provider_id: str = Field(..., description="提供商 ID")
    api_key: str | None = Field(None, max_length=4096)
    base_url: str | None = Field(None, max_length=2048)
    model: str | None = Field(None, max_length=255)
    enabled: bool = True


class ProviderTestPayload(BaseModel):
    """提供商测试配置"""
    provider_type: str
    provider_id: str
    api_key: str | None = None
    base_url: str | None = None
    model: str | None = None


class ProviderTestResponse(BaseModel):
    """提供商测试响应"""
    ok: bool
    message: str
    latency_ms: int | None = None


@router.get("/list", response_model=ProviderListResponse)
def list_all_providers(request: Request) -> ProviderListResponse:
    """列出所有提供商"""
    require_local(request)
    
    providers_info = []
    
    # 遍历所有提供商类型
    for provider_type, providers in ALL_PROVIDERS.items():
        type_str = provider_type.value
        active_provider_id = _get_active_provider(type_str)
        
        for provider_id, metadata in providers.items():
            is_active = (active_provider_id == provider_id)
            
            # 读取提供商独立配置
            config = _load_provider_config(provider_id)
            current_api_key = config.get("api_key", "")
            current_base_url = config.get("base_url", "") or metadata.default_base_url
            current_model = config.get("model", "") or metadata.default_model
            
            # 判断是否已配置
            is_configured = bool(current_api_key) if metadata.requires_api_key else True
            
            providers_info.append(ProviderInfo(
                id=provider_id,
                name=metadata.name,
                type=type_str,
                description=metadata.description,
                default_base_url=metadata.default_base_url,
                default_model=metadata.default_model,
                requires_api_key=metadata.requires_api_key,
                supports_streaming=metadata.supports_streaming,
                is_configured=is_configured,
                is_active=is_active,
                current_api_key=current_api_key,
                current_base_url=current_base_url,
                current_model=current_model
            ))
    
    return ProviderListResponse(providers=providers_info)


@router.post("/configure", response_model=dict)
def configure_provider(payload: ProviderConfigUpdate, request: Request) -> dict:
    """配置提供商"""
    require_local(request)
    
    # 验证提供商类型
    try:
        provider_type = ProviderType(payload.provider_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"不支持的提供商类型: {payload.provider_type}")
    
    # 验证提供商 ID
    metadata = get_provider_metadata(provider_type, payload.provider_id)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"提供商不存在: {payload.provider_id}")
    
    # 保存提供商独立配置
    config = {}
    if payload.api_key:
        config["api_key"] = payload.api_key
    if payload.base_url:
        config["base_url"] = payload.base_url
    if payload.model:
        config["model"] = payload.model
    
    _save_provider_config(payload.provider_id, config)
    
    # 设置激活状态
    if payload.enabled:
        _set_active_provider(payload.provider_type, payload.provider_id)
    else:
        # 如果当前是激活状态，则取消激活
        current_active = _get_active_provider(payload.provider_type)
        if current_active == payload.provider_id:
            _set_active_provider(payload.provider_type, None)
    
    # 清除 LLM 缓存，强制下次对话重新加载配置
    if payload.provider_type == "llm":
        try:
            from rag.llm import clear_llm_cache
            clear_llm_cache()
        except Exception:
            pass
    
    return {"ok": True, "message": f"提供商 {metadata.name} 配置已保存"}


@router.post("/test", response_model=ProviderTestResponse)
async def test_provider(payload: ProviderTestPayload, request: Request) -> ProviderTestResponse:
    """测试提供商连接"""
    require_local(request)
    
    # 验证提供商
    try:
        provider_type = ProviderType(payload.provider_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"不支持的提供商类型: {payload.provider_type}")
    
    metadata = get_provider_metadata(provider_type, payload.provider_id)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"提供商不存在: {payload.provider_id}")
    
    # 获取测试参数
    api_key = payload.api_key or ""
    base_url = payload.base_url or metadata.default_base_url
    model = payload.model or metadata.default_model
    
    result = {"success": False, "message": "未知错误"}
    
    import time
    start_time = time.time()
    
    try:
        if provider_type == ProviderType.LLM:
            result = await test_llm_provider(api_key, base_url, model)
        elif provider_type == ProviderType.EMBEDDING:
            result = await test_embedding_provider(api_key, base_url, model)
        elif provider_type == ProviderType.TTS:
            result = await test_tts_provider(payload.provider_id, api_key, base_url, model)
        elif provider_type == ProviderType.STT:
            result = await test_asr_provider(payload.provider_id, api_key, base_url, model)
        elif provider_type == ProviderType.RERANKER:
            result = await test_reranker_provider(api_key, base_url, model)
        elif provider_type == ProviderType.WEB_SEARCH:
            result = await test_web_search_provider(payload.provider_id, api_key, base_url)
    except Exception as e:
        result = {"success": False, "message": f"测试失败: {str(e)}"}
    
    latency_ms = int((time.time() - start_time) * 1000)
    
    return ProviderTestResponse(
        ok=result.get("success", False),
        message=result.get("message", "未知错误"),
        latency_ms=latency_ms
    )
