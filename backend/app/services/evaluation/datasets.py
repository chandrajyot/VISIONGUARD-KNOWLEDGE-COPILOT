from typing import List, Dict, Any

EVALUATION_DATASET_V1: List[Dict[str, Any]] = [
    {
        "id": "q-01",
        "question": "Why might the metal component develop micro-cracks on Production Line A?",
        "production_line_id": "LINE-A",
        "machine_id": "MCH-STAMP-01",
        "ground_truth_doc_ids": ["doc-sop-01", "doc-manual-02"],
        "ground_truth_chunk_ids": ["chk-sop-402-1", "chk-manual-stamp-1"],
        "expected_root_cause": "Hydraulic pressure exceeding 180 bar combined with fluid temperature > 65 deg C",
        "missing_information": ["Sheet Lubricant Viscosity Index"],
        "contradictions": ["Heat treatment temp < 850 deg C does not cause crack"]
    },
    {
        "id": "q-02",
        "question": "What sensor baseline values should be checked for HydroPress 500T micro-cracking?",
        "production_line_id": "LINE-A",
        "machine_id": "MCH-STAMP-01",
        "ground_truth_doc_ids": ["doc-sop-01"],
        "ground_truth_chunk_ids": ["chk-sop-402-2"],
        "expected_root_cause": "Hydraulic pressure sensor Sens_Hyd_P1 baseline check",
        "missing_information": ["Die gap clearance feeler gauge reading"],
        "contradictions": []
    },
    {
        "id": "q-03",
        "question": "How do you resolve proportional control valve cavitation causing surface cracks?",
        "production_line_id": "LINE-A",
        "machine_id": "MCH-STAMP-01",
        "ground_truth_doc_ids": ["doc-manual-02"],
        "ground_truth_chunk_ids": ["chk-manual-stamp-2"],
        "expected_root_cause": "Proportional control valve cavitation seal kit wear",
        "missing_information": ["Vibration Axis Z measurement"],
        "contradictions": []
    }
]
