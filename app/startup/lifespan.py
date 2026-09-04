"""Application lifespan: warmup on start, graceful shutdown on stop."""

from contextlib import asynccontextmanager, suppress
import asyncio

from fastapi import FastAPI

from agents.tools.mcp_admin import set_mcp_manager
from integrations.mcp.client import MCPManager
from ingestion.embeddings import warm_managed_embedding
from settings import Settings


async def _warm_asr_worker(app: FastAPI) -> None:
    try:
        if not app.state.asr_resources.status().get("ready"):
            return
        provider = app.state.stt_provider_factory(Settings.load())
        manager = getattr(provider, "manager", None)
        if manager is not None:
            await manager.ensure_ready()
    except Exception:
        pass


async def _warm_gpt_sovits(app: FastAPI) -> None:
    try:
        if not app.state.gpt_sovits.status().get("installed"):
            return
        await asyncio.to_thread(app.state.gpt_sovits.ensure_service)
    except Exception:
        pass


def build_lifespan(settings: Settings, *, initialize_database: bool):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        from ingestion.local_embedding.client import resume_embedding_workers
        from ingestion.local_reranker.client import resume_reranker_workers

        resume_embedding_workers()
        resume_reranker_workers()
        app.state.mcp_manager = MCPManager(
            settings.project_root / "data" / "mcp_servers.json",
            allow_arbitrary_stdio=settings.mcp_allow_arbitrary_stdio,
        )
        set_mcp_manager(app.state.mcp_manager)
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
            app.state.asr_warmup_task = asyncio.create_task(_warm_asr_worker(app))
            app.state.gpt_sovits_warmup_task = asyncio.create_task(_warm_gpt_sovits(app))
        yield
        await _shutdown(app)

    return lifespan


async def _shutdown(app: FastAPI) -> None:
    from ingestion.local_embedding.client import begin_embedding_shutdown
    from ingestion.local_reranker.client import begin_reranker_shutdown

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
    with suppress(Exception):
        begin_embedding_shutdown()
    if embedding_warmup is not None:
        with suppress(asyncio.CancelledError, Exception):
            await embedding_warmup
    reranker_warmup = getattr(app.state, "reranker_warmup_task", None)
    with suppress(Exception):
        begin_reranker_shutdown()
    if reranker_warmup is not None:
        with suppress(asyncio.CancelledError, Exception):
            await reranker_warmup
    stt_warmup = getattr(app.state, "stt_warmup_task", None)
    if stt_warmup is not None:
        stt_warmup.cancel()
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
    with suppress(Exception):
        begin_embedding_shutdown()
    try:
        from rag.retriever import clear_retriever_cache
        from ingestion.milvus_store import close_milvus_connections
        clear_retriever_cache()
        await asyncio.to_thread(close_milvus_connections)
    except Exception:
        pass
    resource = getattr(app.state, "checkpoint_resource", None)
    if resource is not None:
        resource.close()
