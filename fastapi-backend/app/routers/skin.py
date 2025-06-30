from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.schemas.skin import SkinAssessmentCreate, SkinAssessmentResponse, ProductAnalysisCreate, ProductAnalysisResponse
from app.api.deps import get_current_active_user
from app.models.user import User
from app.crud.skin import update_user_skin_assessment, create_product_analysis, get_user_analyses
from app.services.gemini import GeminiAnalyzer

router = APIRouter(prefix="/skin", tags=["Skin Analysis"])

@router.post("/assessment", response_model=SkinAssessmentResponse)
async def submit_skin_assessment(
    assessment: SkinAssessmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit skin type assessment questionnaire."""
    
    updated_user = update_user_skin_assessment(db, current_user.id, assessment)
    
    if not updated_user:
        raise HTTPException(status_code=400, detail="Failed to update skin assessment")
    
    # Generate basic recommendations based on skin type
    recommendations = get_skin_type_recommendations(updated_user.skin_type)
    
    return SkinAssessmentResponse(
        skin_type=updated_user.skin_type,
        assessment_answers=updated_user.skin_assessment_answers,
        skin_concerns=updated_user.skin_concerns,
        recommendations=recommendations
    )

@router.get("/profile", response_model=SkinAssessmentResponse)
async def get_skin_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's skin profile and assessment results."""
    
    if not current_user.skin_type:
        raise HTTPException(
            status_code=404, 
            detail="No skin assessment found. Please complete the questionnaire first."
        )
    
    recommendations = get_skin_type_recommendations(current_user.skin_type)
    
    return SkinAssessmentResponse(
        skin_type=current_user.skin_type,
        assessment_answers=current_user.skin_assessment_answers or {},
        skin_concerns=current_user.skin_concerns,
        recommendations=recommendations
    )

@router.post("/analyze-product", response_model=ProductAnalysisResponse)
async def analyze_product(
    product_image: Optional[UploadFile] = File(None),
    product_name: Optional[str] = Form(None),
    ingredients: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze product suitability for user's skin type using Gemini AI."""
    
    if not current_user.skin_type:
        raise HTTPException(
            status_code=400,
            detail="Please complete skin assessment first before analyzing products."
        )
    
    if not product_image and not product_name and not ingredients:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a product image, product name, or ingredients list."
        )
    
    # Initialize Gemini analyzer
    analyzer = GeminiAnalyzer()
    
    # Analyze product
    if product_image:
        # Image-based analysis
        image_data = await product_image.read()
        analysis_result = analyzer.analyze_product_image(image_data, current_user.skin_type)
        
        # Use extracted product name if not provided
        if not product_name and analysis_result.get("product_name"):
            product_name = analysis_result["product_name"]
        
        # Use extracted ingredients if not provided
        if not ingredients and analysis_result.get("ingredients_list"):
            ingredients = ", ".join(analysis_result["ingredients_list"])
    else:
        # Text-based analysis
        analysis_result = analyzer.analyze_product_for_skin_type(
            skin_type=current_user.skin_type,
            product_name=product_name,
            ingredients=ingredients
        )
    
    # Save analysis to database
    analysis_data = {
        "product_name": product_name,
        "ingredients": ingredients,
        "analysis_result": analysis_result,
        "suitability_score": analysis_result.get("suitability_score"),
        "recommendation": analysis_result.get("recommendation"),
        "warnings": analysis_result.get("warnings")
    }
    
    saved_analysis = create_product_analysis(db, current_user.id, analysis_data)
    
    return ProductAnalysisResponse(
        id=saved_analysis.id,
        product_name=saved_analysis.product_name,
        ingredients=saved_analysis.ingredients,
        analysis_result=saved_analysis.analysis_result,
        suitability_score=saved_analysis.suitability_score,
        recommendation=saved_analysis.recommendation,
        warnings=saved_analysis.warnings,
        created_at=saved_analysis.created_at
    )

@router.get("/analyses", response_model=List[ProductAnalysisResponse])
async def get_my_analyses(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's previous product analyses."""
    
    analyses = get_user_analyses(db, current_user.id, skip, limit)
    
    return [
        ProductAnalysisResponse(
            id=analysis.id,
            product_name=analysis.product_name,
            ingredients=analysis.ingredients,
            analysis_result=analysis.analysis_result,
            suitability_score=analysis.suitability_score,
            recommendation=analysis.recommendation,
            warnings=analysis.warnings,
            created_at=analysis.created_at
        )
        for analysis in analyses
    ]

def get_skin_type_recommendations(skin_type: str) -> List[str]:
    """Get basic recommendations for skin type."""
    
    recommendations_map = {
        "dry": [
            "Use a gentle, creamy cleanser",
            "Apply moisturizer twice daily",
            "Look for products with hyaluronic acid and ceramides",
            "Avoid products with alcohol or harsh sulfates",
            "Use a humidifier in dry environments"
        ],
        "oily": [
            "Use oil-free, non-comedogenic products",
            "Cleanse twice daily with salicylic acid",
            "Use lightweight, gel-based moisturizers",
            "Don't over-cleanse as it can increase oil production",
            "Look for products with niacinamide"
        ],
        "combination": [
            "Use different products for different face areas",
            "Gentle cleansing for entire face",
            "Lightweight moisturizer on T-zone, richer on cheeks",
            "Use targeted treatments for specific areas",
            "Balance is key - don't over-treat"
        ],
        "sensitive": [
            "Choose fragrance-free products",
            "Patch test new products before full use",
            "Use gentle, hypoallergenic formulations",
            "Avoid products with many active ingredients",
            "Stick to a simple, consistent routine"
        ],
        "normal": [
            "Maintain current routine if working well",
            "Focus on protection with daily sunscreen",
            "Gentle cleansing and regular moisturizing",
            "Can experiment with various products",
            "Listen to your skin's changing needs"
        ]
    }
    
    return recommendations_map.get(skin_type, recommendations_map["normal"])