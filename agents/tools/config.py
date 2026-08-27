"""配置管理 Worker 工具集"""
from __future__ import annotations
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
            "provider": settings.llm_provider,
            "model": settings.llm_model,
            "base_url": settings.llm_base_url,
            "temperature": settings.llm_temperature,
            "max_tokens": settings.llm_max_tokens
        },
        "embedding": {
            "provider": settings.embedding_provider,
            "model": settings.embedding_model,
            "base_url": settings.embedding_base_url,
            "dimensions": settings.embedding_dimensions
        },
        "tts": {
            "provider": settings.tts_provider,
            "gpt_sovits_url": settings.gpt_sovits_base_url
        },
        "rag": {
            "pipeline": settings.rag_pipeline,
            "max_rewrite_count": settings.max_rewrite_count,
            "max_generation_retry": settings.max_generation_retry,
            "confidence_threshold": settings.default_confidence_threshold
        },
        "security": {
            "max_upload_mb": settings.max_upload_mb,
            "enable_web_search": settings.enable_web_search
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
                "pipeline": "default(自适应纠错) / simple(检索直出)",
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
    from settings import Settings
    
    try:
        settings = Settings.load()
        
        # 设置新值
        full_field = f"{category}_{field}"
        if hasattr(settings, full_field):
            setattr(settings, full_field, new_value)
        elif hasattr(settings, field):
            setattr(settings, field, new_value)
        else:
            return {
                "status": "failed",
                "reason": f"未知字段: {field}"
            }
        
        # 保存配置
        settings.save()
        
        logger.info(f"Applied config change: {category}.{field} = {new_value}")
        
        # 检查是否需要重启服务
        restart_required = _check_restart_required(category, field)
        
        return {
            "status": "applied",
            "category": category,
            "field": field,
            "new_value": new_value,
            "restart_required": restart_required,
            "message": (
                f"配置已更新。"
                f"{'需要重启服务才能生效。' if restart_required else '立即生效。'}"
            )
        }
        
    except Exception as e:
        logger.error(f"Failed to apply config change: {e}")
        return {
            "status": "failed",
            "reason": str(e)
        }


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
