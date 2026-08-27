from dataclasses import dataclass

from langchain_core.tools import BaseTool

from agents.capabilities import CapabilityCatalog, CapabilityDescriptor

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
from agents.tools.voice_clone import (
    start_voice_clone_session,
    request_file_upload,
    analyze_voice_material,
    request_training_confirmation,
    start_voice_training,
    check_training_progress,
    bind_trained_voice,
)
from agents.tools.config import (
    list_available_configs,
    get_config_detail,
    request_config_change,
    apply_config_change,
)
from agents.tools.extended import (
    import_knowledge_from_url,
    export_conversation,
)


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


# 全局工具清单（单一事实来源）：只读检索类工具自动放行，写操作（新增资料、
# 重命名、改人设、删文档、改记忆）全部 requires_confirmation=True。
# Worker 通过 tools_for_specialist 按 specialist 取子集，天然实现"工具按领域分配"，
# 避免把全部工具塞进单一 Agent 的上下文。
_TOOL_SPECS = (
    ToolSpec("search_persona_knowledge", "knowledge", search_persona_knowledge),
    ToolSpec("web_search", "web", web_search),
    ToolSpec("list_persona_documents", "management", list_persona_documents),
    ToolSpec("read_persona_memories", "memory", read_persona_memories),
    ToolSpec("save_persona_memory", "memory", save_persona_memory, False, True),
    ToolSpec("update_persona_memory", "memory", update_persona_memory, False, True),
    ToolSpec("delete_persona_memory", "memory", delete_persona_memory, False, True),
    ToolSpec("read_workspace_memories", "memory", read_workspace_memories),
    ToolSpec("list_structured_tables", "knowledge", list_structured_tables),
    ToolSpec("query_structured_data", "knowledge", query_structured_data),
    ToolSpec("save_workspace_memory", "memory", save_workspace_memory, True, True),
    ToolSpec("delete_workspace_memory", "memory", delete_workspace_memory, True, True),
    ToolSpec("add_persona_knowledge", "management", add_persona_knowledge, True, True),
    ToolSpec("rename_persona", "management", rename_persona, True, True),
    ToolSpec("update_persona_profile", "management", update_persona_profile, True, True),
    ToolSpec("delete_persona_document", "management", delete_persona_document, True, True),
    ToolSpec("start_voice_clone_session", "voice_clone", start_voice_clone_session, False, True),
    ToolSpec("request_file_upload", "voice_clone", request_file_upload),
    ToolSpec("analyze_voice_material", "voice_clone", analyze_voice_material),
    ToolSpec("request_training_confirmation", "voice_clone", request_training_confirmation, True, False),
    ToolSpec("start_voice_training", "voice_clone", start_voice_training, False, True),
    ToolSpec("check_training_progress", "voice_clone", check_training_progress),
    ToolSpec("bind_trained_voice", "voice_clone", bind_trained_voice, False, True),
        ToolSpec("list_available_configs", "config", list_available_configs),
    ToolSpec("get_config_detail", "config", get_config_detail),
    ToolSpec("request_config_change", "config", request_config_change, True, False),
    ToolSpec("apply_config_change", "config", apply_config_change, False, True),
    ToolSpec("import_knowledge_from_url", "management", import_knowledge_from_url, True, True),
    ToolSpec("export_conversation", "management", export_conversation),
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
    # 按 Worker 领域过滤工具：knowledge 只拿 RAG 检索，memory 只拿记忆读写，
    # management 拿文档/人设管理（含需确认的变更工具）——最小权限原则。
    # MCP 工具 specialist 固定为 "mcp"，不属于任何 Worker，天然不会越权。
    return [spec.tool for spec in tool_specs() if spec.specialist == specialist]


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






