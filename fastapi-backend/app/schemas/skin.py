from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
class RoutineStep(BaseModel):
    title: str
    description: str
    icon: str
    color: str
    step_order: int
    time_of_day: str  # "morning", "evening", "both"

class SkinAssessmentCreate(BaseModel):
    answers: Dict[int, str]  # Question ID to answer mapping
    additional_concerns: Optional[str] = None

class SkinAssessmentResponse(BaseModel):
    skin_type: str
    assessment_answers: Dict[str, str]
    skin_concerns: Optional[List[str]] = None
    recommendations: List[str]
    routine: Optional[List[RoutineStep]] = None

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