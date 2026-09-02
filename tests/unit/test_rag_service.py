import pytest

from rag.contracts import RagEvidenceResult, RagQueryContext
from rag.service import RagRequest, RagResult, RagService


def test_rag_service_validates_question_and_returns_typed_result():
    context = RagQueryContext("persona-a", "local-default", ("space-a",))
    expected = RagResult.empty("No indexed evidence")
    service = RagService(lambda request, on_step=None: expected)

    assert service.query(RagRequest("facts", context)) == expected
    with pytest.raises(ValueError, match="question must not be empty"):
        service.query(RagRequest("   ", context))


def test_empty_result_is_fail_closed():
    result = RagResult.empty("insufficient evidence")

    assert result.confidence == 0.0
    assert result.grounded is False
    assert result.useful is False
    assert result.missing_points == ("insufficient evidence",)


def test_evidence_result_only_accepts_grounded_and_useful_answers():
    accepted = RagEvidenceResult.from_rag_result(
        RagResult(
            answer_draft="supported answer",
            evidence=({"content": "source"},),
            confidence=0.9,
            used_web_search=False,
            trace=({"node": "quality_gate"},),
            grounded=True,
            useful=True,
            missing_points=(),
        )
    )
    rejected = RagEvidenceResult.from_rag_result(
        RagResult(
            answer_draft="unsupported draft",
            evidence=({"content": "weak source"},),
            confidence=0.3,
            used_web_search=False,
            trace=({"node": "quality_gate"},),
            grounded=False,
            useful=True,
            missing_points=("missing cause",),
        )
    )

    assert accepted.status == "accepted"
    assert accepted.answer == "supported answer"
    assert rejected.status == "insufficient"
    assert rejected.answer == ""
    assert rejected.evidence == ()
    assert rejected.missing_points == ("missing cause",)


def test_simple_pipeline_is_rejected_so_rag_cannot_bypass_quality_chain():
    from rag.service import create_rag_service

    settings = type("Settings", (), {"rag_pipeline": "simple"})()

    with pytest.raises(ValueError, match="simple.*not supported"):
        create_rag_service(settings)


def test_rag_evidence_citations_preserve_web_url_and_evidence_role():
    from rag.contracts import RagEvidenceResult
    from rag.service import RagResult

    result = RagEvidenceResult.from_rag_result(
        RagResult(
            answer_draft="answer",
            evidence=({
                "title": "来源",
                "url": "https://example.test/source",
                "evidence_role": "primary",
            },),
            confidence=0.9,
            used_web_search=True,
            trace=(),
            grounded=True,
            useful=True,
            missing_points=(),
        )
    )

    assert result.citations == ({
        "title": "来源",
        "url": "https://example.test/source",
        "evidence_role": "primary",
    },)


def test_rag_service_injects_factory_settings_into_request(monkeypatch, tmp_path):
    from dataclasses import replace

    import rag.adaptive_graph as adaptive_graph
    from rag.service import RagRequest, RagResult, create_rag_service
    from settings import Settings

    captured = {}

    def fake_run(request, on_step=None):
        captured["settings"] = request.settings
        return RagResult.empty("ok")

    monkeypatch.setattr(adaptive_graph, "run_adaptive", fake_run)
    selected = replace(Settings.load(tmp_path), rag_pipeline="adaptive")
    service = create_rag_service(selected)

    service.query(RagRequest("问题", type("Context", (), {})()))

    assert captured["settings"] is selected


def test_rag_error_contract_is_stable_and_does_not_expose_exception_text():
    from rag.contracts import RagErrorCode, public_rag_error_message

    result = RagResult.failed(RagErrorCode.FAILED_GENERATION)
    evidence = RagEvidenceResult.from_rag_result(result)

    assert result.error_code == "failed_generation"
    assert result.error_message == public_rag_error_message("failed_generation")
    assert evidence.status == "failed"
    assert evidence.answer == ""
    assert evidence.evidence == ()
    assert evidence.error_code == "failed_generation"
    assert "Traceback" not in (evidence.error_message or "")


def test_rag_service_converts_unexpected_runner_exception_to_dependency_error():
    service = RagService(lambda request, on_step=None: (_ for _ in ()).throw(RuntimeError("private backend detail")))
    context = RagQueryContext("persona-a", "local-default", ("space-a",))

    result = service.query(RagRequest("facts", context))

    assert result.error_code == "dependency_unavailable"
    assert result.error_message == "知识服务依赖暂时不可用，请稍后重试。"
    assert result.answer_draft == ""


def test_specialist_result_forwards_rag_error_as_shared_error_object():
    from agents.contracts import SpecialistResult
    from rag.contracts import RagErrorCode

    result = SpecialistResult.from_rag_evidence(
        RagEvidenceResult.from_rag_result(RagResult.failed(RagErrorCode.FAILED_RETRIEVAL))
    ).as_dict()

    assert result["status"] == "failed"
    assert result["error"] == {
        "code": "failed_retrieval",
        "message": "知识检索暂时失败，请稍后重试。",
    }
