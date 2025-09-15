import uuid
from http import HTTPStatus
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import delete

from tests.conftest import EMAIL, PASSWORD, WEEK_1_NAME
from week_eat_planner.constants import AUTH_LOGIN, AUTH_PREFIX, AUTH_SIGNUP, WEEKS
from week_eat_planner.db.models import MealSlot, User, Week
from week_eat_planner.db.session_maker import db


@pytest_asyncio.fixture(autouse=True)
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(MealSlot))
        await session.execute(delete(Week))
        await session.execute(delete(User))


@pytest.fixture
def login_data() -> dict[str, str]:
    return {'email': EMAIL, 'password': PASSWORD}


@pytest_asyncio.fixture
async def created_user(client: AsyncClient, login_data: dict) -> dict[str, str]:
    response = await client.post(f'{AUTH_PREFIX}{AUTH_SIGNUP}', json=login_data)
    user_data = response.json()
    user_data['password'] = login_data['password']  # ???
    return user_data


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient, created_user: dict) -> AsyncClient:
    token_data = {'username': created_user['email'], 'password': created_user['password']}
    response = await client.post(f'{AUTH_PREFIX}{AUTH_LOGIN}', data=token_data)
    body = response.json()
    token = body['access_token']
    client.headers['Authorization'] = f'Bearer {token}'
    return client


async def test_create_week__with_auth__week_in_response(auth_client, created_user):
    response = await auth_client.post(WEEKS, params={'name': WEEK_1_NAME})

    body = response.json()
    assert response.status_code == HTTPStatus.CREATED
    assert isinstance(uuid.UUID(body.pop('id')), uuid.UUID)
    assert body == {'name': WEEK_1_NAME, 'user_id': created_user['id']}


async def test_get_weeks__empty_db__empty_response(auth_client):
    response = await auth_client.get(WEEKS)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == []


async def test_get_weeks__no_auth__error_in_response(client):
    response = await client.get(WEEKS)

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}
