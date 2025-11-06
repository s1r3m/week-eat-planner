import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import (
    EMAIL,
    HASHED_PASSWORD,
    RECIPE_INGREDIENTS,
    RECIPE_IS_PUBLIC,
    RECIPE_NAME,
    USER_ID,
    WEEK_1_ID,
    WEEK_1_NAME,
)
from week_eat_planner.api.schemas import UserRead, WeekRead
from week_eat_planner.db.models import Recipe, User
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
def db_recipe(user_read: UserRead) -> Recipe:
    return Recipe(
        id=generate_uuid7(),
        name=RECIPE_NAME,
        user_id=user_read.id,
        is_public=RECIPE_IS_PUBLIC,
        ingredients=RECIPE_INGREDIENTS,
    )


@pytest.fixture
def user_read(db_user: User) -> UserRead:
    return UserRead.model_validate(db_user)


@pytest.fixture
def user_read_2() -> UserRead:
    return UserRead(id=generate_uuid7(), email='user2@tests.com', is_active=True)


@pytest.fixture
def week_out(user_read: UserRead) -> WeekRead:
    return WeekRead(id=WEEK_1_ID, user_id=user_read.id, name=WEEK_1_NAME, meal_slots=[])
