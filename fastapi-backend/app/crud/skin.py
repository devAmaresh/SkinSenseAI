from sqlalchemy.orm import Session
from app.models.user import User, ProductAnalysis
from app.schemas.skin import SkinAssessmentCreate, ProductAnalysisCreate
from typing import Dict, Any


def determine_skin_type(answers: Dict[int, str]) -> str:
    """Simple algorithm to determine skin type based on answers."""
    # Count different skin type indicators
    dry_count = 0
    oily_count = 0
    sensitive_count = 0

    for question_id, answer in answers.items():
        if answer == "a":
            if question_id == 1:  # After cleansing feels tight and dry
                dry_count += 2
            elif question_id == 2:  # Rarely breakouts
                dry_count += 1
        elif answer == "b":
            if question_id == 1:  # Comfortable and balanced
                pass  # neutral
            elif question_id == 2:  # Occasional breakouts
                pass  # neutral
        elif answer == "c":
            if question_id == 1:  # Oily in T-zone
                oily_count += 1
            elif question_id == 2:  # Frequent breakouts
                oily_count += 1
        elif answer == "d":
            if question_id == 1:  # Very oily all over
                oily_count += 2
            elif question_id == 2:  # Almost constantly breakouts
                oily_count += 2

        # Sensitivity questions
        if question_id == 3:
            if answer == "a":  # Very sensitive
                sensitive_count += 2
            elif answer == "b":  # Sometimes sensitive
                sensitive_count += 1

    # Determine skin type
    if sensitive_count >= 2:
        return "sensitive"
    elif oily_count > dry_count:
        if oily_count >= 3:
            return "oily"
        else:
            return "combination"
    elif dry_count > oily_count:
        return "dry"
    else:
        return "normal"


def update_user_skin_assessment(
    db: Session, user_id: int, assessment: SkinAssessmentCreate
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    skin_type = determine_skin_type(assessment.answers)

    user.skin_type = skin_type
    user.skin_assessment_answers = assessment.answers
    user.skin_concerns = assessment.additional_concerns

    db.commit()
    db.refresh(user)
    return user


def create_product_analysis(db: Session, user_id: int, analysis_data: Dict[str, Any]):
    analysis = ProductAnalysis(
        user_id=user_id,
        product_name=analysis_data.get("product_name"),
        ingredients=analysis_data.get("ingredients"),
        analysis_result=analysis_data.get("analysis_result", {}),
        suitability_score=analysis_data.get("suitability_score"),
        recommendation=analysis_data.get("recommendation"),
        warnings=analysis_data.get("warnings"),
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


# sort it by created_at descending
def get_user_analyses(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return (
        db.query(ProductAnalysis)
        .filter(ProductAnalysis.user_id == user_id)
        .order_by(ProductAnalysis.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
