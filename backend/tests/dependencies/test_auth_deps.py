from unittest.mock import AsyncMock

import pytest

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user, get_optional_user


@pytest.fixture
def mocked_user_service(mocker) -> AsyncMock:
    user_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.auth_deps.UserService', return_value=user_service_mock)
    return user_service_mock


async def test_get_active_current_user__active_user__user_returned(
    mocked_user_service, mocked_session, encoded_token, user_read
):
    mocked_user_service.get_user_by_token.return_value = user_read

    current_user = await get_current_active_user(encoded_token, mocked_session)

    assert current_user == user_read
    mocked_user_service.get_user_by_token.assert_awaited_once_with(encoded_token)


async def test_get_optional_user__active_user__user_returned(
    mocked_user_service, mocked_session, encoded_token, user_read
):
    mocked_user_service.get_user_by_token.return_value = user_read

    user = await get_optional_user(encoded_token, mocked_session)

    assert user == user_read
    mocked_user_service.get_user_by_token.assert_awaited_once_with(encoded_token)


async def test_get_optional_user__no_token__none_returned(mocked_session):
    user = await get_optional_user(None, mocked_session)
    assert user is None
