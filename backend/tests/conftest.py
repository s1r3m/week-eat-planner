import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import EMAIL, HASHED_PASSWORD, USER_ID
from week_eat_planner.api.schemas import UserOut
from week_eat_planner.db.models import MealSlot, RefreshToken, User, Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.security.token_provider import TokenProvider


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
def db_user() -> User:
    return User(id=USER_ID, email=EMAIL, is_active=True, hashed_password=HASHED_PASSWORD)


@pytest.fixture
def user_out(db_user: User) -> UserOut:
    return UserOut(id=db_user.id, email=db_user.email, is_active=db_user.is_active)


@pytest_asyncio.fixture()
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(MealSlot))
        await session.execute(delete(Week))
        await session.execute(delete(RefreshToken))
        await session.execute(delete(User))
