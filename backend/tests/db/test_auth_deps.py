import pytest
from fastapi import HTTPException

from week_eat_planner.dependencies.auth_deps import get_current_active_user, get_current_user
from week_eat_planner.exceptions import InvalidCredentials


async def test_get_current_user__valid_user__user_in_response(mocked_session, encoded_token, mocker, created_user):
    get_user_mock = mocker.AsyncMock(return_value=created_user)
    user_service_mock = mocker.AsyncMock(get_user=get_user_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserService', return_value=user_service_mock)

    current_user = await get_current_user(encoded_token, mocked_session)

    assert current_user == created_user
    user_service_mock.get_user.assert_awaited_once_with(encoded_token)


async def test_get_current_user__user_not_found__error_raised(mocker, mocked_session, encoded_token):
    get_user_mock = mocker.AsyncMock(return_value=None)
    user_service_mock = mocker.AsyncMock(get_user=get_user_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserService', return_value=user_service_mock)

    with pytest.raises(HTTPException) as exc:
        await get_current_user(encoded_token, mocked_session)

    assert exc.value.status_code == InvalidCredentials.status_code
    assert exc.value.detail == InvalidCredentials.detail
    user_service_mock.get_user.assert_awaited_once_with(encoded_token)


async def test_get_active_current_user__active_user__user_returned(db_user):
    user = await get_current_active_user(db_user)
    assert user.is_active is True


async def test_get_active_current_user__not_active_user__error_raised(db_user):
    db_user.is_active = False

    with pytest.raises(HTTPException) as exc:
        await get_current_active_user(db_user)

    assert exc.value.status_code == InvalidCredentials.status_code
    assert exc.value.detail == InvalidCredentials.detail
