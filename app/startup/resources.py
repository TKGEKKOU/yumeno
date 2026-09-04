"""Centralized resource initialization for FastAPI ``app.state``."""

from fastapi import FastAPI
from langgraph.checkpoint.memory import MemorySaver

from agents.checkpoint import create_sqlite_checkpointer
from agents.service import PersonaAgentService
from agents.runtime.approvals import ApprovalService
from agents.runtime.runner import AgentRuntime
from app.database import (
    Base,
    build_engine,
    build_session_factory,
    upgrade_attachment_schema,
    upgrade_persona_schema,
    upgrade_voice_asset_schema,
    upgrade_document_job_schema,
    upgrade_rag_query_schema,
    upgrade_runtime_schema,
    upgrade_eval_candidate_schema,
    upgrade_persona_version_schema,
)
from app.run_store import RunStore
from extensions.events import EventBus
from ingestion.local_embedding.resources import LocalEmbeddingResourceManager
from ingestion.local_reranker.resources import LocalRerankerResourceManager
from integrations.bilibili import BilibiliLiveManager
from integrations.config import bilibili_runtime_config, onebot_runtime_config
from integrations.onebot11.router import ImMessageRouter
from integrations.onebot11.ws_server import OneBotConnectionManager
from persona.delete_service import PersonaDeletionService
from realtime.execution import ConversationExecutionRegistry
from settings import Settings
from voice.asr import build_stt_provider
from voice.asr.install import STTResourceManager
from voice.asr.stream_client import WorkerStreamClient
from voice.clone_tasks import CloneTaskManager
from voice.ffmpeg_resources import FFmpegResourceManager
from voice.gpt_sovits import GPTSoVITSAdapter, GPTSoVITSConfig
from voice.gpt_sovits.install import GPTSoVITSInstallManager
from voice.gpt_sovits.migration import migrate_voice_assets
from voice.gpt_sovits.synthesis import GPTSoVITSSynthesisService
from voice.gpt_sovits.training import TrainingService
from voice.rvc import RVCResourceManager, RVCAdapter, RVCTaskManager, RVCSessionManager
from voice.separator.install import SeparatorResourceManager
from voice.separator.onnx import HtdemucsSeparator
from voice.studio import VoiceStudioManager
from voice.tts.service import AdaptiveTTSSynthesisService
from voice.vad import build_vad
from voice.vad.energy import EnergyVAD


def _separator_factory(resources: SeparatorResourceManager):
    return lambda: HtdemucsSeparator(
        resources.model_path,
        providers=HtdemucsSeparator.available_providers() or ["CPUExecutionProvider"],
    )


def initialize_database_and_core(app: FastAPI, settings: Settings) -> None:
    """Create DB engine, session factory, and shared registries."""

    engine = build_engine(settings)
    app.state.session_factory = build_session_factory(engine)
    app.state.persona_delete_service = PersonaDeletionService(settings)
    app.state.realtime_executions = ConversationExecutionRegistry()
    app.state.event_bus = EventBus()


def initialize_voice_resources(app: FastAPI, settings: Settings) -> None:
    """Create ASR, TTS, RVC, separator, and voice studio managers."""

    app.state.stt_provider_factory = build_stt_provider
    app.state.asr_provider_factory = app.state.stt_provider_factory
    app.state.stt_resources = STTResourceManager(settings.project_root)
    app.state.asr_resources = app.state.stt_resources
    app.state.vad_factory = build_vad
    app.state.asr_stream_client_factory = WorkerStreamClient
    app.state.embedding_resources = LocalEmbeddingResourceManager(settings.project_root)
    app.state.reranker_resources = LocalRerankerResourceManager(settings.project_root)
    app.state.gpt_sovits_config = GPTSoVITSConfig(settings.project_root)
    app.state.gpt_sovits = GPTSoVITSAdapter(app.state.gpt_sovits_config, settings.project_root)
    app.state.gpt_sovits_synthesis = GPTSoVITSSynthesisService(app.state.gpt_sovits)
    app.state.tts_synthesis = AdaptiveTTSSynthesisService(app.state.gpt_sovits_synthesis, Settings.load)
    app.state.gpt_sovits_install = GPTSoVITSInstallManager(settings.project_root, app.state.gpt_sovits_config)
    app.state.gpt_sovits_training = TrainingService(settings.project_root, app.state.gpt_sovits_config)
    app.state.rvc_resources = RVCResourceManager(settings.project_root)
    app.state.ffmpeg_resources = FFmpegResourceManager(settings.project_root)
    app.state.rvc_adapter = RVCAdapter(app.state.rvc_resources)
    app.state.rvc_tasks = RVCTaskManager(settings.project_root, app.state.rvc_adapter)
    app.state.separator_resources = SeparatorResourceManager(settings.project_root)
    app.state.rvc_sessions = RVCSessionManager(
        settings.project_root,
        separator_factory=_separator_factory(app.state.separator_resources),
    )
    app.state.clone_tasks = CloneTaskManager(
        settings.project_root,
        separator_factory=_separator_factory(app.state.separator_resources),
        vad_factory=EnergyVAD,
    )
    app.state.voice_studio = VoiceStudioManager(
        settings.project_root,
        separator_factory=_separator_factory(app.state.separator_resources),
        vad_factory=EnergyVAD,
        voices_root=settings.project_root / "data" / "tts" / "voices",
    )


def initialize_agent_runtime(app: FastAPI, settings: Settings, *, initialize_database: bool) -> None:
    """Create checkpointer, agent service, runtime, and recovery."""

    if initialize_database:
        Base.metadata.create_all(build_engine(settings))
        engine = build_engine(settings)
        upgrade_attachment_schema(engine)
        upgrade_persona_schema(engine)
        upgrade_voice_asset_schema(engine)
        upgrade_document_job_schema(engine)
        upgrade_rag_query_schema(engine)
        upgrade_runtime_schema(engine)
        upgrade_eval_candidate_schema(engine)
        upgrade_persona_version_schema(engine)
        with app.state.session_factory() as migration_session:
            migrate_voice_assets(migration_session)
        checkpoint_resource = create_sqlite_checkpointer(settings)
        app.state.checkpoint_resource = checkpoint_resource
        app.state.agent_service = PersonaAgentService(checkpoint_resource.saver)
        app.state.run_store = RunStore(app.state.session_factory)
        recovered_runs = app.state.run_store.recover_incomplete_runs()
        from app.routers.eval import sync_recovered_evaluation_runs
        sync_recovered_evaluation_runs(app.state.session_factory, recovered_runs)
        from ingestion.document_jobs import sync_recovered_document_runs
        sync_recovered_document_runs(app.state.session_factory, recovered_runs)
        app.state.recovered_agent_runs = recovered_runs
        app.state.recovered_agent_run_ids = [run.run_id for run in recovered_runs]
        app.state.agent_runtime = AgentRuntime(app.state.agent_service, app.state.run_store)
        app.state.agent_runtime.app_state = app.state
        app.state.approval_service = ApprovalService(app.state.agent_runtime)
        app.state.agent_service.attach_runtime(app.state.agent_runtime)
        app.state.voice_studio.attach_runtime(app.state.agent_runtime)
        app.state.voice_studio.sync_recovered_runs(recovered_runs)
    else:
        app.state.agent_service = PersonaAgentService(MemorySaver())
    app.state.agent_runner = getattr(app.state, "agent_runtime", None) or app.state.agent_service


def initialize_integration_resources(app: FastAPI, settings: Settings) -> None:
    """Create bilibili / onebot integration managers."""

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
        try_persist_text_message(
            app.state.session_factory,
            workspace_id=context.workspace_id,
            persona_id=persona_id,
            conversation_id=conversation_id,
            role="user",
            content=question,
        )
        key = f"{persona_id}:{conversation_id}"
        result = await app.state.realtime_executions.run(
            key,
            lambda: app.state.agent_runner.query(question, context),
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
    app.state.im_router = ImMessageRouter(
        app.state.agent_service,
        app.state.session_factory,
        settings.project_root / "data" / "im_bindings.json",
        settings.project_root / "data" / "integrations.json",
        tts_synthesis=app.state.tts_synthesis,
        agent_runtime=getattr(app.state, "agent_runtime", None),
    )
    app.state.event_bus.subscribe(EVENT_MESSAGE, app.state.im_router.handle)


from extensions.events import EVENT_MESSAGE  # noqa: E402  (used in integration init)
