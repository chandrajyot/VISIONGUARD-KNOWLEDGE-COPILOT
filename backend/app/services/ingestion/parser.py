import os
import hashlib
from typing import Dict, List, Any

def compute_content_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def parse_document(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """
    Parses PDF, DOCX, TXT, CSV, MD files into structured pages/sections with text content.
    Returns a list of dicts: [{'page': 1, 'section': 'Header', 'text': '...'}]
    """
    file_type = file_type.upper()
    pages_data = []

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if file_type == "PDF":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_data.append({
                        "page": idx + 1,
                        "section": f"Page {idx + 1}",
                        "text": text.strip()
                    })
        except Exception:
            # Fallback text reading
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                pages_data.append({"page": 1, "section": "Document Content", "text": content})

    elif file_type == "DOCX":
        try:
            import docx
            doc = docx.Document(file_path)
            current_section = "Document General"
            page_estimate = 1
            para_buffer = []

            for p in doc.paragraphs:
                if p.style.name.startswith("Heading"):
                    if para_buffer:
                        pages_data.append({
                            "page": page_estimate,
                            "section": current_section,
                            "text": "\n".join(para_buffer)
                        })
                        para_buffer = []
                        page_estimate += 1
                    current_section = p.text
                elif p.text.strip():
                    para_buffer.append(p.text.strip())
            if para_buffer:
                pages_data.append({
                    "page": page_estimate,
                    "section": current_section,
                    "text": "\n".join(para_buffer)
                })
        except Exception:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                pages_data.append({"page": 1, "section": "Document Content", "text": content})

    else:
        # TXT, CSV, MD
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            # Split by double newline or headers if MD
            lines = content.split("\n")
            current_section = "Main Content"
            current_text = []
            page_no = 1
            for line in lines:
                if line.startswith("#"):
                    if current_text:
                        pages_data.append({"page": page_no, "section": current_section, "text": "\n".join(current_text)})
                        current_text = []
                        page_no += 1
                    current_section = line.lstrip("#").strip()
                else:
                    if line.strip():
                        current_text.append(line)
            if current_text:
                pages_data.append({"page": page_no, "section": current_section, "text": "\n".join(current_text)})

    if not pages_data:
        pages_data.append({"page": 1, "section": "Content", "text": "Empty or unparseable document."})

    return pages_data
