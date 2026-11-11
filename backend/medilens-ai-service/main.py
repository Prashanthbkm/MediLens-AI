
import logging

from fastapi import FastAPI, HTTPException

from app.schemas.medical import MedicalTestResultRequest

from app.schemas.report_summary import (
    ReportSummaryRequest,
    ReportQuestionRequest,
    ReportIngestRequest,
    RAGQuestionRequest
)

from app.services.medical_explanation import MedicalExplanationService
from app.services.groq_service import generate_medical_explanation
from app.services.report_summary_service import ReportSummaryService
from app.services.report_qa_service import ReportQAService
from app.services.rag_service import RAGService
from app.services.rag_qa_service import RAGQAService


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

logger = logging.getLogger("medilens-ai")


app = FastAPI(
    title="MediLens AI Service",
    description="AI-powered medical report analysis and RAG service",
    version="1.0.0"
)


DISCLAIMER = (
    "This information is generated for educational purposes only. "
    "It is not a medical diagnosis or treatment recommendation. "
    "Consult a qualified healthcare professional."
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MediLens AI Service",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "service": "MediLens AI",
        "status": "healthy"
    }


@app.post("/api/v1/medical/validate-result")
def validate_medical_result(request: MedicalTestResultRequest):
    return {
        "message": "Medical test result received successfully",
        "data": request.model_dump()
    }


@app.post("/api/v1/medical/explain-result")
def explain_medical_result(request: MedicalTestResultRequest):
    try:
        explanation = MedicalExplanationService.generate_explanation(
            request
        )
        return explanation.model_dump()

    except Exception:
        logger.exception("Rule-based explanation failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate medical explanation."
        )


@app.post("/api/v1/medical/ai-explain-result")
def ai_explain_medical_result(request: MedicalTestResultRequest):
    try:
        ai_explanation = generate_medical_explanation(
            test_name=request.test_name,
            numeric_value=request.numeric_value,
            text_value=request.text_value,
            unit=request.unit,
            reference_range=request.reference_range,
            result_flag=request.result_flag
        )

        return {
            "message": "AI medical explanation generated successfully",
            "test_name": request.test_name,
            "result_flag": request.result_flag,
            "ai_explanation": ai_explanation,
            "disclaimer": DISCLAIMER
        }

    except Exception:
        logger.exception("AI medical explanation failed")
        raise HTTPException(
            status_code=502,
            detail="Unable to generate AI explanation. Please try again."
        )


@app.post("/api/v1/medical/summarize-report")
def summarize_medical_report(request: ReportSummaryRequest):
    try:
        summary = ReportSummaryService.generate_summary(
            request.report_text
        )

        return {
            "message": "Medical report summary generated successfully",
            "data": summary
        }

    except Exception:
        logger.exception("Report summarization failed")
        raise HTTPException(
            status_code=502,
            detail="Unable to summarize the medical report. Please try again."
        )


# Existing direct report Q&A endpoint is preserved.
@app.post("/api/v1/medical/ask-report")
def ask_medical_report(request: ReportQuestionRequest):
    try:
        result = ReportQAService.answer_question(
            report_text=request.report_text,
            question=request.question
        )

        return {
            "message": "Report question answered successfully",
            "data": result
        }

    except Exception:
        logger.exception("Direct report Q&A failed")
        raise HTTPException(
            status_code=502,
            detail="Unable to answer the report question. Please try again."
        )


# New RAG report ingestion endpoint.
@app.post("/api/v1/medical/ingest-report")
def ingest_medical_report(request: ReportIngestRequest):
    try:
        result = RAGService.ingest_report(
            report_id=request.report_id,
            user_id=request.user_id,
            report_text=request.report_text
        )

        return {
            "message": "Medical report indexed successfully",
            "data": result
        }

    except Exception:
        logger.exception("RAG report ingestion failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to index the medical report."
        )


# New RAG question-answering endpoint.
@app.post("/api/v1/medical/ask-report-rag")
def ask_medical_report_rag(request: RAGQuestionRequest):
    try:
        result = RAGQAService.answer_question(
            report_id=request.report_id,
            user_id=request.user_id,
            question=request.question
        )

        return {
            "message": "RAG report question answered successfully",
            "data": result
        }

    except Exception:
        logger.exception("RAG question answering failed")
        raise HTTPException(
            status_code=502,
            detail="Unable to answer the report question."
        )
