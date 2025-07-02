from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Skin type data
    skin_type = Column(String, nullable=True)  # 'dry', 'oily', 'combination', 'sensitive'
    skin_assessment_answers = Column(JSON, nullable=True)  # Store the questionnaire answers
    skin_concerns = Column(Text, nullable=True)  # Additional skin concerns
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to ChatSession
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class ProductAnalysis(Base):
    __tablename__ = "product_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # Foreign key to users
    product_image_url = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    ingredients = Column(Text, nullable=True)
    analysis_result = Column(JSON, nullable=False)  # Gemini AI analysis result
    suitability_score = Column(Integer, nullable=True)  # 1-10 score
    recommendation = Column(Text, nullable=True)
    warnings = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())