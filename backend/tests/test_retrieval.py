import pytest
from app.database.session import SessionLocal
from app.database.init_db import init_db
from app.services.retrieval.bm25_search import BM25SearchEngine
from app.services.retrieval.vector_store import vector_engine
from app.services.retrieval.hybrid_retriever import hybrid_retriever

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_bm25_search(db_session):
    from app.database.models import DocumentChunk
    chunks = db_session.query(DocumentChunk).all()
    bm25 = BM25SearchEngine()
    results = bm25.search("micro-cracking hydraulic pressure", chunks, top_k=3)
    assert len(results) > 0
    assert "micro-cracking" in results[0]["chunk"].clean_content.lower() or "pressure" in results[0]["chunk"].clean_content.lower()

def test_vector_search(db_session):
    from app.database.models import DocumentChunk
    chunks = db_session.query(DocumentChunk).all()
    results = vector_engine.search("roller pressure temperature shear stress", chunks, top_k=3)
    assert len(results) > 0
    assert results[0]["vector_score"] > 0.0

def test_hybrid_retriever(db_session):
    results = hybrid_retriever.retrieve(
        db=db_session,
        query="SOP roller pressure threshold micro cracking",
        user_permission="standard",
        production_line_id="LINE-A",
        machine_id="MCH-STAMP-01"
    )
    assert len(results) > 0
    assert results[0]["chunk"].id is not None
