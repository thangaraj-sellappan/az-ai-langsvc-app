from fastapi import APIRouter
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from src.models.text_analzer_result import TextAnalyzerResponse
from src.services.az_lang_service import analyze_text

load_dotenv()

router = APIRouter()

class AnalyzeRequest(BaseModel):
    statement: str

@router.get("/")
def read_root():
    return {"version": "1.0.0", "description": "Azure AI Language Service API"}

@router.get("/settings")
def read_settings():
    """Retrieve settings."""
    return {"environment": os.getenv("environment", "development")}

@router.post("/analyze")
def validate_pii_route(request: AnalyzeRequest):
    """Analyze text for PII, sentiment, entities, etc."""
    try:
        if not request.statement or not request.statement.strip():
            return TextAnalyzerResponse(has_error=True, error="No text provided for analysis")

        results = analyze_text([request.statement])
        if len(results) > 0:
            return results[0]
        return TextAnalyzerResponse(has_error=True, error="No analysis results returned")
    except Exception as e:
        return TextAnalyzerResponse(has_error=True, error=f"Analysis failed: {str(e)}")