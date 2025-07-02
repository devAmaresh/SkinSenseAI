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
    
    # Generate personalized routine based on assessment answers and concerns
    routine = generate_personalized_routine(
        skin_type=current_user.skin_type,
        assessment_answers=current_user.skin_assessment_answers or {},
        skin_concerns=current_user.skin_concerns
    )
    
    return SkinAssessmentResponse(
        skin_type=current_user.skin_type,
        assessment_answers=current_user.skin_assessment_answers or {},
        skin_concerns=current_user.skin_concerns,
        recommendations=recommendations,
        routine=routine
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
    """Get personalized recommendations for the skin type."""
    
    recommendations_map = {
        "dry": [
            "Use a gentle, cream-based cleanser that won't strip natural oils",
            "Apply a rich moisturizer with ceramides and hyaluronic acid twice daily",
            "Look for products with glycerin, shea butter, and niacinamide",
            "Avoid products with alcohol, harsh sulfates, and over-exfoliation",
            "Use a humidifier in dry environments",
            "Consider facial oils for extra hydration"
        ],
        "oily": [
            "Use a foaming cleanser with salicylic acid twice daily",
            "Choose oil-free, non-comedogenic moisturizers and products",
            "Incorporate BHA (salicylic acid) for pore care 2-3x per week",
            "Look for niacinamide to control oil production",
            "Avoid over-cleansing which can trigger more oil production",
            "Use clay masks 1-2x per week for deep cleaning"
        ],
        "combination": [
            "Use different products for T-zone (oily) and cheeks (normal/dry)",
            "Choose a balanced cleanser that doesn't over-dry",
            "Apply lightweight moisturizer on T-zone, richer on cheeks",
            "Use targeted treatments for different areas",
            "Look for products with niacinamide for balance",
            "Avoid one-size-fits-all approaches"
        ],
        "sensitive": [
            "Choose fragrance-free, hypoallergenic products only",
            "Always patch test new products before full application",
            "Look for minimal ingredient lists and gentle formulations",
            "Use mineral sunscreens (zinc oxide, titanium dioxide)",
            "Avoid essential oils, strong actives, and harsh scrubs",
            "Build routine slowly, introducing one product at a time"
        ],
        "normal": [
            "Maintain your current routine if it's working well",
            "Focus on prevention with daily SPF and antioxidants",
            "Use gentle, pH-balanced cleansers",
            "Incorporate vitamin C serum for protection and brightness",
            "Don't over-treat - less is often more",
            "Adjust routine seasonally as skin needs change"
        ]
    }
    
    return recommendations_map.get(skin_type, recommendations_map["normal"])

def generate_personalized_routine(skin_type: str, assessment_answers: dict, skin_concerns: Optional[List[str]]) -> List[dict]:
    """Generate personalized routine based on user's specific answers and concerns."""
    
    routine_steps = []
    step_order = 1
    
    # Base routine for all skin types
    routine_steps.append({
        "title": "Gentle Cleansing",
        "description": get_cleanser_recommendation(skin_type, assessment_answers),
        "icon": "water-outline",
        "color": "#4FC3F7",
        "step_order": step_order,
        "time_of_day": "both"
    })
    step_order += 1
    
    # Add treatment steps based on concerns
    if skin_concerns:
        if "acne" in [c.lower() for c in skin_concerns]:
            routine_steps.append({
                "title": "Acne Treatment",
                "description": get_acne_treatment(skin_type),
                "icon": "medical-outline",
                "color": "#81C784",
                "step_order": step_order,
                "time_of_day": "evening"
            })
            step_order += 1
            
        if "dark spots" in [c.lower() for c in skin_concerns] or "hyperpigmentation" in [c.lower() for c in skin_concerns]:
            routine_steps.append({
                "title": "Brightening Treatment",
                "description": "Use vitamin C serum in morning or retinoids at night for dark spots",
                "icon": "sunny-outline",
                "color": "#FFB74D",
                "step_order": step_order,
                "time_of_day": "morning"
            })
            step_order += 1
            
        if "wrinkles" in [c.lower() for c in skin_concerns] or "aging" in [c.lower() for c in skin_concerns]:
            routine_steps.append({
                "title": "Anti-Aging Care",
                "description": "Apply retinoid at night and antioxidant serum in morning",
                "icon": "leaf-outline",
                "color": "#BA68C8",
                "step_order": step_order,
                "time_of_day": "evening"
            })
            step_order += 1
    
    # Moisturizer based on skin type and assessment
    routine_steps.append({
        "title": "Moisturizing",
        "description": get_moisturizer_recommendation(skin_type, assessment_answers),
        "icon": "heart-outline",
        "color": "#FF8A65",
        "step_order": step_order,
        "time_of_day": "both"
    })
    step_order += 1
    
    # Sun protection (always last in morning routine)
    routine_steps.append({
        "title": "Sun Protection",
        "description": get_sunscreen_recommendation(skin_type, assessment_answers),
        "icon": "shield-outline",
        "color": "#FFA726",
        "step_order": step_order,
        "time_of_day": "morning"
    })
    
    return routine_steps

def get_cleanser_recommendation(skin_type: str, answers: dict) -> str:
    """Get personalized cleanser recommendation based on skin type and assessment."""
    
    # Check if user experiences tightness after cleansing (question about skin feeling)
    feels_tight = any("tight" in str(v).lower() for v in answers.values())
    
    if skin_type == "dry" or feels_tight:
        return "Use a gentle, cream-based cleanser that won't strip natural oils"
    elif skin_type == "oily":
        return "Use a foaming cleanser with salicylic acid to control oil production"
    elif skin_type == "sensitive":
        return "Choose a fragrance-free, hypoallergenic gentle cleanser"
    elif skin_type == "combination":
        return "Use a balanced gel cleanser that cleanses without over-drying"
    else:
        return "Use a gentle daily cleanser suitable for your skin type"

def get_moisturizer_recommendation(skin_type: str, answers: dict) -> str:
    """Get personalized moisturizer recommendation."""
    
    # Check for specific skin concerns from answers
    has_flaking = any("flaking" in str(v).lower() or "peeling" in str(v).lower() for v in answers.values())
    has_shine = any("shiny" in str(v).lower() or "oily" in str(v).lower() for v in answers.values())
    
    if skin_type == "dry" or has_flaking:
        return "Apply a rich, hydrating moisturizer with ceramides and hyaluronic acid"
    elif skin_type == "oily" or has_shine:
        return "Use a lightweight, oil-free moisturizer that won't clog pores"
    elif skin_type == "sensitive":
        return "Choose a gentle, minimal-ingredient moisturizer without fragrances"
    elif skin_type == "combination":
        return "Use different moisturizers for T-zone (lightweight) and cheeks (richer)"
    else:
        return "Apply a balanced moisturizer suitable for your skin type"

def get_sunscreen_recommendation(skin_type: str, answers: dict) -> str:
    """Get personalized sunscreen recommendation."""
    
    if skin_type == "sensitive":
        return "Use mineral sunscreen (zinc oxide/titanium dioxide) SPF 30+ daily"
    elif skin_type == "oily":
        return "Choose a lightweight, non-comedogenic sunscreen with SPF 30+"
    elif skin_type == "dry":
        return "Use a moisturizing sunscreen with SPF 30+ that provides hydration"
    else:
        return "Apply broad-spectrum SPF 30+ sunscreen every morning"

def get_acne_treatment(skin_type: str) -> str:
    """Get acne treatment recommendation based on skin type."""
    
    if skin_type == "sensitive":
        return "Use gentle BHA (salicylic acid) 1-2x per week, start slowly"
    elif skin_type == "dry":
        return "Use salicylic acid with extra moisturizing to prevent dryness"
    else:
        return "Apply salicylic acid or benzoyl peroxide as spot treatment"