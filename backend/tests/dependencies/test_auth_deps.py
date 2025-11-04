from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from tests.constants import EMAIL
from week_eat_planner.api.schemas import Email
from week_eat_planner.dependencies.auth_deps import get_current_active_user, get_current_user
from week_eat_planner.exceptions import InvalidCredentials


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.user_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


async def test_get_current_user__valid_user__user_in_response(mocked_user_dao, mocked_session, encoded_token, user_out):
    mocked_user_dao.find_one_or_none.return_value = user_out

    current_user = await get_current_user(encoded_token, mocked_session)

    assert current_user == user_out
    mocked_user_dao.find_one_or_none.assert_awaited_once_with(Email(email=EMAIL))


async def test_get_current_user__user_not_found__error_raised(mocked_user_dao, mocked_session, encoded_token):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(HTTPException) as exc:
        await get_current_user(encoded_token, mocked_session)

    assert exc.value.status_code == InvalidCredentials.status_code
    assert exc.value.detail == InvalidCredentials.detail
    mocked_user_dao.find_one_or_none.assert_awaited_once_with(Email(email=EMAIL))


async def test_get_active_current_user__active_user__user_returned(user_out):
    user = await get_current_active_user(user_out)
    assert user.is_active is True


async def test_get_active_current_user__not_active_user__error_raised(user_out):
    user_out.is_active = False

    with pytest.raises(HTTPException) as exc:
        await get_current_active_user(user_out)

    assert exc.value.status_code == InvalidCredentials.status_code
    assert exc.value.detail == InvalidCredentials.detail
