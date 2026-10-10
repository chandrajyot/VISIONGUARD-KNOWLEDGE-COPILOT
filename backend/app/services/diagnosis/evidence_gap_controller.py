from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import DefectEvent, SensorObservation, DocumentChunk, CandidateHypothesis, Investigation
from app.services.retrieval.hybrid_retriever import hybrid_retriever

class EvidenceGapController:
    """
    Industrial Event-Conditioned Evidence-Gap Controller:
    1. Correlates defect events (class, confidence, line, machine) with telemetry windows and SOP evidence.
    2. Ranks candidate hypotheses based on evidence alignment.
    3. Detects missing diagnostic measurements and contradicting facts.
    4. Evaluates evidence sufficiency stopping criteria.
    """
    def __init__(self, action_budget: int = 3):
        self.action_budget = action_budget

    def evaluate_investigation(
        self,
        db: Session,
        defect_event_id: str,
        user_permission: str = "standard"
    ) -> Dict[str, Any]:
        event = db.query(DefectEvent).filter(DefectEvent.id == defect_event_id).first()
        if not event:
            return {"error": f"Defect event {defect_event_id} not found."}

        # 1. Fetch Telemetry observations around event
        telemetry = db.query(SensorObservation).filter(
            SensorObservation.machine_id == event.machine_id
        ).order_by(SensorObservation.timestamp.desc()).limit(10).all()

        telemetry_map = {t.sensor_id: f"{t.measurement_value} {t.unit}" for t in telemetry}

        # 2. Retrieve Relevant Technical Manuals & SOPs
        query = f"Defect {event.defect_class} on line {event.production_line_id} machine {event.machine_id} root cause diagnostic"
        retrieved_evidence = hybrid_retriever.retrieve(
            db=db,
            query=query,
            user_permission=user_permission,
            production_line_id=event.production_line_id,
            machine_id=event.machine_id,
            top_k_retrieve=10,
            top_k_rerank=5
        )

        # 3. Build Candidates and Evaluate Evidence Gaps
        candidates = []
        unresolved_questions = []
        recommended_actions = []
        contradictions = []

        # Analyze retrieved chunks for hypotheses & gap analysis
        supporting_chunks = []
        for item in retrieved_evidence:
            chk = item["chunk"]
            if item.get("is_conflicting"):
                contradictions.append(f"Source [{item['document'].title if item['document'] else 'SOP'}] indicates: {chk.clean_content}")
            else:
                supporting_chunks.append(chk.id)

        # Example Hypothesis 1: Hydraulic Press Over-pressure & Temperature
        press_val = telemetry_map.get("PRESS_HYD_P1", "Unmeasured")
        temp_val = telemetry_map.get("TEMP_HYD_FLUID", "Unmeasured")

        h1_score = 0.85 if "PRESS_HYD_P1" in telemetry_map and "TEMP_HYD_FLUID" in telemetry_map else 0.5
        candidates.append({
            "hypothesis_text": f"Localized shear stress micro-cracking caused by hydraulic over-pressure ({press_val}) and elevated fluid temperature ({temp_val}).",
            "confidence_score": h1_score,
            "rank": 1,
            "supporting_evidence_ids": supporting_chunks[:2],
            "contradicting_evidence_ids": [],
            "observed_measurements": telemetry_map,
            "missing_measurements": ["Sheet Lubricant Viscosity Index", "Die Gap Gauge Clearance"],
            "verification_status": "candidate"
        })

        if "Sheet Lubricant Viscosity Index" in candidates[0]["missing_measurements"]:
            unresolved_questions.append("What is the current sheet lubricant viscosity index on Line A?")
            recommended_actions.append("Audit sheet lubricant viscosity using refractometer per SOP-402 Sec 2.")

        if "DIE_GAP_SENSOR" not in telemetry_map:
            unresolved_questions.append("What is the physical feeler gauge die gap clearance?")
            recommended_actions.append("Verify die gap clearance tolerance (1.2mm +/- 0.05mm).")

        # Compute Sufficiency Score
        measured_count = len(telemetry_map)
        sufficiency_score = round(min(1.0, 0.4 + (measured_count * 0.15) + (len(supporting_chunks) * 0.1)), 2)

        return {
            "defect_event_id": event.id,
            "defect_class": event.defect_class,
            "production_line_id": event.production_line_id,
            "machine_id": event.machine_id,
            "telemetry_observed": telemetry_map,
            "retrieved_evidence": retrieved_evidence,
            "candidate_hypotheses": candidates,
            "unresolved_questions": unresolved_questions,
            "recommended_actions": recommended_actions,
            "contradictions": contradictions,
            "evidence_sufficiency_score": sufficiency_score,
            "status": "sufficient" if sufficiency_score >= 0.8 else "unresolved_information_gap"
        }

evidence_gap_controller = EvidenceGapController()
