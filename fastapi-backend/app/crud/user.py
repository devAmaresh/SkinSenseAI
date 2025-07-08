from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_google_id(db: Session, google_id: str):
    return db.query(User).filter(User.google_id == google_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        auth_provider="local",
        is_verified=False
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise ValueError("User with this email or username already exists")

def create_google_user(db: Session, email: str, google_id: str, full_name: str, profile_picture: str = None):
    """Create a new user from Google OAuth"""
    try:
        # Generate username from email
        username = email.split('@')[0]
        
        # Ensure username is unique
        counter = 1
        original_username = username
        while get_user_by_username(db, username):
            username = f"{original_username}_{counter}"
            counter += 1
        
        # Create user with proper datetime
        db_user = User(
            email=email,
            username=username,
            full_name=full_name or email.split('@')[0],  # Fallback name
            google_id=google_id,
            auth_provider="google",
            profile_picture=profile_picture,
            is_verified=True,  # Google accounts are pre-verified
            is_active=True,
            hashed_password=None,  # No password for OAuth users
            created_at=datetime.now(timezone.utc),
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Successfully created Google user: {email}")
        return db_user
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Error creating Google user: {e}")
        # Try to get existing user by email
        existing_user = get_user_by_email(db, email)
        if existing_user:
            logger.info(f"User already exists, returning existing user: {email}")
            return existing_user
        raise ValueError("Failed to create user due to database constraint")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating Google user: {e}")
        raise

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not user.hashed_password:  # OAuth user trying to login with password
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def update_user_profile(db: Session, user_id: int, user_update: UserUpdate):
    """Update user profile (excluding email and password)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Check if username is already taken by another user
    if user_update.username and user_update.username != user.username:
        existing_user = db.query(User).filter(
            User.username == user_update.username,
            User.id != user_id
        ).first()
        if existing_user:
            raise ValueError("Username already taken")
    
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

def change_user_password(db: Session, user_id: int, current_password: str, new_password: str):
    """Change user password after verifying current password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Verify current password
    if not verify_password(current_password, user.hashed_password):
        raise ValueError("Current password is incorrect")
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user