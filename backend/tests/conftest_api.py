import asyncio
from typing import AsyncGenerator, Callable, Generator, TypeVar

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.main import app
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.auth_service import AuthService
from week_eat_planner.services.week_service import WeekService

EMAIL = 'ya@ya.eu'
PASSWORD = 'password_123'
USER_ID = generate_uuid7()

WEEK_1_ID = generate_uuid7()
WEEK_1_NAME = 'first'

T = TypeVar('T')
AsyncYieldFixture = AsyncGenerator[T, None]
YieldFixture = Generator[T, None, None]


@pytest.fixture(scope='module', autouse=True)
def loop() -> YieldFixture[asyncio.AbstractEventLoop]:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def client() -> AsyncYieldFixture[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as ac:
        yield ac


@pytest.fixture
def encoded_token() -> str:
    return TokenProvider.create_access_token(EMAIL)


@pytest.fixture
def user_factory() -> Callable:
    async def _factory(email: str, password: str) -> schema.UserOut:
        async for session in db.get_db_commit():
            user = await AuthService(session).register_user(email, password)
            user_out = schema.UserOut.model_validate(user)
        return user_out

    return _factory


@pytest.fixture
def auth_client_factory(client: AsyncClient) -> Callable:
    async def _factory(user: schema.UserOut, password: str) -> AsyncClient:
        client.headers['Authorization'] = ''
        token_data = {'username': user.email, 'password': password}
        response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)
        body = response.json()
        token = body['access_token']
        client.headers['Authorization'] = f'Bearer {token}'
        return client

    return _factory


@pytest_asyncio.fixture
async def logout_client_for_created_user(auth_client_factory: Callable, created_user: schema.UserOut) -> AsyncClient:
    auth_client = await auth_client_factory(created_user, PASSWORD)
    await auth_client.post(AppUrl.AUTH_LOGOUT)  # Remove cookies
    auth_client.headers['Authorization'] = ''
    return auth_client


@pytest_asyncio.fixture
async def created_user(user_factory: Callable) -> schema.UserOut:
    return await user_factory(EMAIL, PASSWORD)


@pytest_asyncio.fixture
async def created_week(created_user: schema.UserOut) -> schema.WeekOut:
    async for session in db.get_db_commit():
        user = await UserDAO(session).get_user_by_email(created_user.email)
        assert user, 'User was not found!'
        # Create the week and its slots
        created_week_obj = await WeekService(session).create_week_with_slots(user, WEEK_1_NAME)
        # Re-fetch the week from the DB to ensure all relationships are loaded
        week = await WeekDAO(session).get_week(created_week_obj.id, for_update=False)
        week_out = schema.WeekOut.model_validate(week)
    return week_out


@pytest_asyncio.fixture
async def auth_client_for_created_user(auth_client_factory: Callable, created_user: schema.UserOut) -> AsyncClient:
    return await auth_client_factory(created_user, PASSWORD)


@pytest_asyncio.fixture(autouse=True)
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(db_model.MealSlot))
        await session.execute(delete(db_model.Week))
        await session.execute(delete(db_model.RefreshToken))
        await session.execute(delete(db_model.User))
