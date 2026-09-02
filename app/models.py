import time
from datetime import datetime
from itertools import count
from uuid import uuid4

from sqlalchemy import Boolean, JSON, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

_message_seq = count()


def new_uuid() -> str:
    return str(uuid4())


def new_message_id() -> str:
    """Time-ordered message id so rows inserted in the same second still
    sort by insertion order when ordered by (created_at, id). The in-process
    sequence breaks ties inside the same microsecond deterministically."""

    return f"{int(time.time() * 1_000_000):016d}-{next(_message_seq):06d}-{uuid4().hex[:4]}"


class KnowledgeSpace(Base):
    __tablename__ = "knowledge_spaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Persona(Base):
    __tablename__ = "personas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_space_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_spaces.id"), nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    persona_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="knowledge_expert"
    )
    profile_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ready")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )



class PersonaVersion(Base):
    """不可变的角色运行时快照；当前 Persona 仍是草稿/测试态。"""

    __tablename__ = "persona_versions"
    __table_args__ = (
        UniqueConstraint("persona_id", "version_number", name="uq_persona_version_number"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    persona_id: Mapped[str] = mapped_column(
        ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft", index=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    snapshot_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
class PersonaCapabilityPolicy(Base):
    """Explicit capability overrides for a persona.

    Connection configuration and role authorization are deliberately stored in
    different places. ``persona_id='*'`` is the global default policy scope.
    """

    __tablename__ = "persona_capability_policies"
    __table_args__ = (
        UniqueConstraint(
            "persona_id", "capability_id", name="uq_persona_capability_policy"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    persona_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    capability_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class PersonaDraft(Base):
    __tablename__ = "persona_drafts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_space_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_spaces.id"), nullable=False, unique=True
    )
    persona_id: Mapped[str | None] = mapped_column(
        ForeignKey("personas.id"), nullable=True, unique=True
    )
    mode: Mapped[str] = mapped_column(String(16), nullable=False)
    persona_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="knowledge_expert"
    )
    candidates_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    selected_candidate_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    suggested_name: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class PersonaMemory(Base):
    __tablename__ = "persona_memories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    persona_id: Mapped[str] = mapped_column(
        ForeignKey("personas.id"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class WorkspaceMemory(Base):
    __tablename__ = "workspace_memories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_message_id)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_message_id)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    persona_id: Mapped[str] = mapped_column(ForeignKey("personas.id"), nullable=False, index=True)
    conversation_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    audio_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    audio_content_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class ConversationAttachment(Base):
    """受管的会话附件；真实路径永远不暴露给 Agent。"""

    __tablename__ = "conversation_attachments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    conversation_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False, default="application/octet-stream")
    kind: Mapped[str] = mapped_column(String(32), nullable=False, default="file", index=True)
    size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    duration: Mapped[float | None] = mapped_column(nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_path: Mapped[str] = mapped_column(String(1200), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ready", index=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="chat")
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class ConversationMessageAttachment(Base):
    __tablename__ = "conversation_message_attachments"
    message_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversation_messages.id", ondelete="CASCADE"), primary_key=True)
    attachment_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversation_attachments.id", ondelete="CASCADE"), primary_key=True)



class VoiceAsset(Base):
    __tablename__ = "voice_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    engine: Mapped[str] = mapped_column(String(32), nullable=False, default="gpt_sovits")
    dir_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="created", index=True)
    training_stage: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    gpt_weights_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    sovits_weights_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    refer_audio_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    reference_language: Mapped[str | None] = mapped_column(String(16), nullable=True)
    dataset_dir: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    preview_audio_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class ConversationSummary(Base):
    __tablename__ = "conversation_summaries"
    __table_args__ = (
        UniqueConstraint(
            "persona_id", "conversation_id", name="uq_conversation_summary_persona_conv"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    persona_id: Mapped[str] = mapped_column(
        ForeignKey("personas.id"), nullable=False, index=True
    )
    conversation_id: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    summarized_through_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class DocumentJob(Base):
    __tablename__ = "document_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_space_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_spaces.id"), nullable=False, index=True
    )
    document_id: Mapped[str] = mapped_column(String(36), nullable=False, default=new_uuid)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    markdown_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    source_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    markdown_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    markdown_preview: Mapped[str | None] = mapped_column(
        LONGTEXT().with_variant(Text(), "sqlite"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    run_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    indexed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    document_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    chunking_preset: Mapped[str | None] = mapped_column(String(32), nullable=True)
    chunker_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    index_version: Mapped[str | None] = mapped_column(String(64), nullable=True)


class RagQueryRecord(Base):
    """持久化 RAG 查询摘要，用于质量回溯；不保存 prompt 或模型思维链。"""

    __tablename__ = "rag_query_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    persona_id: Mapped[str] = mapped_column(
        ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conversation_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    interaction_mode: Mapped[str] = mapped_column(String(32), nullable=False, default="knowledge")
    confidence: Mapped[float] = mapped_column(nullable=False, default=0.0)
    used_web_search: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    grounded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    useful: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    evidence_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    trace_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    missing_points_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    retrieval_config_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )


class RagQueryFeedback(Base):
    """一条查询最多一份用户反馈，避免重复点击污染质量统计。"""

    __tablename__ = "rag_query_feedback"
    __table_args__ = (UniqueConstraint("query_id", name="uq_rag_query_feedback_query"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    query_id: Mapped[str] = mapped_column(
        ForeignKey("rag_query_records.id", ondelete="CASCADE"), nullable=False, index=True
    )
    helpful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class RagEvaluationRun(Base):
    """已完成或失败的评测快照；支持重启后查看历史质量基线。"""

    __tablename__ = "rag_evaluation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    persona_id: Mapped[str] = mapped_column(
        ForeignKey("personas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="running", index=True)
    config_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    metrics_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    cases_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    analysis: Mapped[str] = mapped_column(Text, nullable=False, default="")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class RagEvaluationCase(Base):
    """知识空间级人工评测题；用于可复现 RAG 回归与失败样本回流。"""

    __tablename__ = "rag_evaluation_cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_space_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_spaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    expected_answer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    relevant_document_ids_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    tags_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    difficulty: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    source: Mapped[str] = mapped_column(String(16), nullable=False, default="manual")
    source_query_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class RagEvaluationCandidate(Base):
    """待人工确认的失败样本；确认后才会进入正式评测题集。"""

    __tablename__ = "rag_evaluation_candidates"
    __table_args__ = (
        UniqueConstraint("workspace_id", "source_query_id", name="uq_rag_eval_candidate_query"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    knowledge_space_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_spaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_query_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending", index=True)
    source: Mapped[str] = mapped_column(String(16), nullable=False, default="quality")
    question: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_answer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    relevant_document_ids_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    tags_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    signals_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    evidence_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    confidence: Mapped[float] = mapped_column(nullable=False, default=0.0)
    grounded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    useful: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feedback_helpful: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    reviewer_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class ProviderDownloadTask(Base):
    """持久化本地 Provider 资源安装/下载任务，供重启后查询和重试。"""

    __tablename__ = "provider_download_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    provider_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    resource_kind: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    operation: Mapped[str] = mapped_column(String(32), nullable=False, default="install")
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="queued", index=True)
    phase: Mapped[str] = mapped_column(String(128), nullable=False, default="queued")
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    detail: Mapped[str] = mapped_column(Text, nullable=False, default="")
    error: Mapped[str] = mapped_column(Text, nullable=False, default="")
    parameters_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class AgentRunRecord(Base):
    """本地 Agent Runtime 运行摘要，与 LangGraph checkpoint 分开保存。"""

    __tablename__ = "agent_runs"

    run_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, default="chat")
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    workspace_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    persona_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    conversation_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    thread_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    active_worker: Mapped[str | None] = mapped_column(String(64), nullable=True)
    specialist: Mapped[str | None] = mapped_column(String(32), nullable=True)
    pending_action_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    current_step: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    current_question: Mapped[str] = mapped_column(Text, nullable=False, default="")
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    resume_state_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    answer: Mapped[str] = mapped_column(Text, nullable=False, default="")
    worker_results_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    evidence_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    citations_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    uncertainties_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    trace_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    requires_approval: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class AgentRunEventRecord(Base):
    """AgentRun 的公开事件，sequence 在每个 run 内单调递增。"""

    __tablename__ = "agent_run_events"
    __table_args__ = (
        UniqueConstraint("run_id", "sequence", name="uq_agent_run_event_run_sequence"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    run_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="completed")
    duration_ms: Mapped[float | None] = mapped_column(nullable=True)
    details_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

class RuntimeTaskRecord(Base):
    """AgentRun 下可独立追踪的任务摘要，与 LangGraph checkpoint 分离。"""

    __tablename__ = "runtime_tasks"

    task_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, default="task")
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True, default="queued")
    input_summary_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    output_summary_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class RuntimeStepRecord(Base):
    """Task 内有序步骤摘要；同一 Task 的 sequence 必须唯一。"""

    __tablename__ = "runtime_steps"
    __table_args__ = (
        UniqueConstraint("task_id", "sequence", name="uq_runtime_step_task_sequence"),
    )

    step_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    task_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False, default="step")
    worker: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True, default="queued")
    input_summary_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    output_summary_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    resume_state_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
