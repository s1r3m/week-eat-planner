from tests.conftest import EMAIL
from week_eat_planner.dependencies.auth_deps import get_current_user


async def test_get_current_user__valid_user__user_in_response(mocked_session, encoded_token, mocker, user):
    get_user_by_email_mock = mocker.AsyncMock(return_value=user)
    user_dao_mock = mocker.AsyncMock(get_user_by_email=get_user_by_email_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserDAO', return_value=user_dao_mock)

    current_user = await get_current_user(encoded_token, mocked_session)

    assert current_user == user
    user_dao_mock.get_user_by_email.assert_awaited_once_with(EMAIL)
