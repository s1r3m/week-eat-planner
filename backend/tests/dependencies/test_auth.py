import pytest

from tests.conftest import EMAIL
from week_eat_planner.exceptions import UserNotFound
from week_eat_planner.api.schemas import UserCreate, UserOut
from week_eat_planner.dependencies.auth_deps import get_current_user, get_current_active_user

TOKEN_DATA = {"sub": EMAIL}
ENCODED_TOKEN = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ5YUB5YS5ldSIsImV4cCI6MTczOTE4MTk3OH0.'
    'DF-fx3RjWeZB0NVoGIjNbWKe6gHpPA0ZW8Yn4DnGJxA'
)


async def test_get_current_user__valid_user__user_in_response(mocked_session, mocker, user):
    get_one_or_none_mock = mocker.AsyncMock(return_value=user)
    user_dao = mocker.MagicMock(get_one_or_none=get_one_or_none_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserDAO', return_value=user_dao)

    current_user = await get_current_user(ENCODED_TOKEN, mocked_session)

    assert current_user == user
    user_dao.get_one_or_none.assert_called_once_with(filter_=UserCreate(email=EMAIL))
