from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import Conversation, Message, RetrievedEvidence, UserFeedback
from app.schemas.chat import ChatRequest, ConversationSchema, MessageSchema, UserFeedbackRequest
from app.services.retrieval.hybrid_retriever import hybrid_retriever
from app.services.generation.llm_service import llm_service
import json
import time

router = APIRouter(tags=["Knowledge Copilot"])

@router.get("/conversations", response_model=List[ConversationSchema])
def list_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{conversation_id}", response_model=ConversationSchema)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted."}

@router.post("/chat/stream")
def stream_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Server-Sent Events (SSE) streaming endpoint for Knowledge Copilot:
    1. Fetches/Creates Conversation
    2. Runs Hybrid Retrieval + Reranking + RBAC Permission check
    3. Persists User & Assistant messages
    4. Streams SSE tokens & citation events
    """
    # Create or fetch conversation
    if request.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
    else:
        conv = Conversation(
            title=request.query[:40] + "...",
            incident_id=request.incident_id,
            production_line_id=request.production_line_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # User message record
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        content=request.query
    )
    db.add(user_msg)
    db.commit()

    # Retrieve Evidence
    evidences = hybrid_retriever.retrieve(
        db=db,
        query=request.query,
        user_permission=request.permission_level,
        doc_types=request.doc_types,
        production_line_id=request.production_line_id,
        machine_id=request.machine_id,
        top_k_retrieve=10,
        top_k_rerank=5
    )

    def sse_event_generator():
        yield f"data: {json.dumps({'type': 'init', 'conversation_id': conv.id})}\n\n"
        
        full_assistant_text = ""
        start_t = time.time()

        for event in llm_service.generate_grounded_response_stream(
            query=request.query,
            retrieved_evidence=evidences,
            production_line_id=request.production_line_id,
            machine_id=request.machine_id,
            incident_id=request.incident_id
        ):
            if event["type"] == "token":
                full_assistant_text += event["content"]
            yield f"data: {json.dumps(event)}\n\n"

        latency_ms = (time.time() - start_t) * 1000.0

        # Save assistant message & evidence to DB
        ast_msg = Message(
            conversation_id=conv.id,
            sender="assistant",
            content=full_assistant_text,
            retrieval_status="complete" if evidences else "low_evidence",
            latency_ms=latency_ms
        )
        db.add(ast_msg)
        db.commit()
        db.refresh(ast_msg)

        for item in evidences:
            db.add(RetrievedEvidence(
                message_id=ast_msg.id,
                chunk_id=item["chunk"].id,
                document_id=item["chunk"].document_id,
                document_title=item["document"].title if item.get("document") else "Doc",
                page_number=item["chunk"].page_number,
                section_title=item["chunk"].section_title,
                snippet=item["chunk"].clean_content[:300],
                similarity_score=item.get("similarity_score", 0.0),
                rerank_score=item.get("rerank_score", 0.0),
                is_conflicting=item.get("is_conflicting", False)
            ))
        db.commit()

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")

@router.post("/chat/feedback")
def submit_feedback(req: UserFeedbackRequest, db: Session = Depends(get_db)):
    fb = UserFeedback(
        message_id=req.message_id,
        rating=req.rating,
        comment=req.comment,
        feedback_type=req.feedback_type
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback recorded."}
