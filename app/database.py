from collections.abc import Generator

from fastapi import Request
from sqlalchemy import Engine, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from settings import Settings


class Base(DeclarativeBase):
    pass


def database_url(settings: Settings) -> str:
    return f"sqlite:///{settings.sqlite_path.as_posix()}"


def build_engine(settings: Settings) -> Engine:
    settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(
        database_url(settings),
        connect_args={"check_same_thread": False},
    )
    # WAL 模式:读写并发更稳,桌面端单用户场景足够
    with engine.begin() as connection:
        connection.execute(text("PRAGMA journal_mode=WAL"))
    return engine


def build_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def upgrade_attachment_schema(engine: Engine) -> None:
    """Create the conversation attachment tables for existing installations."""
    from app.models import ConversationAttachment, ConversationMessageAttachment
    Base.metadata.create_all(engine, tables=[ConversationAttachment.__table__, ConversationMessageAttachment.__table__])


def upgrade_persona_schema(engine: Engine) -> None:
    """Add Task 2 columns for deployments created before persona types existed."""
    if engine.dialect.name != "mysql":
        return
    inspector = inspect(engine)
    additions = {
        "personas": {"persona_type": "VARCHAR(32) NOT NULL DEFAULT 'knowledge_expert'"},
        "persona_drafts": {
            "persona_type": "VARCHAR(32) NOT NULL DEFAULT 'knowledge_expert'",
            "candidates_json": "JSON NULL",
            "selected_candidate_id": "VARCHAR(64) NULL",
        },
    }
    with engine.begin() as connection:
        for table, columns in additions.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, definition in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {definition}"))
        connection.execute(text("UPDATE persona_drafts SET candidates_json = JSON_ARRAY() WHERE candidates_json IS NULL"))


def upgrade_voice_asset_schema(engine: Engine) -> None:
    """Add GPT-SoVITS language metadata without changing existing assets."""

    inspector = inspect(engine)
    if "voice_assets" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("voice_assets")}
    if "reference_language" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE voice_assets ADD COLUMN reference_language VARCHAR(16) NULL")
            )


def upgrade_document_job_schema(engine: Engine) -> None:
    """Add semantic-index metadata to existing supported databases."""
    inspector = inspect(engine)
    if "document_jobs" not in inspector.get_table_names():
        return
    additions = {
        "document_type": "VARCHAR(32) NULL",
        "chunking_preset": "VARCHAR(32) NULL",
        "chunker_version": "VARCHAR(64) NULL",
        "index_version": "VARCHAR(64) NULL",
        "run_id": "VARCHAR(36) NULL",
    }
    existing = {column["name"] for column in inspector.get_columns("document_jobs")}
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE document_jobs ADD COLUMN {name} {definition}"))


def upgrade_rag_query_schema(engine: Engine) -> None:
    """为已有安装补齐 RAG 查询的稳定错误合同字段。"""

    inspector = inspect(engine)
    if "rag_query_records" not in inspector.get_table_names():
        return
    additions = {
        "error_code": "VARCHAR(64) NULL",
        "error_message": "TEXT NULL",
    }
    existing = {column["name"] for column in inspector.get_columns("rag_query_records")}
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE rag_query_records ADD COLUMN {name} {definition}"))


def upgrade_persona_version_schema(engine: Engine) -> None:
    """为已有安装补齐角色版本表；create_all 对已有表是幂等的。"""

    from app.models import PersonaVersion

    Base.metadata.create_all(engine, tables=[PersonaVersion.__table__])


def upgrade_eval_candidate_schema(engine: Engine) -> None:
    """为已有安装补齐失败样本候选表。"""

    from app.models import RagEvaluationCandidate

    Base.metadata.create_all(engine, tables=[RagEvaluationCandidate.__table__])

def upgrade_provider_download_schema(engine: Engine) -> None:
    """为本地 Provider 资源安装任务建立持久化表。"""
    from app.models import ProviderDownloadTask

    Base.metadata.create_all(engine, tables=[ProviderDownloadTask.__table__])


def upgrade_runtime_schema(engine: Engine) -> None:
    """为已有安装补齐 Agent Runtime 表；create_all 对已有表是幂等的。"""

    from app.models import AgentRunEventRecord, AgentRunRecord, RuntimeStepRecord, RuntimeTaskRecord

    Base.metadata.create_all(
        engine,
        tables=[
            AgentRunRecord.__table__,
            AgentRunEventRecord.__table__,
            RuntimeTaskRecord.__table__,
            RuntimeStepRecord.__table__,
        ],
    )
    inspector = inspect(engine)
    if "agent_runs" not in inspector.get_table_names():
        return
    additions = {
        "current_step": "VARCHAR(128) NOT NULL DEFAULT ''",
        "current_question": "TEXT NOT NULL DEFAULT ''",
        "progress": "INTEGER NOT NULL DEFAULT 0",
        "total": "INTEGER NOT NULL DEFAULT 0",
        "status_text": "TEXT NOT NULL DEFAULT ''",
        "resume_state_json": "JSON NULL",
    }
    existing = {column["name"] for column in inspector.get_columns("agent_runs")}
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE agent_runs ADD COLUMN {name} {definition}"))


def get_session(request: Request) -> Generator[Session, None, None]:
    session_factory: sessionmaker[Session] = request.app.state.session_factory
    with session_factory() as session:
        yield session
