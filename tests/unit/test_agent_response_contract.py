from agents.service import AgentTurnResult
from app.routers.agents import response_for


def test_agent_response_exposes_shared_result_contract_fields():
    response = response_for(
        AgentTurnResult(
            status="failed",
            answer="处理失败",
            specialist="management",
            worker="config",
            artifacts=({"kind": "config_preview"},),
            citations=({"source": "settings"},),
            uncertainties=("配置未应用",),
            error={"code": "approval_required", "message": "需要确认"},
            error_code="approval_required",
            error_message="需要确认",
            worker_results=({"status": "failed"},),
        )
    )

    assert response.status == "failed"
    assert response.worker == "config"
    assert response.artifacts == [{"kind": "config_preview"}]
    assert response.citations == [{"source": "settings"}]
    assert response.uncertainties == ["配置未应用"]
    assert response.error == {"code": "approval_required", "message": "需要确认"}
    assert response.error_code == "approval_required"
    assert response.error_message == "需要确认"
    assert response.worker_results == [{"status": "failed"}]
