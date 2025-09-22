import uuid
from http import HTTPStatus
from typing import AsyncGenerator

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from tests.conftest import WEEK_1_NAME, EMAIL
from tests.test_helpers import PASSWORD
from week_eat_planner.api.schemas import WeekPreviewOut, WeekOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.models import MealSlot, User, Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.week_dao import WeekDAO


@pytest_asyncio.fixture(autouse=True)
async def clean_db() -> AsyncGenerator[None, None]:
    yield

    async for session in db.get_db_commit():
        await session.execute(delete(MealSlot))
        await session.execute(delete(Week))
        await session.execute(delete(User))


@pytest_asyncio.fixture
async def created_user(user_factory):
    return await user_factory(EMAIL, PASSWORD)


@pytest_asyncio.fixture
async def created_user_2(user_factory):
    return await user_factory('user_2@test.com', PASSWORD)


@pytest_asyncio.fixture
async def created_week(created_user):
    async for session in db.get_db_commit():
        user = await UserDAO(session).get_user_by_email(created_user.email)
        week = await WeekDAO(session).create_week(user, WEEK_1_NAME)
        await MealSlotDAO(session).init_meal_slots_for_week(week)
        stmt = select(Week).where(Week.id == week.id).options(selectinload(Week.meal_slots))
        result = await session.execute(stmt)
        loaded_week = result.scalar_one()
        week_out = WeekOut.model_validate(loaded_week)
    return week_out


@pytest_asyncio.fixture
async def auth_client_for_created_user(auth_client_factory, created_user) -> AsyncClient:
    return await auth_client_factory(created_user, PASSWORD)


async def test_create_week__with_auth__week_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.post(AppUrl.WEEKS, json={'name': WEEK_1_NAME})

    body = response.json()
    assert response.status_code == HTTPStatus.CREATED
    assert isinstance(uuid.UUID(body.pop('id')), uuid.UUID)
    assert body == {'name': WEEK_1_NAME, 'user_id': str(created_user.id)}


async def test_get_weeks__empty_db__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == []


async def test_get_weeks__no_auth__error_in_response(client):
    response = await client.get(AppUrl.WEEKS)

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_get_week__user_with_week__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    body = response.json()
    assert response.status_code == HTTPStatus.OK
    assert body == created_week.model_dump(mode='json')


async def test_get_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = uuid.uuid4()

    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_get_week__no_auth__error_in_response(client, created_week):
    response = await client.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__new_name__week_in_response(auth_client_for_created_user, created_week):
    new_name = 'new_name'

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}',
        json={'name': new_name}
    )

    body = response.json()
    assert response.status_code == HTTPStatus.OK
    assert body == {
        'id': str(created_week.id),
        'name': new_name,
        'user_id': str(created_week.user_id),
    }


async def test_update_week__no_auth__error_in_response(client, created_week):
    response = await client.put(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', params={'name': 'new_name'})

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = uuid.uuid4()

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}',
        json={'name': 'test'},
    )

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_delete_week__no_auth__error_in_response(client, created_week):
    response = await client.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_delete_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = uuid.uuid4()

    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Week not found'}


async def test_delete_week__user_with_week__week_removed(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == HTTPStatus.NO_CONTENT
    assert not response.text


async def test_delete_week__other_user_existing_week__error_in_response(
    created_week, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)
    response = await user_client_2.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json() == {'detail': 'Week not found'}
