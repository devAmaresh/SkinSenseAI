from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Skin assessment fields
    skin_type = Column(String(50))
    skin_assessment_answers = Column(JSON)
    skin_concerns = Column(String(500))
    
    # Relationships for skin memory
    allergens = relationship("UserAllergen", back_populates="user", cascade="all, delete-orphan")
    skin_issues = relationship("SkinIssue", back_populates="user", cascade="all, delete-orphan")
    memory_entries = relationship("SkinMemoryEntry", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship for chat sessions
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class ProductAnalysis(Base):
    __tablename__ = "product_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_name = Column(String(255))
    ingredients = Column(JSON)
    analysis_result = Column(JSON)
    suitability_score = Column(Float)
    recommendation = Column(Text)
    warnings = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationship
    user = relationship("User")

class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    skin_type = Column(String(50), nullable=False)
    concerns = Column(JSON)
    sensitivities = Column(JSON)
    goals = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationship
    user = relationship("User")
