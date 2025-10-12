import pytest

from tests.constants import EMAIL, USER_ID
from week_eat_planner.api.schemas import UserOut


@pytest.fixture
def user_out() -> UserOut:
    return UserOut(id=USER_ID, email=EMAIL, is_active=True)
