from typing import Generator

import asyncio
import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import UserDAO
from week_eat_planner.api.schemas import UserOut


EMAIL = 'ya@ya.eu'
PASSWORD = 'hashed_password'
USER_ID = 100500


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
def user_dao(mocked_session: AsyncSession) -> UserDAO:
    return UserDAO(mocked_session)


@pytest.fixture
def user() -> UserOut:
    return UserOut(id=USER_ID, email=EMAIL, is_active=True)
