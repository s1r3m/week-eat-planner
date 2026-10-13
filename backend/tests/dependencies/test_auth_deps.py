from unittest.mock import AsyncMock

import pytest
from fastapi import Request

from week_eat_planner.api.dependencies.auth_deps import get_active_user_id, get_optional_user_id
from week_eat_planner.constants import ACCESS_TOKEN_COOKIE_NAME


@pytest.fixture
def mocked_user_service(mocker) -> AsyncMock:
    user_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.auth_deps.UserService', return_value=user_service_mock)
    return user_service_mock


@pytest.fixture
def request_with_access_token(encoded_token) -> Request:
    return Request(
        {
            'type': 'http',
            'headers': [(b'cookie', f'{ACCESS_TOKEN_COOKIE_NAME}={encoded_token}'.encode())],
        }
    )


@pytest.fixture
def request_wo_access_token() -> Request:
    return Request({'type': 'http', 'headers': []})


async def test_get_active_current_user__active_user__user_returned(request_with_access_token, user_read):
    user_id = await get_active_user_id(request_with_access_token)
    assert user_id == user_read.id


async def test_get_optional_user__active_user__user_returned(request_with_access_token, user_read):
    user_id = await get_optional_user_id(request_with_access_token)
    assert user_id == user_read.id


async def test_get_optional_user__no_token__none_returned(request_wo_access_token):
    user_id = await get_optional_user_id(request_wo_access_token)
    assert user_id is None
