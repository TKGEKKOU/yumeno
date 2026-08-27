from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read_script(name: str) -> str:
    return (ROOT / "static" / "js" / f"{name}.js").read_text(encoding="utf-8")


def test_integrations_module_registers_and_uses_api():
    script = read_script("integrations")
    assert "window.PL.modules.integrations" in script
    assert 'fetch("/api/integrations/bilibili")' in script
    assert 'fetch("/api/integrations/onebot11",' not in script
    assert "renderBilibiliStatus" in script


def test_vue_pages_bridge_registers_extension_and_eval_lifecycles():
    script = read_script("vue-pages-bridge")
    assert "window.PL.modules.plugins" in script
    assert "window.PL.modules.test" in script
    assert "showExtensionsApp" in script
    assert "hideExtensionsApp" in script
    assert "showEvaluationApp" in script
    assert "hideEvaluationApp" in script


def test_settings_mounts_reranker_resource_through_vue_bridge():
    bridge = read_script("vue-pages-bridge")
    settings = read_script("settings")
    view = (ROOT / "static" / "views" / "settings.html").read_text(encoding="utf-8")

    assert 'id="reranker-settings-root"' in view
    assert "mountRerankerSettingsApp" in bridge
    assert "destroyRerankerSettingsApp" in bridge
    assert "window.PL.vuePages?.mountRerankerSettings?.()" in settings


def test_role_inspector_keeps_rag_parameters_without_resource_installer():
    inspector = (ROOT / "frontend" / "src" / "manage" / "components" / "NodeInspector.vue").read_text(encoding="utf-8")

    assert "retrieval_k" in inspector
    assert "evidence_token_budget" in inspector
    assert "RerankerResource" not in inspector


def test_shell_registers_new_module_entries():
    script = (ROOT / "static" / "js" / "app.js").read_text(encoding="utf-8")
    assert 'integrations: { view: "integrations"' in script
    assert 'plugins: { view: "plugins"' in script
    assert 'create: { view: "create"' in script
    assert 'manage: { view: "manage"' in script
    assert 'test: { view: "test"' in script
    assert 'upload: { view: "personas"' not in script


def test_settings_updates_tts_service_card_from_runtime_status():
    script = read_script("settings")
    assert 'renderServiceStatus("tts", "TTS", ttsState, ttsState)' in script
    assert 'status.ready ? "ready"' in script


def test_system_status_uses_current_gpt_sovits_resource_fields():
    script = read_script("common")
    assert "tts.install_dir" in script
    assert "tts.service_running" in script
    assert "tts.api_version" in script


def test_chat_stage_keeps_loading_animation_until_first_token():
    script = read_script("chat")
    realtime_stage = script.split('if (event.type === "agent.stage")', 1)[1].split(
        '} else if (event.type === "text.delta")', 1
    )[0]
    stream_stage = script.split('if (event.kind === "stage")', 1)[1].split(
        '} else if (event.kind === "token")', 1
    )[0]

    assert 'classList.remove("loading-bubble")' not in realtime_stage
    assert 'classList.remove("loading-bubble")' not in stream_stage
    assert 'body.textContent = ""' not in realtime_stage
    assert 'body.textContent = ""' not in stream_stage


def test_chat_history_response_cannot_replace_an_active_stream():
    script = read_script("chat")
    history_loader = script.split("async function loadConversationMessages()", 1)[1].split(
        "async function clearConversation()", 1
    )[0]

    assert "chatRenderVersion" in history_loader
    assert "personaId" in history_loader
    assert "conversationId" in history_loader
    assert "return" in history_loader
