from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models import DefectEvent, Investigation, CandidateHypothesis
from app.schemas.incident import DefectEventSchema, InvestigationSchema, VerifyRootCauseRequest
from app.services.diagnosis.evidence_gap_controller import evidence_gap_controller

router = APIRouter(tags=["Industrial Incidents & Diagnosis"])

@router.get("/incidents", response_model=List[DefectEventSchema])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(DefectEvent).order_by(DefectEvent.timestamp.desc()).all()

@router.get("/incidents/{incident_id}", response_model=DefectEventSchema)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    evt = db.query(DefectEvent).filter(DefectEvent.id == incident_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return evt

@router.post("/incidents/{incident_id}/investigate")
def investigate_incident(incident_id: str, db: Session = Depends(get_db)):
    """Runs event-conditioned industrial evidence-gap investigation algorithm."""
    result = evidence_gap_controller.evaluate_investigation(db, incident_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/investigations/{investigation_id}", response_model=InvestigationSchema)
def get_investigation(investigation_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    return inv

@router.post("/investigations/{investigation_id}/verify-root-cause")
def verify_root_cause(
    investigation_id: str,
    req: VerifyRootCauseRequest,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    
    from datetime import datetime
    inv.status = "verified"
    inv.verified_root_cause = req.verified_root_cause
    inv.corrective_action_taken = req.corrective_action_taken
    inv.verified_by = req.engineer_name
    inv.verified_at = datetime.utcnow()
    inv.evidence_sufficiency_score = 1.0

    # Also update defect event status to resolved
    defect_event = db.query(DefectEvent).filter(DefectEvent.id == inv.defect_event_id).first()
    if defect_event:
        defect_event.status = "resolved"

    db.commit()
    db.refresh(inv)
    return inv
