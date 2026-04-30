import httpx

from week_eat_planner.api.dependencies.httpx_client_deps import get_httpx_client


async def test_get_httpx_client__always__returns_async_client():
    client = await get_httpx_client()

    assert isinstance(client, httpx.AsyncClient)
