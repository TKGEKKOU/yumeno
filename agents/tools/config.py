"""配置管理 Worker 工具集"""
from __future__ import annotations
import inspect
import logging
from typing import Any, Literal
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command

from agents.context import PersonaAgentContext

logger = logging.getLogger(__name__)

ConfigCategory = Literal["llm", "embedding", "tts", "rag", "security"]


@tool
def list_available_configs(
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    列出所有可配置项及其当前值。
    
    Returns:
        配置分类和当前值
    """
    from settings import Settings
    
    settings = Settings.load()
    
    return {
        "llm": {
            "model": settings.openai_model,
            "base_url": settings.openai_base_url,
        },
        "embedding": {
            "provider": settings.embedding_provider,
            "model": settings.embedding_model,
            "base_url": settings.embedding_base_url,
            "dimensions": settings.embedding_dimensions
        },
        "tts": {
            "provider": "gpt_sovits",
        },
        "rag": {
            "pipeline": settings.rag_pipeline,
            "max_rewrite_count": settings.max_rewrite_count,
            "max_generation_retry": settings.max_generation_retry,
            "confidence_threshold": settings.confidence_threshold
        },
        "security": {
            "max_upload_mb": settings.max_upload_mb,
            "enable_web_search": settings.enable_web_fallback
        }
    }


@tool
def get_config_detail(
    category: ConfigCategory,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    获取特定配置类别的详细说明。
    
    Args:
        category: 配置类别 (llm/embedding/tts/rag/security)
    
    Returns:
        配置项说明和约束
    """
    descriptions = {
        "llm": {
            "description": "大语言模型配置，影响对话生成质量",
            "fields": {
                "provider": "提供商：openai / dashscope / ollama / custom",
                "model": "模型名称，如 gpt-4 / qwen-plus",
                "base_url": "API 基础地址",
                "temperature": "温度参数 (0.0-2.0)，越高越随机",
                "max_tokens": "单次生成最大 token 数"
            },
            "constraints": {
                "temperature": "0.0 ≤ temperature ≤ 2.0",
                "max_tokens": "100 ≤ max_tokens ≤ 8192"
            }
        },
        "embedding": {
            "description": "Embedding 模型配置，影响知识检索准确率",
            "fields": {
                "provider": "提供商：openai / dashscope / local",
                "model": "模型名称",
                "dimensions": "向量维度，必须与 Milvus 集合匹配"
            },
            "constraints": {
                "dimensions": "常见值: 768, 1024, 1536, 3072"
            },
            "warning": "更改维度后需重建 Milvus 索引"
        },
        "rag": {
            "description": "RAG 流程配置，影响检索质量和性能",
            "fields": {
                "pipeline": "default(自适应纠错；adaptive 为兼容别名；不支持 simple)",
                "max_rewrite_count": "查询改写最大次数",
                "max_generation_retry": "生成重试最大次数",
                "confidence_threshold": "质量门阈值 (0.0-1.0)"
            },
            "constraints": {
                "max_rewrite_count": "0 ≤ count ≤ 5",
                "max_generation_retry": "0 ≤ count ≤ 5",
                "confidence_threshold": "0.5 ≤ threshold ≤ 0.95"
            }
        },
        "tts": {
            "description": "语音合成配置",
            "fields": {
                "provider": "gpt_sovits / edge_tts",
                "gpt_sovits_url": "GPT-SoVITS 服务地址"
            }
        },
        "security": {
            "description": "安全相关配置",
            "fields": {
                "max_upload_mb": "单文件上传大小上限 (MB)",
                "enable_web_search": "是否启用联网搜索"
            },
            "constraints": {
                "max_upload_mb": "1 ≤ size ≤ 500"
            }
        }
    }
    
    return descriptions.get(category, {"error": "未知配置类别"})


@tool
def request_config_change(
    category: ConfigCategory,
    field: str,
    new_value: Any,
    runtime: ToolRuntime[PersonaAgentContext]
) -> Command:
    """
    请求修改配置（触发 HITL 确认）。
    
    Args:
        category: 配置类别
        field: 字段名
        new_value: 新值
    
    Returns:
        中断命令，等待用户确认
    """
    from settings import Settings
    
    settings = Settings.load()
    
    # 获取当前值
    current_value = getattr(settings, f"{category}_{field}", None)
    if current_value is None:
        # 尝试不带前缀
        current_value = getattr(settings, field, None)
    
    # 验证新值合法性
    validation = _validate_config_value(category, field, new_value)
    if not validation["valid"]:
        return Command(
            update={
                "messages": [{
                    "role": "assistant",
                    "content": f"配置验证失败: {validation['reason']}"
                }]
            }
        )
    
    # 触发确认中断
    return Command(
        interrupt=[{
            "type": "config_change_confirmation",
            "category": category,
            "field": field,
            "current_value": current_value,
            "new_value": new_value,
            "warning": validation.get("warning"),
            "message": (
                f"确认修改配置？\n"
                f"类别: {category}\n"
                f"字段: {field}\n"
                f"当前值: {current_value}\n"
                f"新值: {new_value}\n"
                f"{validation.get('warning', '')}"
            )
        }]
    )


@tool
def apply_config_change(
    category: ConfigCategory,
    field: str,
    new_value: Any,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    应用配置修改（用户确认后调用）。
    
    Args:
        category: 配置类别
        field: 字段名
        new_value: 新值
    
    Returns:
        应用结果
    """
    del category, field, new_value
    logger.warning("Blocked in-process config mutation attempt from agent tool")
    return {
        "status": "failed",
        "reason": "配置修改必须使用设置页持久化，Agent 不能直接写入运行时配置。"
    }


def _resource_managers(runtime: ToolRuntime[PersonaAgentContext]) -> dict[str, Any]:
    """Return only application-owned resource managers; never inspect arbitrary paths."""
    context = getattr(runtime, "context", None)
    app_state = getattr(getattr(context, "agent_runtime", None), "app_state", None)
    if app_state is None:
        request = getattr(runtime, "request", None)
        app_state = getattr(getattr(request, "app", None), "state", None)
    if app_state is None:
        return {}
    return {
        "rvc": getattr(app_state, "rvc_resources", None),
        "ffmpeg": getattr(app_state, "ffmpeg_resources", None),
        "asr": getattr(app_state, "asr_resources", None),
        "embedding": getattr(app_state, "embedding_resources", None),
        "gpt_sovits": getattr(app_state, "gpt_sovits_install", None),
        "separator": getattr(app_state, "separator_resources", None),
    }


def _normalized_resource_status(key: str, value: Any) -> dict[str, Any]:
    raw = dict(value) if isinstance(value, dict) else {"detail": str(value)}
    progress = raw.get("progress_percent", raw.get("progress"))
    if progress is None and raw.get("total_bytes"):
        progress = round(float(raw.get("downloaded_bytes", 0)) * 100 / float(raw["total_bytes"]))
    raw.update({
        "resource": key,
        "ready": bool(raw.get("ready", False)),
        "installed": bool(raw.get("installed", False)),
        "installing": bool(raw.get("installing", False)),
        "cancelling": bool(raw.get("cancelling", False)),
        "progress_percent": progress,
        "phase": str(raw.get("phase") or ("ready" if raw.get("ready") else "idle")),
        "detail": str(raw.get("detail") or raw.get("message") or ""),
        "error": str(raw.get("error") or ""),
    })
    return raw

@tool
def get_resource_install_status(
    resource: str,
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict[str, Any]:
    """查询应用内受管资源的安装状态。resource 支持 rvc、ffmpeg、asr、embedding、gpt_sovits。"""
    key = str(resource or "").strip().lower().replace("-", "_")
    manager = _resource_managers(runtime).get(key)
    if manager is None or not hasattr(manager, "status"):
        return {"status": "failed", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": "status", "error": "不支持或不可用的受管资源"}
    try:
        install = _normalized_resource_status(key, manager.status())
        capabilities = {
            "status": True,
            "install": callable(getattr(manager, "start_install", None)) or callable(getattr(manager, "install", None)),
            "cancel": callable(getattr(manager, "cancel_install", None)),
            "clean": callable(getattr(manager, "remove_managed", None)) or callable(getattr(manager, "remove_install", None)) or callable(getattr(manager, "remove", None)),
        }
        return {"status": "ok", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": "status", "install": install, "capabilities": capabilities, "phase": (install or {}).get("phase") if isinstance(install, dict) else None, "progress_percent": (install or {}).get("progress_percent", (install or {}).get("progress", 0)) if isinstance(install, dict) else 0, "missing": (install or {}).get("missing", []) if isinstance(install, dict) else []}
    except Exception as exc:
        return {"status": "failed", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": "status", "error": str(exc)}


@tool
def manage_resource_install(
    resource: str,
    action: Literal["install", "cancel", "clean"],
    runtime: ToolRuntime[PersonaAgentContext],
) -> dict[str, Any]:
    """启动、取消或清理应用自有资源；不得操作用户模型、附件或任意路径。"""
    key = str(resource or "").strip().lower().replace("-", "_")
    manager = _resource_managers(runtime).get(key)
    if manager is None:
        return {"status": "failed", "resource": key, "error": "不支持或不可用的受管资源"}
    try:
        if action == "install":
            method = getattr(manager, "start_install", None) or getattr(manager, "install", None)
            if method is None:
                return {"status": "failed", "resource": key, "error": "该资源没有安装器"}
            # 不同受管资源的安装器合同不同：RVC/ASR/FFmpeg 无参数，
            # GPT-SoVITS 需要下载地址。优先复用管理器自身状态中的默认地址，
            # 避免卡片上的“下载/安装”按钮只能触发一个参数错误。
            required = [
                parameter for parameter in inspect.signature(method).parameters.values()
                if parameter.default is inspect.Parameter.empty
                and parameter.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
            ]
            if required:
                current = manager.status() if callable(getattr(manager, "status", None)) else {}
                url = current.get("download_url") if isinstance(current, dict) else None
                if not url:
                    return {"status": "failed", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": action, "error": "该资源需要先提供下载地址"}
                result = method(url)
            else:
                result = method()
        elif action == "cancel":
            method = getattr(manager, "cancel_install", None)
            if method is None:
                return {"status": "failed", "resource": key, "error": "该资源不支持取消"}
            result = method()
        else:
            method = getattr(manager, "remove_managed", None) or getattr(manager, "remove_install", None) or getattr(manager, "remove", None)
            if method is None:
                return {"status": "failed", "resource": key, "error": "该资源不支持安全清理"}
            result = method()
        return {"status": "accepted", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": action, "install": result if isinstance(result, dict) else None, "capabilities": {"status": True, "install": True, "cancel": callable(getattr(manager, "cancel_install", None)), "clean": callable(getattr(manager, "remove_managed", None)) or callable(getattr(manager, "remove_install", None)) or callable(getattr(manager, "remove", None))}, "phase": (result or {}).get("phase") if isinstance(result, dict) else "accepted", "progress_percent": (result or {}).get("progress_percent", (result or {}).get("progress", 0)) if isinstance(result, dict) else 0}
    except Exception as exc:
        logger.exception("resource action failed: %s/%s", key, action)
        return {"status": "failed", "worker": "config_worker", "kind": "resource_setup", "resource": key, "action": action, "error": str(exc)}


def _validate_config_value(
    category: str,
    field: str,
    value: Any
) -> dict[str, Any]:
    """验证配置值"""
    
    # LLM 温度
    if field == "temperature":
        if not isinstance(value, (int, float)):
            return {"valid": False, "reason": "temperature 必须是数字"}
        if not 0.0 <= value <= 2.0:
            return {"valid": False, "reason": "temperature 必须在 0.0-2.0 之间"}
    
    # Embedding 维度
    if field == "dimensions":
        if not isinstance(value, int):
            return {"valid": False, "reason": "dimensions 必须是整数"}
        if value not in {768, 1024, 1536, 3072}:
            return {
                "valid": True,
                "warning": "⚠️ 非标准维度，更改后需重建 Milvus 索引"
            }
    
    # RAG 参数
    if field in {"max_rewrite_count", "max_generation_retry"}:
        if not isinstance(value, int):
            return {"valid": False, "reason": f"{field} 必须是整数"}
        if not 0 <= value <= 5:
            return {"valid": False, "reason": f"{field} 必须在 0-5 之间"}
    
    if field == "confidence_threshold":
        if not isinstance(value, (int, float)):
            return {"valid": False, "reason": "confidence_threshold 必须是数字"}
        if not 0.5 <= value <= 0.95:
            return {"valid": False, "reason": "confidence_threshold 建议在 0.5-0.95 之间"}
    
    # 上传大小
    if field == "max_upload_mb":
        if not isinstance(value, int):
            return {"valid": False, "reason": "max_upload_mb 必须是整数"}
        if not 1 <= value <= 500:
            return {"valid": False, "reason": "max_upload_mb 必须在 1-500 之间"}
    
    return {"valid": True}


def _check_restart_required(category: str, field: str) -> bool:
    """检查配置更改是否需要重启服务"""
    
    # LLM/Embedding 提供商或 base_url 变更需要重启
    if category in {"llm", "embedding"}:
        if field in {"provider", "base_url", "model"}:
            return True
    
    # TTS 提供商变更需要重启
    if category == "tts" and field == "provider":
        return True
    
    # 其他配置可热加载
    return False
