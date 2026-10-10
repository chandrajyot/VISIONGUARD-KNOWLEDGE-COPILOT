from sqlalchemy.orm import Session
from app.database.models import Base, User, ProductionLine, Machine, Document, DocumentChunk, DefectEvent, SensorObservation, EvaluationRun, Investigation, CandidateHypothesis
from app.database.session import engine
from datetime import datetime, timedelta
import os
import json

def init_db(db: Session):
    Base.metadata.create_all(bind=engine)
    
    # Check if DB is already seeded
    if db.query(ProductionLine).first():
        return

    print("Seeding initial industrial dataset for VisionGuard Knowledge Copilot...")

    # 1. Seed Users
    users = [
        User(id="usr-01", email="admin@visionguard.ai", full_name="Alex Vance (Lead Engineer)", role="admin", permission_level="confidential"),
        User(id="usr-02", email="quality@visionguard.ai", full_name="Sarah Chen (Quality Engineer)", role="quality_engineer", permission_level="standard"),
        User(id="usr-03", email="maintenance@visionguard.ai", full_name="Marcus Brody (Maintenance Supervisor)", role="maintenance_engineer", permission_level="standard"),
    ]
    for u in users:
        db.add(u)

    # 2. Seed Production Lines & Machines
    line_a = ProductionLine(id="LINE-A", name="Line A - Heavy Stamping & Forming", location="Building 1, Bay 3", status="warning", current_product="Automotive Chassis Beam", active_batch_id="BATCH-2026-089")
    line_b = ProductionLine(id="LINE-B", name="Line B - Precision CNC & Weld", location="Building 2, Bay 1", status="operational", current_product="Engine Mount Bracket", active_batch_id="BATCH-2026-104")
    db.add(line_a)
    db.add(line_b)

    m1 = Machine(id="MCH-STAMP-01", production_line_id="LINE-A", name="HydroPress 500T Hydraulic Stamping Machine", model_number="HP-500-X", health_score=84.2)
    m2 = Machine(id="MCH-HEAT-02", production_line_id="LINE-A", name="ThermoInduct Continuous Heat Treatment Furnace", model_number="TI-1200", health_score=92.0)
    m3 = Machine(id="MCH-WELD-01", production_line_id="LINE-B", name="RoboWeld Robotic Laser Welder", model_number="RW-Laser-8K", health_score=97.5)
    db.add(m1)
    db.add(m2)
    db.add(m3)

    # 3. Seed Standard Documents & Chunks
    doc1 = Document(
        id="doc-sop-01",
        title="SOP-402: Stamping Press Micro-Cracking Troubleshooting & Roller Calibration",
        file_name="SOP-402_Stamping_MicroCracking.pdf",
        file_type="PDF",
        file_path="storage/documents/SOP-402_Stamping_MicroCracking.pdf",
        file_size_bytes=145000,
        content_hash="hash_sop_402",
        doc_type="sop",
        revision="v3.2",
        machine_id="MCH-STAMP-01",
        production_line_id="LINE-A",
        permission_required="standard",
        status="indexed",
        chunk_count=3
    )
    db.add(doc1)

    c1 = DocumentChunk(
        id="chk-sop-402-1",
        document_id="doc-sop-01",
        chunk_index=1,
        page_number=1,
        section_title="1. Scope & Primary Defect Modes",
        content="Section 1: Micro-cracking on high-tensile steel sheet components during press operations. When surface micro-cracking exceeds 0.5mm length, immediate inspection of hydraulic die alignment and roller pressure is required. Root cause correlation: Roller pressure exceeding 180 bar combined with hydraulic fluid temperature > 65 deg C causes localized shear stress, triggering micro-cracking.",
        clean_content="Section 1: Micro-cracking on high-tensile steel sheet components during press operations. When surface micro-cracking exceeds 0.5mm length, immediate inspection of hydraulic die alignment and roller pressure is required. Root cause correlation: Roller pressure exceeding 180 bar combined with hydraulic fluid temperature > 65 deg C causes localized shear stress, triggering micro-cracking.",
        metadata_json={"machine_id": "MCH-STAMP-01", "production_line_id": "LINE-A", "doc_type": "sop"}
    )
    c2 = DocumentChunk(
        id="chk-sop-402-2",
        document_id="doc-sop-01",
        chunk_index=2,
        page_number=2,
        section_title="2. Diagnostic Checklist & Sensor Thresholds",
        content="Section 2: Required Diagnostic Measurements for Micro-Cracking on Line A: 1) Verify die gap clearance with feeler gauge (standard tolerance 1.2mm +/- 0.05mm). 2) Audit HydroPress hydraulic pressure sensor (Sens_Hyd_P1) - baseline 150-165 bar. 3) Inspect sheet lubricant viscosity index (standard index > 95). If hydraulic fluid temp is normal (<55 deg C) but cracking persists, check for material grain direction misalignment.",
        clean_content="Section 2: Required Diagnostic Measurements for Micro-Cracking on Line A: 1) Verify die gap clearance with feeler gauge (standard tolerance 1.2mm +/- 0.05mm). 2) Audit HydroPress hydraulic pressure sensor (Sens_Hyd_P1) - baseline 150-165 bar. 3) Inspect sheet lubricant viscosity index (standard index > 95). If hydraulic fluid temp is normal (<55 deg C) but cracking persists, check for material grain direction misalignment.",
        metadata_json={"machine_id": "MCH-STAMP-01", "production_line_id": "LINE-A", "doc_type": "sop"}
    )
    c3 = DocumentChunk(
        id="chk-sop-402-3",
        document_id="doc-sop-01",
        chunk_index=3,
        page_number=3,
        section_title="3. Contradictions & Material Exclusions",
        content="Section 3: Contradiction Alert: Heat treatment temperature variations below 850 deg C do NOT cause longitudinal cracking in Stamping Press MCH-STAMP-01. Do not adjust furnace zonal heaters unless quench coil inlet pressure is below 4.2 bar.",
        clean_content="Section 3: Contradiction Alert: Heat treatment temperature variations below 850 deg C do NOT cause longitudinal cracking in Stamping Press MCH-STAMP-01. Do not adjust furnace zonal heaters unless quench coil inlet pressure is below 4.2 bar.",
        metadata_json={"machine_id": "MCH-STAMP-01", "production_line_id": "LINE-A", "doc_type": "sop"}
    )
    db.add(c1)
    db.add(c2)
    db.add(c3)

    doc2 = Document(
        id="doc-manual-02",
        title="MCH-STAMP Maintenance & Service Manual - Hydraulic System",
        file_name="HydroPress_Service_Manual_v2.docx",
        file_type="DOCX",
        file_path="storage/documents/HydroPress_Service_Manual_v2.docx",
        file_size_bytes=310000,
        content_hash="hash_manual_stamp",
        doc_type="manual",
        revision="v2.1",
        machine_id="MCH-STAMP-01",
        production_line_id="LINE-A",
        permission_required="standard",
        status="indexed",
        chunk_count=2
    )
    db.add(doc2)

    c4 = DocumentChunk(
        id="chk-manual-stamp-1",
        document_id="doc-manual-02",
        chunk_index=1,
        page_number=14,
        section_title="4.3 Proportional Valve & Vibration Signatures",
        content="Section 4.3: High vibration on Axis Z (> 4.5 mm/s RMS) indicates proportional control valve cavitation or worn piston seals in HydroPress 500T. Severe cavitation produces micro-pulsations in hydraulic pressure, resulting in periodic surface cracks along the stamping draw curve.",
        clean_content="Section 4.3: High vibration on Axis Z (> 4.5 mm/s RMS) indicates proportional control valve cavitation or worn piston seals in HydroPress 500T. Severe cavitation produces micro-pulsations in hydraulic pressure, resulting in periodic surface cracks along the stamping draw curve.",
        metadata_json={"machine_id": "MCH-STAMP-01", "production_line_id": "LINE-A", "doc_type": "manual"}
    )
    c5 = DocumentChunk(
        id="chk-manual-stamp-2",
        document_id="doc-manual-02",
        chunk_index=2,
        page_number=28,
        section_title="8.1 Corrective Action Protocol",
        content="Section 8.1 Corrective Action: Upon detecting hydraulic pressure micro-pulsations: 1) Isolate power and bleed main accumulator pressure. 2) Replace proportional valve seal kit (Part # PV-500-SK). 3) Recalibrate pressure sensor Sens_Hyd_P1 using zero-point offset utility.",
        clean_content="Section 8.1 Corrective Action: Upon detecting hydraulic pressure micro-pulsations: 1) Isolate power and bleed main accumulator pressure. 2) Replace proportional valve seal kit (Part # PV-500-SK). 3) Recalibrate pressure sensor Sens_Hyd_P1 using zero-point offset utility.",
        metadata_json={"machine_id": "MCH-STAMP-01", "production_line_id": "LINE-A", "doc_type": "manual"}
    )
    db.add(c4)
    db.add(c5)

    # 4. Seed Defect Events
    evt1 = DefectEvent(
        id="DEF-2026-0941",
        defect_class="Surface Crack",
        confidence=0.94,
        severity="high",
        image_path="/samples/defects/crack_line_a_01.jpg",
        bounding_box=[140, 220, 310, 85],
        production_line_id="LINE-A",
        machine_id="MCH-STAMP-01",
        product_batch_id="BATCH-2026-089",
        camera_id="CAM-STAMP-01",
        inspection_session_id="SESS-8812",
        yolo_model_version="v8.2-industrial-crack-detector",
        status="investigating",
        timestamp=datetime.utcnow() - timedelta(minutes=45)
    )
    evt2 = DefectEvent(
        id="DEF-2026-0938",
        defect_class="Porosity Void",
        confidence=0.88,
        severity="medium",
        image_path="/samples/defects/porosity_line_b_02.jpg",
        bounding_box=[80, 110, 60, 60],
        production_line_id="LINE-B",
        machine_id="MCH-WELD-01",
        product_batch_id="BATCH-2026-104",
        camera_id="CAM-WELD-02",
        inspection_session_id="SESS-8799",
        yolo_model_version="v8.2-industrial-weld-qa",
        status="open",
        timestamp=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(evt1)
    db.add(evt2)

    # 5. Seed Sensor Telemetry Around Incident
    now = datetime.utcnow()
    sensors = [
        ("MCH-STAMP-01", "TEMP_HYD_FLUID", 68.4, "degC", "warning"),
        ("MCH-STAMP-01", "PRESS_HYD_P1", 188.5, "bar", "warning"),
        ("MCH-STAMP-01", "VIB_AXIS_Z", 5.2, "mm/s", "anomaly"),
        ("MCH-STAMP-01", "DIE_GAP_SENSOR", 1.21, "mm", "valid"),
        ("MCH-HEAT-02", "FURNACE_ZONE1_TEMP", 840.0, "degC", "valid"),
        ("MCH-WELD-01", "LASER_POWER_KW", 4.1, "kW", "valid"),
    ]
    for m_id, s_id, val, unit, status in sensors:
        db.add(SensorObservation(
            machine_id=m_id,
            sensor_id=s_id,
            measurement_value=val,
            unit=unit,
            quality_status=status,
            is_synthetic=False,
            timestamp=now - timedelta(minutes=30)
        ))

    # 6. Seed Investigation & Candidates
    inv1 = Investigation(
        id="INV-2026-042",
        defect_event_id="DEF-2026-0941",
        title="Root Cause Investigation: High-Tensile Steel Sheet Crack on Line A",
        status="in_progress",
        assigned_engineer="Sarah Chen",
        evidence_sufficiency_score=0.82,
        unresolved_questions=[
            "Is the hydraulic lubricant viscosity index currently above 95?",
            "Has the proportional valve seal kit been inspected for cavitation wear?"
        ],
        recommended_actions=[
            "Measure sheet lubricant viscosity using portable refractometer per SOP-402 Sec 2.",
            "Audit hydraulic pressure sensor Sens_Hyd_P1 calibration and reduce system pressure below 180 bar."
        ]
    )
    db.add(inv1)

    hyp1 = CandidateHypothesis(
        id="hyp-01",
        investigation_id="INV-2026-042",
        hypothesis_text="Excessive hydraulic press pressure (>180 bar) combined with high fluid temperature (>65 °C) causing localized shear cracking.",
        confidence_score=0.88,
        rank=1,
        supporting_evidence_ids=["chk-sop-402-1", "chk-manual-stamp-1"],
        contradicting_evidence_ids=[],
        observed_measurements={"PRESS_HYD_P1": "188.5 bar", "TEMP_HYD_FLUID": "68.4 degC", "VIB_AXIS_Z": "5.2 mm/s"},
        missing_measurements=["Sheet Lubricant Viscosity Index"],
        verification_status="candidate"
    )
    hyp2 = CandidateHypothesis(
        id="hyp-02",
        investigation_id="INV-2026-042",
        hypothesis_text="Thermal shock in post-stamping cooling sequence due to heat treatment furnace temperature drop.",
        confidence_score=0.25,
        rank=2,
        supporting_evidence_ids=[],
        contradicting_evidence_ids=["chk-sop-402-3"],
        observed_measurements={"FURNACE_ZONE1_TEMP": "840 degC"},
        missing_measurements=["Quench coil inlet pressure"],
        verification_status="rejected"
    )
    db.add(hyp1)
    db.add(hyp2)

    # 7. Seed Evaluation Benchmark Runs
    eval1 = EvaluationRun(
        id="eval-run-001",
        name="Benchmark Run: Dense Vector vs Hybrid RAG vs Copilot",
        system_variant="full_copilot",
        dataset_name="industrial_troubleshooting_v1",
        dataset_size=50,
        recall_at_k=0.924,
        mrr=0.875,
        ndcg_at_k=0.891,
        retrieval_precision=0.860,
        citation_precision=0.940,
        citation_coverage=0.960,
        groundedness_score=0.912,
        unsupported_claim_rate=0.035,
        root_cause_accuracy=0.880,
        avg_latency_ms=420.5,
        metrics_detail={
            "ablation": {
                "dense_vector_only": {"recall@5": 0.74, "mrr": 0.68, "groundedness": 0.76},
                "hybrid_retrieval": {"recall@5": 0.83, "mrr": 0.79, "groundedness": 0.82},
                "hybrid_plus_rerank": {"recall@5": 0.89, "mrr": 0.84, "groundedness": 0.88},
                "full_copilot_system": {"recall@5": 0.92, "mrr": 0.88, "groundedness": 0.91}
            }
        }
    )
    db.add(eval1)

    db.commit()
    print("Database seeding completed successfully!")
