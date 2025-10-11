from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from fastapi import HTTPException, status

from week_eat_planner.api.schemas import RefreshTokenFromDB, TokenUpdate, UserOut
from week_eat_planner.config import settings
from week_eat_planner.constants import AppUrl, REFRESH_TOKEN_COOKIE_NAME, TokenType
from week_eat_planner.db.dao import RefreshTokenDAO
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import (
    InvalidCredentials,
    InvalidEmail,
    InvalidRefreshToken,
    RefreshTokenMissing,
    TokenExpired,
    UserAlreadyExists,
)


@pytest.fixture
def login_data() -> dict[str, str]:
    """Generates a unique email and a standard password for test isolation."""
    email = 'test_user_123@example.com'
    password = 'a-secure-password-123'
    return {'email': email, 'password': password}


@pytest_asyncio.fixture
async def user(client, login_data) -> dict[str, str]:
    """A created user in the system."""
    await client.post(AppUrl.AUTH_SIGNUP, json=login_data)
    return login_data


@pytest_asyncio.fixture
async def expired_refresh_token_user(created_user) -> UserOut:
    async for session in db.get_db_commit():
        token = RefreshTokenFromDB(user_id=created_user.id)
        new_expires_at = datetime.now(timezone.utc) - timedelta(days=settings.REFRESH_TOKEN_TTL + 1)
        await RefreshTokenDAO(session).update(token, TokenUpdate(expires_at=new_expires_at))

    return created_user


@pytest_asyncio.fixture
async def revoked_refresh_token_user(created_user) -> UserOut:
    async for session in db.get_db_commit():
        token = RefreshTokenFromDB(user_id=created_user.id)
        await RefreshTokenDAO(session).update(token, TokenUpdate(revoked=True))

    return created_user


async def test_add_user__valid_data__user_created(client, login_data):
    response = await client.post(AppUrl.AUTH_SIGNUP, json=login_data)

    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    assert body.pop('id')
    assert body == {'email': login_data['email'], 'is_active': True}


async def test_add_user__duplicate_email__conflict_error(client, user):
    response = await client.post(AppUrl.AUTH_SIGNUP, json=user)

    assert response.status_code == UserAlreadyExists.status_code
    assert response.json() == {'detail': UserAlreadyExists.detail}


async def test_add_user__invalid_email_format__unprocessable_entity_error(client):
    invalid_login_data = {'email': 'not-a-valid-email', 'password': 'password'}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=invalid_login_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_login__valid_credentials__token_returned(client, user):
    token_data = {'username': user['email'], 'password': user['password']}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert 'access_token' in body
    assert body['token_type'] == TokenType.BEARER


async def test_login__invalid_email_format__conflict_error(client):
    token_data = {'username': 'not-a-valid-email', 'password': 'password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == InvalidEmail.status_code
    assert response.json() == {'detail': InvalidEmail.detail}


async def test_login__invalid_password__not_found_error(client, user):
    token_data = {'username': user['email'], 'password': 'wrong-password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == InvalidCredentials.status_code
    assert response.json() == {'detail': InvalidCredentials.detail}


async def test_login__nonexistent_user__not_found_error(client, login_data):
    token_data = {'username': login_data['email'], 'password': login_data['password']}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == InvalidCredentials.status_code
    assert response.json() == {'detail': InvalidCredentials.detail}


async def test_refresh_token__valid_user__new_token_returned(auth_client_for_created_user):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body.pop('access_token')
    assert body == {'token_type': 'bearer'}


async def test_refresh_token__no_cookies_in_request__error_raised(auth_client_for_created_user):
    auth_client_for_created_user.cookies = []

    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == RefreshTokenMissing.status_code
    assert response.json() == {'detail': RefreshTokenMissing.detail}


async def test_refresh_token__expired_refresh_token__error_raised(
    auth_client_for_created_user, expired_refresh_token_user
):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == TokenExpired.status_code
    assert response.json() == {'detail': TokenExpired.detail}


async def test_refresh_token__revoked_refresh_token__error_raised(
    auth_client_for_created_user, revoked_refresh_token_user
):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == InvalidRefreshToken.status_code
    assert response.json() == {'detail': InvalidRefreshToken.detail}


async def test_logout__valid_user__no_cookie_in_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    assert REFRESH_TOKEN_COOKIE_NAME not in response.cookies


async def test_logout__no_cookie_in_request__no_error_raised(auth_client_for_created_user):
    auth_client_for_created_user.cookies = []

    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    assert REFRESH_TOKEN_COOKIE_NAME not in response.cookies


async def test_logout__revoked_refresh_token__no_error_raised(auth_client_for_created_user, revoked_refresh_token_user):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    assert REFRESH_TOKEN_COOKIE_NAME not in response.cookies


async def test_logout__unexpected_http_exception__error_raised(mocker, auth_client_for_created_user):
    unexpected_error = HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail='An unexpected error occurred.',
    )
    mocker.patch(
        'week_eat_planner.api.auth.AuthService.logout',
        side_effect=unexpected_error,
    )

    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == unexpected_error.status_code
    assert response.json() == {'detail': unexpected_error.detail}
