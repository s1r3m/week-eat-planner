import pytest
from fastapi import status

from week_eat_planner.constants import AppUrl


async def test_get_user__auth_user__user_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.get(AppUrl.USER)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        'id': str(created_user.id),
        'email': created_user.email,
        'username': created_user.username,
        'is_active': created_user.is_active,
        'avatar_url': None,
    }


@pytest.mark.usefixtures('created_user')
async def test_get_user__no_auth_user__user_in_response(logout_client_for_created_user):
    response = await logout_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_user__username_changed__updated_user_in_response(auth_client_for_created_user, created_user):
    new_name = 'new_username'

    response = await auth_client_for_created_user.patch(AppUrl.USER, json={'username': new_name})

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        'id': str(created_user.id),
        'email': created_user.email,
        'username': new_name,
        'is_active': created_user.is_active,
        'avatar_url': None,
    }


async def test_update_user__empty_payload__422_returned(auth_client_for_created_user):
    response = await auth_client_for_created_user.patch(AppUrl.USER, json={})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


async def test_update_user__no_auth__401_returned(logout_client_for_created_user):
    response = await logout_client_for_created_user.patch(AppUrl.USER, json={'username': 'new_username'})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
