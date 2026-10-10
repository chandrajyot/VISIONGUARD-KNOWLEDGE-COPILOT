from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SensorObservationSchema(BaseModel):
    id: str
    machine_id: str
    sensor_id: str
    measurement_value: float
    unit: str
    quality_status: str
    is_synthetic: bool
    timestamp: datetime

    class Config:
        from_attributes = True

class TelemetryImportRequest(BaseModel):
    machine_id: str
    sensor_id: str
    measurement_value: float
    unit: str
    quality_status: str = "valid"
    is_synthetic: bool = False
