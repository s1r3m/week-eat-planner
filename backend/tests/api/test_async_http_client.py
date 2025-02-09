from typing import AsyncGenerator

import asyncio
import httpx
import pytest
import pytest_asyncio

from week_eat_planner.db.async_client import HttpClientManager


@pytest.fixture(scope='module', autouse=True)
def loop():
    loop = asyncio.new_event_loop()

    yield loop

    loop.close()


@pytest_asyncio.fixture
async def manager() -> AsyncGenerator[HttpClientManager, None]:
    manager = HttpClientManager()

    yield manager

    await manager.close_client()


async def test_manager__client_property__client_created(manager):
    client = manager.client

    assert isinstance(client, httpx.AsyncClient)
    assert manager._client is not None  # pylint: disable=protected-access


async def test_manager__second_client_call__same_client(manager):
    client = manager.client
    same_client = manager.client
    assert client is same_client


async def test_manager__close_client__client_removed(manager):
    client = manager.client  # pylint: disable=unused-variable
    await manager.close_client()
    assert manager._client is None  # pylint: disable=protected-access


async def test_manager__client_recreation_after_closing__client_created(manager):
    client = manager.client
    await manager.close_client()

    new_client = manager.client

    assert isinstance(new_client, httpx.AsyncClient)
    assert manager._client is not None  # pylint: disable=protected-access
    assert new_client is not client
