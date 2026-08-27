"""
提供商配置管理 API
支持列出、配置、测试多个提供商
"""

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
    # 当前配置值（明文）
    current_api_key: str = ""
    current_base_url: str = ""
    current_model: str = ""


class ProviderListResponse(BaseModel):
    """提供商列表响应"""
    providers: list[ProviderInfo]


class ProviderConfigUpdate(BaseModel):
    """提供商配置更新"""
    provider_type: str = Field(..., description="提供商类型: llm, embedding, tts, asr, reranker, web_search")
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
    
    settings = read_settings(SETTINGS_PATH)
    providers_info = []
    
    # 获取当前配置的提供商
    current_llm = settings.get("llm_provider", "openai")
    current_embedding = settings.get("embedding_provider", "managed_local")
    current_tts = settings.get("tts_provider", "gpt_sovits")
    current_asr = settings.get("asr_provider", "qwen")
    current_reranker = settings.get("reranker_provider", "managed_local")
    current_web_search = settings.get("web_search_provider", "tavily")
    
    current_map = {
        "llm": current_llm,
        "embedding": current_embedding,
        "tts": current_tts,
        "asr": current_asr,
        "reranker": current_reranker,
        "web_search": current_web_search
    }
    
    # 遍历所有提供商类型
    for provider_type, providers in ALL_PROVIDERS.items():
        for provider_id, metadata in providers.items():
            type_str = provider_type.value
            is_active = (current_map.get(type_str) == provider_id)
            
            # 读取当前配置值
            current_api_key = ""
            current_base_url = ""
            current_model = ""
            is_configured = False
            
            if type_str == "llm" and is_active:
                current_api_key = settings.get("openai_api_key", "")
                current_base_url = settings.get("openai_base_url", "")
                current_model = settings.get("openai_model", "")
                is_configured = bool(current_api_key)
            elif type_str == "embedding" and is_active:
                current_api_key = settings.get("embedding_api_key", "")
                current_base_url = settings.get("embedding_base_url", "")
                current_model = settings.get("embedding_model", "")
                is_configured = bool(current_api_key)
            elif type_str == "tts" and is_active:
                current_api_key = settings.get("tts_api_key", "")
                current_base_url = settings.get("tts_base_url", "")
                current_model = settings.get("tts_model", "")
                is_configured = bool(current_api_key) if metadata.requires_api_key else True
            elif type_str == "asr" and is_active:
                current_api_key = settings.get("asr_api_key", "")
                current_base_url = settings.get("asr_base_url", "")
                current_model = settings.get("asr_model", "")
                is_configured = bool(current_api_key) if metadata.requires_api_key else True
            elif type_str == "reranker" and is_active:
                current_api_key = settings.get("reranker_api_key", "")
                current_base_url = settings.get("reranker_base_url", "")
                current_model = settings.get("reranker_model", "")
                is_configured = True if provider_id == "managed_local" else bool(current_api_key)
            elif type_str == "web_search" and is_active:
                current_api_key = settings.get("web_search_api_key", "")
                current_base_url = settings.get("web_search_base_url", "")
                is_configured = bool(current_api_key)
            
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


@router.get("/{provider_type}", response_model=ProviderListResponse)
def list_providers(provider_type: str, request: Request) -> ProviderListResponse:
    """列出指定类型的提供商"""
    require_local(request)
    
    try:
        ptype = ProviderType(provider_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"不支持的提供商类型: {provider_type}")
    
    settings = read_settings(SETTINGS_PATH)
    providers_info = []
    
    type_str = ptype.value
    current_provider = settings.get(f"{type_str}_provider", "")
    
    for provider_id, metadata in list_providers_by_type(ptype).items():
        is_active = (current_provider == provider_id)
        
        # 读取当前配置值
        current_api_key = ""
        current_base_url = ""
        current_model = ""
        is_configured = False
        
        if is_active:
            if type_str == "llm":
                current_api_key = settings.get("openai_api_key", "")
                current_base_url = settings.get("openai_base_url", "")
                current_model = settings.get("openai_model", "")
                is_configured = bool(current_api_key)
            elif type_str == "embedding":
                current_api_key = settings.get("embedding_api_key", "")
                current_base_url = settings.get("embedding_base_url", "")
                current_model = settings.get("embedding_model", "")
                is_configured = bool(current_api_key)
            elif type_str == "tts":
                current_api_key = settings.get("tts_api_key", "")
                current_base_url = settings.get("tts_base_url", "")
                current_model = settings.get("tts_model", "")
                is_configured = bool(current_api_key) if metadata.requires_api_key else True
            elif type_str == "asr":
                current_api_key = settings.get("asr_api_key", "")
                current_base_url = settings.get("asr_base_url", "")
                current_model = settings.get("asr_model", "")
                is_configured = bool(current_api_key) if metadata.requires_api_key else True
            elif type_str == "reranker":
                current_api_key = settings.get("reranker_api_key", "")
                current_base_url = settings.get("reranker_base_url", "")
                current_model = settings.get("reranker_model", "")
                is_configured = True if provider_id == "managed_local" else bool(current_api_key)
            elif type_str == "web_search":
                current_api_key = settings.get("web_search_api_key", "")
                current_base_url = settings.get("web_search_base_url", "")
                is_configured = bool(current_api_key)
        
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
    
    # 构建更新字典
    updates = {}
    type_str = payload.provider_type
    
    # 设置当前提供商（如果 enabled 为 False，则清空）
    if payload.enabled:
        updates[f"{type_str}_provider"] = payload.provider_id
    else:
        updates[f"{type_str}_provider"] = None
    
    # 根据提供商类型设置对应字段
    if type_str == "llm":
        if payload.api_key:
            updates["openai_api_key"] = payload.api_key
        if payload.base_url:
            updates["openai_base_url"] = payload.base_url
        if payload.model:
            updates["openai_model"] = payload.model
    elif type_str == "embedding":
        if payload.api_key:
            updates["embedding_api_key"] = payload.api_key
        if payload.base_url:
            updates["embedding_base_url"] = payload.base_url
        if payload.model:
            updates["embedding_model"] = payload.model
    elif type_str == "tts":
        if payload.api_key:
            updates["tts_api_key"] = payload.api_key
        if payload.base_url:
            updates["tts_base_url"] = payload.base_url
        if payload.model:
            updates["tts_model"] = payload.model
    elif type_str == "asr":
        if payload.api_key:
            updates["asr_api_key"] = payload.api_key
        if payload.base_url:
            updates["asr_base_url"] = payload.base_url
        if payload.model:
            updates["asr_model"] = payload.model
    elif type_str == "reranker":
        if payload.api_key:
            updates["reranker_api_key"] = payload.api_key
        if payload.base_url:
            updates["reranker_base_url"] = payload.base_url
        if payload.model:
            updates["reranker_model"] = payload.model
    elif type_str == "web_search":
        if payload.api_key:
            updates["web_search_api_key"] = payload.api_key
        if payload.base_url:
            updates["web_search_base_url"] = payload.base_url
    
    # 保存配置
    update_local_settings(SETTINGS_PATH, updates)
    
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
    # 执行真实测试
    import time
    start_time = time.time()
    
    # 获取测试参数
    api_key = payload.api_key or ""
    base_url = payload.base_url or metadata.default_base_url
    model = payload.model or metadata.default_model
    
    result = {"success": False, "message": "未知错误"}
    
    try:
        if provider_type == ProviderType.LLM:
            result = await test_llm_provider(api_key, base_url, model)
        elif provider_type == ProviderType.EMBEDDING:
            result = await test_embedding_provider(api_key, base_url, model)
        elif provider_type == ProviderType.TTS:
            result = await test_tts_provider(payload.provider_id, api_key, base_url, model)
        elif provider_type == ProviderType.ASR:
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
