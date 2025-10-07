from http import HTTPStatus

import pytest
from fastapi import HTTPException

from week_eat_planner.dependencies.week_deps import get_week_by_id, get_week_for_update
from week_eat_planner.helpers import generate_uuid7


async def test_get_week_by_id__week_exist__week_returned(mocker, mocked_session, db_week, db_user):
    get_week_mock = mocker.AsyncMock(return_value=db_week)
    week_service_mock = mocker.AsyncMock(get_week=get_week_mock)
    mocker.patch('week_eat_planner.dependencies.week_deps.WeekService', return_value=week_service_mock)
    db_week.user_id = db_user.id

    week = await get_week_by_id(str(db_week.id), db_user, mocked_session)

    assert week == db_week
    week_service_mock.get_week.assert_awaited_once_with(str(db_week.id))


async def test_get_week_by_id__week_not_exist__error_raised(mocker, mocked_session, mocked_week_dao, db_week, db_user):
    get_week_mock = mocker.AsyncMock(return_value=None)
    week_service_mock = mocker.AsyncMock(get_week=get_week_mock)
    mocker.patch('week_eat_planner.dependencies.week_deps.WeekService', return_value=week_service_mock)

    with pytest.raises(HTTPException) as exc:
        await get_week_by_id(str(db_week.id), db_user, mocked_session)

    assert exc.value.status_code == HTTPStatus.CONFLICT
    assert exc.value.detail == 'Week not found'
    week_service_mock.get_week.assert_awaited_once_with(str(db_week.id))


async def test_get_week_by_id__week_not_owned__error_raised(mocker, mocked_session, mocked_week_dao, db_week, db_user):
    get_week_mock = mocker.AsyncMock(return_value=db_week)
    week_service_mock = mocker.AsyncMock(get_week=get_week_mock)
    mocker.patch('week_eat_planner.dependencies.week_deps.WeekService', return_value=week_service_mock)
    db_week.user_id = generate_uuid7()

    with pytest.raises(HTTPException) as exc:
        await get_week_by_id(str(db_week.id), db_user, mocked_session)

    assert exc.value.status_code == HTTPStatus.FORBIDDEN
    assert exc.value.detail == 'Access forbidden'
    week_service_mock.get_week.assert_awaited_once_with(str(db_week.id))


async def test_get_week_for_update__week_exist__week_returned(mocker, mocked_session, mocked_week_dao, db_week):
    get_week_mock = mocker.AsyncMock(return_value=db_week)
    week_service_mock = mocker.AsyncMock(get_week=get_week_mock)
    mocker.patch('week_eat_planner.dependencies.week_deps.WeekService', return_value=week_service_mock)

    week = await get_week_for_update(db_week, mocked_session)

    assert week == db_week
    week_service_mock.get_week.assert_awaited_once_with(db_week.id, for_update=True)


async def test_get_week_for_update__week_not_exist__error_raised(mocker, mocked_session, mocked_week_dao, db_week):
    get_week_mock = mocker.AsyncMock(return_value=None)
    week_service_mock = mocker.AsyncMock(get_week=get_week_mock)
    mocker.patch('week_eat_planner.dependencies.week_deps.WeekService', return_value=week_service_mock)

    with pytest.raises(HTTPException) as exc:
        await get_week_for_update(db_week, mocked_session)

    assert exc.value.status_code == HTTPStatus.CONFLICT
    assert exc.value.detail == 'Week not found'
    week_service_mock.get_week.assert_awaited_once_with(db_week.id, for_update=True)
