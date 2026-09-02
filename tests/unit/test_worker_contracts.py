from agents.contracts import SpecialistResult, WorkerManifest, WorkerRetryPolicy
from agents.registry import tool_specs, worker_manifest, worker_manifests
from agents.runtime.models import AgentResult


def test_worker_manifests_are_derived_from_registered_tools():
    manifests = worker_manifests()
    assert [manifest.name for manifest in manifests] == [
        "knowledge",
        "memory",
        "document",
        "profile",
        "voice",
        "rvc_worker",
        "live2d",
        "config_worker",
    ]

    specs = tool_specs()
    for manifest in manifests:
        owned = tuple(spec for spec in specs if spec.specialist == manifest.name)
        assert manifest.tools == tuple(spec.name for spec in owned)
        assert manifest.capabilities == tuple(f"builtin/{spec.name}" for spec in owned)
        assert manifest.mutating_operations == tuple(
            spec.name for spec in owned if spec.mutates_data
        )
        assert "worker" in manifest.output_schema["required"]
        assert manifest.as_dict()["retry_policy"]["max_attempts"] >= 1


def test_worker_manifest_is_explicit_and_rejects_unknown_workers():
    manifest = worker_manifest("memory")
    assert manifest.description
    assert manifest.input_schema["required"] == ["request"]
    assert manifest.timeout_seconds > 0
    assert manifest.read_only is False
    assert manifest.requires_confirmation is True

    try:
        worker_manifest("not-a-worker")
    except KeyError as exc:
        assert "not-a-worker" in str(exc)
    else:
        raise AssertionError("unknown worker should fail explicitly")


def test_worker_manifest_retry_policy_validates_execution_bounds():
    assert WorkerRetryPolicy(max_attempts=2, backoff_seconds=0.5).max_attempts == 2
    for kwargs in ({"max_attempts": 0}, {"backoff_seconds": -1}):
        try:
            WorkerRetryPolicy(**kwargs)
        except ValueError:
            pass
        else:
            raise AssertionError("invalid retry policy should fail")

    for kwargs in (
        {"name": "", "description": "x"},
        {"name": "x", "description": "x", "timeout_seconds": 0},
    ):
        try:
            WorkerManifest(**kwargs)
        except ValueError:
            pass
        else:
            raise AssertionError("invalid manifest should fail")


def test_agent_result_has_one_shared_worker_contract_and_legacy_aliases():
    result = AgentResult(
        run_id="run-1",
        worker="knowledge",
        status="accepted",
        answer="有证据的回答",
        evidence=[{"filename": "设定.md"}],
        artifacts=[{"kind": "report", "id": "artifact-1"}],
        confidence=0.9,
    )

    assert result.specialist == "knowledge"
    payload = result.as_worker_dict()
    assert "run_id" not in payload
    assert payload["worker"] == "knowledge"
    assert payload["specialist"] == "knowledge"
    assert payload["artifacts"] == [{"kind": "report", "id": "artifact-1"}]
    assert payload["error"] is None


def test_specialist_result_emits_the_shared_contract_fields():
    payload = SpecialistResult(
        specialist="memory",
        status="confirmation_required",
        answer="",
        pending_action={"tool": "save_persona_memory"},
    ).as_dict()

    assert payload["worker"] == "memory"
    assert payload["specialist"] == "memory"
    assert payload["requires_approval"] is True
    assert payload["artifacts"] == []
    assert payload["error"] is None


def test_voice_and_live2d_tools_have_single_domain_owners():
    from agents.registry import specialist_for_tool, tools_for_specialist

    voice_tools = {tool.name for tool in tools_for_specialist("voice")}
    live2d_tools = {tool.name for tool in tools_for_specialist("live2d")}

    assert {
        "start_voice_clone_session",
        "list_voice_assets",
        "get_voice_system_status",
    } <= voice_tools
    assert {
        "list_live2d_models",
        "get_live2d_vts_config",
        "open_live2d_model_directory",
    } <= live2d_tools
    assert specialist_for_tool("start_voice_clone_session") == "voice"
    assert specialist_for_tool("list_live2d_models") == "live2d"
    assert specialist_for_tool("start_voice_clone_session") != "voice_clone"