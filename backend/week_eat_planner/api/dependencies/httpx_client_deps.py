"""HTTP client dependencies for FastAPI endpoints."""

from httpx import AsyncClient

from week_eat_planner.clients.async_client import http_client_manager


async def get_httpx_client() -> AsyncClient:
    """Return the shared async HTTP client, creating it on first access.

    Returns:
        The application's shared AsyncClient instance.
    """
    return http_client_manager.client
