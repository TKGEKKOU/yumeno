from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def test_knowledge_workbench_has_real_dashboard_and_query_path():
    html = (ROOT / "static/views/knowledge.html").read_text(encoding="utf-8")
    script = (ROOT / "static/js/knowledge-workbench.js").read_text(encoding="utf-8")
    assert 'id="knowledge-dashboard-root"' in html
    assert '"/api/personas"' in script
    assert '/documents/report' in script
    assert '/rag/query' in script
    assert 'knowledgeDashboard' in script
    assert 'workbench-placeholder' not in html.split('data-workbench-panel="knowledge-overview"', 1)[1].split('data-workbench-panel="knowledge-eval"', 1)[0]

def test_deep_links_map_to_workbench_and_tab():
    script = (ROOT / "static/js/app.js").read_text(encoding="utf-8")
    for deep_link, view in (("role-create", "role"), ("voice-rvc", "voice"), ("knowledge-eval", "knowledge"), ("system-providers", "system")):
        assert f'"{deep_link}": "{view}"' in script
    assert "function parseLocation()" in script
    assert "history.replaceState(null, \"\", canonicalHash(view, target))" in script

def test_legacy_provider_links_are_migrated_to_system_tab():
    for path in (ROOT / "static").rglob("*.html"):
        html = path.read_text(encoding="utf-8")
        assert 'href="#providers"' not in html


def test_workbench_uses_real_storage_summary_and_no_voice_asset_placeholder():
    system = (ROOT / "static/views/system.html").read_text(encoding="utf-8")
    storage_script = (ROOT / "static/js/system-workbench.js").read_text(encoding="utf-8")
    voice = (ROOT / "static/views/voice-workbench.html").read_text(encoding="utf-8")
    assert 'id="system-storage-root"' in system
    assert 'fetch("/api/status"' in storage_script
    assert 'data-workbench-tab="voice-rvc"' in voice
    assert 'data-workbench-panel="voice-asset"><div class="section-card workbench-placeholder"' not in voice
    assert '不会从这里删除用户模型' in storage_script


def test_workbench_public_api_does_not_shadow_internal_tab_applier():
    script = (ROOT / "static/js/app.js").read_text(encoding="utf-8")
    assert "function applyWorkbenchTab(workbench, target)" in script
    assert "return applyWorkbenchTab(workbench, target);" in script
    assert "function setWorkbenchTab(workbench, target)" not in script
    assert "bindWorkbenchCapture" not in script
    assert "function bindWorkbenchEvents" not in script
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read_view(name: str) -> str:
    return (ROOT / "static" / "views" / name).read_text(encoding="utf-8")


def test_workbench_navigation_matches_reduced_information_architecture():
    role = read_view("role.html")
    voice = read_view("voice-workbench.html")
    knowledge = read_view("knowledge.html")
    integrations = read_view("integrations-workbench.html")
    system = read_view("system.html")
    capabilities = read_view("capabilities.html")

    assert 'data-workbench-tab="role-overview"' not in role
    assert 'data-workbench-tab="role-create"' in role
    assert 'data-workbench-tab="role-manage"' in role
    assert 'data-workbench-tab="voice-gpt-sovits"' in voice
    assert 'data-workbench-tab="voice-rvc"' in voice
    assert 'data-workbench-tab="voice-asset"' not in voice
    assert 'data-workbench-tab="voice-library"' not in voice
    assert 'data-workbench-tab="knowledge-overview"' in knowledge
    assert 'data-workbench-tab="knowledge-eval"' in knowledge
    assert 'data-workbench-tab="knowledge-documents"' not in knowledge
    assert 'data-workbench-tab="integration-overview"' not in integrations
    assert 'data-workbench-tab="integration-qq"' in integrations
    assert 'data-workbench-tab="system-overview"' in system
    assert 'data-workbench-tab="system-providers"' in system
    assert 'data-workbench-tab="system-runtime"' not in system
    assert 'data-workbench-tab="system-storage"' not in system
    assert 'class="workspace-tabs"' not in capabilities


def test_removed_tabs_keep_legacy_links_but_map_to_live_defaults():
    script = (ROOT / "static" / "js" / "app.js").read_text(encoding="utf-8")
    assert '"role-overview": "role-create"' in script
    assert '"voice-service": "voice-gpt-sovits"' in script
    assert '"voice-asset": "voice-gpt-sovits"' in script
    assert '"voice-library": "voice-gpt-sovits"' in script
    assert '"knowledge-documents": "knowledge-overview"' in script
    assert '"knowledge-space": "knowledge-overview"' in script
    assert '"knowledge-retrieval": "knowledge-overview"' in script
    assert '"integration-overview": "integration-qq"' in script
    assert '"system-runtime": "system-overview"' in script
    assert '"system-storage": "system-overview"' in script


def test_system_overview_is_the_real_status_surface():
    system = read_view("system.html")
    assert 'id="settings-system-status"' in system
    assert 'id="system-storage-root"' in system
    assert 'data-workbench-panel="system-runtime"' not in system
    assert 'data-workbench-panel="system-storage"' not in system

def test_voice_training_library_is_kept_inside_gpt_sovits_workbench():
    voice = read_view("voice-workbench.html")
    assert 'data-workbench-panel="voice-gpt-sovits"' in voice
    gpt = voice.split('data-workbench-panel="voice-gpt-sovits"', 1)[1].split('data-workbench-panel="voice-rvc"', 1)[0]
    assert 'id="voice-library"' in gpt
    assert 'id="voice-library-count"' in gpt
    assert 'id="voice-library-status"' in gpt


def test_capability_manager_exposes_stable_user_facing_tabs():
    app = (ROOT / "frontend/src/extensions/App.vue").read_text(encoding="utf-8")
    assert ':data-capability-tab="tab.id"' in app
    assert 'id: "skills"' in app
    assert 'id: "mcp"' in app
    assert 'id: "tools"' in app
    assert 'id: "catalog"' in app
    assert '工具与权限' in app
    assert '扩展管理' in app


def test_knowledge_dashboard_owns_document_upload_and_lifecycle_actions():
    script = read_script("knowledge-workbench") if "read_script" in globals() else (ROOT / "static/js/knowledge-workbench.js").read_text(encoding="utf-8")
    assert "/api/knowledge-spaces/" in script and "/documents/upload" in script
    assert "FormData" in script
    assert "/retry-index" in script
    assert "method: \"DELETE\"" in script
    assert "上传资料" in script
