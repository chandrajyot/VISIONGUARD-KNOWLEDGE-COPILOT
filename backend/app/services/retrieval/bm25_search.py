import math
import re
from typing import List, Dict, Any

class BM25SearchEngine:
    """
    In-memory BM25 Keyword Search Engine for database document chunks.
    Calculates TF-IDF BM25 scores for precision keyword retrieval.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b\w+\b', text)]

    def search(self, query: str, chunks: List[Any], top_k: int = 10) -> List[Dict[str, Any]]:
        if not chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        corpus_tokens = [self._tokenize(chunk.clean_content) for chunk in chunks]
        N = len(corpus_tokens)
        avgdl = sum(len(doc) for doc in corpus_tokens) / (N if N > 0 else 1)

        # Compute document frequency for query terms
        df = {}
        for token in set(query_tokens):
            df[token] = sum(1 for doc in corpus_tokens if token in doc)

        scores = []
        for idx, (chunk, doc_tokens) in enumerate(zip(chunks, corpus_tokens)):
            doc_len = len(doc_tokens)
            score = 0.0
            doc_token_counts = {}
            for t in doc_tokens:
                doc_token_counts[t] = doc_token_counts.get(t, 0) + 1

            for q_term in query_tokens:
                if q_term not in doc_token_counts:
                    continue
                freq = doc_token_counts[q_term]
                n_q = df.get(q_term, 0)
                idf = math.log((N - n_q + 0.5) / (n_q + 0.5) + 1.0)
                numerator = freq * (self.k1 + 1)
                denominator = freq + self.k1 * (1 - self.b + self.b * (doc_len / (avgdl or 1.0)))
                score += idf * (numerator / denominator)

            if score > 0:
                scores.append({
                    "chunk": chunk,
                    "bm25_score": score
                })

        scores.sort(key=lambda x: x["bm25_score"], reverse=True)
        return scores[:top_k]
