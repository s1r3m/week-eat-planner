"""HTTP client dependencies for FastAPI endpoints."""

from httpx import AsyncClient

from week_eat_planner.clients.async_client import http_client_manager


async def get_httpx_client() -> AsyncClient:
    """FastAPI dependency that yields the shared async HTTP client.

    Returns:
        The global AsyncClient instance.
    """
    return http_client_manager.client
