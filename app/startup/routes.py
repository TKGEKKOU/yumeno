"""Route registration, endpoint definitions, and static mounts."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.startup.static import STATIC_DIR, NoCacheStaticFiles
from ingestion.status import get_system_status
from settings import Settings

from app.routers.agents import router as agents_router
from app.routers.attachments import router as attachments_router
from app.routers.asr import router as asr_router, stt_router
from app.routers.documents import router as documents_router
from app.routers.extensions import router as extensions_router
from app.routers.embedding import router as embedding_router
from app.routers.eval import router as eval_router
from app.routers.eval_dataset import router as eval_dataset_router
from app.routers.integrations import router as integrations_router
from app.routers.live2d import router as live2d_router
from app.routers.mcp import router as mcp_router
from app.routers.persona_drafts import router as persona_drafts_router
from app.routers.persona_versions import router as persona_versions_router
from app.routers.messages import router as messages_router
from app.routers.personas import router as personas_router
from app.routers.rag import router as rag_router
from app.routers.reranker import router as reranker_router
from app.routers.realtime import router as realtime_router
from app.routers.runs import router as runs_router
from app.routers.settings import router as settings_router
from app.routers.skills import router as skills_router
from app.routers.system import router as system_router
from app.routers.tts import router as tts_router
from app.routers.video_clone import router as video_clone_router
from app.routers.voice_assets import router as voice_assets_router
from app.routers.voice_studio import router as voice_studio_router
from app.routers.voice_rvc import router as voice_rvc_router, provider_router as rvc_provider_router, audio_resource_router
from app.routers.voice import router as voice_router
from app.routers.voice_stream import router as voice_stream_router
from app.routers.providers import router as providers_router
from app.routers.resources import router as resources_router, legacy_router as provider_resources_router
from app.routers.worker_manifests import router as worker_manifests_router
from integrations.onebot11.ws_server import router as onebot_ws_router


_ALL_ROUTERS = [
    agents_router, attachments_router, asr_router, stt_router, onebot_ws_router,
    integrations_router, live2d_router, messages_router, mcp_router,
    personas_router, persona_versions_router, documents_router, extensions_router,
    embedding_router, eval_router, eval_dataset_router, persona_drafts_router,
    skills_router, rag_router, reranker_router, realtime_router, runs_router,
    settings_router, system_router, tts_router, video_clone_router,
    voice_assets_router, voice_studio_router, voice_rvc_router,
    rvc_provider_router, audio_resource_router, voice_router, voice_stream_router,
    providers_router, resources_router, provider_resources_router, worker_manifests_router,
]


def configure_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def register_routes(app: FastAPI, settings: Settings) -> None:
    for router in _ALL_ROUTERS:
        app.include_router(router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "workspace_id": settings.workspace_id}

    @app.get("/api/status")
    def status() -> dict:
        return get_system_status()

    @app.get("/api/launcher/progress")
    def launcher_progress() -> dict:
        fn = getattr(app.state, "launcher_progress", None)
        if fn is None:
            return {"starting": False, "done": False, "ok": None, "error": "", "percent": 0, "steps": []}
        return fn()

    @app.get("/", include_in_schema=False)
    def web_workbench() -> RedirectResponse:
        return RedirectResponse(url="/static/index.html")


def mount_static_files(app: FastAPI, settings: Settings) -> None:
    live2d_dir = settings.project_root / "data" / "live2d"
    live2d_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/live2d-assets", StaticFiles(directory=live2d_dir), name="live2d-assets")
    app.mount("/static", NoCacheStaticFiles(directory=STATIC_DIR), name="static")
    try:
        from datasette.app import Datasette
        settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        settings.sqlite_path.touch(exist_ok=True)
        datasette_app = Datasette(
            files=[str(settings.sqlite_path)],
            settings={"base_url": "/sqlite/", "default_page_size": 50},
        ).app()
        app.mount("/sqlite", datasette_app, name="sqlite")
    except Exception:
        pass


from starlette.staticfiles import StaticFiles  # noqa: E402  (used in mount_static_files)
