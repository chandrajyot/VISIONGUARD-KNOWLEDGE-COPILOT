from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Document, DefectEvent, SensorObservation, EvaluationRun
from app.core.config import settings

router = APIRouter(tags=["System"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@router.get("/system/status")
def system_status(db: Session = Depends(get_db)):
    doc_count = db.query(Document).count()
    defect_count = db.query(DefectEvent).count()
    sensor_count = db.query(SensorObservation).count()
    eval_count = db.query(EvaluationRun).count()

    return {
        "status": "operational",
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_model": settings.EMBEDDING_MODEL,
        "qdrant_status": "connected" if settings.QDRANT_URL else "local_vector_engine",
        "stats": {
            "indexed_documents": doc_count,
            "open_defects": defect_count,
            "sensor_channels": sensor_count,
            "evaluation_runs": eval_count
        }
    }
