import pytest

from rag.contracts import RagQueryContext


@pytest.fixture
def rag_context():
    return RagQueryContext("persona-a", "local-default", ("space-a",))


def test_retrieve_node_passes_server_context(monkeypatch, rag_context):
    from rag.adaptive_graph import retrieve_node

    captured = {}

    class FakeRetriever:
        def invoke(self, query):
            captured["query"] = query
            return []

    monkeypatch.setattr(
        "rag.adaptive_graph.build_retriever",
        lambda context, k=4: captured.update(context=context) or FakeRetriever(),
    )
    state = retrieve_node(
        {"question": "facts", "query": "facts", "context": rag_context}
    )

    assert captured == {"context": rag_context, "query": "facts"}
    assert state["documents"] == []


def test_empty_evidence_rewrites_then_uses_web_fallback():
    from rag.adaptive_graph import decide_after_batch_grade

    assert decide_after_batch_grade({"documents": [object()]}, 2, True) == "generate"
    assert decide_after_batch_grade({"documents": [], "rewrite_count": 0}, 2, True) == "rewrite_query"
    assert decide_after_batch_grade({"documents": [], "rewrite_count": 2}, 2, True) == "web_search"
    assert decide_after_batch_grade(
        {"documents": [], "rewrite_count": 2, "used_web_search": True}, 2, True
    ) == "no_answer"
    assert decide_after_batch_grade(
        {"documents": [], "irrelevant_after_rerank": True, "rewrite_count": 0}, 2, True
    ) == "no_answer"


def test_quality_failure_has_bounded_retry_and_feedback():
    from rag.adaptive_graph import decide_quality, prepare_correction_node

    state = {
        "grounded": False,
        "useful": False,
        "correction_action": "regenerate",
        "generation_retry_count": 0,
        "missing_points": ["时间范围"],
        "unsupported_claims": ["未经资料支持的结论"],
        "answer": "old",
    }
    assert decide_quality(state, max_generation_retry=1) == "prepare_correction"
    corrected = prepare_correction_node(state)
    assert corrected["generation_retry_count"] == 1
    assert "时间范围" in corrected["correction_feedback"]
    assert "未经资料支持的结论" in corrected["correction_feedback"]
    assert decide_quality(corrected, max_generation_retry=1) == "no_answer"


def test_high_confidence_answer_still_runs_answer_level_quality_gate(monkeypatch):
    from langchain_core.documents import Document
    from rag.adaptive_graph import quality_gate_node

    calls = []

    monkeypatch.setattr(
        "rag.adaptive_graph.grade_answer_quality",
        lambda *args: calls.append(args) or type(
            "Score",
            (),
            {
                "grounded": False,
                "useful": False,
                "missing_points": ["回答包含资料未提及的事实"],
                "unsupported_claims": ["资料未说明的结论"],
                "correction_action": "no_answer",
            },
        )(),
    )

    result = quality_gate_node(
        {
            "question": "格式要求是什么",
            "documents": [Document(page_content="正文小四，1.3倍行距")],
            "answer": "正文使用小四，行距为1.3倍。",
            "confidence": 0.9,
        }
    )

    assert len(calls) == 1
    assert result["grounded"] is False
    assert result["useful"] is False
    assert result["unsupported_claims"] == ["资料未说明的结论"]
    assert result["correction_action"] == "no_answer"


def test_reranker_uses_rewritten_query_instead_of_original_question(monkeypatch):
    from langchain_core.documents import Document
    from rag.adaptive_graph import batch_grade_documents_node

    captured = {}

    class Reranker:
        def score_pairs(self, query, documents):
            captured["query"] = query
            return [0.9 for _ in documents]

    monkeypatch.setattr("rag.adaptive_graph.get_managed_reranker", lambda *args: Reranker())
    result = batch_grade_documents_node(
        {
            "question": "原始口语问题",
            "query": "补充实体后的检索问题",
            "documents": [Document(page_content="相关资料")],
            "retrieval_config": {"profile": "precise"},
            "trace": [],
        }
    )

    assert captured["query"] == "补充实体后的检索问题"
    assert result["documents"]


def test_interaction_router_keeps_chat_and_capabilities_out_of_rag():
    from rag.interaction_router import route_interaction

    assert route_interaction("你好", True) == "conversation"
    assert route_interaction("你会调用哪些 tools", True) == "capability"
    assert route_interaction("根据资料说明她的经历", True) == "knowledge"
    assert route_interaction("今天北京天气", True) == "web"


def test_interaction_router_respects_negation_and_realtime_priority(monkeypatch):
    from rag.interaction_router import route_interaction

    monkeypatch.setattr(
        "rag.interaction_router.classify_ambiguous",
        lambda question: "conversation",
    )

    assert route_interaction("不要查资料，直接陪我聊聊", True) == "conversation"
    assert route_interaction("你今天觉得北京天气怎么样？", True) == "web"
    assert route_interaction("根据角色资料说明她的经历，再查今天北京天气", True) == "knowledge"


def test_persona_knowledge_question_does_not_fallback_to_web_without_explicit_request():
    from rag.interaction_router import route_interaction_for_tests as route_interaction

    assert route_interaction("梦限大的薇欧拉", True) == "knowledge"
    assert route_interaction("继续", True) == "knowledge"


def test_force_knowledge_bypasses_conversation_routing(rag_context):
    from rag.adaptive_graph import route_query_node

    state = route_query_node(
        {"question": "你好", "context": rag_context, "force_knowledge": True}
    )

    assert state["interaction_mode"] == "knowledge"
    assert state["datasource"] == "vectorstore"


def test_greeting_uses_persona_without_retrieval(monkeypatch, rag_context):
    from rag.adaptive_graph import run_adaptive
    from rag.service import RagRequest

    monkeypatch.setattr(
        "rag.adaptive_graph.generate_persona_reply",
        lambda name, profile, question: f"{name}:{profile['description']}:{question}",
    )
    monkeypatch.setattr(
        "rag.adaptive_graph.build_retriever",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("should not retrieve")),
    )

    result = run_adaptive(
        RagRequest(
            "你好",
            rag_context,
            persona_name="爱弥斯",
            persona_profile={"description": "活泼俏皮"},
        )
    )

    assert result.answer_draft == "爱弥斯:活泼俏皮:你好"
    assert result.interaction_mode == "conversation"
    assert [step["node"] for step in result.trace] == ["route_query", "persona_chat"]


def test_capability_question_reports_actual_empty_tool_manifest(rag_context):
    from rag.adaptive_graph import run_adaptive
    from rag.service import RagRequest

    result = run_adaptive(RagRequest("你会调用哪些tools", rag_context, persona_name="爱弥斯"))

    assert "没有已启用的工具" in result.answer_draft
    assert result.interaction_mode == "capability"
    assert result.evidence == ()


def test_rag_generation_always_receives_persona_profile(monkeypatch):
    from rag import generate

    captured = {}
    monkeypatch.setattr(
        generate,
        "_invoke_generation",
        lambda prompt, values: captured.update(values) or "answer",
    )

    answer = generate.generate_answer(
        "她有什么经历？",
        [],
        persona_name="爱弥斯",
        persona_profile={"description": "活泼俏皮的数据幽灵"},
    )

    assert answer == "answer"
    assert captured["persona_name"] == "爱弥斯"
    assert "活泼俏皮" in captured["persona_profile"]


def test_prefetched_web_evidence_uses_rag_quality_chain(monkeypatch, rag_context):
    from langchain_core.documents import Document
    from rag.adaptive_graph import run_adaptive
    from rag.service import RagRequest

    monkeypatch.setattr(
        "rag.adaptive_graph.get_managed_reranker",
        lambda *args, **kwargs: type("Reranker", (), {"score_pairs": lambda self, q, docs: [0.95 for _ in docs]})(),
    )
    monkeypatch.setattr(
        "rag.adaptive_graph.generate_answer",
        lambda *args, **kwargs: "由公开资料支持的回答",
    )
    monkeypatch.setattr(
        "rag.adaptive_graph.grade_answer_quality",
        lambda *args, **kwargs: type(
            "Score",
            (),
            {
                "grounded": True,
                "useful": True,
                "missing_points": [],
                "unsupported_claims": [],
                "correction_action": "no_answer",
            },
        )(),
    )
    monkeypatch.setattr(
        "rag.adaptive_graph.build_retriever",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("prefetched web evidence must not retrieve local docs again")),
    )

    result = run_adaptive(
        RagRequest(
            "查询公开资料",
            rag_context,
            persona_name="Ames",
            force_knowledge=True,
            prefetched_web_documents=(
                {"title": "来源", "url": "https://example.test", "content": "公开事实"},
            ),
        )
    )

    nodes = [step["node"] for step in result.trace]
    assert nodes[:3] == ["route_query", "web_search", "batch_grade_documents"]
    assert "generate" in nodes
    assert "quality_gate" in nodes
    assert result.used_web_search is True


def test_web_evidence_without_relevant_documents_fails_closed():
    from rag.adaptive_graph import decide_after_batch_grade

    assert decide_after_batch_grade(
        {"documents": [], "used_web_search": True, "rewrite_count": 0},
        max_rewrite_count=2,
        enable_web_fallback=True,
    ) == "no_answer"


def test_retrieval_failure_is_fail_closed_with_public_error_contract(monkeypatch, rag_context):
    from rag.adaptive_graph import retrieve_node

    monkeypatch.setattr(
        "rag.adaptive_graph.build_retriever",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("Milvus secret endpoint")),
    )

    state = retrieve_node({"question": "facts", "query": "facts", "context": rag_context})

    assert state["error_code"] == "failed_retrieval"
    assert state["error_message"] == "知识检索暂时失败，请稍后重试。"
    assert state["documents"] == []
    assert "Milvus" not in state["error_message"]


def test_error_state_does_not_enter_rewrite_or_generation():
    from rag.adaptive_graph import decide_after_batch_grade, decide_quality

    state = {"error_code": "failed_quality_gate", "documents": [], "rewrite_count": 0}
    assert decide_after_batch_grade(state, 3, True) == "no_answer"
    assert decide_quality(state, 3, 3, True) == "no_answer"
