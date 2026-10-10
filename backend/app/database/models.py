from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

# 1. USERS & ORGANIZATIONS
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="engineer") # admin, quality_engineer, maintenance_engineer, supervisor, research
    permission_level = Column(String, default="standard") # standard, restricted, admin, confidential
    organization_id = Column(String, default="default_org")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# 2. DOCUMENTS & INGESTION
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # PDF, DOCX, TXT, CSV, MD
    file_path = Column(String, nullable=False)
    file_size_bytes = Column(Integer, default=0)
    content_hash = Column(String, unique=True, index=True)
    
    doc_type = Column(String, default="sop") # sop, manual, spec, incident_report, maintenance_log
    revision = Column(String, default="v1.0")
    machine_id = Column(String, nullable=True)
    production_line_id = Column(String, nullable=True)
    product_family = Column(String, nullable=True)
    permission_required = Column(String, default="standard") # standard, restricted, confidential
    
    status = Column(String, default="pending") # pending, processing, indexed, failed
    chunk_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    ingestion_jobs = relationship("IngestionJob", back_populates="document")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    clean_content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String, nullable=True)
    
    embedding_id = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("Document", back_populates="chunks")

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"))
    status = Column(String, default="queued") # queued, parsing, chunking, embedding, indexing, completed, failed
    progress_percentage = Column(Float, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    log_messages = Column(JSON, default=list)
    
    document = relationship("Document", back_populates="ingestion_jobs")

# 3. CONVERSATIONS & COPILOT CHAT
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    title = Column(String, default="New Troubleshooting Session")
    incident_id = Column(String, nullable=True)
    production_line_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    retrieval_status = Column(String, nullable=True) # complete, low_evidence, insufficient
    latency_ms = Column(Float, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
    evidences = relationship("RetrievedEvidence", back_populates="message", cascade="all, delete-orphan")
    feedback = relationship("UserFeedback", back_populates="message", uselist=False)

class RetrievedEvidence(Base):
    __tablename__ = "retrieved_evidence"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    message_id = Column(String, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    chunk_id = Column(String, nullable=False)
    document_id = Column(String, nullable=False)
    document_title = Column(String, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String, nullable=True)
    snippet = Column(Text, nullable=False)
    similarity_score = Column(Float, default=0.0)
    rerank_score = Column(Float, default=0.0)
    is_conflicting = Column(Boolean, default=False)
    
    message = relationship("Message", back_populates="evidences")

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    message_id = Column(String, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False) # +1 or -1
    comment = Column(Text, nullable=True)
    feedback_type = Column(String, nullable=True) # inaccurate, missing_context, helpful, hallucination
    created_at = Column(DateTime, default=datetime.utcnow)
    
    message = relationship("Message", back_populates="feedback")

# 4. INDUSTRIAL EVENTS & TELEMETRY
class ProductionLine(Base):
    __tablename__ = "production_lines"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="operational") # operational, maintenance, warning, offline
    current_product = Column(String, nullable=True)
    active_batch_id = Column(String, nullable=True)

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(String, primary_key=True)
    production_line_id = Column(String, ForeignKey("production_lines.id"))
    name = Column(String, nullable=False)
    model_number = Column(String, nullable=True)
    install_date = Column(DateTime, nullable=True)
    health_score = Column(Float, default=98.5)

class DefectEvent(Base):
    __tablename__ = "defect_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    defect_class = Column(String, nullable=False) # e.g. Surface Crack, Porosity, Dimension Skew, Weld Gap
    confidence = Column(Float, nullable=False)
    severity = Column(String, default="medium") # low, medium, high, critical
    image_path = Column(String, nullable=True)
    bounding_box = Column(JSON, nullable=True) # [x, y, w, h]
    
    production_line_id = Column(String, nullable=False)
    machine_id = Column(String, nullable=True)
    product_batch_id = Column(String, nullable=True)
    camera_id = Column(String, default="CAM-01")
    inspection_session_id = Column(String, nullable=True)
    yolo_model_version = Column(String, default="v8.2-industrial")
    
    status = Column(String, default="open") # open, investigating, resolved, false_positive
    timestamp = Column(DateTime, default=datetime.utcnow)

class SensorObservation(Base):
    __tablename__ = "sensor_observations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    machine_id = Column(String, nullable=False, index=True)
    sensor_id = Column(String, nullable=False) # e.g., TEMP_BEARING_01, VIB_AXIS_Z, PRESSURE_HYD
    measurement_value = Column(Float, nullable=False)
    unit = Column(String, nullable=False) # degC, mm/s, bar, RPM
    quality_status = Column(String, default="valid") # valid, warning, anomaly, sensor_error
    is_synthetic = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

# 5. DIAGNOSIS & ROOT CAUSE ANALYSIS
class Investigation(Base):
    __tablename__ = "investigations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    defect_event_id = Column(String, ForeignKey("defect_events.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="in_progress") # in_progress, evidence_gathered, verified, closed
    assigned_engineer = Column(String, nullable=True)
    evidence_sufficiency_score = Column(Float, default=0.0) # 0 to 1.0
    unresolved_questions = Column(JSON, default=list)
    recommended_actions = Column(JSON, default=list)
    
    verified_root_cause = Column(Text, nullable=True)
    corrective_action_taken = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    hypotheses = relationship("CandidateHypothesis", back_populates="investigation", cascade="all, delete-orphan")

class CandidateHypothesis(Base):
    __tablename__ = "candidate_hypotheses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    hypothesis_text = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.5)
    rank = Column(Integer, default=1)
    
    supporting_evidence_ids = Column(JSON, default=list) # List of chunk IDs or doc IDs
    contradicting_evidence_ids = Column(JSON, default=list)
    observed_measurements = Column(JSON, default=dict)
    missing_measurements = Column(JSON, default=list)
    verification_status = Column(String, default="candidate") # candidate, testing, verified, rejected
    
    investigation = relationship("Investigation", back_populates="hypotheses")

# 6. EVALUATION LAB
class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    system_variant = Column(String, nullable=False) # dense_rag, hybrid_rag, hybrid_rerank, full_copilot
    dataset_name = Column(String, default="industrial_troubleshooting_v1")
    dataset_size = Column(Integer, default=0)
    
    recall_at_k = Column(Float, default=0.0)
    mrr = Column(Float, default=0.0)
    ndcg_at_k = Column(Float, default=0.0)
    retrieval_precision = Column(Float, default=0.0)
    citation_precision = Column(Float, default=0.0)
    citation_coverage = Column(Float, default=0.0)
    groundedness_score = Column(Float, default=0.0)
    unsupported_claim_rate = Column(Float, default=0.0)
    root_cause_accuracy = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
    
    metrics_detail = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
