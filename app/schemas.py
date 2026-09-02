from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ProviderKind = Literal["llm", "embedding", "asr", "reranker"]

class ProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: ProviderKind
    name: str
    provider: str
    enabled: bool = True
    configured: bool = False
    ready: bool = False
    status_text: str = ""
    detail: dict[str, Any] = Field(default_factory=dict)


class ProviderListResponse(BaseModel):
    providers: list[ProviderResponse]


class PersonaCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    profile: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class PersonaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    workspace_id: str
    knowledge_space_id: str
    persona_type: Literal["character", "knowledge_expert"]
    profile: dict[str, Any] = Field(validation_alias="profile_json")
    status: str


class PersonaDraftUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    profile: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def strip_draft_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class PersonaUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=255)
    profile: dict[str, Any] | None = None

    @field_validator("name")
    @classmethod
    def strip_optional_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class PersonaDraftResponse(BaseModel):
    id: str
    mode: Literal["character", "expert"]
    persona_type: Literal["character", "knowledge_expert"]
    candidates: list[dict[str, Any]]
    selected_candidate_id: str | None
    suggested_name: str
    profile: dict[str, Any]
    status: str
    documents: list["DocumentJobResponse"]
    persona: PersonaResponse | None = None


class DocumentJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    knowledge_space_id: str
    document_id: str
    original_filename: str
    markdown_filename: str
    markdown_preview: str | None
    status: str
    run_id: str | None = None
    error_message: str | None
    created_at: datetime
    updated_at: datetime
    indexed_at: datetime | None


class RagQueryPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = Field(default=None, max_length=255)

    @field_validator("question")
    @classmethod
    def strip_question(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question must not be empty")
        return value


class RagQueryResponse(BaseModel):
    query_id: str | None = None
    answer: str
    evidence: list[dict[str, Any]]
    confidence: float
    used_web_search: bool
    trace: list[dict[str, Any]]
    grounded: bool
    useful: bool
    missing_points: list[str]
    error_code: str | None = None
    error_message: str | None = None
    interaction_mode: Literal["conversation", "capability", "knowledge", "web"] = "knowledge"


class RagFeedbackPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    helpful: bool
    note: str = Field(default="", max_length=2000)

    @field_validator("note")
    @classmethod
    def strip_feedback_note(cls, value: str) -> str:
        return value.strip()


class RagQueryRecordResponse(BaseModel):
    id: str
    persona_id: str
    conversation_id: str | None
    question: str
    answer: str
    interaction_mode: str
    confidence: float
    used_web_search: bool
    grounded: bool
    useful: bool
    evidence: list[dict[str, Any]]
    trace: list[dict[str, Any]]
    missing_points: list[str]
    error_code: str | None = None
    error_message: str | None = None
    retrieval_config: dict[str, Any]
    feedback: dict[str, Any] | None = None
    created_at: datetime


class RagQualityReportResponse(BaseModel):
    persona_id: str
    knowledge_space_id: str
    window: int
    query_count: int
    feedback_count: int
    helpful_rate: float | None
    grounded_rate: float | None
    useful_rate: float | None
    average_confidence: float | None
    web_fallback_rate: float
    top_trace_nodes: list[dict[str, Any]]
    document_versions: list[dict[str, Any]]
    retrieval_config: dict[str, Any]


class RagEvaluationRunSummary(BaseModel):
    id: str
    persona_id: str
    status: str
    config: dict[str, Any]
    metrics: dict[str, Any]
    analysis: str
    error_message: str | None
    created_at: datetime
    started_at: datetime | None
    finished_at: datetime | None


class WorkflowNodeResponse(BaseModel):
    """用户可见的流程节点；不包含内部图节点或本地路径。"""

    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    description: str = ""
    status: Literal["pending", "waiting_input", "running", "completed", "failed", "cancelled", "skipped"]
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    duration_seconds: float | None = Field(default=None, ge=0.0)
    error: str | None = None


class WorkflowEdgeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    from_: str = Field(alias="from")
    to: str


class WorkflowResponse(BaseModel):
    """Agent workflow 的公开视图，普通任务可以不返回。"""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    flow_id: str
    title: str
    # 专项 worker 是公开工作流合同的一部分：前端只能在 Agent
    # 正式 handoff 后据此激活对应工作区，不能从标题或用户文本猜测。
    worker: str | None = None
    kind: Literal["workflow", "sequence", "lifecycle", "data-flow"] = "workflow"
    status: Literal["idle", "running", "waiting_input", "completed", "failed", "cancelled"]
    current_node: str | None = None
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    nodes: list[WorkflowNodeResponse] = Field(default_factory=list)
    edges: list[WorkflowEdgeResponse] = Field(default_factory=list)
    waiting_inputs: list[dict[str, Any]] = Field(default_factory=list)
    # RVC worker metadata is optional and only exposed after a formal Agent handoff.
    # These are stable managed identifiers; local paths must never cross this boundary.
    rvc_session_id: str | None = None
    source_file_id: str | None = None
    session_id: str | None = None
    task_id: str | None = None
    attachment_ids: list[str] = Field(default_factory=list)
    input_refs: dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdateEvent(BaseModel):
    """流式传输的流程更新事件。"""

    model_config = ConfigDict(extra="forbid")

    kind: Literal["workflow_update"] = "workflow_update"
    task_id: str | None = None
    flow: WorkflowResponse


class AgentQueryPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(min_length=1, max_length=2000)
    conversation_id: str = Field(min_length=1, max_length=255)
    attachment_ids: list[str] = Field(default_factory=list, max_length=32)

    @field_validator("question", "conversation_id")
    @classmethod
    def strip_agent_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("value must not be empty")
        return value


class AgentResumePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation_id: str = Field(min_length=1, max_length=255)
    # specialist/approved 保留旧确认 API；新流程优先使用 worker/task_id/input_values。
    specialist: Literal["conversation", "web", "memory", "management"] = "management"
    approved: bool | None = None
    worker: str | None = Field(default=None, min_length=1, max_length=64)
    task_id: str | None = Field(default=None, min_length=1, max_length=255)
    attachment_ids: list[str] = Field(default_factory=list, max_length=32)
    input_values: dict[str, Any] = Field(default_factory=dict)


class AgentTurnResponse(BaseModel):
    status: Literal["completed", "pending_confirmation", "waiting_input", "failed", "degraded"]
    answer: str
    specialist: Literal["conversation", "web", "memory", "management"]
    worker: str | None = None
    pending_action: dict[str, Any] | None = None
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)
    worker_results: list[dict[str, Any]] = Field(default_factory=list)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    artifacts: list[dict[str, Any]] = Field(default_factory=list)
    citations: list[dict[str, Any]] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    trace: list[dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    requires_approval: bool = False
    error: dict[str, Any] | None = None
    error_code: str | None = None
    error_message: str | None = None
    duration_seconds: float = 0.0
    loaded_skills: list[str] = Field(default_factory=list)
    events: list[dict[str, Any]] = Field(default_factory=list)
    metrics: dict[str, Any] = Field(default_factory=dict)
    workflow: WorkflowResponse | None = None
    task_type: str | None = None
    input_refs: dict[str, Any] = Field(default_factory=dict)
    selected_options: dict[str, Any] = Field(default_factory=dict)
    waiting_inputs: list[dict[str, Any]] = Field(default_factory=list)
    result_refs: list[dict[str, Any]] = Field(default_factory=list)
    task_id: str | None = None


class LocalSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    openai_api_key: str | None = None
    openai_base_url: str | None = None
    openai_model: str | None = None
    embedding_api_key: str | None = None
    embedding_provider: str | None = None
    embedding_model_source: str | None = None
    embedding_device: str | None = None
    embedding_base_url: str | None = None
    embedding_model: str | None = None
    embedding_dimensions: int | None = Field(default=None, ge=1, le=4096)
    embedding_send_dimensions: bool | None = None
    chunk_size: int | None = Field(default=None, ge=200, le=4000)
    chunk_overlap: int | None = Field(default=None, ge=0, le=1000)
    web_search_provider: str | None = None
    web_search_api_key: str | None = None
    web_search_base_url: str | None = None
    tavily_api_key: str | None = None
    enable_web_fallback: bool | None = None

    # Provider configurations
    llm_provider: str | None = None
    tts_provider: str | None = None
    tts_api_key: str | None = None
    tts_base_url: str | None = None
    tts_model: str | None = None
    asr_provider: str | None = None
    asr_api_key: str | None = None
    asr_base_url: str | None = None
    asr_model: str | None = None
    reranker_provider: str | None = None
    reranker_api_key: str | None = None
    reranker_base_url: str | None = None
    reranker_model: str | None = None


class LLMConnectionTestPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    api_key: str | None = Field(default=None, max_length=4096)
    base_url: str = Field(min_length=1, max_length=2048)
    model: str = Field(min_length=1, max_length=255)

    @field_validator("api_key", "base_url", "model")
    @classmethod
    def strip_llm_test_values(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class LLMConnectionTestResponse(BaseModel):
    ok: bool
    model: str
    base_url: str
    message: str


class ApiKeyRevealRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: Literal["openai_api_key", "embedding_api_key", "web_search_api_key"]


class ApiKeyRevealResponse(BaseModel):
    value: str


class LocalSettingsResponse(BaseModel):
    # 设置页是 localhost-only 管理面板；按用户要求直接返回当前明文 Key。
    # 生产部署仍不应把该接口暴露到公网。
    openai_api_key: str = ""
    openai_api_key_configured: bool
    openai_base_url: str
    openai_model: str
    embedding_api_key: str = ""
    embedding_api_key_configured: bool
    embedding_provider: str
    embedding_model_source: str
    embedding_device: str
    embedding_base_url: str
    embedding_model: str
    embedding_dimensions: int
    embedding_send_dimensions: bool
    chunk_size: int
    chunk_overlap: int
    web_search_provider: str
    web_search_api_key: str = ""
    web_search_api_key_configured: bool
    web_search_base_url: str
    enable_web_fallback: bool
    restart_required: bool = False


class TranscriptionResponse(BaseModel):
    text: str


class ConversationAttachmentResponse(BaseModel):
    file_id: str
    name: str
    mime_type: str
    kind: str
    size: int
    duration: float | None = None
    width: int | None = None
    height: int | None = None
    status: str
    source: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    url: str
    created_at: datetime
    updated_at: datetime


class ConversationMessageResponse(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    kind: Literal["text", "audio"]
    content: str
    audio_url: str | None = None
    transcript: str | None = None
    status: Literal["pending", "transcribing", "completed", "failed"]
    error_message: str | None = None
    created_at: datetime
    attachments: list[ConversationAttachmentResponse] = Field(default_factory=list)


class VoiceMessageTurnResponse(BaseModel):
    message: ConversationMessageResponse
    turn: AgentTurnResponse


class PluginEnablePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    enabled: bool


class PluginConfigPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    config: dict[str, Any]


class PluginInfoResponse(BaseModel):
    name: str
    version: str
    description: str
    author: str
    enabled: bool
    config: dict[str, Any]
    error: str | None = None


class OneBotConfigUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    enabled: bool | None = None
    access_token: str | None = None
    group_trigger: Literal["at", "prefix"] | None = None
    prefix: str | None = None
    default_persona_id: str | None = None
    auto_reply_enabled: bool | None = None
    auto_voice_reply: bool | None = None
    voice_only: bool | None = None
    chinese_text: bool | None = None
    reply_mode: Literal["text", "text_voice", "voice_only"] | None = None
    spontaneous_reply_probability: float | None = Field(default=None, ge=0, le=1)


class OneBotObservationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_type: Literal["group"]
    target_id: str = Field(min_length=1, max_length=32)
    enabled: bool

    @field_validator("target_id")
    @classmethod
    def strip_target_id(cls, value: str) -> str:
        value = value.strip()
        if not value.isdigit() or int(value) <= 0:
            raise ValueError("target_id must be a positive number")
        return value


class NapCatSendPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_type: Literal["private", "group"]
    target_id: str = Field(min_length=1, max_length=32)
    text: str | None = Field(default=None, max_length=10000)
    record_path: str | None = Field(default=None, max_length=1024)
    persona_id: str | None = None
    voice: bool = False

    @model_validator(mode="after")
    def require_message(self):
        if not self.text and not self.record_path:
            raise ValueError("at least one message payload is required")
        return self

    @field_validator("target_id")
    @classmethod
    def strip_target_id(cls, value: str) -> str:
        value = value.strip()
        if not value.isdigit() or int(value) <= 0:
            raise ValueError("target_id must be a positive number")
        return value

    @field_validator("text", "record_path", "persona_id")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) and value.strip() else None


class NapCatConversationClearPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_type: Literal["private", "group"]
    target_id: str = Field(min_length=1, max_length=32)

    @field_validator("target_id")
    @classmethod
    def strip_target_id(cls, value: str) -> str:
        value = value.strip()
        if not value.isdigit() or int(value) <= 0:
            raise ValueError("target_id must be a positive number")
        return value

class BilibiliConfigUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    room_id: str | None = Field(default=None, max_length=20, pattern=r"^\d*$")
    default_persona_id: str | None = None
    danmaku_enabled: bool | None = None
    enter_enabled: bool | None = None
    auto_voice: bool | None = None
    cookie: str | None = Field(default=None, max_length=8192)


class ShutdownPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    stop_docker: bool = False


class DockerSettingsPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    on_exit: Literal["keep", "pause", "remove"]


class RunApprovalPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approved: bool

class PersonaVersionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str = Field(default="", max_length=255)
    note: str = Field(default="", max_length=5000)

    @field_validator("label", "note")
    @classmethod
    def strip_version_text(cls, value: str) -> str:
        return value.strip()


class PersonaVersionSummary(BaseModel):
    id: str
    persona_id: str
    version_number: int
    status: Literal["draft", "published", "superseded"]
    label: str
    note: str
    created_at: datetime
    published_at: datetime | None


class PersonaVersionResponse(PersonaVersionSummary):
    snapshot: dict[str, Any]


class PersonaVersionDiffResponse(BaseModel):
    persona_id: str
    from_version_id: str
    to_version_id: str
    changed: bool
    changes: list[dict[str, Any]]
