import uuid
from http import HTTPStatus

import pytest
import pytest_asyncio

from week_eat_planner.constants import AppUrl


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


async def test_add_user__valid_data__user_created(client, login_data):
    response = await client.post(AppUrl.AUTH_SIGNUP, json=login_data)

    assert response.status_code == HTTPStatus.CREATED
    body = response.json()
    assert isinstance(uuid.UUID(body.pop('id')), uuid.UUID)
    assert body == {'email': login_data['email'], 'is_active': True}


async def test_add_user__duplicate_email__conflict_error(client, user):
    response = await client.post(AppUrl.AUTH_SIGNUP, json=user)

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'User with this email already exists'}


async def test_add_user__invalid_email_format__unprocessable_entity_error(client):
    invalid_login_data = {'email': 'not-a-valid-email', 'password': 'password'}
    response = await client.post(AppUrl.AUTH_SIGNUP, json=invalid_login_data)
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


async def test_login__valid_credentials__token_returned(client, user):
    token_data = {'username': user['email'], 'password': user['password']}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == HTTPStatus.OK
    body = response.json()
    assert 'access_token' in body
    assert body['token_type'] == 'bearer'


async def test_login__invalid_email_format__conflict_error(client):
    token_data = {'username': 'not-a-valid-email', 'password': 'password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Invalid email'}


async def test_login__invalid_password__not_found_error(client, user):
    token_data = {'username': user['email'], 'password': 'wrong-password'}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Incorrect email or password'}


async def test_login__nonexistent_user__not_found_error(client, login_data):
    token_data = {'username': login_data['email'], 'password': login_data['password']}

    response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Incorrect email or password'}


async def test_get_user__auth_user__user_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.get(AppUrl.AUTH_ME)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        'id': str(created_user.id),
        'email': created_user.email,
        'is_active': created_user.is_active,
    }
