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
