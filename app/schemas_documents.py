from datetime import datetime

from pydantic import BaseModel


class DocumentProcessingSummaryResponse(BaseModel):
    """只读的知识空间文档处理汇总。"""

    knowledge_space_id: str
    total_documents: int
    status_counts: dict[str, int]
    indexed_count: int
    failed_count: int
    in_progress_count: int
    ready_count: int
    document_type_counts: dict[str, int]
    chunking_preset_counts: dict[str, int]
    chunker_version_counts: dict[str, int]
    index_version_counts: dict[str, int]
    latest_updated_at: datetime | None
    latest_indexed_at: datetime | None


class DocumentProcessingReportResponse(BaseModel):
    """单个文档任务的处理状态与索引元数据，不返回文件路径或正文。"""

    id: str
    workspace_id: str
    knowledge_space_id: str
    document_id: str
    original_filename: str
    markdown_filename: str
    status: str
    error_message: str | None
    document_type: str | None
    chunking_preset: str | None
    chunker_version: str | None
    index_version: str | None
    markdown_preview_available: bool
    markdown_preview_length: int
    created_at: datetime
    updated_at: datetime
    indexed_at: datetime | None
