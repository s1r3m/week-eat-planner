from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException, status

from tests.constants import EMAIL, PASSWORD, USERNAME
from week_eat_planner.api.schemas.user import OAuthUserData, UserCreate, UserLogin
from week_eat_planner.constants import AppUrl, OAuthProvider, SESSION_COOIKE_NAME
from week_eat_planner.exceptions import (
    InvalidCredentialsException,
    OAuthAccountException,
    OAuthInvalidCodeException,
    OAuthProviderException,
    PasswordAccountException,
    UserAlreadyExistsException,
)


async def test_create_user__valid_data__user_created(client):
    signup_data = UserCreate(email=EMAIL, password=PASSWORD, username=USERNAME).model_dump(mode='json')
    response = await client.post(AppUrl.AUTH_SIGNUP, json=signup_data)

    assert response.status_code == status.HTTP_201_CREATED
    assert not response.cookies.get(SESSION_COOIKE_NAME)


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
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


async def test_create_user__duplicate_email__conflict_error(client, created_user):
    signup_data = UserCreate(email=created_user.email, password=PASSWORD, username=USERNAME).model_dump(mode='json')
    response = await client.post(AppUrl.AUTH_SIGNUP, json=signup_data)

    error = UserAlreadyExistsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_create_user__invalid_email_format__unprocessable_entity_error(client):
    signup_data = {'email': 'not-email', 'password': PASSWORD, 'username': USERNAME}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=signup_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


async def test_login__valid_credentials__session_returned(client, created_user):
    login_data = UserLogin(email=created_user.email, password=PASSWORD).model_dump(mode='json')

    response = await client.post(AppUrl.AUTH_LOGIN, json=login_data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {'status': 'success'}
    assert response.cookies.get(SESSION_COOIKE_NAME)


async def test_login__invalid_email_format__conflict_error(client):
    login_data = {'email': 'not-email', 'password': PASSWORD}
    response = await client.post(AppUrl.AUTH_LOGIN, json=login_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


async def test_login__invalid_password__not_found_error(client, created_user):
    login_data = UserLogin(email=created_user.email, password='wrong-pass').model_dump(mode='json')

    response = await client.post(AppUrl.AUTH_LOGIN, json=login_data)

    error = InvalidCredentialsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_login__nonexistent_user__not_found_error(client):
    login_data = UserLogin(email='other@email.com', password=PASSWORD).model_dump(mode='json')

    response = await client.post(AppUrl.AUTH_LOGIN, json=login_data)

    error = InvalidCredentialsException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_logout__valid_user__no_cookie_in_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    assert SESSION_COOIKE_NAME not in response.cookies


async def test_logout__no_cookie_in_request__error_raised(auth_client_for_created_user):
    auth_client_for_created_user.cookies = []

    response = await auth_client_for_created_user.post(AppUrl.AUTH_LOGOUT)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    assert SESSION_COOIKE_NAME not in response.cookies


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
    login_data = {'email': created_user.email, 'password': PASSWORD}

    response = await client.post(AppUrl.AUTH_LOGIN, json=login_data)

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
        'week_eat_planner.services.auth_service.GoogleAuthClient.get_oauth_user',
        new=AsyncMock(return_value=oauth_user_data),
    )

    response = await client.post(AppUrl.AUTH_GOOGLE_EXCHANGE, json={'code': 'test_auth_code'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {'status': 'success'}
    assert response.cookies.get(SESSION_COOIKE_NAME)


async def test_google_auth__invalid_code__error_raised(mocker, client):
    mocker.patch(
        'week_eat_planner.api.auth.AuthService.login_with_google',
        side_effect=OAuthInvalidCodeException(),
    )

    response = await client.post(AppUrl.AUTH_GOOGLE_EXCHANGE, json={'code': 'bad_code'})

    error = OAuthInvalidCodeException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_google_auth__provider_error__error_raised(mocker, client):
    mocker.patch(
        'week_eat_planner.api.auth.AuthService.login_with_google',
        side_effect=OAuthProviderException(),
    )

    response = await client.post(AppUrl.AUTH_GOOGLE_EXCHANGE, json={'code': 'auth_code'})

    error = OAuthProviderException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_google_auth__email_has_password_account__error_raised(mocker, client):
    mocker.patch(
        'week_eat_planner.api.auth.AuthService.login_with_google',
        side_effect=PasswordAccountException(),
    )

    response = await client.post(AppUrl.AUTH_GOOGLE_EXCHANGE, json={'code': 'auth_code'})

    error = PasswordAccountException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}
