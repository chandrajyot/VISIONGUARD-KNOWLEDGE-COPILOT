from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Document, DocumentChunk
from app.services.retrieval.bm25_search import BM25SearchEngine
from app.services.retrieval.vector_store import vector_engine
from app.services.retrieval.reranker import reranker

class HybridRetrievalEngine:
    def __init__(self):
        self.bm25 = BM25SearchEngine()

    def rewrite_query(self, query: str, machine_id: Optional[str] = None, production_line_id: Optional[str] = None) -> str:
        """Stage A: Query understanding & rewriting."""
        rewritten = query
        if machine_id and machine_id.lower() not in query.lower():
            rewritten += f" {machine_id}"
        if production_line_id and production_line_id.lower() not in query.lower():
            rewritten += f" {production_line_id}"
        return rewritten

    def filter_by_permissions_and_metadata(
        self,
        db: Session,
        user_permission: str = "standard",
        doc_types: Optional[List[str]] = None,
        production_line_id: Optional[str] = None,
        machine_id: Optional[str] = None
    ) -> List[DocumentChunk]:
        """Stage C: Strict RBAC Permission & Metadata filtering before LLM context."""
        query = db.query(DocumentChunk).join(Document)

        # RBAC Filtering
        if user_permission == "standard":
            query = query.filter(Document.permission_required.in_(["standard"]))
        elif user_permission == "restricted":
            query = query.filter(Document.permission_required.in_(["standard", "restricted"]))

        # Document type filtering
        if doc_types:
            query = query.filter(Document.doc_type.in_(doc_types))

        # Line/Machine filtering
        if production_line_id:
            query = query.filter((Document.production_line_id == production_line_id) | (Document.production_line_id.is_(None)))
        if machine_id:
            query = query.filter((Document.machine_id == machine_id) | (Document.machine_id.is_(None)))

        return query.all()

    def reciprocal_rank_fusion(
        self,
        dense_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
        k: int = 60
    ) -> List[Dict[str, Any]]:
        """Combines dense vector and BM25 search rankings using RRF."""
        scores = {}
        chunks_map = {}

        for rank, item in enumerate(dense_results, 1):
            c_id = item["chunk"].id
            chunks_map[c_id] = item
            scores[c_id] = scores.get(c_id, 0.0) + (1.0 / (k + rank))

        for rank, item in enumerate(bm25_results, 1):
            c_id = item["chunk"].id
            if c_id not in chunks_map:
                chunks_map[c_id] = item
            scores[c_id] = scores.get(c_id, 0.0) + (1.0 / (k + rank))

        fused = []
        for c_id, rrf_score in scores.items():
            item = chunks_map[c_id]
            item["rrf_score"] = rrf_score
            fused.append(item)

        fused.sort(key=lambda x: x["rrf_score"], reverse=True)
        return fused

    def retrieve(
        self,
        db: Session,
        query: str,
        user_permission: str = "standard",
        doc_types: Optional[List[str]] = None,
        production_line_id: Optional[str] = None,
        machine_id: Optional[str] = None,
        top_k_retrieve: int = 10,
        top_k_rerank: int = 5
    ) -> List[Dict[str, Any]]:
        # 1. Query Rewrite
        expanded_query = self.rewrite_query(query, machine_id, production_line_id)

        # 2. Get Authorized Candidate Chunks
        eligible_chunks = self.filter_by_permissions_and_metadata(
            db=db,
            user_permission=user_permission,
            doc_types=doc_types,
            production_line_id=production_line_id,
            machine_id=machine_id
        )

        if not eligible_chunks:
            return []

        # 3. Dense Vector Search
        dense_results = vector_engine.search(expanded_query, eligible_chunks, top_k=top_k_retrieve)

        # 4. Lexical BM25 Keyword Search
        bm25_results = self.bm25.search(expanded_query, eligible_chunks, top_k=top_k_retrieve)

        # 5. Reciprocal Rank Fusion
        fused = self.reciprocal_rank_fusion(dense_results, bm25_results)

        # 6. Reranking & Contradiction Detection
        reranked = reranker.rerank(query=expanded_query, candidate_items=fused, top_k=top_k_rerank)

        # Attach document entity details
        for item in reranked:
            item["document"] = db.query(Document).filter(Document.id == item["chunk"].document_id).first()

        return reranked

hybrid_retriever = HybridRetrievalEngine()
