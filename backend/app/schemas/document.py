from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentChunkSchema(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class DocumentSchema(BaseModel):
    id: str
    title: str
    file_name: str
    file_type: str
    file_size_bytes: int
    doc_type: str
    revision: str
    machine_id: Optional[str] = None
    production_line_id: Optional[str] = None
    permission_required: str
    status: str
    chunk_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IngestionJobSchema(BaseModel):
    id: str
    document_id: Optional[str] = None
    status: str
    progress_percentage: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    log_messages: List[str] = []

    class Config:
        from_attributes = True

class DocumentCreateRequest(BaseModel):
    title: str
    doc_type: str = "sop"
    revision: str = "v1.0"
    machine_id: Optional[str] = None
    production_line_id: Optional[str] = None
    permission_required: str = "standard"
