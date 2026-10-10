import pytest
from app.database.session import SessionLocal
from app.database.init_db import init_db
from app.services.diagnosis.evidence_gap_controller import evidence_gap_controller
from app.services.evaluation.evaluator import evaluation_lab

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_evidence_gap_controller(db_session):
    result = evidence_gap_controller.evaluate_investigation(db_session, "DEF-2026-0941")
    assert "error" not in result
    assert result["defect_event_id"] == "DEF-2026-0941"
    assert len(result["candidate_hypotheses"]) > 0
    assert result["evidence_sufficiency_score"] > 0.5
    assert len(result["unresolved_questions"]) > 0

def test_evaluation_lab(db_session):
    run_record = evaluation_lab.run_evaluation(db_session, variant_name="full_copilot", run_name="Unit Test Eval")
    assert run_record.recall_at_k > 0.5
    assert run_record.mrr > 0.5
    assert run_record.groundedness_score > 0.5
