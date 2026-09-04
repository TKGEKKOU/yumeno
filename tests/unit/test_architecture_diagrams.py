from pathlib import Path

from agents.graph.diagram import (
    knowledge_subgraph_mermaid,
    native_knowledge_mermaid,
    parent_graph_mermaid,
)
from agents.graph.state import WORKERS
from agents.workflow import build_persona_workflow

ROOT = Path(__file__).resolve().parents[2]
README = (ROOT / "README.md").read_text(encoding="utf-8")
DIAGRAM_README = (ROOT / "diagrams" / "README.md").read_text(encoding="utf-8")
DIAGRAM_STEMS = (
    "yumeno-system-context",
    "yumeno-multi-agent",
    "yumeno-worker-registry",
    "yumeno-runtime-lifecycle",
    "yumeno-knowledge-subgraph",
    "yumeno-rvc-workflow",
    "yumeno-resource-boundary",
)
README_STEMS = DIAGRAM_STEMS[:5]


def _mmd(stem: str) -> str:
    return (ROOT / "diagrams" / f"{stem}.mmd").read_text(encoding="utf-8").strip()


def test_parent_mermaid_covers_compiled_nodes():
    mermaid = parent_graph_mermaid()
    graph = build_persona_workflow(model=None, checkpointer=None)
    names = set(graph.get_graph().nodes) - {"__start__", "__end__"}
    for name in names:
        assert name in mermaid or name.replace("_worker", " Worker") in mermaid or name.replace("_worker", " 子图") in mermaid, name
    for worker in WORKERS:
        assert f"delegate_to_{worker}" in mermaid
        assert f"finalize_{worker}" in mermaid


def test_checked_in_parent_mmd_matches_generator():
    assert parent_graph_mermaid().strip() == _mmd("yumeno-multi-agent")
    assert knowledge_subgraph_mermaid().strip() == _mmd("yumeno-knowledge-subgraph")


def test_readme_and_diagram_index_have_expected_layers():
    assert README.count("```mermaid") == len(README_STEMS)
    assert DIAGRAM_README.count("```mermaid") == len(DIAGRAM_STEMS)
    for stem in README_STEMS:
        assert _mmd(stem) in README, stem
    for stem in DIAGRAM_STEMS:
        assert _mmd(stem) in DIAGRAM_README, stem


def test_architecture_files_use_unique_parent_node_ids():
    mermaid = parent_graph_mermaid()
    assert "D[document_worker]" not in mermaid
    assert "C[config_worker]" not in mermaid
    assert "START([START]) --> S[persona_supervisor" in mermaid
    assert "START([START]) --> R[intent_route" not in mermaid


def test_native_knowledge_export_matches_compiled_subgraph():
    mermaid = native_knowledge_mermaid().replace(" ", "")
    assert "knowledge_planner-->knowledge_retrieve" in mermaid
    assert "knowledge_retrieve-->knowledge_fallback" in mermaid
    assert "create_agent" not in mermaid
