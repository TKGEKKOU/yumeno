from contextlib import asynccontextmanager, suppress
import asyncio
from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.staticfiles import StaticFiles
from langgraph.checkpoint.memory import MemorySaver

from agents.checkpoint import create_sqlite_checkpointer
from agents.context_factory import build_agent_runner
from agents.service import PersonaAgentService
from app.database import (
    Base,
    build_engine,
    build_session_factory,
    upgrade_persona_schema,
    upgrade_voice_asset_schema,
    upgrade_document_job_schema,
    upgrade_runtime_schema,
)
from app.routers.agents import router as agents_router
from app.routers.asr import router as asr_router
from app.routers.documents import router as documents_router
from app.routers.extensions import router as extensions_router
from app.routers.embedding import router as embedding_router
from app.routers.eval import router as eval_router
from app.routers.integrations import router as integrations_router
from app.routers.live2d import router as live2d_router
from app.routers.mcp import router as mcp_router
from app.routers.persona_drafts import router as persona_drafts_router
from app.routers.messages import router as messages_router
from app.routers.personas import router as personas_router
from app.routers.rag import router as rag_router
from app.routers.reranker import router as reranker_router
from app.routers.realtime import router as realtime_router
from app.routers.settings import router as settings_router
from app.routers.skills import router as skills_router
from app.routers.system import router as system_router
from app.routers.tts import router as tts_router
from app.routers.video_clone import router as video_clone_router
from app.routers.voice_assets import router as voice_assets_router
from app.routers.voice_studio import router as voice_studio_router
from app.routers.voice import router as voice_router
from app.routers.voice_stream import router as voice_stream_router
from app.routers.providers import router as providers_router
from settings import Settings
from extensions.events import EVENT_MESSAGE, EventBus
from ingestion.status import get_system_status
from ingestion.local_embedding.resources import LocalEmbeddingResourceManager
from ingestion.local_reranker.resources import LocalRerankerResourceManager
from ingestion.embeddings import warm_managed_embedding
from integrations.config import bilibili_runtime_config, onebot_runtime_config
from integrations.bilibili import BilibiliLiveManager
from integrations.mcp.client import MCPManager
from integrations.onebot11.router import ImMessageRouter
from integrations.onebot11.ws_server import OneBotConnectionManager, router as onebot_ws_router
from persona.delete_service import PersonaDeletionService
from realtime.execution import ConversationExecutionRegistry
from voice.asr import build_asr_provider
from voice.asr.install import ASRResourceManager
from voice.asr.stream_client import WorkerStreamClient
from voice.clone_tasks import CloneTaskManager
from voice.separator.install import SeparatorResourceManager
from voice.separator.onnx import HtdemucsSeparator
from voice.studio import VoiceStudioManager
from voice.gpt_sovits import GPTSoVITSAdapter, GPTSoVITSConfig
from voice.gpt_sovits.install import GPTSoVITSInstallManager
from voice.gpt_sovits.migration import migrate_voice_assets
from voice.gpt_sovits.synthesis import GPTSoVITSSynthesisService
from voice.gpt_sovits.training import TrainingService
from voice.vad import build_vad
from voice.vad.energy import EnergyVAD

STATIC_DIR = (Path(sys.executable).parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parents[1]) / "static"


class NoCacheStaticFiles(StaticFiles):
    """静态资源允许缓存但必须重新验证，避免 WebView2/浏览器启发式缓存导致改了不生效。"""

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-store"
        return response


def create_app(initialize_database: bool = True) -> FastAPI:
    settings = Settings.load()
    checkpoint_resource = None

    async def warm_asr_worker() -> None:
        """Preload the local ASR worker in the background so the first voice
        utterance is not delayed by a cold model load. ASR must already be
        installed; failures are ignored (the start command retries)."""

        try:
            if not app.state.asr_resources.status().get("ready"):
                return
            provider = app.state.asr_provider_factory(Settings.load())
            manager = getattr(provider, "manager", None)
            if manager is not None:
                await manager.ensure_ready()
        except Exception:
            pass

    async def warm_gpt_sovits() -> None:
        """Start the GPT-SoVITS API service at app startup when the engine is
        installed. Runs in the background so a slow cold start never blocks
        app launch."""

        try:
            if not app.state.gpt_sovits.status().get("installed"):
                return
            await asyncio.to_thread(app.state.gpt_sovits.ensure_service)
        except Exception:
            pass

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        from ingestion.local_embedding.client import resume_embedding_workers
        from ingestion.local_reranker.client import resume_reranker_workers

        resume_embedding_workers()
        resume_reranker_workers()
        # MCP 服务器启动时连接并注册工具：连接失败仅记录错误，不阻塞启动；
        # 工具注册发生在 workflow 懒构建之前，因此新技能即可引用 MCP 工具。
        app.state.mcp_manager = MCPManager(
            settings.project_root / "data" / "mcp_servers.json",
            allow_arbitrary_stdio=settings.mcp_allow_arbitrary_stdio,
        )
        from agents.tools.mcp_admin import set_mcp_manager

        set_mcp_manager(app.state.mcp_manager)
        # MCP connections own external subprocesses/sockets. Start them in
        # the background so an unavailable optional server never delays FastAPI
        # or the desktop UI; per-server status is published as it works.
        app.state.mcp_connect_task = asyncio.create_task(
            app.state.mcp_manager.connect_all(register=True)
        )
        if initialize_database:
            app.state.embedding_warmup_task = asyncio.create_task(
                asyncio.to_thread(warm_managed_embedding, settings)
            )
            from ingestion.local_reranker.client import warm_managed_reranker
            app.state.reranker_warmup_task = asyncio.create_task(
                asyncio.to_thread(warm_managed_reranker, settings)
            )
            app.state.asr_warmup_task = asyncio.create_task(warm_asr_worker())
            app.state.gpt_sovits_warmup_task = asyncio.create_task(warm_gpt_sovits())
        yield
        await app.state.bilibili.disconnect()
        mcp_manager = getattr(app.state, "mcp_manager", None)
        if mcp_manager is not None:
            connect_task = getattr(app.state, "mcp_connect_task", None)
            if connect_task is not None:
                connect_task.cancel()
                with suppress(asyncio.CancelledError, Exception):
                    await connect_task
            close = getattr(mcp_manager, "close", None)
            if close is not None:
                await asyncio.to_thread(close)
        embedding_warmup = getattr(app.state, "embedding_warmup_task", None)
        try:
            from ingestion.local_embedding.client import begin_embedding_shutdown

            begin_embedding_shutdown()
        except Exception:
            pass
        if embedding_warmup is not None:
            with suppress(asyncio.CancelledError, Exception):
                await embedding_warmup
        reranker_warmup = getattr(app.state, "reranker_warmup_task", None)
        try:
            from ingestion.local_reranker.client import begin_reranker_shutdown
            begin_reranker_shutdown()
        except Exception:
            pass
        if reranker_warmup is not None:
            with suppress(asyncio.CancelledError, Exception):
                await reranker_warmup
        warmup = getattr(app.state, "asr_warmup_task", None)
        if warmup is not None:
            warmup.cancel()
        gpt_warmup = getattr(app.state, "gpt_sovits_warmup_task", None)
        if gpt_warmup is not None:
            gpt_warmup.cancel()
        gpt_sovits = getattr(app.state, "gpt_sovits", None)
        if gpt_sovits is not None:
            gpt_sovits.stop_service()
        try:
            from voice.asr.local_worker import shutdown_asr_workers

            shutdown_asr_workers()
        except Exception:
            pass
        try:
            # The warmup thread may have been inside Popen while teardown
            # started. Drain once more without reopening the creation gate.
            from ingestion.local_embedding.client import begin_embedding_shutdown

            begin_embedding_shutdown()
        except Exception:
            pass
        resource = getattr(app.state, "checkpoint_resource", None)
        if resource is not None:
            resource.close()

    app = FastAPI(title="YUMENO", lifespan=lifespan)
    app.state.settings = settings
    from extensions.catalog import CatalogClient

    app.state.extension_catalog_client = CatalogClient(settings.project_root)
    app.state.extension_installer = None
    # 允许 file:// 启动页等本地来源通过 HTTP 轮询（服务仅绑定 127.0.0.1）
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    engine = build_engine(settings)
    app.state.session_factory = build_session_factory(engine)
    app.state.persona_delete_service = PersonaDeletionService(settings)
    app.state.realtime_executions = ConversationExecutionRegistry()
    app.state.asr_provider_factory = build_asr_provider
    app.state.asr_resources = ASRResourceManager(settings.project_root)
    app.state.vad_factory = build_vad
    app.state.asr_stream_client_factory = WorkerStreamClient
    app.state.embedding_resources = LocalEmbeddingResourceManager(settings.project_root)
    app.state.reranker_resources = LocalRerankerResourceManager(settings.project_root)
    app.state.gpt_sovits_config = GPTSoVITSConfig(settings.project_root)
    app.state.gpt_sovits = GPTSoVITSAdapter(
        app.state.gpt_sovits_config,
        settings.project_root,
    )
    app.state.tts_synthesis = GPTSoVITSSynthesisService(app.state.gpt_sovits)
    app.state.gpt_sovits_install = GPTSoVITSInstallManager(
        settings.project_root,
        app.state.gpt_sovits_config,
    )
    app.state.gpt_sovits_training = TrainingService(
        settings.project_root,
        app.state.gpt_sovits_config,
    )
    app.state.separator_resources = SeparatorResourceManager(settings.project_root)
    app.state.clone_tasks = CloneTaskManager(
        settings.project_root,
        separator_factory=lambda: HtdemucsSeparator(
            app.state.separator_resources.model_path,
            providers=HtdemucsSeparator.available_providers() or ["CPUExecutionProvider"],
        ),
        vad_factory=lambda: EnergyVAD(),
    )
    app.state.voice_studio = VoiceStudioManager(
        settings.project_root,
        separator_factory=lambda: HtdemucsSeparator(
            app.state.separator_resources.model_path,
            providers=HtdemucsSeparator.available_providers() or ["CPUExecutionProvider"],
        ),
        vad_factory=lambda: EnergyVAD(),
        voices_root=settings.project_root / "data" / "tts" / "voices",
    )
    if initialize_database:
        Base.metadata.create_all(engine)
        upgrade_persona_schema(engine)
        upgrade_voice_asset_schema(engine)
        upgrade_document_job_schema(engine)
        upgrade_runtime_schema(engine)
        with app.state.session_factory() as migration_session:
            migrate_voice_assets(migration_session)
        # 会话状态（对话历史、中断点、Worker 结果）持久化到本地 SQLite；
        # 服务重启后可按 thread_id 恢复；langgraph-checkpoint-sqlite 实现了
        # BaseCheckpointSaver 接口，对上层 PersonaAgentService 透明。
        checkpoint_resource = create_sqlite_checkpointer(settings)
        app.state.checkpoint_resource = checkpoint_resource
        app.state.agent_service = PersonaAgentService(checkpoint_resource.saver)
    else:
        # 无数据库（测试/演示）时退化为内存检查点，行为一致但重启即失。
        app.state.agent_service = PersonaAgentService(MemorySaver())
    # PersonaAgentService 是人设多 Agent（Supervisor + 领域 Worker）的应用层入口：
    # 对外只暴露 query / resume，内部由 LangGraph 图执行，thread_id = persona_id:conversation_id。
    app.state.event_bus = EventBus()

    async def process_bilibili_event(event, conversation_id):
        from types import SimpleNamespace
        from app.routers.agents import context_for, response_for
        from app.chat_store import try_persist_text_message

        config = bilibili_runtime_config(settings.project_root)
        persona_id = config.get("default_persona_id")
        if not persona_id:
            raise RuntimeError("请先选择直播回复角色")
        question = event.content if event.kind == "enter" else f"{event.username}：{event.content}"
        with app.state.session_factory() as session:
            context = context_for(SimpleNamespace(app=app), session, persona_id, conversation_id)
        try_persist_text_message(app.state.session_factory, workspace_id=context.workspace_id,
                                 persona_id=persona_id, conversation_id=conversation_id,
                                 role="user", content=question)
        key = f"{persona_id}:{conversation_id}"
        result = await app.state.realtime_executions.run(
            key,
            lambda: app.state.agent_service.query(question, context),
        )
        return response_for(result).model_dump()

    async def clear_bilibili_conversation(persona_id, conversation_id):
        from app.conversation_cleanup import clear_conversation_data
        from app.routers.messages import AUDIO_ROOT

        with app.state.session_factory() as session:
            clear_conversation_data(
                session,
                app.state.agent_service.checkpointer,
                persona_id,
                conversation_id,
                AUDIO_ROOT,
            )

    app.state.bilibili = BilibiliLiveManager(
        lambda: bilibili_runtime_config(settings.project_root),
        process_bilibili_event,
        clear_bilibili_conversation,
    )
    app.state.onebot = OneBotConnectionManager(
        lambda: onebot_runtime_config(settings.project_root)
    )
    # IM 消息路由：OneBot（QQ）等外部渠道消息经 EventBus 广播到这里，统一转成
    # PersonaAgentService 的一轮对话；消息与 Agent 解耦，渠道扩展不触碰 Agent 逻辑。
    app.state.im_router = ImMessageRouter(
        app.state.agent_service,
        app.state.session_factory,
        settings.project_root / "data" / "im_bindings.json",
        settings.project_root / "data" / "integrations.json",
        tts_synthesis=app.state.tts_synthesis,
    )
    app.state.event_bus.subscribe(EVENT_MESSAGE, app.state.im_router.handle)
    app.include_router(agents_router)
    app.include_router(asr_router)
    app.include_router(onebot_ws_router)
    app.include_router(integrations_router)
    app.include_router(live2d_router)
    app.include_router(messages_router)
    app.include_router(mcp_router)
    app.include_router(personas_router)
    app.include_router(documents_router)
    app.include_router(extensions_router)
    app.include_router(embedding_router)
    app.include_router(eval_router)
    app.include_router(persona_drafts_router)
    app.include_router(skills_router)
    app.include_router(rag_router)
    app.include_router(reranker_router)
    app.include_router(realtime_router)
    app.include_router(settings_router)
    app.include_router(system_router)
    app.include_router(tts_router)
    app.include_router(video_clone_router)
    app.include_router(voice_assets_router)
    app.include_router(voice_studio_router)
    app.include_router(voice_router)
    app.include_router(voice_stream_router)
    app.include_router(providers_router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "workspace_id": settings.workspace_id}

    @app.get("/api/status")
    def status() -> dict:
        return get_system_status()

    @app.get("/api/launcher/progress")
    def launcher_progress() -> dict:
        """桌面启动页轮询用的启动进度（由桌面进程注入，浏览器端无则返回空进度）。"""
        fn = getattr(app.state, "launcher_progress", None)
        if fn is None:
            return {"starting": False, "done": False, "ok": None, "error": "", "percent": 0, "steps": []}
        return fn()

    @app.get("/", include_in_schema=False)
    def web_workbench() -> RedirectResponse:
        return RedirectResponse(url="/static/index.html")

    live2d_dir = settings.project_root / "data" / "live2d"
    live2d_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/live2d-assets", StaticFiles(directory=live2d_dir), name="live2d-assets")
    app.mount("/static", NoCacheStaticFiles(directory=STATIC_DIR), name="static")

    # SQLite 网页管理（datasette，只读）：/sqlite/ 浏览表与执行查询，失败不影响应用启动
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

    return app
