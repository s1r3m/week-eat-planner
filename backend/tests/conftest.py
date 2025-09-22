import uuid
from typing import AsyncGenerator, Generator, TypeVar, Coroutine, Callable

import asyncio

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from watchfiles import awatch

from week_eat_planner.api.schemas import UserOut, WeekPreviewOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.models import Week, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.helpers import create_access_token, get_password_hash
from week_eat_planner.main import app

EMAIL = 'ya@ya.eu'
PASSWORD = 'password_123'
USER_ID = uuid.uuid4()

WEEK_1_ID = uuid.uuid4()
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
def meal_slot_dao(mocked_session: AsyncSession) -> MealSlotDAO:
    return MealSlotDAO(mocked_session)


@pytest.fixture
def db_week() -> Week:
    return Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=USER_ID)


@pytest.fixture
def user() -> UserOut:
    return UserOut(id=USER_ID, email=EMAIL, is_active=True)


@pytest.fixture
def encoded_token() -> str:
    return create_access_token(EMAIL)


@pytest.fixture
def user_factory() -> Callable:
    async def _factory(email: str, password: str) -> UserOut:
        async for session in db.get_db_commit():
            hashed_password = get_password_hash(password)
            user = await UserDAO(session).create_user(email, hashed_password)
            user_out = UserOut.model_validate(user)
        return user_out

    return _factory


@pytest.fixture
def auth_client_factory(client: AsyncClient) -> Callable:
    async def _factory(_user: UserOut, password: str) -> AsyncClient:
        client.headers['Authorization'] = ''
        token_data = {'username': _user.email, 'password': password}
        response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)
        body = response.json()
        token = body['access_token']
        client.headers['Authorization'] = f'Bearer {token}'
        return client

    return _factory

