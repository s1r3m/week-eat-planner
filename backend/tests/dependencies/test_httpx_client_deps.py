from collections.abc import AsyncGenerator

import httpx
import pytest

from week_eat_planner.api.dependencies.httpx_client_deps import get_httpx_client
from week_eat_planner.clients.async_client import http_client_manager


@pytest.fixture(autouse=True)
async def closed_client() -> AsyncGenerator[None, None]:
    yield

    await http_client_manager.close_client()


async def test_get_httpx_client__always__returns_async_client():
    client = await get_httpx_client()

    assert isinstance(client, httpx.AsyncClient)
