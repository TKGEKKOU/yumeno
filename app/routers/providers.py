"""
提供商配置管理 API
支持列出、配置、测试多个提供商
配置存储：每个提供商单独保存配置到 data/providers/{provider_id}.json
"""

from pathlib import Path
import json
import threading
import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from app.models import ProviderDownloadTask
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from providers import (
    ProviderType,
    get_provider_metadata,
    list_providers_by_type,
    ALL_PROVIDERS,
    runtime_support,
)
from providers.testers import (
    test_llm_provider,
    test_embedding_provider,
    test_tts_provider,
    test_stt_provider,
    test_reranker_provider,
    test_web_search_provider,
)

from app.routers.settings import require_local, read_settings, update_local_settings, SETTINGS_PATH
from settings import Settings, configured_api_key, text_setting


router = APIRouter(prefix="/api/providers", tags=["providers"])

# 提供商配置目录
PROVIDER_CONFIG_DIR = Settings.load().project_root / "data" / "providers"
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
            value = json.load(f)
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _save_provider_config(provider_id: str, config: dict):
    """保存提供商配置"""
    config_path = _get_provider_config_path(provider_id)
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def _legacy_provider_config(provider_type: ProviderType, provider_id: str, values: dict[str, Any]) -> dict[str, Any]:
    """从旧版 local_settings 生成当前 Provider 的兼容配置。

    Provider JSON 是新配置入口；这里仅在当前 Provider 正在运行或旧配置明确
    指向它时提供迁移回退，避免已有安装升级后页面误显示为“未配置”。
    """
    active = values.get("asr_provider" if provider_type == ProviderType.STT else f"{provider_type.value}_provider")
    aliases = {
        (ProviderType.EMBEDDING, "local_embedding"): {"managed_local"},
        (ProviderType.EMBEDDING, "dashscope_embedding"): {"qwen"},
        (ProviderType.WEB_SEARCH, "custom_search"): {"custom"},
    }
    if active != provider_id and active not in aliases.get((provider_type, provider_id), set()):
        return {}

    if provider_type == ProviderType.LLM:
        return {
            "api_key": values.get("openai_api_key"),
            "base_url": values.get("openai_base_url"),
            "model": values.get("openai_model"),
        }
    if provider_type == ProviderType.EMBEDDING:
        return {
            "api_key": values.get("embedding_api_key"),
            "base_url": values.get("embedding_base_url"),
            "model": values.get("embedding_model"),
            "source": values.get("embedding_model_source"),
            "device": values.get("embedding_device"),
        }
    if provider_type == ProviderType.WEB_SEARCH:
        return {
            "api_key": values.get("web_search_api_key") or values.get("tavily_api_key"),
            "base_url": values.get("web_search_base_url"),
        }
    if provider_type == ProviderType.STT and provider_id == "local_stt":
        return {"model": values.get("asr_model")}
    if provider_type == ProviderType.TTS and provider_id == "gsv_tts_local":
        return {}
    if provider_type == ProviderType.RERANKER:
        return {
            "api_key": values.get("reranker_api_key"),
            "base_url": values.get("reranker_base_url"),
            "model": values.get("reranker_model"),
            "source": values.get("reranker_model_source"),
            "device": values.get("reranker_device"),
        }
    return {}


def _effective_provider_config(provider_type: ProviderType, provider_id: str) -> dict[str, Any]:
    """读取 Provider 配置，并兼容升级前保存于 local_settings 的配置。"""
    config = _legacy_provider_config(provider_type, provider_id, read_settings(SETTINGS_PATH))
    stored = _load_provider_config(provider_id)
    # 独立 Provider 配置优先；无效的模板 Key 不应遮蔽旧配置中的真实 Key。
    for key, value in stored.items():
        if key == "api_key":
            if configured_api_key(value):
                config[key] = value
        elif text_setting(value):
            config[key] = value
        elif key not in config:
            config[key] = value
    return config


_RUNTIME_PROVIDER_ALIASES: dict[str, dict[str, str]] = {
    # Provider 页面使用更清晰的注册 ID；运行时保留旧版 Settings ID。
    "embedding": {
        "local_embedding": "managed_local",
        "managed_local": "managed_local",
        "dashscope_embedding": "custom",
        "openai_embedding": "custom",
        "nvidia_embedding": "custom",
    },
    "web_search": {
        "custom_search": "custom",
        "custom": "custom",
    },
}
_ACTIVE_PROVIDER_ID_KEYS = {"embedding": "embedding_active_provider", "web_search": "web_search_active_provider"}


def _runtime_provider_id(provider_type: str, provider_id: str | None) -> str | None:
    if provider_id is None:
        return None
    return _RUNTIME_PROVIDER_ALIASES.get(provider_type, {}).get(provider_id, provider_id)


def _get_active_provider(provider_type: str) -> str | None:
    """获取 Provider 页面使用的激活 ID，并兼容旧版运行时 ID。"""
    settings = read_settings(SETTINGS_PATH)
    explicit_key = _ACTIVE_PROVIDER_ID_KEYS.get(provider_type)
    if explicit_key:
        explicit = settings.get(explicit_key)
        if isinstance(explicit, str) and explicit.strip():
            return explicit.strip()
    key = "asr_provider" if provider_type == "stt" else f"{provider_type}_provider"
    runtime_id = settings.get(key)
    if not isinstance(runtime_id, str):
        return runtime_id
    # 旧配置没有页面专用 ID 时，只能用无歧义的别名回退；新配置会写入显式 ID，
    # 避免多个 OpenAI-compatible Embedding Provider 同时被显示为 active。
    if provider_type == "embedding":
        if runtime_id == "managed_local":
            return "local_embedding"
        if runtime_id == "qwen":
            return "dashscope_embedding"
    if provider_type == "web_search" and runtime_id == "custom":
        return "custom_search"
    return runtime_id


def _set_active_provider(provider_type: str, provider_id: str | None):
    """同时写入运行时 ID 与 Provider 页面激活 ID，保持两套命名一致。"""
    runtime_key = "asr_provider" if provider_type == "stt" else f"{provider_type}_provider"
    updates: dict[str, Any] = {runtime_key: _runtime_provider_id(provider_type, provider_id)}
    explicit_key = _ACTIVE_PROVIDER_ID_KEYS.get(provider_type)
    if explicit_key:
        updates[explicit_key] = provider_id
    update_local_settings(SETTINGS_PATH, updates)


def _resource_status(request: Request, provider_id: str, resource_kind: str | None) -> dict[str, Any] | None:
    """返回本地 Provider 的真实资源状态，而不是用「无需 Key」推断已配置。"""
    if resource_kind == "embedding":
        return request.app.state.embedding_resources.status()
    if resource_kind == "reranker":
        return request.app.state.reranker_resources.status()
    if resource_kind == "stt":
        return request.app.state.asr_resources.status()
    if resource_kind == "rvc":
        return request.app.state.rvc_resources.status()
    if resource_kind == "separator":
        return request.app.state.separator_resources.status()
    if resource_kind == "tts" and provider_id == "gsv_tts_local":
        return {
            **request.app.state.gpt_sovits.status(),
            "install": request.app.state.gpt_sovits_install.status(),
        }
    return None



_RESOURCE_ALIASES = {"rvc": "rvc", "rvc_local": "rvc", "separator": "separator", "local_separator": "separator"}
_RESOURCE_TASKS: dict[str, threading.Thread] = {}
_RESOURCE_CANCEL_EVENTS: dict[str, threading.Event] = {}
_RESOURCE_LOCK = threading.Lock()


class ProviderInstallPayload(BaseModel):
    """本地资源安装参数；保留扩展字段以兼容前端版本。"""

    parameters: dict[str, Any] = Field(default_factory=dict)


def _canonical_resource_id(provider_id: str) -> str:
    canonical = _RESOURCE_ALIASES.get(provider_id)
    if canonical is None:
        raise HTTPException(status_code=404, detail=f"不支持的本地资源 Provider: {provider_id}")
    return canonical


def _resource_manager(request: Request, provider_id: str):
    canonical = _canonical_resource_id(provider_id)
    manager = getattr(request.app.state, f"{canonical}_resources", None)
    if manager is None:
        raise HTTPException(status_code=503, detail=f"资源管理器未初始化: {canonical}")
    return canonical, manager


def _task_session(request: Request):
    factory = getattr(request.app.state, "session_factory", None)
    if factory is None:
        raise HTTPException(status_code=503, detail="数据库会话未初始化")
    # 兼容测试/嵌入式启动时跳过完整迁移的应用实例；正式启动仍由数据库升级流程负责。
    try:
        bind = factory.kw.get("bind") if hasattr(factory, "kw") else None
        if bind is not None:
            ProviderDownloadTask.__table__.create(bind=bind, checkfirst=True)
    except Exception:
        pass
    return factory()


def _resource_snapshot(manager) -> dict[str, Any]:
    try:
        value = manager.status()
    except Exception as exc:
        return {"ready": False, "installing": False, "phase": "error", "error": str(exc)}
    return value if isinstance(value, dict) else {"ready": False, "phase": "unknown", "detail": str(value)}


def _task_progress(snapshot: dict[str, Any]) -> int:
    try:
        return max(0, min(100, int(snapshot.get("progress_percent", snapshot.get("progress", 0)) or 0)))
    except (TypeError, ValueError):
        return 0


def _task_dict(task: ProviderDownloadTask, resource_status: dict[str, Any] | None = None) -> dict[str, Any]:
    """返回统一下载任务字段，同时保留旧字段供旧版前端兼容。"""
    status = resource_status or {}
    progress = status.get("progress_percent", status.get("progress", task.progress))
    downloaded = status.get("downloaded_bytes", 0) or 0
    elapsed = status.get("elapsed_seconds", 0) or 0
    speed = status.get("speed_bytes_per_second", status.get("download_speed_bytes", 0)) or (downloaded / elapsed if elapsed else 0)
    total = status.get("total_bytes", 0) or 0
    eta = status.get("eta_seconds") if status.get("eta_seconds") is not None else (max(0, (total - downloaded) / speed) if speed and total else None)
    current_file = status.get("current_file", status.get("detail", task.detail)) or ""
    error = status.get("error", task.error) or ""
    parameters = task.parameters_json or {}
    return {
        "task_id": task.id, "provider_id": task.provider_id, "resource_kind": task.resource_kind,
        "resource_name": parameters.get("resource_name", task.provider_id),
        "operation": task.operation, "status": task.status, "phase": task.phase,
        "progress_percent": progress, "downloaded_bytes": downloaded, "total_bytes": total,
        "speed_bytes_per_second": speed, "eta_seconds": eta, "current_file": current_file,
        "error_message": error, "retry_count": parameters.get("retry_count", 0),
        # Legacy aliases.
        "progress": progress, "detail": task.detail, "error": error,
        "parameters": parameters,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "started_at": task.started_at.isoformat() if task.started_at else None,
        "finished_at": task.finished_at.isoformat() if task.finished_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        "resource_status": resource_status,
    }


def _update_task(request: Request, task_id: str, **changes) -> None:
    with _task_session(request) as session:
        task = session.get(ProviderDownloadTask, task_id)
        if task is None:
            return
        for key, value in changes.items():
            setattr(task, key, value)
        task.updated_at = datetime.now(timezone.utc)
        session.commit()


def _run_resource_install(request: Request, task_id: str, manager, parameters: dict[str, Any]) -> None:
    try:
        _update_task(request, task_id, status="running", phase="preparing", started_at=datetime.now(timezone.utc))
        result = manager.start_install(**parameters)
        if result is False:
            raise RuntimeError("资源管理器拒绝启动安装，可能已有安装任务正在运行")
        event = _RESOURCE_CANCEL_EVENTS.get(task_id)
        while True:
            snapshot = _resource_snapshot(manager)
            installing = bool(snapshot.get("installing"))
            cancelled = bool(event and event.is_set())
            error = str(snapshot.get("error") or "")
            phase = str(snapshot.get("phase") or "running")
            detail = str(snapshot.get("detail") or snapshot.get("message") or "")
            if cancelled and not installing:
                _update_task(request, task_id, status="cancelled", phase="cancelled", progress=_task_progress(snapshot), detail="安装已取消", error="", finished_at=datetime.now(timezone.utc))
                return
            if not installing:
                if error or phase in {"failed", "error"}:
                    _update_task(request, task_id, status="failed", phase=phase, progress=_task_progress(snapshot), detail=detail, error=error or detail, finished_at=datetime.now(timezone.utc))
                elif snapshot.get("ready") or snapshot.get("installed"):
                    _update_task(request, task_id, status="succeeded", phase=phase or "done", progress=100, detail=detail, error="", finished_at=datetime.now(timezone.utc))
                else:
                    _update_task(request, task_id, status="failed", phase=phase, progress=_task_progress(snapshot), detail=detail, error=error or "资源安装未完成", finished_at=datetime.now(timezone.utc))
                return
            _update_task(request, task_id, status="cancelling" if cancelled else "running", phase=phase, progress=_task_progress(snapshot), detail=detail, error=error)
            time.sleep(0.25)
    except Exception as exc:
        _update_task(request, task_id, status="failed", phase="failed", detail="资源安装失败", error=str(exc), finished_at=datetime.now(timezone.utc))
    finally:
        with _RESOURCE_LOCK:
            _RESOURCE_TASKS.pop(task_id, None)
            _RESOURCE_CANCEL_EVENTS.pop(task_id, None)


def _create_resource_task(request: Request, provider_id: str, parameters: dict[str, Any]) -> dict[str, Any]:
    canonical, manager = _resource_manager(request, provider_id)
    if _resource_snapshot(manager).get("installing"):
        raise HTTPException(status_code=409, detail="该资源已有安装任务正在运行")
    with _task_session(request) as session:
        task = ProviderDownloadTask(provider_id=canonical, resource_kind=canonical, operation="install", status="queued", phase="queued", parameters_json=parameters)
        session.add(task)
        session.commit()
        session.refresh(task)
        task_id = task.id
    cancel_event = threading.Event()
    thread = threading.Thread(target=_run_resource_install, args=(request, task_id, manager, parameters), daemon=True, name=f"provider-install-{canonical}")
    with _RESOURCE_LOCK:
        _RESOURCE_CANCEL_EVENTS[task_id] = cancel_event
        _RESOURCE_TASKS[task_id] = thread
    thread.start()
    with _task_session(request) as session:
        fresh = session.get(ProviderDownloadTask, task_id)
        return _task_dict(fresh, _resource_snapshot(manager))


@router.get("/resources")
def list_resource_status(request: Request):
    require_local(request)
    items = []
    for provider_id in ("rvc", "separator"):
        canonical, manager = _resource_manager(request, provider_id)
        items.append({"provider_id": provider_id, "resource_kind": canonical, "status": _resource_snapshot(manager)})
    return {"items": items}


@router.get("/resources/tasks")
def list_resource_tasks(request: Request, provider_id: str | None = None, limit: int = 50):
    require_local(request)
    limit = max(1, min(limit, 200))
    with _task_session(request) as session:
        query = select(ProviderDownloadTask).order_by(ProviderDownloadTask.created_at.desc()).limit(limit)
        if provider_id:
            query = query.where(ProviderDownloadTask.provider_id == _canonical_resource_id(provider_id))
        tasks = session.scalars(query).all()
    return {"items": [_task_dict(task) for task in tasks]}


@router.post("/resources/{provider_id}/install", status_code=202)
def install_resource(provider_id: str, request: Request, payload: ProviderInstallPayload | None = None):
    require_local(request)
    return _create_resource_task(request, provider_id, payload.parameters if payload else {})


@router.get("/resources/{provider_id}")
def get_resource_status(provider_id: str, request: Request):
    require_local(request)
    canonical, manager = _resource_manager(request, provider_id)
    return {"provider_id": provider_id, "resource_kind": canonical, "status": _resource_snapshot(manager)}


@router.get("/resources/{provider_id}/status")
def get_resource_status_alias(provider_id: str, request: Request):
    return get_resource_status(provider_id, request)


@router.get("/resources/tasks/{task_id}")
def get_resource_task(task_id: str, request: Request):
    require_local(request)
    with _task_session(request) as session:
        task = session.get(ProviderDownloadTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="资源任务不存在")
    manager = getattr(request.app.state, f"{task.resource_kind}_resources", None)
    return _task_dict(task, _resource_snapshot(manager) if manager else None)


@router.delete("/resources/tasks/{task_id}", status_code=202)
def cancel_resource_task(task_id: str, request: Request):
    require_local(request)
    with _task_session(request) as session:
        task = session.get(ProviderDownloadTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="资源任务不存在")
    if task.status in {"succeeded", "failed", "cancelled"}:
        return {"cancelled": False, "task": _task_dict(task)}
    manager = getattr(request.app.state, f"{task.resource_kind}_resources", None)
    event = _RESOURCE_CANCEL_EVENTS.get(task_id)
    if event:
        event.set()
    if manager is not None:
        try:
            manager.cancel_install()
        except Exception as exc:
            _update_task(request, task_id, status="failed", phase="failed", error=str(exc), detail="取消安装失败")
            raise HTTPException(status_code=500, detail=f"取消安装失败: {exc}")
    snapshot = _resource_snapshot(manager) if manager is not None else {}
    if not snapshot.get("installing"):
        _update_task(
            request,
            task_id,
            status="cancelled",
            phase="cancelled",
            progress=_task_progress(snapshot),
            detail="安装已取消",
            error="",
            finished_at=datetime.now(timezone.utc),
        )
        return {"cancelled": True, "task_id": task_id, "status": "cancelled"}
    _update_task(request, task_id, status="cancelling", phase="cancelling", detail="正在取消安装")
    return {"cancelled": True, "task_id": task_id, "status": "cancelling"}


@router.post("/resources/tasks/{task_id}/retry", status_code=202)
def retry_resource_task(task_id: str, request: Request):
    require_local(request)
    with _task_session(request) as session:
        task = session.get(ProviderDownloadTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="资源任务不存在")
    if task.status not in {"failed", "cancelled"}:
        raise HTTPException(status_code=409, detail="只有失败或已取消的任务可以重试")
    return _create_resource_task(request, task.provider_id, task.parameters_json or {})


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
    mode: str = "api"
    resource_kind: str | None = None
    resource_status: dict[str, Any] | None = None
    runtime_supported: bool = False
    runtime_note: str = ""
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
    provider_type: str = Field(..., description="提供商类型: llm, embedding, reranker, stt, tts, web_search, voice_conversion")
    provider_id: str = Field(..., description="提供商 ID")
    api_key: str | None = Field(None, max_length=4096)
    base_url: str | None = Field(None, max_length=2048)
    model: str | None = Field(None, max_length=255)
    source: str | None = Field(None, max_length=32)
    device: str | None = Field(None, max_length=16)
    voice: str | None = Field(None, max_length=128)
    source_dir: str | None = Field(None, max_length=2048)
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
def list_all_providers(request: Request, response: Response) -> ProviderListResponse:
    """列出所有提供商"""
    require_local(request)
    response.headers["Cache-Control"] = "no-store"
    
    providers_info = []
    
    # 遍历所有提供商类型
    for provider_type, providers in ALL_PROVIDERS.items():
        type_str = provider_type.value
        active_provider_id = _get_active_provider(type_str)
        
        for provider_id, metadata in providers.items():
            is_active = (active_provider_id == provider_id)
            
            # 独立 Provider 配置优先；没有独立配置时从旧 local_settings 回退。
            # 这样升级后页面看到的是实际可用配置，而不是一律“未配置”。
            config = _effective_provider_config(provider_type, provider_id)
            resource_status = _resource_status(request, provider_id, metadata.resource_kind)
            current_api_key = configured_api_key(config.get("api_key"))
            current_base_url = text_setting(config.get("base_url")) or metadata.default_base_url
            current_model = (
                text_setting(config.get("model"))
                or (text_setting(resource_status.get("model_id")) if resource_status else "")
                or metadata.default_model
            )

            # API Provider 以真实 Key 或显式保存的无 Key 配置判断；本地 Provider
            # 必须以资源状态判断，避免模板值/默认 URL/“无需 Key”造成假已配置。
            if metadata.mode == "local":
                local_ready = bool(resource_status and (
                    resource_status.get("ready") or resource_status.get("installed")
                    or resource_status.get("service_running")
                    or (resource_status.get("install") or {}).get("installed")
                ))
                if metadata.resource_kind == "rvc":
                    local_ready = bool(resource_status and resource_status.get("ready"))
                is_configured = local_ready
            elif metadata.requires_api_key:
                is_configured = bool(current_api_key)
            else:
                is_configured = bool(config)
            
            runtime_supported, runtime_note = runtime_support(provider_type, provider_id)
            providers_info.append(ProviderInfo(
                id=provider_id,
                name=metadata.name,
                type=type_str,
                description=metadata.description,
                default_base_url=metadata.default_base_url,
                default_model=metadata.default_model,
                requires_api_key=metadata.requires_api_key,
                supports_streaming=metadata.supports_streaming,
                mode=metadata.mode,
                resource_kind=metadata.resource_kind,
                resource_status=resource_status,
                runtime_supported=runtime_supported,
                runtime_note=runtime_note,
                is_configured=is_configured,
                is_active=is_active,
                current_api_key=current_api_key,
                current_base_url=current_base_url,
                current_model=current_model
            ))
    
    return ProviderListResponse(providers=providers_info)


def _sync_runtime_provider(
    provider_type: str,
    provider_id: str,
    config: dict,
    request: Request | None = None,
    enabled: bool = True,
) -> None:
    """把提供商页保存的配置同步到当前运行时真正读取的 local_settings。

    提供商目录是 UI 层配置存储；LLM、Embedding 和联网搜索的正式运行链路
    仍由 Settings.load() 读取 local_settings.json。若不在这里同步，页面会显示
    已激活但 Agent/RAG 继续使用旧配置。
    """
    api_key = configured_api_key(config.get("api_key"))
    metadata = get_provider_metadata(ProviderType(provider_type), provider_id)
    base_url = text_setting(config.get("base_url")) or (metadata.default_base_url if metadata else "")
    model = text_setting(config.get("model")) or (metadata.default_model if metadata else "")
    updates: dict = {}
    if provider_type == "llm":
        updates = {
            "llm_provider": provider_id,
            "openai_api_key": api_key,
            "openai_base_url": base_url,
            "openai_model": model,
        }
    elif provider_type == "embedding":
        if provider_id == "local_embedding":
            if request is None:
                raise RuntimeError("本地 Embedding Provider 需要应用资源管理器")
            source = text_setting(config.get("source"), "modelscope")
            device = text_setting(config.get("device"), "auto")
            request.app.state.embedding_resources.configure(model, source, device)
            updates = {
                "embedding_provider": "managed_local",
                "embedding_model": model,
                "embedding_model_source": source,
                "embedding_device": device,
            }
        else:
            updates = {
                "embedding_provider": "custom",
                "embedding_api_key": api_key,
                "embedding_base_url": base_url,
                "embedding_model": model,
                "embedding_send_dimensions": True,
            }
    elif provider_type == "reranker":
        if request is None:
            raise RuntimeError("本地 Reranker Provider 需要应用资源管理器")
        source = text_setting(config.get("source"), "modelscope")
        device = text_setting(config.get("device"), "auto")
        if provider_id == "local_rerank":
            if request is None:
                raise RuntimeError("本地 Reranker Provider 需要应用资源管理器")
            request.app.state.reranker_resources.configure(model, source, device)
        updates = {
            "reranker_provider": provider_id,
            "reranker_api_key": api_key,
            "reranker_base_url": base_url,
            "reranker_model": model,
            "reranker_model_source": source,
            "reranker_device": device,
        }
    elif provider_type == "stt":
        if provider_id == "local_stt":
            if request is None:
                raise RuntimeError("本地 STT Provider 需要应用资源管理器")
            request.app.state.asr_resources.configure(enabled=enabled)
        updates = {
            "stt_provider": provider_id,
            "stt_api_key": api_key,
            "stt_base_url": base_url,
            "stt_model": model,
            # 旧配置双写，给历史扩展和旧客户端留兼容窗口。
            "asr_provider": provider_id,
            "asr_api_key": api_key,
            "asr_base_url": base_url,
            "asr_model": model,
        }
    elif provider_type == "voice_conversion":
        if provider_id == "rvc" and request is not None:
            source_dir = text_setting(config.get("source_dir"))
            if source_dir:
                request.app.state.rvc_resources.configure_source(source_dir)
            updates = {"voice_conversion_provider": "rvc", "rvc_source_dir": str(request.app.state.rvc_resources.source_root)}
    elif provider_type == "tts":
        updates = {
            "tts_provider": provider_id,
            "tts_api_key": api_key,
            "tts_base_url": base_url,
            "tts_model": model,
            "tts_voice": text_setting(config.get("voice"), "alloy"),
        }
    elif provider_type == "web_search":
        runtime_provider = {"tavily": "tavily", "custom_search": "custom", "bocha": "bocha"}.get(provider_id)
        if runtime_provider is not None:
            updates = {
                "web_search_provider": runtime_provider,
                "web_search_api_key": api_key,
                "web_search_base_url": base_url,
                "enable_web_fallback": True,
            }
    if updates:
        update_local_settings(SETTINGS_PATH, updates)


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
    runtime_supported, runtime_note = runtime_support(provider_type, payload.provider_id)
    
    # 空字段保留旧配置，避免停用/切换状态时误清密钥或覆盖端点。
    existing_config = _load_provider_config(payload.provider_id)
    config = dict(existing_config)
    if payload.api_key is not None:
        if payload.api_key:
            config["api_key"] = payload.api_key
        else:
            config.pop("api_key", None)
    if payload.base_url is not None:
        config["base_url"] = payload.base_url
    if payload.model is not None:
        config["model"] = payload.model
    if payload.source is not None:
        config["source"] = payload.source
    if payload.device is not None:
        config["device"] = payload.device
    if payload.voice is not None:
        config["voice"] = payload.voice
    
    _save_provider_config(payload.provider_id, config)
    
    # 只有正式运行链路已接入且配置完整的 Provider 才能成为 active；
    # 未接入项、模板 Key 或空 Key 仍允许保存/测试，但绝不伪装成正在运行。
    has_required_config = (
        not metadata.requires_api_key
        or bool(configured_api_key(config.get("api_key")))
    )
    resource_status = _resource_status(request, payload.provider_id, metadata.resource_kind)
    resource_ready = True
    if metadata.mode == "local":
        resource_ready = bool(resource_status and (
            resource_status.get("ready")
            or resource_status.get("installed")
            or resource_status.get("service_running")
            or (resource_status.get("install") or {}).get("installed")
        ))
        if metadata.resource_kind == "rvc":
            resource_ready = bool(resource_status and resource_status.get("ready"))
    # 本地资源必须先安装/就绪才能成为运行时 Provider；否则页面会显示 active，
    # 但首个请求才暴露“模型不存在”的延迟故障。
    can_activate = payload.enabled and runtime_supported and has_required_config and resource_ready
    current_active = _get_active_provider(payload.provider_type)
    if payload.provider_type == "embedding" and not payload.enabled and current_active == payload.provider_id:
        # RAG 的标准流程必须有 Embedding；停用会让入库和检索出现隐性运行时故障，
        # 因此要求用户先切换到另一个已接入的 Embedding Provider。
        raise HTTPException(status_code=409, detail="Embedding 是 RAG 必需组件，请先切换到另一个可用 Provider")
    if can_activate:
        _set_active_provider(payload.provider_type, payload.provider_id)
        _sync_runtime_provider(
            payload.provider_type,
            payload.provider_id,
            config,
            request=request,
            enabled=True,
        )
    elif payload.enabled and runtime_supported and metadata.mode == "local":
        # 先保存本地资源的选择，让安装/下载流程和 Settings 使用同一份目标配置；
        # 但在资源未就绪前不标记为 active。
        _sync_runtime_provider(
            payload.provider_type,
            payload.provider_id,
            config,
            request=request,
            enabled=True,
        )
    elif not payload.enabled and current_active == payload.provider_id:
        # 停用必须同步清理运行时入口，不能出现页面显示未激活、运行时仍
        # 偷偷继续使用旧 Key/模型的隐性状态。
        _set_active_provider(payload.provider_type, None)
        if payload.provider_type == "llm":
            update_local_settings(SETTINGS_PATH, {
                "openai_api_key": "",
                "openai_base_url": "",
                "openai_model": "",
            })
        elif payload.provider_type == "web_search":
            update_local_settings(SETTINGS_PATH, {
                "web_search_provider": "off",
                "web_search_api_key": "",
                "web_search_base_url": "",
                "enable_web_fallback": False,
            })
        elif payload.provider_type == "stt" and payload.provider_id == "local_stt":
            request.app.state.asr_resources.configure(enabled=False)

    # 失效所有会持有旧客户端/旧模型的缓存；正在执行的请求不强制中断，
    # 后续请求会按新的 Settings 快照构建资源。
    if payload.provider_type == "llm":
        from rag.llm import clear_llm_cache
        clear_llm_cache()
    elif payload.provider_type == "embedding":
        from ingestion.embeddings import clear_embedding_cache
        clear_embedding_cache()
        from rag.retriever import clear_retriever_cache
        clear_retriever_cache()
    elif payload.provider_type == "web_search":
        # 联网搜索按请求读取 Settings，无客户端缓存；这里只保留统一分支。
        pass
    elif payload.provider_type == "stt" and payload.provider_id == "local_stt" and not payload.enabled:
        request.app.state.asr_resources.configure(enabled=False)

    return {
        "ok": True,
        "runtime_supported": runtime_supported,
        "message": (
            f"提供商 {metadata.name} 配置已保存并已应用"
            if can_activate
            else (
                f"提供商 {metadata.name} 配置已保存，但缺少有效 API Key，暂未启用"
                if payload.enabled and metadata.requires_api_key and not has_required_config
                else f"提供商 {metadata.name} 配置已保存，但本地资源尚未就绪，请先安装资源"
                if payload.enabled and metadata.mode == "local" and not resource_ready
                else f"提供商 {metadata.name} 配置已保存，但当前运行链路未接入，不会被自动使用"
            )
        ),
        "runtime_note": runtime_note,
    }


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
    
    # 获取测试参数；表单未带 Key 时使用该提供商已保存的明文 Key。
    saved = _effective_provider_config(provider_type, payload.provider_id)
    api_key = configured_api_key(payload.api_key) or configured_api_key(saved.get("api_key"))
    base_url = text_setting(payload.base_url) or text_setting(saved.get("base_url")) or metadata.default_base_url
    model = text_setting(payload.model) or text_setting(saved.get("model")) or metadata.default_model
    
    result = {"success": False, "message": "未知错误"}

    if metadata.mode == "local":
        status = _resource_status(request, payload.provider_id, metadata.resource_kind) or {}
        ready = bool(status.get("ready") or status.get("installed") or status.get("service_running") or (status.get("install") or {}).get("installed"))
        if metadata.resource_kind == "rvc":
            ready = bool(status.get("ready"))
        return ProviderTestResponse(
            ok=ready,
            message="本地资源已就绪" if ready else "本地资源尚未安装或未就绪",
            latency_ms=0,
        )
    
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
            result = await test_stt_provider(payload.provider_id, api_key, base_url, model)
        elif provider_type == ProviderType.RERANKER:
            result = await test_reranker_provider(payload.provider_id, api_key, base_url, model)
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
