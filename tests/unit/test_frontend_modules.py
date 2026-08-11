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
