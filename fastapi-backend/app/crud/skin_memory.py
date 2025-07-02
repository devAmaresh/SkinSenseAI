from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.models.skin_memory import UserAllergen, SkinIssue, SkinMemoryEntry, AllergenReaction
from app.schemas.skin_memory import (
    UserAllergenCreate, UserAllergenUpdate,
    SkinIssueCreate, SkinIssueUpdate,
    SkinMemoryEntryCreate
)

class SkinMemoryCRUD:
    
    # ============= ALLERGEN METHODS =============
    
    def get_user_allergens(self, db: Session, user_id: int) -> List[UserAllergen]:
        """Get all active allergens for a user"""
        return db.query(UserAllergen).filter(
            and_(
                UserAllergen.user_id == user_id,
                UserAllergen.is_active == True
            )
        ).order_by(UserAllergen.first_detected.desc()).all()
    
    def get_allergen_by_id(self, db: Session, allergen_id: int, user_id: int) -> Optional[UserAllergen]:
        """Get a specific allergen by ID for a user"""
        return db.query(UserAllergen).filter(
            and_(
                UserAllergen.id == allergen_id,
                UserAllergen.user_id == user_id
            )
        ).first()
    
    async def add_user_allergen(
        self, 
        db: Session, 
        user_id: int, 
        ingredient_name: str,
        severity: str = "mild",
        notes: str = None,
        confirmed: bool = False
    ) -> UserAllergen:
        """Add a new allergen for a user"""
        try:
            # Check if allergen already exists
            existing = db.query(UserAllergen).filter(
                and_(
                    UserAllergen.user_id == user_id,
                    UserAllergen.ingredient_name.ilike(ingredient_name),
                    UserAllergen.is_active == True
                )
            ).first()
            
            if existing:
                # Update existing allergen
                existing.severity = severity
                existing.notes = notes
                existing.confirmed = confirmed
                existing.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(existing)
                return existing
            else:
                # Create new allergen
                allergen = UserAllergen(
                    user_id=user_id,
                    ingredient_name=ingredient_name,
                    severity=severity,
                    notes=notes,
                    confirmed=confirmed
                )
                db.add(allergen)
                db.commit()
                db.refresh(allergen)
                return allergen
                
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to add allergen: {str(e)}")
    
    def update_allergen(
        self, 
        db: Session, 
        allergen_id: int, 
        user_id: int, 
        update_data: UserAllergenUpdate
    ) -> Optional[UserAllergen]:
        """Update an existing allergen"""
        try:
            allergen = self.get_allergen_by_id(db, allergen_id, user_id)
            if not allergen:
                return None
            
            update_dict = update_data.dict(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(allergen, field, value)
            
            allergen.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(allergen)
            return allergen
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update allergen: {str(e)}")
    
    def delete_allergen(self, db: Session, allergen_id: int, user_id: int) -> bool:
        """Hard delete an allergen"""
        try:
            allergen = self.get_allergen_by_id(db, allergen_id, user_id)
            if not allergen:
                return False
            
            db.delete(allergen)
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to delete allergen: {str(e)}")
    
    # ============= SKIN ISSUES METHODS =============
    
    def get_user_skin_issues(self, db: Session, user_id: int) -> List[SkinIssue]:
        """Get all active skin issues for a user"""
        return db.query(SkinIssue).filter(
            SkinIssue.user_id == user_id
        ).order_by(SkinIssue.last_updated.desc()).all()
    
    def get_skin_issue_by_id(self, db: Session, issue_id: int, user_id: int) -> Optional[SkinIssue]:
        """Get a specific skin issue by ID for a user"""
        return db.query(SkinIssue).filter(
            and_(
                SkinIssue.id == issue_id,
                SkinIssue.user_id == user_id
            )
        ).first()
    
    async def add_skin_issue(
        self,
        db: Session,
        user_id: int,
        issue_type: str,
        description: str = None,
        severity: int = 1,
        triggers: List[str] = None,
        status: str = "active"
    ) -> SkinIssue:
        """Add a new skin issue for a user"""
        try:
            # Check if similar issue already exists
            existing = db.query(SkinIssue).filter(
                and_(
                    SkinIssue.user_id == user_id,
                    SkinIssue.issue_type.ilike(issue_type),
                    SkinIssue.status.in_(["active", "improving"])
                )
            ).first()
            
            if existing:
                # Update existing issue
                existing.description = description or existing.description
                existing.severity = severity
                existing.triggers = triggers or existing.triggers
                existing.status = status
                existing.last_updated = datetime.utcnow()
                db.commit()
                db.refresh(existing)
                return existing
            else:
                # Create new issue
                issue = SkinIssue(
                    user_id=user_id,
                    issue_type=issue_type,
                    description=description,
                    severity=severity,
                    triggers=triggers,
                    status=status
                )
                db.add(issue)
                db.commit()
                db.refresh(issue)
                return issue
                
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to add skin issue: {str(e)}")
    
    def update_skin_issue(
        self,
        db: Session,
        issue_id: int,
        user_id: int,
        update_data: SkinIssueUpdate
    ) -> Optional[SkinIssue]:
        """Update an existing skin issue"""
        try:
            issue = self.get_skin_issue_by_id(db, issue_id, user_id)
            if not issue:
                return None
            
            update_dict = update_data.dict(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(issue, field, value)
            
            issue.last_updated = datetime.utcnow()
            
            # Set resolved date if status changed to resolved
            if update_dict.get("status") == "resolved" and not issue.resolved_date:
                issue.resolved_date = datetime.utcnow()
            
            db.commit()
            db.refresh(issue)
            return issue
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update skin issue: {str(e)}")
    
    def delete_skin_issue(self, db: Session, issue_id: int, user_id: int) -> bool:
        """Delete a skin issue (hard delete)"""
        try:
            issue = self.get_skin_issue_by_id(db, issue_id, user_id)
            if not issue:
                return False
            
            db.delete(issue)
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to delete skin issue: {str(e)}")
    
    # ============= MEMORY ENTRY METHODS =============
    
    def add_memory_entry(
        self,
        db: Session,
        user_id: int,
        entry_type: str,
        content: str,
        entry_metadata: Dict[str, Any] = None,  # Updated parameter name
        source: str = None,
        importance: int = 1
    ) -> SkinMemoryEntry:
        """Add a new memory entry"""
        try:
            entry = SkinMemoryEntry(
                user_id=user_id,
                entry_type=entry_type,
                content=content,
                entry_metadata=entry_metadata,  # Updated field name
                source=source,
                importance=importance
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to add memory entry: {str(e)}")
    
    def get_user_memory_entries(
        self,
        db: Session, 
        user_id: int, 
        entry_type: str = None, 
        limit: int = 50,
        skip: int = 0
    ) -> List[SkinMemoryEntry]:
        """Get user's memory entries with optional filtering"""
        query = db.query(SkinMemoryEntry).filter(
            SkinMemoryEntry.user_id == user_id,
            SkinMemoryEntry.is_active == True
        )
        
        if entry_type:
            query = query.filter(SkinMemoryEntry.entry_type == entry_type)
        
        return query.order_by(SkinMemoryEntry.created_at.desc()).offset(skip).limit(limit).all()
    
    def delete_memory_entry(self, db: Session, memory_id: int, user_id: int) -> bool:
        """Delete a specific memory entry (hard delete)"""
        try:
            memory = db.query(SkinMemoryEntry).filter(
                SkinMemoryEntry.id == memory_id,
                SkinMemoryEntry.user_id == user_id,
                SkinMemoryEntry.is_active == True
            ).first()
            
            if not memory:
                return False
            
            db.delete(memory)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    def delete_all_user_memories(self, db: Session, user_id: int, entry_type: Optional[str] = None) -> int:
        """Delete all memory entries for a user, optionally filtered by type (hard delete)"""
        try:
            query = db.query(SkinMemoryEntry).filter(
                SkinMemoryEntry.user_id == user_id,
                SkinMemoryEntry.is_active == True
            )
            
            if entry_type:
                query = query.filter(SkinMemoryEntry.entry_type == entry_type)
            
            # Get all entries to delete
            entries_to_delete = query.all()
            count = len(entries_to_delete)
            
            # Delete each entry
            for entry in entries_to_delete:
                db.delete(entry)
            
            db.commit()
            return count
        except Exception as e:
            db.rollback()
            raise e
    
    # ============= ANALYTICS METHODS =============
    
    def get_user_skin_summary(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get comprehensive skin summary for a user"""
        allergens = self.get_user_allergens(db, user_id)
        issues = self.get_user_skin_issues(db, user_id)
        
        # Active issues
        active_issues = [i for i in issues if i.status == "active"]
        improving_issues = [i for i in issues if i.status == "improving"]
        resolved_issues = [i for i in issues if i.status == "resolved"]
        
        # Severe allergens
        severe_allergens = [a for a in allergens if a.severity == "severe"]
        
        return {
            "allergens": {
                "total": len(allergens),
                "confirmed": len([a for a in allergens if a.confirmed]),
                "severe": len(severe_allergens),
                "list": [{"name": a.ingredient_name, "severity": a.severity} for a in allergens]
            },
            "skin_issues": {
                "active": len(active_issues),
                "improving": len(improving_issues),
                "resolved": len(resolved_issues),
                "high_severity": len([i for i in active_issues if i.severity >= 7]),
                "list": [{"type": i.issue_type, "severity": i.severity, "status": i.status} for i in issues]
            },
            "recommendations": self._generate_recommendations(allergens, active_issues)
        }
    
    def _generate_recommendations(self, allergens: List[UserAllergen], issues: List[SkinIssue]) -> List[str]:
        """Generate basic recommendations based on user's profile"""
        recommendations = []
        
        if any(a.severity == "severe" for a in allergens):
            recommendations.append("Always patch test new products due to severe allergies")
        
        if any(i.severity >= 8 for i in issues):
            recommendations.append("Consider consulting a dermatologist for severe skin issues")
        
        if len(allergens) > 5:
            recommendations.append("Focus on simple, fragrance-free formulations")
        
        # Add more logic based on specific combinations
        return recommendations

# Create instance
skin_memory_crud = SkinMemoryCRUD()