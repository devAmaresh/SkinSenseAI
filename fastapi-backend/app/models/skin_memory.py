from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UserAllergen(Base):
    __tablename__ = "user_allergens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ingredient_name = Column(String(255), nullable=False)
    severity = Column(String(50), default="mild")  # mild, moderate, severe
    confirmed = Column(Boolean, default=False)
    notes = Column(Text)
    first_detected = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationship to user
    user = relationship("User", back_populates="allergens")

class SkinIssue(Base):
    __tablename__ = "skin_issues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_type = Column(String(100), nullable=False)  # acne, dryness, sensitivity, etc.
    description = Column(Text)
    severity = Column(Integer, default=1)  # 1-10 scale
    status = Column(String(50), default="active")  # active, improving, resolved
    triggers = Column(JSON)  # List of known triggers
    first_reported = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    resolved_date = Column(DateTime, nullable=True)
    
    # Relationship to user
    user = relationship("User", back_populates="skin_issues")

class SkinMemoryEntry(Base):
    __tablename__ = "skin_memory_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entry_type = Column(String(50), nullable=False)  # chat_insight, analysis_finding, user_report
    content = Column(Text, nullable=False)
    entry_metadata = Column(JSON)  # Additional structured data (renamed from metadata)
    source = Column(String(100))  # chat_session_id, analysis_id, etc.
    importance = Column(Integer, default=1)  # 1-5 scale
    created_at = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationship to user
    user = relationship("User", back_populates="memory_entries")

class AllergenReaction(Base):
    __tablename__ = "allergen_reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allergen_id = Column(Integer, ForeignKey("user_allergens.id"), nullable=False)
    product_name = Column(String(255))
    reaction_description = Column(Text)
    reaction_severity = Column(String(50))  # mild, moderate, severe
    date_occurred = Column(DateTime, server_default=func.now())
    treatment_notes = Column(Text)
    
    # Relationships
    user = relationship("User")
    allergen = relationship("UserAllergen")