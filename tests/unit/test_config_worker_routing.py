from agents.graph.state import WORKERS, canonicalize_worker_name, worker_node_name
from agents.registry import worker_manifest
from agents.intent_funnel import analyze_intents

def test_config_worker_is_canonical_and_config_alias_is_accepted():
    assert "config_worker" in WORKERS
    assert canonicalize_worker_name("config") == "config_worker"
    assert worker_node_name("config") == "config_worker"

def test_config_worker_manifest_is_distinct_from_rvc_worker():
    assert worker_manifest("config_worker").name == "config_worker"
    assert worker_manifest("config_worker").name != worker_manifest("rvc_worker").name

def test_configuration_is_advisory_not_rvc_feature_route():
    result = analyze_intents("检查一下 RVC 是否配置完成")
    assert result.configuration_hint is True
    assert result.configuration_subject == "rvc"
    assert result.requested_action == "status"
