import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database import (
    get_db_session,
    init_db,
    SessionModel,
    MessageModel,
)
from schemas import (
    MessageInput,
    ChatResponse,
    SessionCreate,
    SessionResponse,
    MessageItem,
)
from services.llm_service import get_chat_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    await init_db()
    yield


app = FastAPI(
    title="AI Chatbot API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/session/list/", response_model=List[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db_session)):
    """List all sessions ordered by creation date descending."""
    stmt = select(SessionModel).order_by(SessionModel.created_at.desc())
    result = await db.execute(stmt)
    sessions = result.scalars().all()
    return [
        SessionResponse(
            session_id=s.session_id,
            title=s.title,
            created_at=s.created_at.isoformat() if s.created_at else "",
        )
        for s in sessions
    ]


@app.post("/api/v1/session/create/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(payload: SessionCreate = None, db: AsyncSession = Depends(get_db_session)):
    """Create a new session."""
    title = (payload.title if payload and payload.title else "New Conversation")
    new_session = SessionModel(title=title)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    return SessionResponse(
        session_id=new_session.session_id,
        title=new_session.title,
        created_at=new_session.created_at.isoformat() if new_session.created_at else "",
    )


@app.get("/api/v1/session/{session_id}/", response_model=List[MessageItem])
async def get_session_messages(session_id: str, db: AsyncSession = Depends(get_db_session)):
    """Retrieve all messages for a specific session."""
    stmt = select(SessionModel).where(SessionModel.session_id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msg_stmt = select(MessageModel).where(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    return [
        MessageItem(
            role=m.role,
            content=m.content,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in messages
    ]


@app.post("/api/v1/session/{session_id}/", response_model=ChatResponse)
async def send_message(session_id: str, payload: MessageInput, db: AsyncSession = Depends(get_db_session)):
    """Send a user message to a session and get the AI assistant response."""
    stmt = select(SessionModel).where(SessionModel.session_id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    user_msg = MessageModel(
        session_id=session_id,
        role="user",
        content=payload.message,
    )
    db.add(user_msg)
    await db.commit()

    # Get conversation history for LLM
    msg_stmt = select(MessageModel).where(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    try:
        reply_text = get_chat_response(messages)
    except Exception as exc:
        logger.exception("LLM generation failed")
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {str(exc)}")

    # Save assistant reply
    assistant_msg = MessageModel(
        session_id=session_id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_msg)
    await db.commit()

    return ChatResponse(reply=reply_text)


@app.delete("/api/v1/session/{session_id}/")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db_session)):
    """Delete a session by ID."""
    stmt = select(SessionModel).where(SessionModel.session_id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.commit()
    return {"reply": "Session deleted"}
