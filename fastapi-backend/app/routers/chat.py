from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.schemas.chat import (
    ChatSessionCreate, 
    ChatSessionResponse, 
    ChatSessionListResponse,
    ChatMessageCreate, 
    ChatMessageResponse
)
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.skin_memory import UserAllergen, SkinIssue
from app.crud.chat import (
    create_chat_session,
    get_user_chat_sessions,
    get_chat_session,
    add_message_to_session,
    delete_chat_session,
    get_recent_context
)
from app.services.gemini_chat import GeminiChatService

router = APIRouter(prefix="/chat", tags=["Skincare Chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_new_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session."""
    
    session = create_chat_session(
        db=db,
        user_id=current_user.id,
        title=session_data.title
    )
    
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        is_active=session.is_active,
        messages=[]
    )

@router.get("/sessions", response_model=List[ChatSessionListResponse])
async def get_chat_sessions(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's chat sessions."""
    
    sessions = get_user_chat_sessions(db, current_user.id, skip, limit)
    
    session_list = []
    for session in sessions:
        # Get message count and last message
        message_count = len(session.messages)
        last_message = session.messages[-1].message if session.messages else None
        
        session_list.append(ChatSessionListResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            is_active=session.is_active,
            message_count=message_count,
            last_message=last_message
        ))
    
    return session_list

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session_detail(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat session with all messages."""
    
    session = get_chat_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    messages = [
        ChatMessageResponse(
            id=msg.id,
            message=msg.message,
            is_user=msg.is_user,
            created_at=msg.created_at
        )
        for msg in session.messages
    ]
    
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        is_active=session.is_active,
        messages=messages
    )

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: UUID,
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response."""
    
    try:
        # Verify session exists
        session = get_chat_session(db, session_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Add user message
        user_message = add_message_to_session(
            db=db,
            session_id=session_id,
            message=message_data.message,
            is_user=True,
            user_id=current_user.id
        )
        
        # Get conversation context
        recent_messages = get_recent_context(db, session_id, current_user.id, limit=8)
        
        # Get user's skin memory for enhanced context
        user_allergens = db.query(UserAllergen).filter(
            UserAllergen.user_id == current_user.id,
            UserAllergen.is_active == True
        ).all()
        
        user_issues = db.query(SkinIssue).filter(
            SkinIssue.user_id == current_user.id
        ).all()
        
        # Build enhanced context
        allergen_context = ""
        if user_allergens:
            allergen_list = [f"{a.ingredient_name} ({a.severity})" for a in user_allergens]
            allergen_context = f"Known Allergens: {', '.join(allergen_list)}"
        
        issue_context = ""
        if user_issues:
            issue_list = [f"{i.issue_type} (severity: {i.severity}/10)" for i in user_issues]
            issue_context = f"Current Issues: {', '.join(issue_list)}"
        
        enhanced_skin_concerns = f"{current_user.skin_concerns or ''}\n{allergen_context}\n{issue_context}".strip()
        
        # Generate AI response using Gemini with enhanced context
        gemini_service = GeminiChatService()
        ai_response = gemini_service.generate_chat_response(
            user_message=message_data.message,
            skin_type=current_user.skin_type,
            skin_concerns=enhanced_skin_concerns,
            conversation_history=recent_messages
        )
        
        # Add AI response
        ai_message = add_message_to_session(
            db=db,
            session_id=session_id,
            message=ai_response,
            is_user=False,
            user_id=current_user.id
        )
        
        # Extract insights and update skin memory
        gemini_service = GeminiChatService()
        await gemini_service._extract_and_update_memory(
            db, current_user.id, message_data.message, ai_response
        )
        
        return ChatMessageResponse(
            id=ai_message.id,
            message=ai_message.message,
            is_user=ai_message.is_user,
            created_at=ai_message.created_at
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@router.delete("/sessions/{session_id}")
async def delete_chat_session_endpoint(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a chat session."""
    
    success = delete_chat_session(db, session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return {"message": "Chat session deleted successfully"}