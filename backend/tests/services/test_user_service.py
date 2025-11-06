from unittest.mock import AsyncMock

import pytest
from fastapi import status

from week_eat_planner.exceptions import InvalidCredentials
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.user_service import UserService


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.user_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


@pytest.fixture
def other_encoded_token() -> str:
    return TokenProvider.create_access_token('other_email@test.com')


async def test_get_user__user_exists__user_returned(mocked_user_dao, mocked_session, encoded_token, db_user, user_read):
    mocked_user_dao.find_one_or_none.return_value = db_user
    user = await UserService(mocked_session).get_user_by_token(encoded_token)
    assert user == user_read


async def test_get_user__user_not_exist__none_returned(mocked_user_dao, mocked_session, encoded_token):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentials) as exc:
        await UserService(mocked_session).get_user_by_token(encoded_token)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Could not validate credentials'


async def test_get_user__not_active_user__error_raised(mocked_user_dao, mocked_session, encoded_token, user_read):
    user_read.is_active = False
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentials) as exc:
        await UserService(mocked_session).get_user_by_token(encoded_token)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Could not validate credentials'
