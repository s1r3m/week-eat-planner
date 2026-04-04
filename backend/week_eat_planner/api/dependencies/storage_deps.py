from functools import lru_cache

from week_eat_planner.clients.storage_client import StorageClient


@lru_cache
def get_storage_client() -> StorageClient:
    """
    Provide a singleton-like StorageClient instance cached across calls.
    
    Returns:
        StorageClient: The cached StorageClient instance.
    """
    return StorageClient()
