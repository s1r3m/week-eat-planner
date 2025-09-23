import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import WEEK_1_ID, WEEK_1_NAME, USER_ID, EMAIL, PASSWORD
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.models import Week, User
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO


@pytest_asyncio.fixture
async def mocked_session(mocker: MockerFixture) -> AsyncSession:
    mock_session = mocker.AsyncMock(spec=AsyncSession)
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    return mock_session


@pytest.fixture
def mocked_user_dao(mocked_session: AsyncSession) -> UserDAO:
    return UserDAO(mocked_session)


@pytest.fixture
def mocked_week_dao(mocked_session: AsyncSession) -> WeekDAO:
    return WeekDAO(mocked_session)


@pytest.fixture
def mocked_mealslot_dao(mocked_session: AsyncSession) -> MealSlotDAO:
    return MealSlotDAO(mocked_session)


@pytest.fixture
def db_week(created_user: User) -> Week:
    return Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=created_user.id)


@pytest.fixture
def db_user() -> User:
    return User(id=USER_ID, email=EMAIL, hashed_password=PASSWORD, is_active=True)
