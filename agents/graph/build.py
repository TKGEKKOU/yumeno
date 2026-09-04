"""Compile the persona supervisor-worker graph."""

from uuid import uuid4

from langchain_core.language_models import BaseChatModel
from langchain.messages import HumanMessage
from langgraph.constants import END, START
from langgraph.graph import StateGraph
from langgraph.config import get_stream_writer

from agents.context import PersonaAgentContext
from agents.graph.knowledge import _default_web_search_executor, _knowledge_subgraph
from agents.graph.policy import direct_worker_for_intent
from agents.graph.state import WORKERS, PersonaWorkflowState, worker_node_name
from agents.graph.supervisor import (
    _after_finalize_route,
    _finalize_worker,
    _supervisor_agent,
    _supervisor_collect,
    _supervisor_dispatch,
    _worker_agent,
)
from agents.tools.knowledge import run_persona_knowledge_search, run_persona_web_grounded_search
from agents.tools.structured_query import query_structured_data_for_context


_DIRECT_STAGE_LABELS = {
    "memory_worker": "已识别为记忆请求，正在检查记忆…",
    "document_worker": "已识别为文档请求，正在处理知识文档…",
    "profile_worker": "已识别为档案请求，正在更新角色档案…",
    "voice_worker": "已识别为声音系统请求，正在准备处理…",
    "rvc_worker": "正在分析请求…",
    "live2d_worker": "已识别为 Live2D 请求，正在准备处理…",
    "config_worker": "已识别为配置请求，正在检查资源…",
}


def _latest_question(state: PersonaWorkflowState) -> str:
    for message in reversed(state.get("messages", [])):
        if isinstance(message, HumanMessage):
            content = message.content
            if isinstance(content, str):
                return content
            return str(content)
    return ""


def _intent_route(state: PersonaWorkflowState) -> dict:
    worker_node = direct_worker_for_intent(state.get("intent_decision"))
    # RVC 必须由 Core Supervisor 通过 handoff 委派给 rvc_worker。
    # 意图漏斗只能提供路由线索，不能绕过 Agent 直接进入专用工作流。
    if not worker_node or worker_node == "rvc_worker":
        return {"route_node": "persona_supervisor"}
    try:
        writer = get_stream_writer()
        worker = worker_node
        if worker == "voice_worker":
            # 保留旧的前端业务事件协议；canonical Worker 已统一为 voice。
            writer({"kind": "clone_session", "action": "request_voice_material"})
        writer({"kind": "stage", "stage": _DIRECT_STAGE_LABELS.get(worker, f"正在调用 {worker}")})
    except RuntimeError:
        pass
    return {
        "route_node": worker_node,
        "worker_request": _latest_question(state),
        "worker_call_id": f"direct:{worker_node}:{uuid4()}",
    }


def _route_to_worker(state: PersonaWorkflowState) -> str:
    route = str(state.get("route_node") or "persona_supervisor")
    if route in {worker_node_name(worker) for worker in WORKERS} or route == "persona_supervisor":
        return route
    return "persona_supervisor"


def _dispatch_route(state: PersonaWorkflowState) -> str:
    route = str(state.get("route_node") or "persona_supervisor")
    allowed = {worker_node_name(worker) for worker in WORKERS}
    if route in allowed:
        return route
    return "persona_supervisor"


def build_persona_workflow(
    model: BaseChatModel | None,
    checkpointer,
    *,
    knowledge_executor=run_persona_knowledge_search,
    structured_executor=query_structured_data_for_context,
    web_search_executor=_default_web_search_executor,
    web_rag_executor=run_persona_web_grounded_search,
):
    """构建 supervisor -> worker -> supervisor 的闭环，并启用会话级检查点。

    设计要点：
    - 只有 persona_supervisor 对用户可见：它是唯一直接生成最终回复的节点，
      Worker 永远不直接回答用户，只能把事实性结果交回 Supervisor 整合。
    - Worker 通过 handoff 工具（Command(PARENT, goto=worker_node)）把控制权从
      Supervisor 子图交回父图对应节点；执行完再由 finalize 节点封装结果回 Supervisor。
    - checkpointer 按 thread_id（persona_id:conversation_id）持久化整张图状态，
      因此中断（interrupt）恢复、多轮对话、服务重启都能从检查点续跑。
    """

    builder = StateGraph(PersonaWorkflowState, context_schema=PersonaAgentContext)
    builder.add_node("persona_supervisor", _supervisor_agent(model))
    # intent_route 保留为兼容节点，但不再位于主入口；意图漏斗只提供提示和搜索安全门禁，
    # 所有专项任务必须先经过 Core Agent 的信息收集和结构化 handoff。
    builder.add_node("intent_route", _intent_route)
    builder.add_node("supervisor_dispatch", _supervisor_dispatch)
    builder.add_node("supervisor_collect", _supervisor_collect)
    # Structured RVC waiting/failure results terminate without a second Core
    # generation pass, which is what previously produced hallucinated success
    # messages. A named node keeps graph introspection compatibility intact.
    builder.add_node("rvc_wait_boundary", lambda _state: {})
    builder.add_edge("rvc_wait_boundary", END)
    builder.add_conditional_edges(
        "supervisor_dispatch",
        _dispatch_route,
        {
            **{worker_node_name(worker): worker_node_name(worker) for worker in WORKERS},
            "persona_supervisor": "persona_supervisor",
        },
    )
    builder.add_edge(START, "persona_supervisor")
    builder.add_edge("persona_supervisor", END)
    builder.add_edge("supervisor_collect", "persona_supervisor")
    # 每个 Worker 都经过 finalize 节点：清理 active_worker、把 Worker 的原始输出封装成
    # 结构化交接结果（knowledge 走 JSON 合同，其余走文本摘要），再回到 persona_supervisor
    # 生成最终答复；图中不存在 Worker 直达 END 的边，保证所有对外回复都过 Supervisor。
    for worker in WORKERS:
        worker_node = worker_node_name(worker)
        finalize_node = f"finalize_{worker}"
        if worker == "knowledge_worker":
            builder.add_node(
                worker_node,
                _knowledge_subgraph(
                    model,
                    knowledge_executor,
                    structured_executor,
                    web_search_executor,
                    web_rag_executor,
                ),
            )
        else:
            builder.add_node(worker_node, _worker_agent(worker, model))
        builder.add_node(finalize_node, _finalize_worker(worker))
        builder.add_edge(worker_node, finalize_node)
        # Keep a named persona_supervisor branch for legacy graph introspection while
        # selecting supervisor_collect at runtime. This preserves the explicit
        # Worker -> Supervisor collect boundary without reintroducing a direct
        # Worker -> Core shortcut.
        builder.add_conditional_edges(
            finalize_node,
            _after_finalize_route,
            {
                "supervisor_collect": "supervisor_collect",
                "rvc_wait_boundary": "rvc_wait_boundary",
                # Kept as an introspection/legacy branch; the router selects
                # rvc_wait_boundary for RVC non-terminal states above.
                "persona_supervisor": "persona_supervisor",
            },
        )
    return builder.compile(checkpointer=checkpointer, name="persona_workflow")
