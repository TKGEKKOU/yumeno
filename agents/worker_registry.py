"""
动态 Worker 注册机制
支持运行时注册、卸载和管理 Worker
"""
from dataclasses import dataclass
from typing import Callable, Optional
from langchain_core.tools import BaseTool

@dataclass
class WorkerSpec:
    """Worker 规格定义"""
    name: str
    tools: list[str]  # 工具名称列表
    prompt_template: str  # Worker 的系统提示模板
    description: str  # Worker 描述（用于 handoff 工具）
    requires_approval: bool = False  # 是否需要所有操作都审批
    enabled: bool = True  # 是否启用
    
    # 可选的自定义处理器
    pre_execute: Optional[Callable] = None  # 执行前钩子
    post_execute: Optional[Callable] = None  # 执行后钩子
    finalize: Optional[Callable] = None  # 自定义 finalize 逻辑

# Worker 注册表
_WORKER_REGISTRY: dict[str, WorkerSpec] = {}
_REGISTRY_VERSION = 0

def register_worker(spec: WorkerSpec) -> bool:
    """
    注册一个新的 Worker
    
    Args:
        spec: Worker 规格
        
    Returns:
        是否成功注册
    """
    global _REGISTRY_VERSION
    
    if spec.name in _WORKER_REGISTRY:
        return False
    
    _WORKER_REGISTRY[spec.name] = spec
    _REGISTRY_VERSION += 1
    return True

def unregister_worker(name: str) -> bool:
    """
    注销一个 Worker
    
    Args:
        name: Worker 名称
        
    Returns:
        是否成功注销
    """
    global _REGISTRY_VERSION
    
    if name not in _WORKER_REGISTRY:
        return False
    
    del _WORKER_REGISTRY[name]
    _REGISTRY_VERSION += 1
    return True

def get_worker_spec(name: str) -> Optional[WorkerSpec]:
    """获取 Worker 规格"""
    return _WORKER_REGISTRY.get(name)

def list_workers() -> list[WorkerSpec]:
    """列出所有已注册的 Worker"""
    return list(_WORKER_REGISTRY.values())

def get_registry_version() -> int:
    """获取注册表版本号（用于缓存失效）"""
    return _REGISTRY_VERSION

# 内置 Worker 规格
BUILTIN_WORKERS = [
    WorkerSpec(
        name="knowledge",
        tools=[
            "search_persona_knowledge",
            "web_search",
            "list_structured_tables",
            "query_structured_data",
            "import_knowledge_from_url"
        ],
        prompt_template=(
            "Retrieve the active persona's uploaded knowledge, search current web information, "
            "or import knowledge from URLs. For structured data queries over CSV/XLSX, "
            "list tables first and use query_structured_data with physical column names."
        ),
        description="Delegate knowledge retrieval, web search, or knowledge import to the knowledge specialist."
    ),
    WorkerSpec(
        name="memory",
        tools=[
            "read_persona_memories",
            "save_persona_memory",
            "update_persona_memory",
            "delete_persona_memory",
            "read_workspace_memories",
            "save_workspace_memory",
            "delete_workspace_memory"
        ],
        prompt_template="Read or maintain only the active persona's user memory (both persona-specific and workspace-wide).",
        description="Delegate durable user memory operations to the memory specialist."
    ),
    WorkerSpec(
        name="document",
        tools=[
            "list_persona_documents",
            "add_persona_knowledge",
            "delete_persona_document"
        ],
        prompt_template="Inspect or manage only the active persona's knowledge documents and uploaded files.",
        description="Delegate persona document management to the document specialist."
    ),
    WorkerSpec(
        name="profile",
        tools=[
            "rename_persona",
            "update_persona_profile",
            "export_conversation"
        ],
        prompt_template="Inspect or modify only the active persona's profile, name, and export conversations.",
        description="Delegate persona profile management to the profile specialist."
    ),
    WorkerSpec(
        name="voice_clone",
        tools=[
            "start_voice_clone_session",
            "request_file_upload",
            "analyze_voice_material",
            "request_training_confirmation",
            "start_voice_training",
            "check_training_progress",
            "bind_trained_voice"
        ],
        prompt_template="Manage voice cloning workflows including material analysis, training coordination, and voice profile binding.",
        description="Delegate voice cloning tasks to the voice clone specialist."
    ),
    WorkerSpec(
        name="config",
        tools=[
            "list_available_configs",
            "get_config_detail",
            "request_config_change",
            "apply_config_change"
        ],
        prompt_template="Inspect and modify system configuration settings after user confirmation.",
        description="Delegate configuration modifications to the config specialist."
    )
]

def initialize_builtin_workers():
    """初始化内置 Worker"""
    for spec in BUILTIN_WORKERS:
        register_worker(spec)

# 自动初始化
initialize_builtin_workers()

# 示例：如何添加自定义 Worker
"""
from agents.worker_registry import register_worker, WorkerSpec

# 定义自定义 Worker
email_worker = WorkerSpec(
    name="email",
    tools=["send_email", "read_email", "search_email"],
    prompt_template="Manage email operations including sending, reading, and searching.",
    description="Delegate email operations to the email specialist.",
    requires_approval=True  # 所有邮件操作需要审批
)

# 注册
register_worker(email_worker)

# 之后 build_persona_workflow 会自动使用这个新 Worker
"""
