import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import (
    EMAIL,
    HASHED_PASSWORD,
    RECIPE_INGREDIENTS,
    RECIPE_NAME,
    RECIPE_STEPS,
    USERNAME,
    USER_ID,
    WEEK_1_ID,
    WEEK_1_NAME,
)
from week_eat_planner.api.schemas import UserRead, WeekRead
from week_eat_planner.db.models import Recipe, User
from week_eat_planner.db.models.week import Week
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
    return User(id=USER_ID, email=EMAIL, username=USERNAME, is_active=True, hashed_password=HASHED_PASSWORD)


@pytest.fixture
def db_private_recipe(db_user: User) -> Recipe:
    return Recipe(
        id=generate_uuid7(),
        name=RECIPE_NAME,
        user_id=db_user.id,
        user=db_user,
        is_public=False,
        steps=[step.model_dump() for step in RECIPE_STEPS],
        ingredients=[recipe.model_dump() for recipe in RECIPE_INGREDIENTS],
    )


@pytest.fixture
def db_public_recipe(db_user: User) -> Recipe:
    return Recipe(
        id=generate_uuid7(),
        name=RECIPE_NAME,
        user_id=db_user.id,
        user=db_user,
        is_public=True,
        steps=[step.model_dump() for step in RECIPE_STEPS],
        ingredients=[recipe.model_dump() for recipe in RECIPE_INGREDIENTS],
    )


@pytest.fixture
def db_week(db_user: User) -> Week:
    return Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=db_user.id, meal_slots=[], user=db_user)


@pytest.fixture
def user_read(db_user: User) -> UserRead:
    return UserRead.model_validate(db_user)


@pytest.fixture
def user_read_2() -> UserRead:
    return UserRead(id=generate_uuid7(), email='user2@tests.com', is_active=True, username='user2', avatar_url=None)


@pytest.fixture
def week_out(db_week: Week) -> WeekRead:
    return WeekRead.model_validate(db_week)
