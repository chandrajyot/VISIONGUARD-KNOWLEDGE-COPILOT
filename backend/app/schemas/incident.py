from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DefectEventSchema(BaseModel):
    id: str
    defect_class: str
    confidence: float
    severity: str
    image_path: Optional[str] = None
    bounding_box: Optional[List[int]] = None
    production_line_id: str
    machine_id: Optional[str] = None
    product_batch_id: Optional[str] = None
    camera_id: str
    inspection_session_id: Optional[str] = None
    yolo_model_version: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class CandidateHypothesisSchema(BaseModel):
    id: str
    hypothesis_text: str
    confidence_score: float
    rank: int
    supporting_evidence_ids: List[str] = []
    contradicting_evidence_ids: List[str] = []
    observed_measurements: Dict[str, Any] = {}
    missing_measurements: List[str] = []
    verification_status: str

    class Config:
        from_attributes = True

class InvestigationSchema(BaseModel):
    id: str
    defect_event_id: str
    title: str
    status: str
    assigned_engineer: Optional[str] = None
    evidence_sufficiency_score: float
    unresolved_questions: List[str] = []
    recommended_actions: List[str] = []
    verified_root_cause: Optional[str] = None
    corrective_action_taken: Optional[str] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    hypotheses: List[CandidateHypothesisSchema] = []

    class Config:
        from_attributes = True

class VerifyRootCauseRequest(BaseModel):
    verified_root_cause: str
    corrective_action_taken: str
    engineer_name: str = "Sarah Chen"
