from unittest.mock import AsyncMock

import pytest
from fastapi import status

from tests.api.conftest import WEEK_1_NAME
from tests.constants import FOR_UPDATE_PARAMETRIZE
from week_eat_planner.api.schemas import UserRead, WeekCreate, WeekRead, WeekReadMinimal, WeekUpdate
from week_eat_planner.db.models import Week
from week_eat_planner.exceptions import WeekForbidden, WeekNotFound
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.week_service import WeekService


@pytest.fixture
def mocked_week_dao(mocker) -> AsyncMock:
    week_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.week_service.WeekDAO', return_value=week_dao_mock)
    return week_dao_mock


@pytest.fixture
def db_week(user_read: UserRead) -> Week:
    return Week(id=generate_uuid7(), name=WEEK_1_NAME, user_id=user_read.id, meal_slots=[])


async def test_create_week__name__week_created(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.add.return_value = db_week
    week = await WeekService(mocked_session).create_week_with_slots(user_read, WeekCreate(name=WEEK_1_NAME))
    assert week == WeekReadMinimal.model_validate(db_week)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__week_exists__week_returned(
    mocked_week_dao, mocked_session, db_week, user_read, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = db_week

    week = await WeekService(mocked_session).get_week_for_user(str_week_id, user_read, for_update=for_update)

    assert week == WeekRead.model_validate(db_week)
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__no_week__error_raised(
    mocked_week_dao, mocked_session, db_week, user_read, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(WeekNotFound) as exc:
        await WeekService(mocked_session).get_week_for_user(str_week_id, user_read, for_update=for_update)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Week {str_week_id} not found'
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__week_not_owned__error_raised(
    mocked_week_dao, mocked_session, db_week, user_read_2, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = db_week

    with pytest.raises(WeekForbidden) as exc:
        await WeekService(mocked_session).get_week_for_user(str_week_id, user_read_2, for_update=for_update)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == f'Week {db_week.id} forbidden'
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


async def test_get_week_for_user__not_uuid__error_raised(mocked_week_dao, mocked_session, user_read):
    bad_uuid = 'not_uuid'

    with pytest.raises(WeekNotFound) as exc:
        await WeekService(mocked_session).get_week_for_user(bad_uuid, user_read, for_update=False)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Week {bad_uuid} not found'
    mocked_week_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_weeks__user_no_weeks__empty_list_returned(mocked_week_dao, mocked_session, user_read):
    mocked_week_dao.find_all.return_value = []
    weeks = await WeekService(mocked_session).get_weeks(user_read)
    assert weeks == []


async def test_get_weeks__user_with_weeks__weeks_returned(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.find_all.return_value = [db_week]
    weeks = await WeekService(mocked_session).get_weeks(user_read)
    assert weeks == [WeekReadMinimal.model_validate(db_week)]


async def test_update_week__valid_data__week_updated(mocked_week_dao, mocked_session, user_read, db_week):
    new_name = 'New Week Name'
    updated_db_week = Week(id=db_week.id, name=new_name, user_id=user_read.id)
    mocked_week_dao.update.return_value = updated_db_week
    week_preview = WeekReadMinimal.model_validate(db_week)

    week = await WeekService(mocked_session).update_week(week_preview, WeekUpdate(name=new_name))

    assert week == WeekReadMinimal.model_validate(updated_db_week)


async def test_delete_week__always__week_deleted(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.delete.return_value = 1
    week_preview = WeekReadMinimal.model_validate(db_week)

    await WeekService(mocked_session).delete_week(week_preview)

    mocked_week_dao.delete.assert_awaited_once_with(week_preview)
