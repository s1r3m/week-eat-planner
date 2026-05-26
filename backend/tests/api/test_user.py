import pytest
from fastapi import status

from tests.constants import PASSWORD
from week_eat_planner.constants import ACCESS_TOKEN_COOKIE_NAME, AppUrl, REFRESH_TOKEN_COOKIE_NAME
from week_eat_planner.exceptions import NoAccessTokenException

NEW_PASSWORD = 'new_password'


async def test_get_user__auth_user__user_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.get(AppUrl.USER)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        'id': str(created_user.id),
        'email': created_user.email,
        'username': created_user.username,
        'is_active': created_user.is_active,
        'avatar_url': None,
        'oauth_provider': None,
    }


@pytest.mark.usefixtures('created_user')
async def test_get_user__no_auth_user__user_in_response(logout_client_for_created_user):
    response = await logout_client_for_created_user.get(AppUrl.USER)

    error = NoAccessTokenException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_update_user__data_changed__updated_user_in_response(auth_client_for_created_user, created_user):
    new_name = 'new_username'

    response = await auth_client_for_created_user.patch(AppUrl.USER, json={'username': new_name})

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        'id': str(created_user.id),
        'email': created_user.email,
        'username': new_name,
        'is_active': created_user.is_active,
        'avatar_url': None,
        'oauth_provider': None,
    }


async def test_update_user__empty_username__422_returned(auth_client_for_created_user):
    response = await auth_client_for_created_user.patch(AppUrl.USER, json={'username': ''})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_update_user__empty_payload__422_returned(auth_client_for_created_user):
    response = await auth_client_for_created_user.patch(AppUrl.USER, json={})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_update_user__no_auth__401_returned(client):
    response = await client.patch(AppUrl.USER, json={'username': 'new_username'})

    error = NoAccessTokenException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_change_password__valid_new_password__token_in_cookies(auth_client_for_created_user):
    response = await auth_client_for_created_user.patch(
        AppUrl.USER_PASSWORD, json={'old_password': PASSWORD, 'new_password': NEW_PASSWORD}
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    assert response.cookies.get(ACCESS_TOKEN_COOKIE_NAME)


@pytest.mark.parametrize(
    'body',
    [
        pytest.param({'new_password': PASSWORD}, id='no_old_password'),
        pytest.param({'old_password': PASSWORD}, id='no_new_password'),
        pytest.param({'old_password': PASSWORD, 'new_password': PASSWORD}, id='passwords_match'),
        pytest.param({'old_password': PASSWORD, 'new_password': 12345678}, id='password_int'),
    ],
)
async def test_change_password__bad_data__validation_failed(auth_client_for_created_user, body):
    response = await auth_client_for_created_user.patch(AppUrl.USER_PASSWORD, json=body)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
