from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ============= USER ALLERGEN SCHEMAS =============

class UserAllergenBase(BaseModel):
    ingredient_name: str = Field(..., min_length=1, max_length=255)
    severity: str = Field(default="mild", pattern="^(mild|moderate|severe)$")
    confirmed: bool = False
    notes: Optional[str] = None

class UserAllergenCreate(UserAllergenBase):
    pass

class UserAllergenUpdate(BaseModel):
    ingredient_name: Optional[str] = Field(None, min_length=1, max_length=255)
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe)$")
    confirmed: Optional[bool] = None
    notes: Optional[str] = None

class UserAllergen(UserAllergenBase):
    id: int
    user_id: int
    first_detected: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# ============= SKIN ISSUE SCHEMAS =============

class SkinIssueBase(BaseModel):
    issue_type: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    severity: int = Field(default=1, ge=1, le=10)
    status: str = Field(default="active", pattern="^(active|improving|resolved)$")
    triggers: Optional[List[str]] = None

class SkinIssueCreate(SkinIssueBase):
    pass

class SkinIssueUpdate(BaseModel):
    issue_type: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[str] = Field(None, pattern="^(active|improving|resolved)$")
    triggers: Optional[List[str]] = None

class SkinIssue(SkinIssueBase):
    id: int
    user_id: int
    first_reported: datetime
    last_updated: datetime
    resolved_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============= MEMORY ENTRY SCHEMAS =============

class SkinMemoryEntryBase(BaseModel):
    entry_type: str = Field(..., max_length=50)
    content: str = Field(..., min_length=1)
    entry_metadata: Optional[Dict[str, Any]] = None  # Updated field name
    source: Optional[str] = Field(None, max_length=100)
    importance: int = Field(default=1, ge=1, le=5)

class SkinMemoryEntryCreate(SkinMemoryEntryBase):
    pass

class SkinMemoryEntry(SkinMemoryEntryBase):
    id: int
    user_id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# ============= RESPONSE SCHEMAS =============

class SkinMemoryResponse(BaseModel):
    allergens: List[UserAllergen]
    skin_issues: List[SkinIssue]
    memory_entries: List[SkinMemoryEntry]

class SkinSummaryResponse(BaseModel):
    allergens: Dict[str, Any]
    skin_issues: Dict[str, Any]
    recommendations: List[str]

# ============= REQUEST SCHEMAS =============

class AllergenReactionReport(BaseModel):
    ingredient_name: str
    product_name: Optional[str] = None
    reaction_description: str
    severity: str = Field(pattern="^(mild|moderate|severe)$")

class SkinIssueReport(BaseModel):
    issue_type: str
    description: str
    severity: int = Field(ge=1, le=10)
    triggers: Optional[List[str]] = None
    affected_areas: Optional[List[str]] = None