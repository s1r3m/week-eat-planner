from unittest.mock import AsyncMock

import pytest

from week_eat_planner.api.dependencies.auth_deps import get_active_user_id, get_optional_user_id


@pytest.fixture
def mocked_user_service(mocker) -> AsyncMock:
    user_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.auth_deps.UserService', return_value=user_service_mock)
    return user_service_mock


async def test_get_active_current_user__active_user__user_returned(mocked_user_service, encoded_token, user_read):
    mocked_user_service.get_user_by_token.return_value = user_read

    user_id = await get_active_user_id(encoded_token)

    assert user_id == user_read.id


async def test_get_optional_user__active_user__user_returned(mocked_user_service, encoded_token, user_read):
    mocked_user_service.get_user_by_token.return_value = user_read

    user_id = await get_optional_user_id(encoded_token)

    assert user_id == user_read.id


async def test_get_optional_user__no_token__none_returned():
    user_id = await get_optional_user_id(None)

    assert user_id is None
