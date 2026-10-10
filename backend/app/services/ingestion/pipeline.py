import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.models import Document, DocumentChunk, IngestionJob
from app.services.ingestion.parser import parse_document, compute_content_hash
from app.services.ingestion.chunker import chunk_parsed_data

def process_document_ingestion(db: Session, document_id: str, job_id: str):
    """
    Executes complete document ingestion pipeline:
    1. Fetch document record
    2. Compute content hash & check duplicates
    3. Parse text/sections
    4. Chunk document
    5. Save chunks to DB
    6. Index chunks in hybrid retriever engine
    7. Update Job & Document status
    """
    job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
    doc = db.query(Document).filter(Document.id == document_id).first()

    if not doc or not job:
        return

    try:
        job.status = "parsing"
        job.progress_percentage = 20.0
        job.log_messages = job.log_messages + [f"Starting document parsing for file: {doc.file_name}"]
        db.commit()

        # Parse file
        pages = parse_document(doc.file_path, doc.file_type)

        job.status = "chunking"
        job.progress_percentage = 50.0
        job.log_messages = job.log_messages + [f"Extracted {len(pages)} sections/pages. Generating chunks..."]
        db.commit()

        # Chunk content
        chunks_data = chunk_parsed_data(pages)

        job.status = "embedding"
        job.progress_percentage = 80.0
        job.log_messages = job.log_messages + [f"Generated {len(chunks_data)} text chunks. Indexing..."]
        db.commit()

        # Remove existing chunks if re-indexing
        db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()

        created_chunks = []
        for cdata in chunks_data:
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_index=cdata["chunk_index"],
                content=cdata["content"],
                clean_content=cdata["clean_content"],
                page_number=cdata["page_number"],
                section_title=cdata["section_title"],
                metadata_json={
                    "doc_id": doc.id,
                    "doc_title": doc.title,
                    "doc_type": doc.doc_type,
                    "revision": doc.revision,
                    "machine_id": doc.machine_id,
                    "production_line_id": doc.production_line_id,
                    "permission_required": doc.permission_required
                }
            )
            db.add(chunk_obj)
            created_chunks.append(chunk_obj)

        doc.chunk_count = len(created_chunks)
        doc.status = "indexed"
        doc.updated_at = datetime.utcnow()

        job.status = "completed"
        job.progress_percentage = 100.0
        job.completed_at = datetime.utcnow()
        job.log_messages = job.log_messages + ["Document ingestion and indexing completed successfully!"]

        db.commit()

    except Exception as e:
        db.rollback()
        doc.status = "failed"
        doc.error_message = str(e)

        job.status = "failed"
        job.log_messages = job.log_messages + [f"Ingestion error: {str(e)}"]
        db.commit()
