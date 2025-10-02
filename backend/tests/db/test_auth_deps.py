from http import HTTPStatus

import pytest
from fastapi import HTTPException

from tests.conftest import EMAIL
from week_eat_planner.dependencies.auth_deps import get_current_active_user, get_current_user


async def test_get_current_user__valid_user__user_in_response(mocked_session, encoded_token, mocker, created_user):
    get_user_by_email_mock = mocker.AsyncMock(return_value=created_user)
    user_dao_mock = mocker.AsyncMock(get_user_by_email=get_user_by_email_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserDAO', return_value=user_dao_mock)

    current_user = await get_current_user(encoded_token, mocked_session)

    assert current_user == created_user
    user_dao_mock.get_user_by_email.assert_awaited_once_with(EMAIL)


async def test_get_current_user__user_not_found__error_raised(mocker, mocked_session, encoded_token):
    get_user_by_email_mock = mocker.AsyncMock(return_value=None)
    user_dao_mock = mocker.AsyncMock(get_user_by_email=get_user_by_email_mock)
    mocker.patch('week_eat_planner.dependencies.auth_deps.UserDAO', return_value=user_dao_mock)

    with pytest.raises(HTTPException) as exc:
        await get_current_user(encoded_token, mocked_session)

    assert exc.value.status_code == HTTPStatus.CONFLICT
    assert exc.value.detail == 'Incorrect email or password'
    user_dao_mock.get_user_by_email.assert_awaited_once_with(EMAIL)


async def test_get_active_current_user__active_user__user_returned(db_user):
    user = await get_current_active_user(db_user)
    assert user.is_active is True


async def test_get_active_current_user__not_active_user__error_raised(db_user):
    db_user.is_active = False

    with pytest.raises(HTTPException) as exc:
        await get_current_active_user(db_user)

    assert exc.value.status_code == 409
    assert exc.value.detail == 'Incorrect email or password'
