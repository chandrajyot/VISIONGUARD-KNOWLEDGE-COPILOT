const API_BASE = "http://localhost:8000/api";

export interface AnalyticsOverview {
  total_indexed_documents: number;
  documents_awaiting_processing: number;
  open_incidents: number;
  defect_events_investigated: number;
  questions_answered_sufficient: number;
  unresolved_investigations: number;
  retrieval_latency_ms: number;
  answer_latency_ms: number;
  groundedness_rate: string;
  citation_accuracy: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  doc_type: string;
  revision: string;
  machine_id?: string;
  production_line_id?: string;
  permission_required: string;
  status: string;
  chunk_count: number;
  error_message?: string;
  created_at: string;
}

export interface DefectEventItem {
  id: string;
  defect_class: string;
  confidence: number;
  severity: string;
  image_path?: string;
  bounding_box?: number[];
  production_line_id: string;
  machine_id?: string;
  product_batch_id?: string;
  camera_id: string;
  inspection_session_id?: string;
  yolo_model_version: string;
  status: string;
  timestamp: string;
}

export interface CandidateHypothesis {
  id: string;
  hypothesis_text: string;
  confidence_score: number;
  rank: number;
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  observed_measurements: Record<string, any>;
  missing_measurements: string[];
  verification_status: string;
}

export interface InvestigationResult {
  defect_event_id: string;
  defect_class: string;
  production_line_id: string;
  machine_id: string;
  telemetry_observed: Record<string, string>;
  retrieved_evidence: any[];
  candidate_hypotheses: CandidateHypothesis[];
  unresolved_questions: string[];
  recommended_actions: string[];
  contradictions: string[];
  evidence_sufficiency_score: number;
  status: string;
}

export interface EvaluationRunItem {
  id: string;
  name: string;
  system_variant: string;
  dataset_name: string;
  dataset_size: number;
  recall_at_k: number;
  mrr: number;
  ndcg_at_k: number;
  retrieval_precision: number;
  citation_precision: number;
  citation_coverage: number;
  groundedness_score: number;
  unsupported_claim_rate: number;
  root_cause_accuracy: number;
  avg_latency_ms: number;
  created_at: string;
}

export const api = {
  getSystemStatus: async () => {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  },
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },
  getDocuments: async (): Promise<DocumentItem[]> => {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },
  uploadDocument: async (formData: FormData): Promise<DocumentItem> => {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },
  deleteDocument: async (docId: string) => {
    const res = await fetch(`${API_BASE}/documents/${docId}`, { method: "DELETE" });
    return res.json();
  },
  reindexDocument: async (docId: string) => {
    const res = await fetch(`${API_BASE}/documents/${docId}/reindex`, { method: "POST" });
    return res.json();
  },
  getIncidents: async (): Promise<DefectEventItem[]> => {
    const res = await fetch(`${API_BASE}/incidents`);
    return res.json();
  },
  investigateIncident: async (incidentId: string): Promise<InvestigationResult> => {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/investigate`, { method: "POST" });
    return res.json();
  },
  verifyRootCause: async (investigationId: string, verified_root_cause: string, corrective_action_taken: string, engineer_name: string) => {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/verify-root-cause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified_root_cause, corrective_action_taken, engineer_name }),
    });
    return res.json();
  },
  getEvaluationRuns: async (): Promise<EvaluationRunItem[]> => {
    const res = await fetch(`${API_BASE}/evaluation/runs`);
    return res.json();
  },
  triggerEvaluationRun: async (name: string, system_variant: string): Promise<EvaluationRunItem> => {
    const res = await fetch(`${API_BASE}/evaluation/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, system_variant }),
    });
    return res.json();
  },
};
