from datetime import datetime
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

EvalDifficulty = Literal["easy", "medium", "hard"]
EvalCaseSource = Literal["manual", "feedback"]


def _clean_string_list(values: list[str], *, field_name: str, item_max_length: int) -> list[str]:
    cleaned: list[str] = []
    for value in values:
        item = value.strip()
        if not item:
            continue
        if len(item) > item_max_length:
            raise ValueError(f"{field_name} item is too long")
        if item not in cleaned:
            cleaned.append(item)
    return cleaned


class EvalCaseCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(min_length=1, max_length=4000)
    expected_answer: str = Field(default="", max_length=8000)
    relevant_document_ids: list[str] = Field(default_factory=list, max_length=20)
    tags: list[str] = Field(default_factory=list, max_length=20)
    difficulty: EvalDifficulty = "medium"
    enabled: bool = True
    source: EvalCaseSource = "manual"
    source_query_id: str | None = Field(default=None, max_length=36)

    @field_validator("question")
    @classmethod
    def strip_question(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question must not be empty")
        return value

    @field_validator("expected_answer")
    @classmethod
    def strip_expected_answer(cls, value: str) -> str:
        return value.strip()

    @field_validator("relevant_document_ids")
    @classmethod
    def clean_document_ids(cls, value: list[str]) -> list[str]:
        return _clean_string_list(value, field_name="relevant_document_ids", item_max_length=255)

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, value: list[str]) -> list[str]:
        return _clean_string_list(value, field_name="tags", item_max_length=64)


class EvalCaseUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str | None = Field(default=None, min_length=1, max_length=4000)
    expected_answer: str | None = Field(default=None, max_length=8000)
    relevant_document_ids: list[str] | None = Field(default=None, max_length=20)
    tags: list[str] | None = Field(default=None, max_length=20)
    difficulty: EvalDifficulty | None = None
    enabled: bool | None = None

    @field_validator("question")
    @classmethod
    def strip_optional_question(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("question must not be empty")
        return value

    @field_validator("expected_answer")
    @classmethod
    def strip_optional_expected_answer(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("relevant_document_ids")
    @classmethod
    def clean_optional_document_ids(cls, value: list[str] | None) -> list[str] | None:
        return _clean_string_list(value, field_name="relevant_document_ids", item_max_length=255) if value is not None else None

    @field_validator("tags")
    @classmethod
    def clean_optional_tags(cls, value: list[str] | None) -> list[str] | None:
        return _clean_string_list(value, field_name="tags", item_max_length=64) if value is not None else None


class EvalCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    knowledge_space_id: str
    question: str
    expected_answer: str
    relevant_document_ids: list[str]
    tags: list[str]
    difficulty: EvalDifficulty
    enabled: bool
    source: EvalCaseSource
    source_query_id: str | None
    created_at: datetime
    updated_at: datetime


class EvalCaseListResponse(BaseModel):
    items: list[EvalCaseResponse]
    total: int

class EvalCandidateStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class EvalCandidateReviewPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_answer: str | None = Field(default=None, max_length=8000)
    relevant_document_ids: list[str] | None = Field(default=None, max_length=20)
    tags: list[str] | None = Field(default=None, max_length=20)
    difficulty: EvalDifficulty | None = None
    note: str = Field(default="", max_length=2000)

    @field_validator("expected_answer", "note")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("relevant_document_ids")
    @classmethod
    def clean_optional_document_ids(cls, value: list[str] | None) -> list[str] | None:
        return _clean_string_list(value, field_name="relevant_document_ids", item_max_length=255) if value is not None else None

    @field_validator("tags")
    @classmethod
    def clean_optional_tags(cls, value: list[str] | None) -> list[str] | None:
        return _clean_string_list(value, field_name="tags", item_max_length=64) if value is not None else None


class EvalCandidateResponse(BaseModel):
    id: str
    workspace_id: str
    knowledge_space_id: str
    source_query_id: str
    status: EvalCandidateStatus
    source: str
    question: str
    suggested_answer: str
    relevant_document_ids: list[str]
    tags: list[str]
    signals: list[dict[str, str]]
    evidence: list[dict[str, Any]]
    confidence: float
    grounded: bool
    useful: bool
    feedback_helpful: bool | None
    reviewer_note: str
    created_at: datetime
    updated_at: datetime
    reviewed_at: datetime | None


class EvalCandidateListResponse(BaseModel):
    items: list[EvalCandidateResponse]
    total: int
    pending_total: int


class EvalCandidateSyncResponse(BaseModel):
    created: int
    existing: int
    items: list[EvalCandidateResponse]

