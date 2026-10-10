from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import EvaluationRun
from app.schemas.evaluation import EvaluationRunSchema, EvaluationRunRequest
from app.services.evaluation.evaluator import evaluation_lab

router = APIRouter(prefix="/evaluation", tags=["Evaluation Lab"])

@router.get("/runs", response_model=List[EvaluationRunSchema])
def list_evaluation_runs(db: Session = Depends(get_db)):
    return db.query(EvaluationRun).order_by(EvaluationRun.created_at.desc()).all()

@router.get("/runs/{run_id}", response_model=EvaluationRunSchema)
def get_evaluation_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found.")
    return run

@router.post("/runs", response_model=EvaluationRunSchema)
def trigger_evaluation_run(req: EvaluationRunRequest, db: Session = Depends(get_db)):
    run_record = evaluation_lab.run_evaluation(
        db=db,
        variant_name=req.system_variant,
        run_name=req.name
    )
    return run_record
