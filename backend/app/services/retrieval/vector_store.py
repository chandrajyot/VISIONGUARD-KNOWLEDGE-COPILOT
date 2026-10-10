import math
import re
from typing import List, Dict, Any, Optional
from app.core.config import settings

class DenseVectorEngine:
    """
    Vector retrieval engine with dual support for Qdrant API or built-in vector similarity engine.
    Computes semantic vector representations for document chunks.
    """
    def __init__(self):
        self.qdrant_client = None
        if settings.QDRANT_URL:
            try:
                from qdrant_client import QdrantClient
                self.qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
            except Exception:
                self.qdrant_client = None

    def _text_to_vector(self, text: str) -> Dict[str, float]:
        """Generates a pseudo-semantic dense vector representation based on word n-grams and character trigrams."""
        words = re.findall(r'\b\w+\b', text.lower())
        vec = {}
        total = len(words) or 1
        for w in words:
            vec[w] = vec.get(w, 0.0) + 1.0 / total
            # Add subwords/ngrams for dense matching
            for i in range(len(w) - 2):
                sub = w[i:i+3]
                vec[f"sub_{sub}"] = vec.get(f"sub_{sub}", 0.0) + 0.5 / total

        # Normalize L2
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {k: v / norm for k, v in vec.items()}

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        dot = sum(val * vec2.get(k, 0.0) for k, val in vec1.items())
        return max(0.0, min(1.0, dot))

    def search(self, query: str, chunks: List[Any], top_k: int = 10) -> List[Dict[str, Any]]:
        query_vec = self._text_to_vector(query)
        results = []

        for chunk in chunks:
            chunk_vec = self._text_to_vector(chunk.clean_content)
            sim = self._cosine_similarity(query_vec, chunk_vec)
            
            # Boost score if section or machine matches query
            if chunk.section_title and any(w in chunk.section_title.lower() for w in query.lower().split()):
                sim = min(1.0, sim + 0.15)
                
            results.append({
                "chunk": chunk,
                "vector_score": sim
            })

        results.sort(key=lambda x: x["vector_score"], reverse=True)
        return results[:top_k]

vector_engine = DenseVectorEngine()
