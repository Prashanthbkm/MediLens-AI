
from uuid import UUID

from pydantic import BaseModel, Field


class ReportSummaryRequest(BaseModel):
    report_text: str = Field(
        ...,
        min_length=20,
        max_length=30000,
        description="Extracted medical report text"
    )


class ReportSummaryResponse(BaseModel):
    summary: str
    important_findings: list[str] = Field(default_factory=list)
    abnormal_results: list[str] = Field(default_factory=list)
    normal_results: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    disclaimer: str


class ReportQuestionRequest(BaseModel):
    report_text: str = Field(
        ...,
        min_length=20,
        max_length=30000
    )
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000
    )


class ReportQuestionResponse(BaseModel):
    question: str
    answer: str
    supporting_context: list[str] = Field(default_factory=list)
    disclaimer: str


class ReportIngestRequest(BaseModel):
    report_id: UUID
    user_id: UUID
    report_text: str = Field(
        ...,
        min_length=20,
        max_length=30000
    )


class RAGQuestionRequest(BaseModel):
    report_id: UUID
    user_id: UUID
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000
    )
