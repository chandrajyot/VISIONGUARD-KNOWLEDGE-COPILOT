from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class EvidenceItemSchema(BaseModel):
    id: str
    chunk_id: str
    document_id: str
    document_title: str
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    snippet: str
    similarity_score: float = 0.0
    rerank_score: float = 0.0
    is_conflicting: bool = False

    class Config:
        from_attributes = True

class MessageSchema(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    retrieval_status: Optional[str] = None
    latency_ms: Optional[float] = None
    created_at: datetime
    evidences: List[EvidenceItemSchema] = []

    class Config:
        from_attributes = True

class ConversationSchema(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    incident_id: Optional[str] = None
    production_line_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    query: str
    production_line_id: Optional[str] = None
    machine_id: Optional[str] = None
    incident_id: Optional[str] = None
    doc_types: Optional[List[str]] = None
    permission_level: str = "standard"

class UserFeedbackRequest(BaseModel):
    message_id: str
    rating: int # 1 or -1
    comment: Optional[str] = None
    feedback_type: Optional[str] = None
