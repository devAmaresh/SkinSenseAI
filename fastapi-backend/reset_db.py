"""Script to reset database tables"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.user import User, ProductAnalysis, SkinProfile
from app.models.skin_memory import UserAllergen, SkinIssue, SkinMemoryEntry, AllergenReaction
from app.models.chat import ChatSession, ChatMessage

def reset_database():
    """Drop all tables and recreate them"""
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()