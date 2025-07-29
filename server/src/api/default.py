from fastapi import APIRouter
import os
from dotenv import load_dotenv
from src.models.text_analzer_result import TextAnalyzerResponse
from src.services.az_lang_service import analyze_text

load_dotenv()

router = APIRouter()

@router.get("/")
def read_root():
    return {"version": "1.0.0", "description": "Azure AI Language Service API"}

@router.get("/settings")
def read_settings():
    """Retrieve settings."""
    return {"environment": os.getenv("environment", "development")}

@router.get("/analyze")
def validate_pii_route(statement: str):
    """Analyze text for PII"""
    if not statement:
        return TextAnalyzerResponse(has_error=True, error="No text provided for analysis")
    
    results = analyze_text([statement])
    if len(results) > 0:
        return results[0]
    return None