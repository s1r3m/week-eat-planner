import pytest_asyncio
from fastapi import status

from tests.conftest import WEEK_1_NAME
from tests.test_helpers import PASSWORD
from week_eat_planner.constants import AppUrl
from week_eat_planner.helpers import generate_uuid7


@pytest_asyncio.fixture
async def created_user_2(user_factory):
    return await user_factory('user_2@test.com', PASSWORD)


async def test_create_week__with_auth__week_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.post(AppUrl.WEEKS, json={'name': WEEK_1_NAME})

    body = response.json()
    assert response.status_code == status.HTTP_201_CREATED
    assert body.pop('id')
    assert body == {'name': WEEK_1_NAME, 'user_id': str(created_user.id)}


async def test_get_weeks__empty_db__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_weeks__no_auth__error_in_response(client):
    response = await client.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_get_week__user_with_week__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == created_week.model_dump(mode='json')


async def test_get_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_get_week__no_auth__error_in_response(client, created_week):
    response = await client.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__new_name__week_in_response(auth_client_for_created_user, created_week):
    new_name = 'new_name'

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', json={'name': new_name}
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == {
        'id': str(created_week.id),
        'name': new_name,
        'user_id': str(created_week.user_id),
    }


async def test_update_week__no_auth__error_in_response(client, created_week):
    response = await client.put(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', params={'name': 'new_name'})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}',
        json={'name': 'test'},
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_delete_week__no_auth__error_in_response(client, created_week):
    response = await client.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_delete_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_delete_week__user_with_week__week_removed(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_week__other_user_existing_week__error_in_response(
    created_week, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)
    response = await user_client_2.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': 'Access forbidden'}
