from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class SkinAssessmentCreate(BaseModel):
    answers: Dict[int, str]  # Question ID to answer mapping
    additional_concerns: Optional[str] = None

class SkinAssessmentResponse(BaseModel):
    skin_type: str
    assessment_answers: Dict[int, str]
    skin_concerns: Optional[str]
    recommendations: List[str]
    
    class Config:
        from_attributes = True

class ProductAnalysisCreate(BaseModel):
    product_name: Optional[str] = None
    ingredients: Optional[str] = None

class ProductAnalysisResponse(BaseModel):
    id: int
    product_name: Optional[str]
    ingredients: Optional[str]
    analysis_result: Dict[str, Any]
    suitability_score: Optional[int]
    recommendation: Optional[str]
    warnings: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True