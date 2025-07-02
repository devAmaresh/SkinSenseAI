from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.crud.skin_memory import skin_memory_crud
from app.schemas.skin_memory import (
    UserAllergen, UserAllergenCreate, UserAllergenUpdate,
    SkinIssue, SkinIssueCreate, SkinIssueUpdate,
    SkinMemoryResponse, SkinSummaryResponse,
    AllergenReactionReport, SkinIssueReport
)

router = APIRouter(prefix="/skin-memory", tags=["skin-memory"])

# ============= ALLERGEN ENDPOINTS =============

@router.get("/allergens", response_model=List[UserAllergen])
async def get_user_allergens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all allergens for the current user"""
    try:
        allergens = skin_memory_crud.get_user_allergens(db, current_user.id)
        return allergens
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch allergens: {str(e)}"
        )

@router.post("/allergens", response_model=UserAllergen)
async def add_allergen(
    allergen_data: UserAllergenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new allergen for the current user"""
    try:
        allergen = await skin_memory_crud.add_user_allergen(
            db=db,
            user_id=current_user.id,
            ingredient_name=allergen_data.ingredient_name,
            severity=allergen_data.severity,
            notes=allergen_data.notes,
            confirmed=allergen_data.confirmed
        )
        return allergen
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add allergen: {str(e)}"
        )

@router.put("/allergens/{allergen_id}", response_model=UserAllergen)
async def update_allergen(
    allergen_id: int,
    update_data: UserAllergenUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing allergen"""
    try:
        allergen = skin_memory_crud.update_allergen(
            db, allergen_id, current_user.id, update_data
        )
        if not allergen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allergen not found"
            )
        return allergen
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update allergen: {str(e)}"
        )

@router.delete("/allergens/{allergen_id}")
async def delete_allergen(
    allergen_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete a specific allergen"""
    try:
        success = skin_memory_crud.delete_allergen(db, allergen_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allergen not found or you don't have permission to delete it"
            )
        return {
            "message": "Allergen permanently deleted",
            "deleted_id": allergen_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete allergen: {str(e)}"
        )

# ============= SKIN ISSUES ENDPOINTS =============

@router.get("/issues", response_model=List[SkinIssue])
async def get_skin_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all skin issues for the current user"""
    try:
        issues = skin_memory_crud.get_user_skin_issues(db, current_user.id)
        return issues
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skin issues: {str(e)}"
        )

@router.post("/issues", response_model=SkinIssue)
async def add_skin_issue(
    issue_data: SkinIssueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new skin issue for the current user"""
    try:
        issue = await skin_memory_crud.add_skin_issue(
            db=db,
            user_id=current_user.id,
            issue_type=issue_data.issue_type,
            description=issue_data.description,
            severity=issue_data.severity,
            triggers=issue_data.triggers,
            status=issue_data.status
        )
        return issue
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add skin issue: {str(e)}"
        )

@router.put("/issues/{issue_id}", response_model=SkinIssue)
async def update_skin_issue(
    issue_id: int,
    update_data: SkinIssueUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing skin issue"""
    try:
        issue = skin_memory_crud.update_skin_issue(
            db, issue_id, current_user.id, update_data
        )
        if not issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skin issue not found"
            )
        return issue
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update skin issue: {str(e)}"
        )

@router.delete("/issues/{issue_id}")
async def delete_skin_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete a specific skin issue"""
    try:
        success = skin_memory_crud.delete_skin_issue(db, issue_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skin issue not found or you don't have permission to delete it"
            )
        return {
            "message": "Skin issue permanently deleted",
            "deleted_id": issue_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete skin issue: {str(e)}"
        )

# ============= SUMMARY ENDPOINTS =============

@router.get("/summary", response_model=SkinSummaryResponse)
async def get_skin_memory_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive skin memory summary"""
    try:
        summary = skin_memory_crud.get_user_skin_summary(db, current_user.id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch summary: {str(e)}"
        )

# ============= REPORTING ENDPOINTS =============

@router.post("/report/reaction")
async def report_allergic_reaction(
    reaction_data: AllergenReactionReport,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a new allergic reaction"""
    try:
        # Add or update allergen
        allergen = await skin_memory_crud.add_user_allergen(
            db=db,
            user_id=current_user.id,
            ingredient_name=reaction_data.ingredient_name,
            severity=reaction_data.severity,
            notes=f"Reaction to {reaction_data.product_name}: {reaction_data.reaction_description}",
            confirmed=True
        )
        
        # Add memory entry
        skin_memory_crud.add_memory_entry(
            db=db,
            user_id=current_user.id,
            entry_type="reaction_report",
            content=f"Allergic reaction to {reaction_data.ingredient_name}",
            entry_metadata={  # Updated field name
                "product_name": reaction_data.product_name,
                "reaction": reaction_data.reaction_description,
                "severity": reaction_data.severity
            },
            importance=4 if reaction_data.severity == "severe" else 3
        )
        
        return {"message": "Reaction reported successfully", "allergen": allergen}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to report reaction: {str(e)}"
        )

@router.post("/report/issue")
async def report_skin_issue(
    issue_data: SkinIssueReport,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a new skin issue"""
    try:
        issue = await skin_memory_crud.add_skin_issue(
            db=db,
            user_id=current_user.id,
            issue_type=issue_data.issue_type,
            description=issue_data.description,
            severity=issue_data.severity,
            triggers=issue_data.triggers
        )
        
        # Add memory entry
        skin_memory_crud.add_memory_entry(
            db=db,
            user_id=current_user.id,
            entry_type="issue_report",
            content=f"New skin issue: {issue_data.issue_type}",
            entry_metadata={  # Updated field name
                "severity": issue_data.severity,
                "triggers": issue_data.triggers,
                "affected_areas": getattr(issue_data, 'affected_areas', None)
            },
            importance=5 if issue_data.severity >= 8 else 3
        )
        
        return {"message": "Issue reported successfully", "issue": issue}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to report issue: {str(e)}"
        )

# ============= MEMORY ENDPOINTS =============

@router.get("/memories")
async def get_user_memories(
    entry_type: str = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's memory entries"""
    try:
        memories = skin_memory_crud.get_user_memory_entries(
            db=db,
            user_id=current_user.id,
            entry_type=entry_type,
            limit=limit
        )
        return [
            {
                "id": memory.id,
                "entry_type": memory.entry_type,
                "content": memory.content,
                "entry_metadata": memory.entry_metadata,  # Updated field name
                "source": memory.source,
                "importance": memory.importance,
                "created_at": memory.created_at.isoformat(),
                "is_active": memory.is_active
            }
            for memory in memories
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch memories: {str(e)}"
        )

# ============= DELETE ENDPOINTS =============

@router.delete("/memories/{memory_id}")
async def delete_memory_entry(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete a specific memory entry"""
    try:
        success = skin_memory_crud.delete_memory_entry(db, memory_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory entry not found or you don't have permission to delete it"
            )
        return {
            "message": "Memory entry permanently deleted",
            "deleted_id": memory_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete memory entry: {str(e)}"
        )

@router.delete("/memories")
async def delete_all_memories(
    entry_type: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete all memory entries for the current user"""
    try:
        deleted_count = skin_memory_crud.delete_all_user_memories(
            db, current_user.id, entry_type
        )
        
        type_text = f" of type '{entry_type}'" if entry_type else ""
        return {
            "message": f"Permanently deleted {deleted_count} memory entries{type_text}",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete memory entries: {str(e)}"
        )

@router.put("/issues/{issue_id}/status")
async def update_issue_status(
    issue_id: int,
    status_data: dict,  # {"status": "active|improving|resolved"}
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the status of a skin issue"""
    try:
        new_status = status_data.get("status")
        if new_status not in ["active", "improving", "resolved"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be 'active', 'improving', or 'resolved'"
            )
        
        issue = skin_memory_crud.update_skin_issue(
            db, issue_id, current_user.id, {"status": new_status}
        )
        if not issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skin issue not found"
            )
        
        # Add memory entry for status change
        skin_memory_crud.add_memory_entry(
            db=db,
            user_id=current_user.id,
            entry_type="user_report",
            content=f"Updated {issue.issue_type} status to {new_status}",
            entry_metadata={
                "issue_id": issue_id,
                "old_status": issue.status,
                "new_status": new_status,
                "issue_type": issue.issue_type
            },
            importance=2
        )
        
        return issue
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update issue status: {str(e)}"
        )