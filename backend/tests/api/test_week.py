from fastapi import status

from tests.api.conftest import WEEK_1_NAME
from tests.test_security import PASSWORD
from week_eat_planner.api.schemas import WeekCreate, WeekReadMinimal
from week_eat_planner.constants import AppUrl
from week_eat_planner.exceptions import WeekForbidden, WeekNotFound
from week_eat_planner.helpers import generate_uuid7


async def test_create_week__with_auth__week_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.post(
        AppUrl.WEEKS, json=WeekCreate(name=WEEK_1_NAME).model_dump(mode='json')
    )

    body = response.json()
    assert response.status_code == status.HTTP_201_CREATED
    assert body.pop('id')
    assert body == {'name': WEEK_1_NAME, 'user_id': str(created_user.id)}


async def test_get_weeks__empty_db__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_weeks__week_exists__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [WeekReadMinimal.model_validate(created_week.model_dump()).model_dump(mode='json')]


async def test_get_weeks__no_auth__error_in_response(client):
    response = await client.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_get_week__user_with_week__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == created_week.model_dump(mode='json')


async def test_get_week__week_not_exist__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == WeekNotFound.status_code
    assert response.json() == {'detail': WeekNotFound.detail}


async def test_get_week__no_auth__error_in_response(client, created_week):
    response = await client.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__new_name__week_in_response(auth_client_for_created_user, created_week):
    new_name = 'new_name'

    response = await auth_client_for_created_user.patch(
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
    response = await client.patch(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', json={'name': 'new_name'})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}',
        json={'name': 'test'},
    )

    assert response.status_code == WeekNotFound.status_code
    assert response.json() == {'detail': WeekNotFound.detail}


async def test_delete_week__no_auth__error_in_response(client, created_week):
    response = await client.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_delete_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == WeekNotFound.status_code
    assert response.json() == {'detail': WeekNotFound.detail}


async def test_delete_week__user_with_week__week_removed(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_week__other_user_existing_week__error_in_response(
    created_week, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)
    response = await user_client_2.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == WeekForbidden.status_code
    assert response.json() == {'detail': WeekForbidden.detail}
