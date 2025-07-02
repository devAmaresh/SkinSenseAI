from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from uuid import UUID

from app.models.chat import ChatSession, ChatMessage
from app.models.user import User

def create_chat_session(db: Session, user_id: int, title: Optional[str] = None) -> ChatSession:
    """Create a new chat session."""
    session = ChatSession(
        user_id=user_id,
        title=title or "New Chat"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_user_chat_sessions(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[ChatSession]:
    """Get user's chat sessions with message count and last message."""
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id, ChatSession.is_active == True)
        .order_by(desc(ChatSession.updated_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_chat_session(db: Session, session_id: UUID, user_id: int) -> Optional[ChatSession]:
    """Get a specific chat session with messages."""
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
            ChatSession.is_active == True
        )
        .first()
    )

def add_message_to_session(
    db: Session, 
    session_id: UUID, 
    message: str, 
    is_user: bool,
    user_id: int
) -> ChatMessage:
    """Add a message to a chat session."""
    # Verify session belongs to user
    session = get_chat_session(db, session_id, user_id)
    if not session:
        raise ValueError("Chat session not found")
    
    chat_message = ChatMessage(
        session_id=session_id,
        message=message,
        is_user=is_user
    )
    db.add(chat_message)
    
    # Update session's updated_at timestamp
    session.updated_at = func.now()
    
    # Auto-generate title from first user message if title is "New Chat"
    if session.title == "New Chat" and is_user:
        # Generate title from first few words of the message
        words = message.split()[:5]
        session.title = " ".join(words) + ("..." if len(words) == 5 else "")
    
    db.commit()
    db.refresh(chat_message)
    return chat_message

def get_session_messages(db: Session, session_id: UUID, user_id: int) -> List[ChatMessage]:
    """Get all messages for a session."""
    session = get_chat_session(db, session_id, user_id)
    if not session:
        return []
    
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )

def delete_chat_session(db: Session, session_id: UUID, user_id: int) -> bool:
    """Delete a chat session (soft delete)."""
    session = get_chat_session(db, session_id, user_id)
    if not session:
        return False
    
    session.is_active = False
    db.commit()
    return True

def get_recent_context(db: Session, session_id: UUID, user_id: int, limit: int = 10) -> List[ChatMessage]:
    """Get recent messages for context."""
    return (
        db.query(ChatMessage)
        .join(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
            ChatSession.is_active == True
        )
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
        .all()
    )