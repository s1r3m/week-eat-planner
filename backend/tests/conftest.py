import asyncio
from typing import AsyncGenerator, Callable, Generator, TypeVar
from uuid import UUID

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload
from uuid_utils import uuid7

from week_eat_planner.api.schemas import UserOut, WeekOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.models import MealSlot, RefreshToken, User, Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.helpers import create_access_token, get_password_hash
from week_eat_planner.main import app

EMAIL = 'ya@ya.eu'
PASSWORD = 'password_123'
USER_ID = UUID(str(uuid7()))

WEEK_1_ID = UUID(str(uuid7()))
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


@pytest_asyncio.fixture
async def created_user(user_factory: Callable) -> UserOut:
    return await user_factory(EMAIL, PASSWORD)


@pytest_asyncio.fixture
async def created_week(created_user: UserOut) -> WeekOut:
    async for session in db.get_db_commit():
        user = await UserDAO(session).get_user_by_email(created_user.email)
        if not user:
            raise ValueError('User not found!')
        week = await WeekDAO(session).create_week(user, WEEK_1_NAME)
        await MealSlotDAO(session).init_meal_slots_for_week(week)
        stmt = select(Week).where(Week.id == week.id).options(selectinload(Week.meal_slots))
        result = await session.execute(stmt)
        loaded_week = result.scalar_one()
        week_out = WeekOut.model_validate(loaded_week)
    return week_out


@pytest_asyncio.fixture
async def auth_client_for_created_user(auth_client_factory: Callable, created_user: UserOut) -> AsyncClient:
    return await auth_client_factory(created_user, PASSWORD)


@pytest_asyncio.fixture(autouse=True)
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(MealSlot))
        await session.execute(delete(Week))
        await session.execute(delete(RefreshToken))
        await session.execute(delete(User))
