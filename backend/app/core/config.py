import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionGuard Knowledge Copilot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Storage & DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./visionguard.db")
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "./storage")
    
    # Vector DB & Embeddings
    QDRANT_URL: Optional[str] = os.getenv("QDRANT_URL", None)
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY", None)
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "ms-marco-MiniLM-L-6-v2")
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq") # "groq", "openai", "gemini", "anthropic", "offline"
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-visionguard-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    # Retrieval Thresholds & Defaults
    DEFAULT_TOP_K_RETRIEVAL: int = 10
    DEFAULT_TOP_K_RERANK: int = 5
    SIMILARITY_THRESHOLD: float = 0.35

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
