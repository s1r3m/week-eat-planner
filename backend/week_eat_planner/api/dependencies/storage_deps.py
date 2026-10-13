"""Storage dependencies for FastAPI endpoints."""

from functools import lru_cache

from week_eat_planner.clients.storage_client import StorageClient


@lru_cache
def get_storage_client() -> StorageClient:
    """Dependency that provides a singleton instance of the StorageClient.

    Returns:
        A cached instance of the StorageClient.
    """
    return StorageClient()
