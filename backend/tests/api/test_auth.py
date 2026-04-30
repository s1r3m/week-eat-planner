from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from fastapi import HTTPException, status
from freezegun import freeze_time
from sqlalchemy.ext.asyncio import AsyncSession

from tests.constants import EMAIL, PASSWORD, USERNAME
from week_eat_planner.api.schemas import RefreshTokenFromDB, TokenUpdate, UserRead
from week_eat_planner.api.schemas.user import OAuthUserData
from week_eat_planner.config import settings
from week_eat_planner.constants import AppUrl, OAuthProvider, REFRESH_TOKEN_COOKIE_NAME, TokenType
from week_eat_planner.db.dao import RefreshTokenDAO
from week_eat_planner.exceptions import (
    InvalidCredentialsException,
    InvalidEmailException,
    LoginWithAuthException,
    OAuthAccountException,
    RefreshTokenMissingException,
    RefreshTokenRevokedException,
    SignUpWithAuthException,
    TokenExpiredException,
    UserAlreadyExistsException,
)


@pytest_asyncio.fixture
async def expired_refresh_token_user(db_session: AsyncSession, created_user: UserRead) -> UserRead:
    db_token = await RefreshTokenDAO(db_session).find_one_or_none(RefreshTokenFromDB(user_id=created_user.id))
    new_expires_at = datetime.now(UTC) - timedelta(days=settings.REFRESH_TOKEN_TTL + 1)
    token = RefreshTokenFromDB.model_validate(db_token)
    await RefreshTokenDAO(db_session).update(token, TokenUpdate(expires_at=new_expires_at))
    await db_session.flush()
    return created_user


@pytest_asyncio.fixture
async def revoked_refresh_token_user(db_session: AsyncSession, created_user: UserRead) -> UserRead:
    db_token = await RefreshTokenDAO(db_session).find_one_or_none(RefreshTokenFromDB(user_id=created_user.id))
    token = RefreshTokenFromDB.model_validate(db_token)
    await RefreshTokenDAO(db_session).update(token, TokenUpdate(revoked=True))
    await db_session.flush()
    return created_user


async def test_create_user__valid_data__user_created_and_logged_in(client):
    signup_data = {'email': EMAIL, 'password': PASSWORD, 'username': USERNAME}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=signup_data)

    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    assert 'access_token' in body
    assert body['access_token']
    assert body['token_type'] == TokenType.BEARER


@pytest.mark.parametrize(
    'username',
    [
        pytest.param(None, id='not_present'),
        pytest.param('', id='empty_string'),
    ],
)
async def test_create_user__bad_username__unprocessable_entity_error(client, username):
    signup_data = {'email': EMAIL, 'password': PASSWORD, 'username': username}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=signup_data)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_create_user__duplicate_email__conflict_error(client, created_user):
    login_data = {'email': created_user.email, 'password': PASSWORD, 'username': USERNAME}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=login_data)

    error = UserAlreadyExistsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_create_user__invalid_email_format__unprocessable_entity_error(client):
    invalid_login_data = {'email': 'not-a-valid-email', 'password': 'password'}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=invalid_login_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_create_user__with_authorization_header__error_raised(
    auth_client_for_created_user,
):
    login_data = {'email': EMAIL, 'password': PASSWORD, 'username': USERNAME}

    response = await auth_client_for_created_user.post(AppUrl.AUTH_SIGNUP, json=login_data)

    error = SignUpWithAuthException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_login__valid_credentials__token_returned(client, created_user):
    token_data = {'username': created_user.email, 'password': PASSWORD}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert 'access_token' in body
    assert body['access_token']
    assert body['token_type'] == TokenType.BEARER


async def test_login__invalid_email_format__conflict_error(client):
    bad_email = 'not-a-valid-email'
    token_data = {'username': bad_email, 'password': 'password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    error = InvalidEmailException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_login__invalid_password__not_found_error(client, created_user):
    token_data = {'username': created_user.email, 'password': 'wrong-password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    error = InvalidCredentialsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_login__nonexistent_user__not_found_error(client):
    token_data = {'username': 'email@not.exist', 'password': PASSWORD}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    error = InvalidCredentialsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_login__with_authorization_header__error_raised(auth_client_for_created_user, created_user):
    token_data = {'username': created_user.email, 'password': PASSWORD}

    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGIN, data=token_data)

    error = LoginWithAuthException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_refresh_token__valid_user__new_token_returned(auth_client_for_created_user):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body.pop('access_token')
    assert body == {'token_type': 'bearer'}


async def test_refresh_token__no_cookies_in_request__error_raised(auth_client_for_created_user):
    auth_client_for_created_user.cookies = []

    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    error = RefreshTokenMissingException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_refresh_token__refresh_token_far_from_expire__same_token_in_cookies(auth_client_for_created_user):
    old_token = auth_client_for_created_user.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == status.HTTP_200_OK
    assert old_token == response.cookies.get(REFRESH_TOKEN_COOKIE_NAME)


async def test_refresh_token__refresh_token_about_to_expire__new_token_in_cookies(auth_client_for_created_user):
    old_token = auth_client_for_created_user.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    time_in_future = datetime.now(UTC) + timedelta(
        days=settings.REFRESH_TOKEN_TTL, minutes=-settings.ROTATE_TOKEN_EXPIRE_DELTA + 1
    )

    with freeze_time(time_in_future):
        response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    assert response.status_code == status.HTTP_200_OK
    assert old_token != response.cookies.get(REFRESH_TOKEN_COOKIE_NAME)


async def test_refresh_token__expired_refresh_token__error_raised(
    auth_client_for_created_user, expired_refresh_token_user
):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    error = TokenExpiredException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_refresh_token__revoked_refresh_token__error_raised(
    auth_client_for_created_user, revoked_refresh_token_user
):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_REFRESH)

    error = RefreshTokenRevokedException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


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


async def test_login__oauth_account__error_raised(mocker, client, created_user):
    mocker.patch(
        'week_eat_planner.api.auth.AuthService.login',
        side_effect=OAuthAccountException(),
    )
    token_data = {'username': created_user.email, 'password': PASSWORD}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    error = OAuthAccountException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_google_auth__valid_code__tokens_returned(mocker, client):
    oauth_user_data = OAuthUserData(
        oauth_provider=OAuthProvider.GOOGLE,
        oauth_id='google-sub-123',
        email='oauth@example.com',
        username='OAuth User',
        avatar_url=None,
    )
    mocker.patch(
        'week_eat_planner.services.auth_service.GoogleAuthClient.token_exchange',
        new=AsyncMock(return_value=oauth_user_data),
    )

    response = await client.post(AppUrl.AUTH_GOOGLE_EXCHANGE, json={'code': 'test_auth_code'})

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert 'access_token' in body
    assert body['access_token']
    assert body['token_type'] == TokenType.BEARER
