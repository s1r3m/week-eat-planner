import asyncio
from typing import AsyncGenerator, Callable, Generator

import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import EMAIL, PASSWORD
from week_eat_planner.api.schemas import UserCreate, UserOut
from week_eat_planner.db.models import MealSlot, RefreshToken, User, Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.auth_service import AuthService


@pytest.fixture(scope='module', autouse=True)
def loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def mocked_session(mocker: MockerFixture) -> AsyncSession:
    mock_session = mocker.AsyncMock(spec=AsyncSession)
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    return mock_session


@pytest.fixture
def encoded_token() -> str:
    return TokenProvider.create_access_token(EMAIL)


@pytest.fixture
def user_factory() -> Callable:
    async def _factory(user_data: UserCreate) -> UserOut:
        async for session in db.get_db_commit():
            user = await AuthService(session).register_user(user_data)
        return user

    return _factory


@pytest_asyncio.fixture
async def created_user(user_factory: Callable) -> UserOut:
    return await user_factory(UserCreate(email=EMAIL, password=PASSWORD))


@pytest_asyncio.fixture()
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(MealSlot))
        await session.execute(delete(Week))
        await session.execute(delete(RefreshToken))
        await session.execute(delete(User))
