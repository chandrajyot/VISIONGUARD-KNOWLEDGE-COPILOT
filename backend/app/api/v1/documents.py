from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models import Document, DocumentChunk, IngestionJob
from app.schemas.document import DocumentSchema, IngestionJobSchema, DocumentChunkSchema
from app.services.ingestion.pipeline import process_document_ingestion
from app.core.config import settings
import os
import shutil
import uuid

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("", response_model=DocumentSchema)
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    doc_type: str = Form("sop"),
    revision: str = Form("v1.0"),
    machine_id: Optional[str] = Form(None),
    production_line_id: Optional[str] = Form(None),
    permission_required: str = Form("standard"),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    os.makedirs(settings.STORAGE_PATH, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1].upper() if "." in file.filename else "TXT"
    saved_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.STORAGE_PATH, saved_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)

    doc = Document(
        title=title,
        file_name=file.filename,
        file_type=file_ext,
        file_path=file_path,
        file_size_bytes=file_size,
        content_hash=f"hash_{uuid.uuid4().hex[:12]}",
        doc_type=doc_type,
        revision=revision,
        machine_id=machine_id,
        production_line_id=production_line_id,
        permission_required=permission_required,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    job = IngestionJob(
        document_id=doc.id,
        status="queued",
        progress_percentage=0.0,
        log_messages=["Job queued for ingestion."]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Process ingestion synchronously or via background task
    process_document_ingestion(db, doc.id, job.id)
    db.refresh(doc)
    return doc

@router.get("", response_model=List[DocumentSchema])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentSchema)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.get("/{document_id}/chunks", response_model=List[DocumentChunkSchema])
def get_document_chunks(document_id: str, db: Session = Depends(get_db)):
    return db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).all()

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully."}

@router.post("/{document_id}/reindex", response_model=IngestionJobSchema)
def reindex_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    doc.status = "processing"
    job = IngestionJob(
        document_id=doc.id,
        status="queued",
        progress_percentage=0.0,
        log_messages=["Re-indexing requested by user."]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    process_document_ingestion(db, doc.id, job.id)
    return job
