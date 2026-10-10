from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class EvaluationRunSchema(BaseModel):
    id: str
    name: str
    system_variant: str
    dataset_name: str
    dataset_size: int
    recall_at_k: float
    mrr: float
    ndcg_at_k: float
    retrieval_precision: float
    citation_precision: float
    citation_coverage: float
    groundedness_score: float
    unsupported_claim_rate: float
    root_cause_accuracy: float
    avg_latency_ms: float
    metrics_detail: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluationRunRequest(BaseModel):
    name: str
    system_variant: str = "full_copilot" # dense_rag, hybrid_rag, hybrid_rerank, full_copilot
    dataset_name: str = "industrial_troubleshooting_v1"
