from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FRONTEND_CHECK = ROOT / "scripts" / "frontend-route-check.cjs"


def test_playwright_route_check_is_reusable_and_requires_live_server():
    assert FRONTEND_CHECK.exists()
    script = FRONTEND_CHECK.read_text(encoding="utf-8")
    assert "chromium.launch" in script
    assert "static/index.html" in script
    assert "provider-card" in script
    assert "console" in script
