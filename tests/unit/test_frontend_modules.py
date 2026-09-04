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
    assert 'integrations: { view: "integrations-workbench"' in script
    assert 'capabilities: { view: "capabilities"' in script
    assert 'role: { view: "role", init: initRoleWorkbench }' in script
    assert 'knowledge: { view: "knowledge", init: initKnowledgeWorkbench' in script
    assert 'await callModule("create")' in script
    assert 'await callModule("manage")' in script
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


def test_chat_upload_request_is_explicit_and_reply_final_clears_stage():
    script = read_script("chat")
    assert 'event.type === "upload.request"' in script
    assert 'event.kind === "upload_request"' in script
    assert "purpose === \"voice_material\"" in script
    assert 'body.textContent = event.answer || ""' in script
    assert 'delete body.dataset.stage' in script


def test_chat_stage_ui_never_uses_reply_body_as_progress_surface():
    script = read_script("chat")
    assert "function setStageBubbleState" not in script
    assert "function showThinkingIndicator" not in script
    assert "setStageBubbleState(" not in script
    assert "showThinkingIndicator(" not in script
    assert 'setReplyStage(node, "正在分析请求…")' in script
    realtime_stage = script.split('if (event.type === "agent.stage")', 1)[1].split(
        '} else if (event.type === "text.delta")', 1
    )[0]
    stream_stage = script.split('if (event.kind === "stage")', 1)[1].split(
        '} else if (event.kind === "token")', 1
    )[0]

    assert "body.dataset.stage" not in realtime_stage
    assert "body.dataset.stage" not in stream_stage


def test_confirmation_arguments_are_human_readable():
    script = read_script("chat")
    renderer = script.split("function renderConfirmation()", 1)[1].split(
        "\nasync function resumeAgent", 1
    )[0]

    assert "JSON.stringify(action.arguments || {})" not in renderer
    assert "Object.entries(actionArguments)" in renderer
    assert '${key}：${' in renderer


def test_backend_marks_voice_clone_material_request():
    graph = (ROOT / "agents" / "graph" / "build.py").read_text(encoding="utf-8")
    voice_tool = (ROOT / "agents" / "tools" / "voice_clone.py").read_text(encoding="utf-8")
    service = (ROOT / "agents" / "service.py").read_text(encoding="utf-8")
    realtime = (ROOT / "app" / "routers" / "realtime.py").read_text(encoding="utf-8")
    api = (ROOT / "app" / "routers" / "agents.py").read_text(encoding="utf-8")
    assert '"kind": "clone_session", "action": "request_voice_material"' in graph
    assert '"action": "voice_session_created"' in voice_tool
    assert 'if payload.get("kind") == "clone_session":' in service
    assert 'upload.request' in realtime
    assert 'upload_request' in api
    assert '"session_id": event["session_id"]' in api
    assert 'session_id=event["session_id"]' in realtime


def test_chat_history_response_cannot_replace_an_active_stream():
    script = read_script("chat")
    history_loader = script.split("async function loadConversationMessages()", 1)[1].split(
        "async function clearConversation()", 1
    )[0]

    assert "chatRenderVersion" in history_loader
    assert "personaId" in history_loader
    assert "conversationId" in history_loader
    assert "return" in history_loader


def test_eval_case_rendering_does_not_use_innerhtml():
    script = read_script("personas")
    renderer = script.split("function renderEvalCases(", 1)[1].split(
        "async function pollEvalResult()", 1
    )[0]

    assert "innerHTML" not in renderer
    assert "replaceChildren(...list.slice(0, VISIBLE_CASES))" in renderer
    assert "expand.replaceWith(...list.slice(VISIBLE_CASES))" in renderer
    assert "flagsNode.append(flag)" in renderer


def test_rvc_conversion_uses_managed_file_json_and_task_progress_field():
    script = read_script("rvc-studio")
    submitter = script.split("async function startRvcConversion()", 1)[1].split("function pollTask", 1)[0]
    poller = script.split("function pollTask", 1)[1].split("function finishRvcResult", 1)[0]

    assert "session_id" in submitter
    assert "input_file_id" in submitter
    assert '"Content-Type":"application/json"' in submitter
    assert "JSON.stringify" in submitter
    assert "/sessions/${rvcSessionId}/files/" not in submitter
    assert "task.progress_percent??task.progress" in poller.replace(" ", "")


def test_rvc_page_uses_its_responsive_layout_contract():
    view = (ROOT / "static" / "views" / "rvc.html").read_text(encoding="utf-8")
    styles = (ROOT / "static" / "styles.css").read_text(encoding="utf-8")

    assert 'class="rvc-page-shell"' in view
    assert 'class="rvc-page-header"' in view
    assert 'class="rvc-workbench"' in view
    assert 'class="rvc-main-column rvc-form-column"' in view
    assert 'class="rvc-status-dot"' in view
    assert ".rvc-actions" in styles
    assert ".rvc-stems" in styles



def test_chat_workbench_exposes_workflow_sidebar_without_guessing_normal_chat():
    script = read_script("chat")
    html = (ROOT / "static" / "views" / "chat.html").read_text(encoding="utf-8")
    styles = (ROOT / "static" / "styles.css").read_text(encoding="utf-8")

    assert 'id="chat-context-sidebar"' in html
    assert 'id="chat-workflow-canvas"' in html
    assert 'function consumeWorkflowEvent(event)' in script
    assert 'kind === "workflow_update"' in script
    assert 'const showEntry = hasTask || hasAttention;' in script
    assert '@media (max-width: 780px)' in styles
    assert 'prefers-reduced-motion: reduce' in styles
