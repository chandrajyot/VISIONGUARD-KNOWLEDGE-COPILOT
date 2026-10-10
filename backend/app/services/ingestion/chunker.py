from typing import List, Dict, Any
import re

def clean_text(text: str) -> str:
    """Normalizes whitespace while preserving industrial units and mathematical notations."""
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def chunk_parsed_data(pages_data: List[Dict[str, Any]], chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Chunks document content into semantic segments with page numbers and section headers.
    """
    chunks = []
    chunk_counter = 1

    for page_item in pages_data:
        page_no = page_item.get("page", 1)
        section_title = page_item.get("section", "General")
        raw_text = page_item.get("text", "")
        cleaned = clean_text(raw_text)

        words = cleaned.split()
        if len(words) <= chunk_size:
            chunks.append({
                "chunk_index": chunk_counter,
                "content": raw_text,
                "clean_content": cleaned,
                "page_number": page_no,
                "section_title": section_title
            })
            chunk_counter += 1
        else:
            i = 0
            while i < len(words):
                chunk_words = words[i : i + chunk_size]
                chunk_str = " ".join(chunk_words)
                chunks.append({
                    "chunk_index": chunk_counter,
                    "content": chunk_str,
                    "clean_content": chunk_str,
                    "page_number": page_no,
                    "section_title": section_title
                })
                chunk_counter += 1
                i += (chunk_size - overlap)

    return chunks
