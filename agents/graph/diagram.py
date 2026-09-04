"""Architecture mermaid for README and docs.

LangGraph 原生 ``get_graph().draw_mermaid()`` 只能画出静态边
``START -> persona_supervisor -> END``。Worker 路由走 Command/handoff，
所以编译后的父图导出是残缺的。这里按 ``WORKERS`` 重建运行时拓扑；
knowledge 子图没有 handoff，可以直接从编译图导出。
"""

from __future__ import annotations

from agents.graph.state import WORKERS

_WORKER_NODES = {
    "knowledge_worker": ("K", "knowledge_worker 子图"),
    "memory_worker": ("M", "memory_worker"),
    "document_worker": ("D", "document_worker"),
    "profile_worker": ("P", "profile_worker"),
    "voice_worker": ("V", "voice_worker"),
    "rvc_worker": ("RV", "rvc_worker Worker"),
    "live2d_worker": ("L", "live2d_worker"),
    "config_worker": ("C", "config_worker Worker"),
}


def parent_graph_mermaid() -> str:
    """Complete parent-graph topology, including handoff edges LangGraph omits."""

    lines = [
        "%% YUMENO 完整 Multi-Agent 父图",
        "%% 强意图由 intent_route 直达 Worker；其余交给 Supervisor",
        "flowchart TD",
        "  START([START]) --> R[intent_route]",
        "  R -->|模糊 / knowledge / web| S[persona_supervisor]",
        "  S -->|直接回答| END([父图 END])",
        "  S -->|需要执行| D[supervisor_dispatch]",
        "  D -->|收集必要输入| C[supervisor_collect]",
        "  C --> S",
    ]
    handoffs: list[str] = ["  R -->|强意图| S"]
    finalizes: list[str] = []
    returns: list[str] = []
    for worker in WORKERS:
        node_id, label = _WORKER_NODES.get(worker, (worker, f"{worker} Worker"))
        handoffs.append(f"  D -->|delegate_to_{worker}| {node_id}[{label}]")
        finalize_id = f"F{node_id}"
        finalizes.append(f"  {node_id} --> {finalize_id}[finalize_{worker}]")
        returns.append(f"  {finalize_id} --> S")
    # RVC 的异步 session 在 finalize 后经过显式边界节点；它是编译父图的
    # 真实节点，必须出现在文档拓扑中，避免 README 图与运行时漂移。
    lines.extend(handoffs)
    lines.extend(finalizes)
    lines.extend(returns)
    lines.append("  FRV --> RW[rvc_wait_boundary]")
    lines.append("  RW --> S")
    return "\n".join(lines) + "\n"


def knowledge_subgraph_mermaid() -> str:
    """Human-readable knowledge subgraph plus its contract return to Supervisor."""

    return (
        "%% knowledge：Planner + 确定性执行，不是 create_agent 工具循环\n"
        "flowchart TD\n"
        "  START([子图 START]) --> P[planner 选择 RAG 或 SQL]\n"
        "  P --> R[retrieve 执行管线]\n"
        "  R --> F[fallback 不足才升级]\n"
        "  F --> SE([子图 END])\n"
        "  SE --> FK[finalize_knowledge]\n"
        "  FK --> S[persona_supervisor]\n"
        "  R -.-> RAG[RAG / 只读 SQL]\n"
        "  F -.-> WEB[拒绝 / HITL / web]\n"
    )


def native_knowledge_mermaid() -> str:
    """LangGraph native export of the compiled knowledge subgraph."""

    from agents.graph.knowledge import _default_web_search_executor, _knowledge_subgraph

    graph = _knowledge_subgraph(None, lambda *_a, **_k: None, lambda *_a, **_k: None, _default_web_search_executor)
    return graph.get_graph().draw_mermaid()


if __name__ == "__main__":
    print(parent_graph_mermaid())
    print(knowledge_subgraph_mermaid())
