from dataclasses import dataclass

from langchain_core.tools import BaseTool

from agents.capabilities import CapabilityCatalog, CapabilityDescriptor
from agents.contracts import WorkerManifest, WorkerRetryPolicy

from agents.tools import (
    add_persona_knowledge,
    delete_persona_document,
    delete_persona_memory,
    delete_workspace_memory,
    list_persona_documents,
    list_structured_tables,
    query_structured_data,
    read_persona_memories,
    read_workspace_memories,
    rename_persona,
    save_persona_memory,
    save_workspace_memory,
    search_persona_knowledge,
    update_persona_memory,
    update_persona_profile,
    web_search,
)
from agents.tools.rvc import (
    convert_audio_with_rvc,
    get_rvc_status,
    get_rvc_task_status,
    cancel_rvc_task,
    list_rvc_models,
    validate_rvc_model,
    create_rvc_session, attach_file_to_rvc_session, prepare_rvc_source,
    separate_rvc_vocals, get_rvc_session, mix_rvc_instrumental,
    register_rvc_result_attachment,
)
from agents.tools.voice import (
    start_voice_clone_session,
    request_file_upload,
    analyze_voice_material,
    request_training_confirmation,
    start_voice_training,
    check_training_progress,
    bind_trained_voice,
    list_voice_assets,
    get_voice_system_status,
    list_voice_studio_sessions,
    get_voice_studio_session,
    get_voice_training_status,
    get_persona_voice_binding,
)
from agents.tools.live2d import (
    list_live2d_models,
    get_live2d_vts_config,
    open_live2d_model_directory,
)
from agents.tools.config import (
    list_available_configs,
    get_config_detail,
    request_config_change,
    apply_config_change,
    get_resource_install_status,
    manage_resource_install,
)
from agents.tools.extended import (
    import_knowledge_from_url,
    export_conversation,
)


_WORKER_COMPAT_ALIASES = {"rvc": "rvc_worker", "voice_clone": "voice"}


def _canonical_worker_name(value: str | None) -> str | None:
    if value is None:
        return None
    name = str(value)
    return _WORKER_COMPAT_ALIASES.get(name, name)


@dataclass(frozen=True)
class ToolSpec:
    # 工具注册元数据：name 是 Agent 可见的工具名；specialist 决定该工具挂到哪个 Worker；
    # requires_confirmation=True 表示变更类操作，执行前必须经过 Human-in-the-loop 确认；
    # mutates_data 标记是否写数据，用于能力清单与只读/变更分组。
    name: str
    specialist: str
    tool: BaseTool
    requires_confirmation: bool = False
    mutates_data: bool = False
    server: str = ""


_WORKER_ORDER = ("knowledge", "memory", "document", "profile", "voice", "rvc_worker", "live2d", "config")

_WORKER_DESCRIPTIONS = {
    "knowledge": "在当前角色知识空间中检索、查询结构化数据，并按策略补充公开信息。",
    "memory": "读取、维护当前角色范围内的用户记忆与工作区记忆。",
    "document": "管理当前角色的知识文档、上传资料和 URL 导入任务。",
    "profile": "读取或修改当前角色的人设档案，并导出会话内容。",
    "voice": "统一管理音色、TTS、ASR、实时语音、Voice Studio、训练与 GPT-SoVITS。",
    "rvc_worker": "管理本地 RVC 音色转换资源，并提交和跟踪受管的音频变声任务。",
    "live2d": "统一管理 Live2D 模型、VTube Studio 连接和本地模型目录。",
    "config": "读取系统配置，并在确认后应用配置变更。",
}

_WORKER_EXECUTION_DEFAULTS = {
    "knowledge": (45.0, WorkerRetryPolicy(max_attempts=2, backoff_seconds=0.5)),
    "memory": (30.0, WorkerRetryPolicy(max_attempts=1)),
    "document": (120.0, WorkerRetryPolicy(max_attempts=2, backoff_seconds=1.0)),
    "profile": (30.0, WorkerRetryPolicy(max_attempts=1)),
    "voice": (300.0, WorkerRetryPolicy(max_attempts=1)),
    "rvc_worker": (1800.0, WorkerRetryPolicy(max_attempts=1)),
    "live2d": (45.0, WorkerRetryPolicy(max_attempts=1)),
    "config": (45.0, WorkerRetryPolicy(max_attempts=1)),
}

_WORKER_INPUT_SCHEMA = {
    "type": "object",
    "properties": {"request": {"type": "string", "description": "Supervisor 委派的任务说明"}},
    "required": ["request"],
    "additionalProperties": False,
}

_WORKER_OUTPUT_SCHEMA = {
    "type": "object",
    "required": [
        "worker",
        "status",
        "answer",
        "evidence",
        "artifacts",
        "uncertainties",
        "citations",
        "trace",
        "requires_approval",
        "error",
    ],
    "properties": {
        "worker": {"type": "string"},
        "status": {"type": "string"},
        "answer": {"type": "string"},
        "evidence": {"type": "array"},
        "artifacts": {"type": "array"},
        "uncertainties": {"type": "array"},
        "citations": {"type": "array"},
        "trace": {"type": "array"},
        "requires_approval": {"type": "boolean"},
        "error": {"type": ["object", "null"]},
    },
}


# 全局工具清单（单一事实来源）。
# mutates_data 与 requires_confirmation 是正交标记：
# - 检索类工具不写数据；web_search 的 HITL 由 knowledge_fallback 按策略决定，
#   而不是把“有时需要确认”写死成 ToolSpec.requires_confirmation。
# - request_*_confirmation 本身不写数据，但就是确认步骤。
# - 真正改记忆/文档/人设/配置的工具 requires_confirmation=True。
# Worker 通过 tools_for_specialist 按 specialist 取子集，避免把全部工具塞进单一 Agent。
_TOOL_SPECS = (
    ToolSpec("search_persona_knowledge", "knowledge", search_persona_knowledge),
    ToolSpec("web_search", "knowledge", web_search),
    ToolSpec("list_persona_documents", "document", list_persona_documents),
    ToolSpec("read_persona_memories", "memory", read_persona_memories),
    ToolSpec("save_persona_memory", "memory", save_persona_memory, False, True),
    ToolSpec("update_persona_memory", "memory", update_persona_memory, False, True),
    ToolSpec("delete_persona_memory", "memory", delete_persona_memory, False, True),
    ToolSpec("read_workspace_memories", "memory", read_workspace_memories),
    ToolSpec("list_structured_tables", "knowledge", list_structured_tables),
    ToolSpec("query_structured_data", "knowledge", query_structured_data),
    ToolSpec("save_workspace_memory", "memory", save_workspace_memory, True, True),
    ToolSpec("delete_workspace_memory", "memory", delete_workspace_memory, True, True),
    ToolSpec("add_persona_knowledge", "document", add_persona_knowledge, True, True),
    ToolSpec("rename_persona", "profile", rename_persona, True, True),
    ToolSpec("update_persona_profile", "profile", update_persona_profile, True, True),
    ToolSpec("delete_persona_document", "document", delete_persona_document, True, True),
    ToolSpec("start_voice_clone_session", "voice", start_voice_clone_session, False, True),
    ToolSpec("request_file_upload", "voice", request_file_upload),
    ToolSpec("analyze_voice_material", "voice", analyze_voice_material),
    ToolSpec("request_training_confirmation", "voice", request_training_confirmation, True, False),
    ToolSpec("start_voice_training", "voice", start_voice_training, False, True),
    ToolSpec("check_training_progress", "voice", check_training_progress),
    ToolSpec("bind_trained_voice", "voice", bind_trained_voice, False, True),
    ToolSpec("list_voice_assets", "voice", list_voice_assets),
    ToolSpec("get_voice_system_status", "voice", get_voice_system_status),
    ToolSpec("list_voice_studio_sessions", "voice", list_voice_studio_sessions),
    ToolSpec("get_voice_studio_session", "voice", get_voice_studio_session),
    ToolSpec("get_voice_training_status", "voice", get_voice_training_status),
    ToolSpec("get_persona_voice_binding", "voice", get_persona_voice_binding),
    ToolSpec("create_rvc_session", "rvc_worker", create_rvc_session),
    ToolSpec("attach_file_to_rvc_session", "rvc_worker", attach_file_to_rvc_session),
    ToolSpec("prepare_rvc_source", "rvc_worker", prepare_rvc_source),
    ToolSpec("separate_rvc_vocals", "rvc_worker", separate_rvc_vocals),
    ToolSpec("get_rvc_session", "rvc_worker", get_rvc_session),
    ToolSpec("mix_rvc_instrumental", "rvc_worker", mix_rvc_instrumental, False, True),
    ToolSpec("register_rvc_result_attachment", "rvc_worker", register_rvc_result_attachment, False, True),
    ToolSpec("get_rvc_status", "rvc_worker", get_rvc_status),
    ToolSpec("list_rvc_models", "rvc_worker", list_rvc_models),
    ToolSpec("validate_rvc_model", "rvc_worker", validate_rvc_model),
    ToolSpec("convert_audio_with_rvc", "rvc_worker", convert_audio_with_rvc, False, True),
    ToolSpec("get_rvc_task_status", "rvc_worker", get_rvc_task_status),
    ToolSpec("cancel_rvc_task", "rvc_worker", cancel_rvc_task, False, True),
    ToolSpec("list_live2d_models", "live2d", list_live2d_models),
    ToolSpec("get_live2d_vts_config", "live2d", get_live2d_vts_config),
    ToolSpec("open_live2d_model_directory", "live2d", open_live2d_model_directory),
    ToolSpec("list_available_configs", "config", list_available_configs),
    ToolSpec("get_config_detail", "config", get_config_detail),
    ToolSpec("get_resource_install_status", "config", get_resource_install_status),
    ToolSpec("manage_resource_install", "config", manage_resource_install, True, True),
    ToolSpec("request_config_change", "config", request_config_change, True, False),
    ToolSpec("apply_config_change", "config", apply_config_change, False, True),
    ToolSpec("import_knowledge_from_url", "document", import_knowledge_from_url, True, True),
    ToolSpec("export_conversation", "profile", export_conversation),
)

READ_ONLY_TOOL_NAMES = tuple(spec.name for spec in _TOOL_SPECS if not spec.mutates_data)
AUTOMATIC_TOOL_NAMES = tuple(spec.name for spec in _TOOL_SPECS if not spec.requires_confirmation)
MUTATION_TOOL_NAMES = tuple(spec.name for spec in _TOOL_SPECS if spec.requires_confirmation)

# MCP 工具在应用启动时动态追加到这里（见 integrations/mcp/client.py），
# 运行时注册的额外工具独立存放，避免与内置常量互相污染。
_EXTRA_TOOL_SPECS: list[ToolSpec] = []
_REGISTRY_REVISION = 0


def tool_registry_revision() -> int:
    """Return a monotonic revision used to invalidate workflow tool snapshots."""

    return _REGISTRY_REVISION


def tool_specs() -> tuple[ToolSpec, ...]:
    """全部工具（内置 + 运行时注册的 MCP 工具），单一事实来源。"""

    return _TOOL_SPECS + tuple(_EXTRA_TOOL_SPECS)


def capability_catalog() -> CapabilityCatalog:
    """Build the current capability catalog from the single tool registry."""

    catalog = CapabilityCatalog()
    for spec in tool_specs():
        source = "mcp" if spec.specialist == "mcp" else "builtin"
        capability_id = (
            f"mcp/{spec.server}/{spec.name}"
            if source == "mcp"
            else f"builtin/{spec.name}"
        )
        catalog.register(
            CapabilityDescriptor(
                capability_id=capability_id,
                name=spec.name,
                source=source,
                specialist=spec.specialist,
                requires_confirmation=spec.requires_confirmation,
                mutates_data=spec.mutates_data,
                server=spec.server,
                read_only_confirmed=(
                    source != "mcp"
                    or (not spec.requires_confirmation and not spec.mutates_data)
                ),
                default_allowed=source != "mcp",
            )
        )
    return catalog


def register_tool_specs(specs: list[ToolSpec]) -> int:
    """追加运行时注册的工具（如 MCP 工具）；同名工具跳过。"""

    global _REGISTRY_REVISION
    known = {spec.name for spec in tool_specs()}
    added = 0
    for spec in specs:
        if spec.name in known:
            continue
        _EXTRA_TOOL_SPECS.append(spec)
        known.add(spec.name)
        added += 1
    if added:
        _REGISTRY_REVISION += 1
    return added


def unregister_tool_specs(names: list[str]) -> int:
    """按名称移除运行时注册的工具；不存在的名称忽略。"""

    global _REGISTRY_REVISION
    removed = 0
    remaining: list[ToolSpec] = []
    for spec in _EXTRA_TOOL_SPECS:
        if spec.name in names:
            removed += 1
            continue
        remaining.append(spec)
    _EXTRA_TOOL_SPECS[:] = remaining
    if removed:
        _REGISTRY_REVISION += 1
    return removed


def tools_for_specialist(specialist: str) -> list[BaseTool]:
    specialist = _canonical_worker_name(specialist) or specialist
    # 按 Worker 领域过滤工具：knowledge 拥有检索/SQL/联网兜底，memory 拥有记忆读写，
    # document/profile/voice/live2d/config 各自拥有领域工具——最小权限原则。
    # MCP 工具 specialist 固定为 "mcp"，不属于任何 Worker，天然不会越权。
    return [spec.tool for spec in tool_specs() if spec.specialist == specialist]


def worker_manifests() -> tuple[WorkerManifest, ...]:
    """返回当前所有内置 Worker 的公开能力声明。

    工具名称和变更范围始终从 ToolSpec 计算，避免 Manifest 与实际工具注册表
    产生第二套会漂移的事实源；MCP 工具仍作为独立的外部能力，不挂到内置 Worker。
    """

    specs = tool_specs()
    manifests: list[WorkerManifest] = []
    for worker in _WORKER_ORDER:
        owned = tuple(spec for spec in specs if spec.specialist == worker)
        timeout_seconds, retry_policy = _WORKER_EXECUTION_DEFAULTS[worker]
        manifests.append(
            WorkerManifest(
                name=worker,
                description=_WORKER_DESCRIPTIONS[worker],
                input_schema=dict(_WORKER_INPUT_SCHEMA),
                output_schema=dict(_WORKER_OUTPUT_SCHEMA),
                capabilities=tuple(f"builtin/{spec.name}" for spec in owned),
                mutating_operations=tuple(spec.name for spec in owned if spec.mutates_data),
                # 这里表示“该 Worker 可能触发确认”，而非每一个请求都必须确认；
                # 具体动作仍由 CapabilityGuard / HITL 策略决定。
                requires_confirmation=(
                    worker == "knowledge" or any(spec.requires_confirmation for spec in owned)
                ),
                timeout_seconds=timeout_seconds,
                retry_policy=retry_policy,
                tools=tuple(spec.name for spec in owned),
            )
        )
    return tuple(manifests)


def worker_manifest(worker: str) -> WorkerManifest:
    """按 Worker 名称读取能力声明；未知名称显式失败，避免静默越权。"""

    worker = _canonical_worker_name(worker) or worker
    for manifest in worker_manifests():
        if manifest.name == worker:
            return manifest
    raise KeyError(f"Unknown worker: {worker}")


def specialist_for_tool(tool_name: str) -> str:
    return next((spec.specialist for spec in tool_specs() if spec.name == tool_name), "conversation")


def capability_summary() -> str:
    # 用于"你会做什么"能力问答：区分自动工具、需确认工具与外部 MCP 工具，
    # 并列出可用技能。未配置 API key 搜索时 web_search 不列入自动工具，
    # 联网搜索仅使用设置页配置的 API key 服务。
    from agents.skills import list_skills
    from settings import Settings

    settings = Settings.load()
    specs = tool_specs()
    automatic = [
        spec.name
        for spec in specs
        if not spec.requires_confirmation and spec.specialist != "mcp"
    ]
    if not settings.enable_web_fallback and "web_search" in automatic:
        automatic.remove("web_search")
    confirmed = "、".join(spec.name for spec in specs if spec.requires_confirmation and spec.specialist != "mcp")
    mcp_tools = "、".join(spec.name for spec in specs if spec.specialist == "mcp")
    skills = "、".join(spec.name for spec in list_skills())
    summary = f"可自动使用：{'、'.join(automatic)}。需要你每次确认：{confirmed}。可用技能：{skills}。"
    if mcp_tools:
        summary += f"外部 MCP 工具（需先加载对应技能）：{mcp_tools}。"
    summary += "联网搜索使用 web_search；需在设置页配置 API key 后才可用。"
    return summary






