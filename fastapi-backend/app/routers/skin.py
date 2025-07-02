from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
import io

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.skin_memory import UserAllergen, SkinIssue
from app.schemas.skin import (
    SkinAssessmentRequest,
    SkinAssessmentResponse,
    ProductAnalysisResponse,
    SkinProfileResponse
)
from app.services.gemini import gemini_analyzer
from app.crud import user as user_crud
from app.crud.skin_memory import skin_memory_crud

router = APIRouter(prefix="/skin", tags=["Skin Analysis"])

@router.post("/assessment", response_model=SkinAssessmentResponse)
async def submit_skin_assessment(
    assessment: SkinAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit skin type assessment questionnaire."""
    
    try:
        # Simple skin type determination based on answers
        skin_type = determine_skin_type(assessment.answers)
        
        # Update user's skin profile using direct database update
        current_user.skin_type = skin_type
        current_user.skin_assessment_answers = {str(i): ans for i, ans in enumerate(assessment.answers)}
        current_user.skin_concerns = assessment.additional_concerns
        
        db.commit()
        db.refresh(current_user)
        
        return SkinAssessmentResponse(
            skin_type=skin_type,
            recommendations=generate_skin_recommendations(skin_type),
            message="Skin assessment completed successfully!"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@router.get("/profile", response_model=SkinProfileResponse)
async def get_skin_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's skin profile with dynamic recommendations."""
    
    # Get user's allergens and skin issues
    allergens = db.query(UserAllergen).filter(
        UserAllergen.user_id == current_user.id,
        UserAllergen.is_active == True
    ).all()
    
    skin_issues = db.query(SkinIssue).filter(
        SkinIssue.user_id == current_user.id
    ).all()
    
    # Generate dynamic recommendations based on profile
    recommendations = generate_dynamic_recommendations(
        skin_type=current_user.skin_type,
        allergens=allergens,
        skin_issues=skin_issues,
        skin_concerns=current_user.skin_concerns
    )
    
    return SkinProfileResponse(
        skin_type=current_user.skin_type,
        updated_at=current_user.updated_at,
        skin_concerns=current_user.skin_concerns,
        allergens=[{
            "ingredient_name": a.ingredient_name,
            "severity": a.severity,
            "confirmed": a.confirmed
        } for a in allergens],
        skin_issues=[{
            "issue_type": i.issue_type,
            "severity": i.severity,
            "status": i.status,
            "description": i.description
        } for i in skin_issues],
        recommendations=recommendations  # Add this field
    )

def generate_dynamic_recommendations(skin_type, allergens, skin_issues, skin_concerns):
    """Generate personalized recommendations based on user's profile."""
    recommendations = []
    
    # Base recommendations by skin type
    if skin_type == "dry":
        recommendations.extend([
            {
                "title": "Hydration Focus",
                "description": "Use ceramide-rich moisturizers twice daily",
                "icon": "water-outline",
                "color": "#00f5ff",
                "priority": "high"
            },
            {
                "title": "Gentle Cleansing",
                "description": "Avoid foaming cleansers, use cream-based ones",
                "icon": "leaf-outline",
                "color": "#00ff88",
                "priority": "medium"
            }
        ])
    elif skin_type == "oily":
        recommendations.extend([
            {
                "title": "Oil Control",
                "description": "Use niacinamide or salicylic acid products",
                "icon": "shield-outline",
                "color": "#0080ff",
                "priority": "high"
            }
        ])
    elif skin_type == "sensitive":
        recommendations.extend([
            {
                "title": "Gentle Products",
                "description": "Choose fragrance-free, hypoallergenic formulas",
                "icon": "heart-outline",
                "color": "#ff6b9d",
                "priority": "high"
            }
        ])
    
    # Allergen-based recommendations
    if allergens:
        allergen_names = [a.ingredient_name.lower() for a in allergens]
        if any("paraben" in name for name in allergen_names):
            recommendations.append({
                "title": "Paraben-Free Products",
                "description": "Always check labels for paraben alternatives",
                "icon": "alert-circle-outline",
                "color": "#ff6600",
                "priority": "high"
            })
        
        recommendations.append({
            "title": "Patch Testing",
            "description": f"Test new products - you have {len(allergens)} known allergen(s)",
            "icon": "medical-outline",
            "color": "#8B5CF6",
            "priority": "medium"
        })
    
    # Issue-based recommendations
    if skin_issues:
        issue_types = [i.issue_type.lower() for i in skin_issues]
        
        if any("blackhead" in issue for issue in issue_types):
            recommendations.append({
                "title": "Blackhead Treatment",
                "description": "Use BHA (salicylic acid) 2-3 times per week",
                "icon": "sparkles-outline",
                "color": "#00ff88",
                "priority": "high"
            })
        
        if any("acne" in issue for issue in issue_types):
            high_severity_acne = any(i.severity >= 7 for i in skin_issues if "acne" in i.issue_type.lower())
            if high_severity_acne:
                recommendations.append({
                    "title": "Acne Management",
                    "description": "Consider consulting a dermatologist for severe acne",
                    "icon": "medical-outline",
                    "color": "#ff4444",
                    "priority": "urgent"
                })
            else:
                recommendations.append({
                    "title": "Gentle Acne Care",
                    "description": "Use gentle acne treatments with benzoyl peroxide",
                    "icon": "fitness-outline",
                    "color": "#0080ff",
                    "priority": "medium"
                })
    
    # General recommendations
    recommendations.extend([
        {
            "title": "Daily SPF",
            "description": "Use broad-spectrum SPF 30+ every morning",
            "icon": "sunny-outline",
            "color": "#ffaa00",
            "priority": "medium"
        },
        {
            "title": "Product Analysis",
            "description": "Scan new products with SkinSenseAI before use",
            "icon": "scan-outline",
            "color": "#00f5ff",
            "priority": "low"
        }
    ])
    
    # Sort by priority
    priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 4))
    
    return recommendations[:6]  # Return top 6 recommendations

@router.post("/analyze-product", response_model=ProductAnalysisResponse)
async def analyze_product(
    product_image: Optional[UploadFile] = File(None),
    product_name: Optional[str] = Form(None),
    ingredients: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze a skincare product for compatibility with user's skin."""
    
    try:
        # Validate inputs
        if not product_image and not product_name and not ingredients:
            raise HTTPException(
                status_code=400, 
                detail="Please provide either a product image, product name, or ingredients list"
            )
        
        # Get user's skin memory data using CRUD methods
        user_allergens = skin_memory_crud.get_user_allergens(db, current_user.id)
        user_issues = skin_memory_crud.get_user_skin_issues(db, current_user.id)
        
        # Convert to dict format for the analyzer
        allergen_data = [{
            "ingredient_name": a.ingredient_name,
            "severity": a.severity,
            "confirmed": a.confirmed,
            "notes": a.notes
        } for a in user_allergens]
        
        issue_data = [{
            "issue_type": i.issue_type,
            "description": i.description,
            "severity": i.severity,
            "status": i.status,
            "triggers": i.triggers or []
        } for i in user_issues]
        
        if product_image:
            # Image-based analysis
            image_data = await product_image.read()
            
            # Use the correct method name with skin memory integration
            analysis_result = gemini_analyzer.analyze_product_with_memory(
                image_data=image_data,
                skin_type=current_user.skin_type or "unknown",
                user_allergens=allergen_data,
                user_issues=issue_data,
                db=db,
                user_id=current_user.id
            )
        else:
            # Text-based analysis (fallback method)
            analysis_result = analyze_product_text(
                product_name=product_name,
                ingredients=ingredients,
                skin_type=current_user.skin_type or "unknown",
                user_allergens=allergen_data,
                user_issues=issue_data
            )
        
        return ProductAnalysisResponse(
            product_name=analysis_result.get("product_name", product_name or "Unknown"),
            suitability_score=analysis_result.get("suitability_score", 5),
            analysis=analysis_result.get("personalized_recommendation", "Analysis completed"),
            allergen_warnings=analysis_result.get("allergen_warnings", []),
            beneficial_ingredients=analysis_result.get("beneficial_ingredients", []),
            usage_recommendations=analysis_result.get("usage_instructions", "Follow product instructions")
        )
        
    except Exception as e:
        print(f"Product analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analyses")
async def get_my_analyses(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's product analysis history."""
    
    try:
        # Use the CRUD instance method
        analyses = skin_memory_crud.get_user_memory_entries(
            db=db,
            user_id=current_user.id,
            entry_type="analysis_finding",
            limit=limit,
            skip=skip
        )
        
        return {
            "analyses": [{
                "id": analysis.id,
                "content": analysis.content,
                "metadata": analysis.entry_metadata,
                "created_at": analysis.created_at.isoformat(),
                "importance": analysis.importance,
                "source": analysis.source,
                "entry_type": analysis.entry_type
            } for analysis in analyses],
            "total": len(analyses)
        }
        
    except AttributeError as e:
        print(f"AttributeError in analyses: {e}")
        # Fallback: try direct database query
        try:
            from app.models.skin_memory import SkinMemoryEntry
            analyses = db.query(SkinMemoryEntry).filter(
                SkinMemoryEntry.user_id == current_user.id,
                SkinMemoryEntry.entry_type == "analysis_finding",
                SkinMemoryEntry.is_active == True
            ).order_by(SkinMemoryEntry.created_at.desc()).limit(limit).offset(skip).all()
            
            return {
                "analyses": [{
                    "id": analysis.id,
                    "content": analysis.content,
                    "metadata": analysis.entry_metadata,
                    "created_at": analysis.created_at.isoformat(),
                    "importance": analysis.importance,
                    "source": analysis.source,
                    "entry_type": analysis.entry_type
                } for analysis in analyses],
                "total": len(analyses)
            }
        except Exception as fallback_error:
            print(f"Fallback query also failed: {fallback_error}")
            return {
                "analyses": [],
                "total": 0
            }
        
    except Exception as e:
        print(f"Get analyses error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get analyses: {str(e)}")

@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Permanently delete a specific product analysis."""
    
    try:
        # Check if analysis exists and belongs to current user
        from app.models.skin_memory import SkinMemoryEntry
        analysis = db.query(SkinMemoryEntry).filter(
            SkinMemoryEntry.id == analysis_id,
            SkinMemoryEntry.user_id == current_user.id,
            SkinMemoryEntry.entry_type == "analysis_finding",
            SkinMemoryEntry.is_active == True
        ).first()
        
        if not analysis:
            raise HTTPException(
                status_code=404, 
                detail="Analysis not found or you don't have permission to delete it"
            )
        
        # Hard delete
        db.delete(analysis)
        db.commit()
        
        return {
            "message": "Analysis permanently deleted",
            "deleted_analysis_id": analysis_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete analysis error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@router.delete("/analyses")
async def delete_all_analyses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Permanently delete all product analyses for the current user."""
    
    try:
        from app.models.skin_memory import SkinMemoryEntry
        
        # Get all analyses to be deleted
        analyses_to_delete = db.query(SkinMemoryEntry).filter(
            SkinMemoryEntry.user_id == current_user.id,
            SkinMemoryEntry.entry_type == "analysis_finding",
            SkinMemoryEntry.is_active == True
        ).all()
        
        if not analyses_to_delete:
            return {
                "message": "No analyses found to delete",
                "deleted_count": 0
            }
        
        # Hard delete all analyses
        for analysis in analyses_to_delete:
            db.delete(analysis)
        
        count = len(analyses_to_delete)
        db.commit()
        
        return {
            "message": f"Permanently deleted {count} analyses",
            "deleted_count": count
        }
        
    except Exception as e:
        print(f"Delete all analyses error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete analyses: {str(e)}")

def determine_skin_type(answers: List[str]) -> str:
    """Determine skin type based on assessment answers."""
    # Simplified logic - you can make this more sophisticated
    if not answers:
        return "normal"
    
    # Count keywords in answers
    oily_keywords = ["oily", "shiny", "greasy", "acne", "breakouts"]
    dry_keywords = ["dry", "tight", "flaky", "rough", "dull"]
    sensitive_keywords = ["sensitive", "irritated", "red", "burning", "stinging"]
    
    answer_text = " ".join(answers).lower()
    
    oily_count = sum(1 for keyword in oily_keywords if keyword in answer_text)
    dry_count = sum(1 for keyword in dry_keywords if keyword in answer_text)
    sensitive_count = sum(1 for keyword in sensitive_keywords if keyword in answer_text)
    
    if sensitive_count >= 2:
        return "sensitive"
    elif oily_count > dry_count:
        return "oily"
    elif dry_count > oily_count:
        return "dry"
    else:
        return "combination"

def generate_skin_recommendations(skin_type: str) -> List[str]:
    """Generate basic recommendations based on skin type."""
    recommendations = {
        "oily": [
            "Use a gentle, foaming cleanser twice daily",
            "Apply oil-free, non-comedogenic moisturizer",
            "Use products with salicylic acid or niacinamide",
            "Don't skip moisturizer even if your skin feels oily"
        ],
        "dry": [
            "Use a cream-based, hydrating cleanser",
            "Apply rich moisturizer with ceramides or hyaluronic acid",
            "Use gentle, fragrance-free products",
            "Consider using a humidifier in your room"
        ],
        "combination": [
            "Use different products for different areas of your face",
            "Apply lightweight moisturizer to oily areas",
            "Use richer moisturizer on dry areas",
            "Consider using a gentle BHA on oily zones"
        ],
        "sensitive": [
            "Use fragrance-free, hypoallergenic products",
            "Patch test new products before full use",
            "Avoid harsh scrubs and strong actives",
            "Look for products with soothing ingredients like aloe vera"
        ],
        "normal": [
            "Maintain your routine with gentle products",
            "Use SPF daily to prevent premature aging",
            "Consider adding antioxidants like vitamin C",
            "Keep your routine simple and consistent"
        ]
    }
    
    return recommendations.get(skin_type, recommendations["normal"])

def analyze_product_text(
    product_name: str,
    ingredients: str,
    skin_type: str,
    user_allergens: List[dict],
    user_issues: List[dict]
) -> dict:
    """Fallback text-based analysis when no image is provided."""
    
    # Simple text-based analysis
    allergen_warnings = []
    suitability_score = 7  # Default score
    
    if ingredients and user_allergens:
        ingredients_lower = ingredients.lower()
        for allergen in user_allergens:
            if allergen["ingredient_name"].lower() in ingredients_lower:
                allergen_warnings.append(f"Contains {allergen['ingredient_name']} ({allergen['severity']} severity)")
                if allergen["severity"] == "severe":
                    suitability_score -= 3
                elif allergen["severity"] == "moderate":
                    suitability_score -= 2
                else:
                    suitability_score -= 1
    
    # Adjust score based on skin type
    if skin_type == "sensitive" and any(word in (ingredients or "").lower() for word in ["fragrance", "alcohol", "sulfate"]):
        suitability_score -= 2
        allergen_warnings.append("May contain ingredients that could irritate sensitive skin")
    
    suitability_score = max(1, min(10, suitability_score))
    
    return {
        "product_name": product_name or "Unknown Product",
        "suitability_score": suitability_score,
        "personalized_recommendation": f"Based on your {skin_type} skin type and known sensitivities, this product has a compatibility score of {suitability_score}/10.",
        "allergen_warnings": allergen_warnings,
        "beneficial_ingredients": [],
        "usage_instructions": "Follow the product's recommended usage instructions."
    }