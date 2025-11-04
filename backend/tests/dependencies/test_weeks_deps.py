from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from tests.constants import WEEK_1_ID, WEEK_1_NAME
from week_eat_planner.api.schemas import UserOut, WeekOut, WeekPreviewOut
from week_eat_planner.dependencies.week_deps import get_week_by_id, get_week_for_update
from week_eat_planner.exceptions import WeekForbidden, WeekNotFound


@pytest.fixture
def mocked_week_dao(mocker) -> AsyncMock:
    week_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.week_service.WeekDAO', return_value=week_dao_mock)
    return week_dao_mock


@pytest.fixture
def week_out(user_out: UserOut) -> WeekOut:
    return WeekOut(id=WEEK_1_ID, user_id=user_out.id, name=WEEK_1_NAME, meal_slots=[])


async def test_get_week_by_id__week_exist__week_returned(mocked_week_dao, mocked_session, week_out, user_out):
    mocked_week_dao.find_one_or_none_by_id.return_value = week_out

    week = await get_week_by_id(str(week_out.id), user_out, mocked_session)

    assert week == week_out
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=week_out.id, for_update=False)


async def test_get_week_by_id__week_not_exist__error_raised(mocked_week_dao, mocked_session, week_out, user_out):
    mocked_week_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        await get_week_by_id(str(week_out.id), user_out, mocked_session)

    assert exc.value.status_code == WeekNotFound.status_code
    assert exc.value.detail == WeekNotFound.detail
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=week_out.id, for_update=False)


async def test_get_week_by_id__week_not_owned__error_raised(mocked_week_dao, mocked_session, week_out, user_out_2):
    mocked_week_dao.find_one_or_none_by_id.return_value = week_out

    with pytest.raises(HTTPException) as exc:
        await get_week_by_id(str(week_out.id), user_out_2, mocked_session)

    assert exc.value.status_code == WeekForbidden.status_code
    assert exc.value.detail == WeekForbidden.detail
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=week_out.id, for_update=False)


async def test_get_week_by_id__not_uuid__error_raised(mocked_week_dao, mocked_session, week_out, user_out):
    bad_uuid = 'not_uuid'

    with pytest.raises(HTTPException) as exc:
        await get_week_by_id(bad_uuid, user_out, mocked_session)

    assert exc.value.status_code == WeekNotFound.status_code
    assert exc.value.detail == WeekNotFound.detail
    mocked_week_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_week_for_update__week_exist__week_returned(mocked_week_dao, mocked_session, week_out):
    mocked_week_dao.find_one_or_none_by_id.return_value = week_out

    week = await get_week_for_update(week_out, mocked_session)

    assert week == WeekPreviewOut.model_validate(week_out.model_dump())
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=week_out.id, for_update=True)


async def test_get_week_for_update__week_not_exist__error_raised(mocked_week_dao, mocked_session, week_out):
    mocked_week_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        await get_week_for_update(week_out, mocked_session)

    assert exc.value.status_code == WeekNotFound.status_code
    assert exc.value.detail == WeekNotFound.detail
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=week_out.id, for_update=True)
