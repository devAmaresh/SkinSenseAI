from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union
from datetime import datetime

class RoutineStep(BaseModel):
    title: str
    description: str
    icon: str
    color: str
    step_order: int
    time_of_day: str  # "morning", "evening", "both"

class RecommendationItem(BaseModel):
    title: str
    description: str
    icon: str
    color: str
    priority: str  # "urgent", "high", "medium", "low"

# ============= ASSESSMENT SCHEMAS =============

class SkinAssessmentRequest(BaseModel):
    answers: List[Union[str, Dict[str, Any]]]  # Support both simple strings and detailed objects
    additional_concerns: Optional[str] = ""

class SkinAssessmentCreate(BaseModel):
    answers: Dict[int, str]  # Question ID to answer mapping
    additional_concerns: Optional[str] = None

class SkinAssessmentResponse(BaseModel):
    skin_type: str
    confidence: int
    secondary_characteristics: List[Dict[str, str]] = []
    recommendations: List[str]
    message: str

    class Config:
        from_attributes = True

# ============= PROFILE SCHEMAS =============

class AllergenInfo(BaseModel):
    ingredient_name: str
    severity: str
    confirmed: bool

class SkinIssueInfo(BaseModel):
    issue_type: str
    severity: int
    status: str
    description: Optional[str] = None

class SkinProfileResponse(BaseModel):
    skin_type: Optional[str] = None
    skin_concerns: Optional[str] = None
    allergens: List[AllergenInfo] = []
    skin_issues: List[SkinIssueInfo] = []
    updated_at: Optional[datetime] = None
    recommendations: Optional[List[RecommendationItem]] = []  # Add this field

    class Config:
        from_attributes = True

# ============= PRODUCT ANALYSIS SCHEMAS =============

class ProductAnalysisCreate(BaseModel):
    product_name: Optional[str] = None
    ingredients: Optional[str] = None

class ProductAnalysisResponse(BaseModel):
    product_name: Optional[str]
    suitability_score: Optional[int]
    analysis: Optional[str]  # Changed from analysis_result to analysis to match router
    allergen_warnings: List[str] = []
    beneficial_ingredients: List[str] = []
    usage_recommendations: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============= LEGACY SCHEMAS (for backward compatibility) =============

class ProductAnalysisResponseLegacy(BaseModel):
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