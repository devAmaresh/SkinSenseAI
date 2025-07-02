from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: UUID
    message: str
    is_user: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    title: Optional[str] = None

class ChatSessionResponse(BaseModel):
    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class ChatSessionListResponse(BaseModel):
    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    message_count: int
    last_message: Optional[str]

    class Config:
        from_attributes = True