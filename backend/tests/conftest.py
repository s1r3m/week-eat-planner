import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import EMAIL, HASHED_PASSWORD, USER_ID
from week_eat_planner.api.schemas import UserOut
from week_eat_planner.db.models import User
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.security.token_provider import TokenProvider


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


@pytest.fixture
def user_out_2() -> UserOut:
    return UserOut(id=generate_uuid7(), email='user2@tests.com', is_active=True)
