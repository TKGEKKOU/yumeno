"""Managed local reranker resources and inference adapter."""

from ingestion.local_reranker.client import ManagedLocalReranker, get_managed_reranker
from ingestion.local_reranker.resources import LocalRerankerResourceManager

__all__ = ["LocalRerankerResourceManager", "ManagedLocalReranker", "get_managed_reranker"]
