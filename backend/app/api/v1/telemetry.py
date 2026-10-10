from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import SensorObservation
from app.schemas.telemetry import SensorObservationSchema, TelemetryImportRequest

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("/import")
def import_telemetry(req: TelemetryImportRequest, db: Session = Depends(get_db)):
    obs = SensorObservation(
        machine_id=req.machine_id,
        sensor_id=req.sensor_id,
        measurement_value=req.measurement_value,
        unit=req.unit,
        quality_status=req.quality_status,
        is_synthetic=req.is_synthetic
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs

@router.get("/machines/{machine_id}", response_model=List[SensorObservationSchema])
def get_machine_telemetry(machine_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SensorObservation).filter(
        SensorObservation.machine_id == machine_id
    ).order_by(SensorObservation.timestamp.desc()).limit(limit).all()
