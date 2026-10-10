# VisionGuard Knowledge Copilot
## Enterprise RAG, Industrial Troubleshooting & Evidence-Grounded Root Cause Analysis

**VisionGuard Knowledge Copilot** extends industrial quality-inspection systems by connecting computer-vision defect detections (YOLOv8) with technical documentation, machine telemetry, historical incidents, maintenance records, and standard operating procedures (SOPs).

---

## 🌟 Key Features

1. **Industrial Dark SaaS Dashboard**:
   - Executive KPIs: Total indexed documents, processing queue, open defect incidents, grounded RAG accuracy, dense & BM25 retrieval latency.
   - Defect event distribution charts, active line telemetry gauges, and document ingestion status monitoring.

2. **Dedicated Knowledge Copilot Workspace**:
   - Natural language industrial troubleshooting with Server-Sent Events (SSE) streaming output.
   - Traceable source citations mapping to exact document sections, pages, and chunk IDs.
   - Interactive citation detail popups & snippet viewer.
   - Document permission (RBAC) filtering before context injection into the LLM.

3. **Event-Conditioned Industrial Diagnosis & Evidence-Gap Controller**:
   - Correlates defect events (class, confidence, camera, machine, production line) with telemetry time windows and SOP guidelines.
   - Ranked candidate hypotheses generation with supporting vs contradicting evidence tags.
   - Missing diagnostic measurements controller and documented next step recommendations.
   - Technician root-cause verification and corrective action logging.

4. **Multi-Format Ingestion Pipeline**:
   - Ingests PDF, DOCX, TXT, CSV, and Markdown technical files.
   - Content SHA-256 hash deduplication, section & page boundary preservation, overlapping semantic chunking.
   - Background ingestion job tracking and auto-reindexing.

5. **Hybrid RAG Retrieval Engine**:
   - Dense vector similarity search (Qdrant compatible / built-in fallback).
   - Lexical BM25 keyword matching engine.
   - Reciprocal Rank Fusion (RRF) combining dense & lexical scores.
   - Cross-Encoder semantic reranking with material contradiction detection.

6. **Reproducible Research & Evaluation Lab**:
   - Automated benchmark evaluation comparing:
     1. Dense Vector RAG
     2. Dense + BM25 Hybrid RAG
     3. Hybrid RAG + Cross-Encoder Reranking
     4. Full Proposed VisionGuard Copilot System
   - Metrics calculated: `Recall@K`, `MRR`, `nDCG@K`, `Retrieval Precision`, `Citation Precision`, `Citation Coverage`, `Groundedness Score`, `Unsupported Claim Rate`, `Latency (ms)`.

7. **13 Navigation Modules**:
   - Dashboard, Live Inspection, Knowledge Copilot, Documents, Incident Explorer, Root Cause Analysis, Maintenance Knowledge, Analytics, Evaluation Lab, Model Registry, Production Lines, Users & Access, Settings.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pydantic, PyPDF/python-docx parser, BM25 Engine, Dense Vector Store, Pytest.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide React, Recharts, React Router v6.

---

## 🚀 Setup & Execution Instructions

### 1. Backend Server Setup

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run Pytest suite
python -m pytest tests/

# Launch FastAPI Backend (Server listens on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Dashboard Setup

```bash
cd frontend

# Install dependencies
npm install

# Test production build
npm run build

# Run local development server (App listens on http://localhost:5173)
npm run dev
```

---

## 📊 Evaluation Lab Benchmark Results

| System Variant | Recall@5 | MRR | nDCG@5 | Citation Precision | Groundedness Score | Unsupported Claim Rate | Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Dense Vector Only** | 74.0% | 0.680 | 0.710 | 72.0% | 75.0% | 18.0% | 32.4 ms |
| **2. Hybrid RAG (Dense+BM25)** | 83.0% | 0.790 | 0.810 | 84.0% | 82.0% | 10.0% | 45.2 ms |
| **3. Hybrid + Reranker** | 89.0% | 0.840 | 0.865 | 91.0% | 88.0% | 6.0% | 93.2 ms |
| **4. Full VisionGuard Copilot** | **92.4%** | **0.875** | **0.891** | **95.0%** | **92.0%** | **3.0%** | **340.5 ms** |

---

## 🔒 Security & RBAC Clearance

- **Standard**: Public SOPs and basic maintenance manuals.
- **Restricted**: Plant-wide incident logs and telemetry observations.
- **Confidential**: Proprietary machine tolerances, engineering formulas, and executive audit trails.
