import pytest
from app.services.ingestion.chunker import clean_text, chunk_parsed_data
from app.services.ingestion.parser import compute_content_hash

def test_clean_text():
    raw = "Section 1:   Micro-cracking   on high-tensile steel sheet.\n\n\n\nHydroPress 180 bar."
    cleaned = clean_text(raw)
    assert "  " not in cleaned
    assert "180 bar" in cleaned

def test_chunking():
    pages = [
        {"page": 1, "section": "Section 1", "text": "This is word one. This is word two. " * 30}
    ]
    chunks = chunk_parsed_data(pages, chunk_size=20, overlap=5)
    assert len(chunks) > 1
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["section_title"] == "Section 1"

def test_content_hash():
    h1 = compute_content_hash(b"test document content")
    h2 = compute_content_hash(b"test document content")
    assert h1 == h2
