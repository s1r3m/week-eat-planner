from httpx import AsyncClient

from week_eat_planner.clients.async_client import http_client_manager


async def get_httpx_client() -> AsyncClient:
    return http_client_manager.client
