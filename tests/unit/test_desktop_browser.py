import subprocess
from pathlib import Path

from desktop.browser import (
    app_url,
    edge_candidates,
    open_app,
    setup_fragment,
    wait_and_open,
)


def test_app_url_points_at_local_workbench():
    assert app_url(port=17000) == 'http://127.0.0.1:17000/static/index.html'


def test_app_url_adds_setup_fragment_when_needed():
    assert app_url(port=17000, fragment='providers') == (
        'http://127.0.0.1:17000/static/index.html#providers'
    )


def test_setup_fragment_asks_for_providers_when_llm_is_blank():
    assert setup_fragment(api_key='', base_url='') == 'providers'
    assert setup_fragment(api_key='sk-test', base_url='https://api.example/v1') == ''


def test_open_app_prefers_edge_and_does_not_hide_the_window():
    launched = []

    def runner(command, **kwargs):
        launched.append((command, kwargs))
        return subprocess.CompletedProcess(command, 0)

    edge = Path(r'C:/Program Files/Microsoft/Edge/Application/msedge.exe')
    opened = []
    open_app(
        'http://127.0.0.1:17000/static/index.html',
        runner=runner,
        webbrowser_open=lambda url: opened.append(url),
        exists=lambda path: path == edge,
        environ={
            'ProgramFiles': r'C:/Program Files',
            'ProgramFiles(x86)': r'C:/Program Files (x86)',
            'LOCALAPPDATA': r'C:/Users/demo/AppData/Local',
        },
    )

    assert launched[0][0] == [str(edge), 'http://127.0.0.1:17000/static/index.html']
    assert launched[0][1].get('creationflags', 0) == 0
    assert opened == []


def test_open_app_falls_back_to_default_browser():
    opened = []
    open_app(
        'http://127.0.0.1:17000/static/index.html',
        runner=lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError('no edge')),
        webbrowser_open=lambda url: opened.append(url),
        exists=lambda path: False,
        environ={},
    )
    assert opened == ['http://127.0.0.1:17000/static/index.html']


def test_wait_and_open_polls_health_then_opens():
    calls = []

    def health_get(url, timeout=1):
        calls.append(url)
        if len(calls) < 2:
            raise OSError('not up')
        return type('R', (), {'is_success': True})()

    opened = []
    ok = wait_and_open(
        port=17000,
        timeout=1,
        pause=0,
        health_get=health_get,
        opener=lambda url: opened.append(url),
    )
    assert ok is True
    assert calls[0] == 'http://127.0.0.1:17000/api/health'
    assert opened == ['http://127.0.0.1:17000/static/index.html']


def test_edge_candidates_cover_standard_install_locations():
    paths = edge_candidates(environ={'ProgramFiles': r'C:/Program Files'})
    assert any(path.name == 'msedge.exe' for path in paths)
