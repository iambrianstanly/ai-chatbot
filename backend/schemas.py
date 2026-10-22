from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageItem(BaseModel):
    role: str
    content: str
    created_at: Optional[str] = None


class MessageInput(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class SessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class SessionResponse(BaseModel):
    session_id: str
    title: str
    created_at: str
