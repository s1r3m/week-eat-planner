import pytest
import pytest_asyncio
from pytest_mock import MockerFixture
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.db.models as db_model
from tests.conftest import EMAIL, PASSWORD, USER_ID, WEEK_1_ID, WEEK_1_NAME
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.refresh_token_dao import RefreshTokenDAO
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.helpers import generate_uuid7

REFRESH_TOKEN = '9Q_3Rclneasa6LFcA2TOxFp1hzBnkVIE8jsbCMdyvhGg5FlylOJa-9zuVa4jYXdFvKWChXf2qMx_lsYv54OcKg'
HASHED_REFRESH_TOKEN = '9626ebd9a1951b4e2ebb23c8e14f1a33ea54beb5daf0bb9309d79fe86c4677a3'


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
def mocked_refresh_token_dao(mocked_session: AsyncSession) -> RefreshTokenDAO:
    return RefreshTokenDAO(mocked_session)


@pytest.fixture
def db_week(created_user: db_model.User) -> db_model.Week:
    return db_model.Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=created_user.id)


@pytest.fixture
def db_user() -> db_model.User:
    return db_model.User(id=USER_ID, email=EMAIL, hashed_password=PASSWORD, is_active=True)


@pytest.fixture
def db_refresh_token(db_user: db_model.User) -> db_model.RefreshToken:
    token_id = generate_uuid7()
    return db_model.RefreshToken(id=token_id, user_id=db_user.id, token_hash=HASHED_REFRESH_TOKEN, revoked=False)
