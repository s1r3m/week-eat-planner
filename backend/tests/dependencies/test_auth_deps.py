from unittest.mock import AsyncMock

import pytest
from fastapi import Request

from week_eat_planner.api.dependencies.auth_deps import (
    get_current_active_user,
    get_current_auth_session,
    get_optional_user,
)
from week_eat_planner.constants import SESSION_COOIKE_NAME
from week_eat_planner.exceptions import NoSessionTokenException, SessionExpiredException, UserNotFoundException


@pytest.fixture
def request_with_session_token(session_token) -> Request:
    return Request(
        {
            'type': 'http',
            'headers': [(b'cookie', f'{SESSION_COOIKE_NAME}={session_token}'.encode())],
        }
    )


@pytest.fixture
def mocked_session_service(mocker) -> AsyncMock:
    session_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.auth_deps.SessionService', return_value=session_service_mock)
    return session_service_mock


@pytest.fixture
def request_wo_session_token() -> Request:
    return Request({'type': 'http', 'headers': []})


async def test_get_current_auth_session__active_session__session_returned(
    request_with_session_token, mocked_session, mocked_session_service, auth_session
):
    mocked_session_service.get_sesion_by_token.return_value = auth_session
    result = await get_current_auth_session(request_with_session_token, mocked_session)
    assert result == auth_session


async def test_get_current_auth_session__no_session__none_returned(request_wo_session_token, mocked_session):
    result = await get_current_auth_session(request_wo_session_token, mocked_session)
    assert result is None


async def test_get_current_auth_session__old_session__none_returned(
    request_with_session_token, mocked_session_service, mocked_session
):
    mocked_session_service.get_sesion_by_token.side_effect = [SessionExpiredException]
    result = await get_current_auth_session(request_with_session_token, mocked_session)
    assert result is None


async def test_get_optional_user__active_session__user_returned(
    request_with_session_token, mocked_session, mocked_session_service, auth_session, db_user
):
    mocked_session_service.get_sesion_by_token.return_value = auth_session
    auth_session = await get_current_auth_session(request_with_session_token, mocked_session)

    result = await get_optional_user(auth_session)

    assert result is db_user


async def test_get_optional_user__no_session__none_returned(request_wo_session_token, mocked_session):
    auth_session = await get_current_auth_session(request_wo_session_token, mocked_session)
    result = await get_optional_user(auth_session)
    assert result is None


async def test_get_current_active_user__old_session__none_returned(
    request_with_session_token, mocked_session_service, mocked_session
):
    mocked_session_service.get_sesion_by_token.side_effect = [SessionExpiredException]
    auth_session = await get_current_auth_session(request_with_session_token, mocked_session)

    result = await get_optional_user(auth_session)

    assert result is None


async def test_get_current_active_user__active_session__user_returned(
    request_with_session_token, mocked_session, mocked_session_service, auth_session, db_user
):
    mocked_session_service.get_sesion_by_token.return_value = auth_session
    auth_session = await get_current_auth_session(request_with_session_token, mocked_session)
    user = await get_optional_user(auth_session)

    result = await get_current_active_user(user)

    assert result == db_user


async def test_get_current_active_user__no_session__error_raised(request_wo_session_token, mocked_session):
    auth_session = await get_current_auth_session(request_wo_session_token, mocked_session)
    user = await get_optional_user(auth_session)

    with pytest.raises(NoSessionTokenException) as exc:
        await get_current_active_user(user)

    assert 'No session token in request' in str(exc.value)


async def test_get_current_active_user__old_session__error_raised(
    request_with_session_token, mocked_session_service, mocked_session
):
    mocked_session_service.get_sesion_by_token.side_effect = [SessionExpiredException]
    auth_session = await get_current_auth_session(request_with_session_token, mocked_session)
    user = await get_optional_user(auth_session)

    with pytest.raises(NoSessionTokenException) as exc:
        await get_current_active_user(user)

    assert 'No session token in request' in str(exc.value)


async def test_get_current_active_user__inactive_user__error_raised(
    request_with_session_token, mocked_session, mocked_session_service, auth_session, db_user
):
    auth_session.user.is_active = False
    mocked_session_service.get_sesion_by_token.return_value = auth_session
    auth_session = await get_current_auth_session(request_with_session_token, mocked_session)
    user = await get_optional_user(auth_session)

    with pytest.raises(UserNotFoundException) as exc:
        await get_current_active_user(user)

    assert f'User {db_user.id} was not found!' in str(exc.value)
