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
    """Return the documented parent graph topology from ``build_persona_workflow``.

    ``intent_route`` remains a compatibility/helper node in the implementation,
    but the compiled workflow starts at ``persona_supervisor``.  Handoff edges
    are represented explicitly because LangGraph's native parent export cannot
    show Command-based transitions clearly.
    """

    lines = [
        "%% YUMENO Supervisor-centric 父图（与 build_persona_workflow 对齐）",
        "flowchart TD",
        "  START([START]) --> S[persona_supervisor\nCore + Supervisor]",
        "  S -->|普通对话 / 已有答案| END([END])",
        "  S -->|需要结构化任务| D[supervisor_dispatch]",
        "  D -->|缺少必要输入| C[supervisor_collect]",
        "  C --> S",
    ]
    for index, worker in enumerate(WORKERS):
        node_id, label = _WORKER_NODES.get(worker, (f"W{index}", f"{worker} Worker"))
        dispatch_id = f"DISPATCH_{index}"
        finalize_id = f"FINALIZE_{index}"
        lines.append(f"  D -->|delegate_to_{worker}| {dispatch_id}[{label}]")
        lines.append(f"  {dispatch_id} --> {finalize_id}[finalize_{worker}]")
        if worker == "rvc_worker":
            lines.append(f"  {finalize_id} --> RW[rvc_wait_boundary]")
            lines.append("  RW -->|终态结果| S")
            lines.append("  RW -.->|等待输入 / 失败结果| END")
        else:
            lines.append(f"  {finalize_id} --> S")
    lines.extend([
        "  S -.-> IR[intent_route\n兼容性意图线索与安全门禁]",
        "  IR -.-> S",
    ])
    return "\n".join(lines) + "\n"


def knowledge_subgraph_mermaid() -> str:
    """Human-readable knowledge subgraph plus its contract return to Supervisor."""

    return (
        "%% knowledge_worker 是 Planner + 确定性检索子图\n"
        "flowchart TD\n"
        "  START([子图 START]) --> P[knowledge_planner\n选择 RAG / SQL / 回退]\n"
        "  P --> R[knowledge_retrieve\n作用域检索管线]\n"
        "  R --> F[knowledge_fallback\n证据不足时策略处理]\n"
        "  F --> END([子图 END])\n"
        "  R --> VEC[(Milvus Lite\nDense / Sparse 向量)]\n"
        "  R --> SQL[(SQLite\n元数据与查询记录)]\n"
        "  F -.-> WEB[联网搜索 / HITL / 拒答]\n"
        "  END --> FINAL[finalize_knowledge_worker]\n"
        "  FINAL --> SUP[persona_supervisor]\n"
    )


def native_knowledge_mermaid() -> str:
    """LangGraph native export of the compiled knowledge subgraph."""

    from agents.graph.knowledge import _default_web_search_executor, _knowledge_subgraph

    graph = _knowledge_subgraph(None, lambda *_a, **_k: None, lambda *_a, **_k: None, _default_web_search_executor)
    return graph.get_graph().draw_mermaid()


if __name__ == "__main__":
    print(parent_graph_mermaid())
    print(knowledge_subgraph_mermaid())
