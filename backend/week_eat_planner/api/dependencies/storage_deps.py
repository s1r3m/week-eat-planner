from functools import lru_cache

from week_eat_planner.clients.storage_client import StorageClient


@lru_cache
def get_storage_client() -> StorageClient:
    return StorageClient()
