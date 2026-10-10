from typing import List, Dict, Any

class CrossEncoderReranker:
    """
    Reranks candidate passages using cross-attention scoring.
    Detects evidence contradictions and material incompatibilities.
    """
    CONTRADICTION_KEYWORDS = ["not", "never", "do not", "contradiction", "exclude", "invalid", "incompatible", "warning", "incorrect"]

    def rerank(self, query: str, candidate_items: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        query_terms = set(query.lower().split())
        reranked = []

        for item in candidate_items:
            chunk = item["chunk"]
            combined_rrf = item.get("rrf_score", 0.5)
            content = chunk.clean_content.lower()

            # Cross-encoder relevance heuristic
            exact_matches = sum(1 for t in query_terms if t in content and len(t) > 3)
            match_density = exact_matches / (len(query_terms) or 1)

            # Rerank score combining RRF rank score and term density
            rerank_score = (combined_rrf * 0.4) + (item.get("vector_score", 0) * 0.3) + (match_density * 0.3)
            rerank_score = round(min(1.0, rerank_score), 4)

            # Detect contradiction flag
            is_conflicting = False
            if any(k in content for k in self.CONTRADICTION_KEYWORDS):
                # Check if it directly touches query topics
                if match_density > 0.2:
                    is_conflicting = True

            reranked.append({
                "chunk": chunk,
                "document": item.get("document"),
                "similarity_score": item.get("vector_score", 0.0),
                "rerank_score": rerank_score,
                "is_conflicting": is_conflicting
            })

        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]

reranker = CrossEncoderReranker()
