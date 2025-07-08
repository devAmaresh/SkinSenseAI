from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    Token,
    UserLogin,
)
from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    authenticate_user,
    update_user_profile,
    change_user_password,
    create_google_user,
    get_user_by_google_id,
)
from app.api.deps import get_current_active_user
from app.models.user import User
from firebase_admin import auth as firebase_auth


router = APIRouter(prefix="/auth", tags=["Authentication"])


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class GoogleTokenRequest(BaseModel):
    firebaseIdToken: str
    user_info: dict


class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    is_new_user: bool


@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_username = get_user_by_username(db, username=user.username)
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    new_user = create_user(db=db, user=user)

    # Generate access token for the new user
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


class TokenIn(BaseModel):
    id_token: str


@router.post("/google", response_model=GoogleAuthResponse)
async def login_with_google(
    google_data: GoogleTokenRequest, db: Session = Depends(get_db)
):
    try:
        # Step 1: Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(google_data.firebaseIdToken)

        # Step 2: Extract user info from verified token
        firebase_uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name", "")
        picture = decoded_token.get("picture", "")
        email_verified = decoded_token.get("email_verified", False)

        if not email:
            raise HTTPException(
                status_code=400, detail="Email not found in Firebase token"
            )

        if not email_verified:
            raise HTTPException(
                status_code=400, detail="Email not verified in Firebase"
            )

        logging.info(f"Firebase token verified for user: {email}")

        # Step 3: Check if user exists in our database
        user = get_user_by_email(db, email)
        is_new_user = False

        if not user:
            # Step 4: Create new user if doesn't exist
            try:
                user = create_google_user(
                    db=db,
                    email=email,
                    google_id=firebase_uid,
                    full_name=name,
                    profile_picture=picture,
                )
                is_new_user = True
                logging.info(f"Created new user: {email}")
            except Exception as create_error:
                logging.error(f"Error creating user: {create_error}")
                raise HTTPException(
                    status_code=500, detail="Failed to create user account"
                )
        else:
            # Step 5: Update existing user's Google info if needed
            try:
                if not user.google_id:
                    user.google_id = firebase_uid
                if not user.profile_picture and picture:
                    user.profile_picture = picture
                if not user.is_verified:
                    user.is_verified = True

                db.commit()
                db.refresh(user)
                logging.info(f"Updated existing user: {email}")
            except Exception as update_error:
                logging.error(f"Error updating user: {update_error}")
                db.rollback()
                raise HTTPException(
                    status_code=500, detail="Failed to update user account"
                )

        # Step 6: Generate JWT token for our app
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        # Step 7: Return response
        return GoogleAuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                full_name=user.full_name,
                is_active=user.is_active,
                is_verified=user.is_verified,
                skin_type=getattr(user, "skin_type", None),
                skin_assessment_answers=getattr(user, "skin_assessment_answers", None),
                skin_concerns=getattr(user, "skin_concerns", None),
                created_at=user.created_at,
            ),
            is_new_user=is_new_user,
        )

    except firebase_auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token")
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    except firebase_auth.ExpiredIdTokenError:
        logging.error("Expired Firebase ID token")
        raise HTTPException(status_code=401, detail="Firebase token has expired")
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logging.error(f"Google authentication error: {str(e)}")
        raise HTTPException(status_code=500, detail="Google authentication failed")


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.delete("/delete-account", status_code=204)
async def delete_user_account(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Delete the current user's account permanently."""
    try:
        # Delete user's product analyses first (due to foreign key constraints)
        from app.models.user import ProductAnalysis

        db.query(ProductAnalysis).filter(
            ProductAnalysis.user_id == current_user.id
        ).delete()

        # Delete the user
        db.delete(current_user)
        db.commit()

        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="Failed to delete account. Please try again."
        )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout endpoint (token invalidation handled on client side)."""
    return {"message": "Logged out successfully"}


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update user profile information (excluding email)."""
    try:
        updated_user = update_user_profile(db, current_user.id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.put("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Change user password."""
    try:
        # Check if user is OAuth user
        if current_user.auth_provider != "local":
            raise HTTPException(
                status_code=400, detail="Cannot change password for OAuth users"
            )

        updated_user = change_user_password(
            db,
            current_user.id,
            password_data.current_password,
            password_data.new_password,
        )
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to change password")
