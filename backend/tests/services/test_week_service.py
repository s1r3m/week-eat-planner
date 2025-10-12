import pytest
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.db.models as db_model
from tests.api.conftest import WEEK_1_NAME
from week_eat_planner.services.week_service import WeekService


@pytest.fixture
def mocked_week_service(mocked_session: AsyncSession) -> WeekService:
    return WeekService(mocked_session)


async def test_get_week__week_exists__week_returnedk(mocker, mocked_session, mocked_week_service, created_week):
    week_mock = mocker.MagicMock(return_value=created_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=week_mock)

    week = await mocked_week_service.get_week(created_week.id)

    assert week == created_week


async def test_get_week__no_week__none_returned(mocker, mocked_session, mocked_week_service, db_week):
    week_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=week_mock)

    week = await mocked_week_service.get_week(db_week.id)

    assert week is None


async def test_create_week__name__week_created(mocker, mocked_session, mocked_week_service, created_user, created_week):
    week_mock = mocker.MagicMock(return_value=created_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one=week_mock)

    week = await mocked_week_service.create_week_with_slots(created_user, WEEK_1_NAME)

    assert week == created_week


async def test_get_weeks__user_no_weeks__empty_list(mocker, mocked_session, mocked_week_service, created_user):
    weeks_mock = mocker.MagicMock(return_value=[])
    all_mock = mocker.MagicMock(all=weeks_mock)
    scalars_mock = mocker.MagicMock(return_value=all_mock)
    mocked_session.execute.return_value = mocker.MagicMock(scalars=scalars_mock)

    weeks = await mocked_week_service.get_weeks(created_user)

    assert weeks == []


async def test_get_weeks__user_with_weeks__empty_list(
    mocker, mocked_session, mocked_week_service, created_user, created_week, created_week_2
):
    week_1 = db_model.Week(name=created_week.name, user_id=created_user.id)
    week_2 = db_model.Week(name=created_week_2.name, user_id=created_user.id)
    expected_weeks = [week_1, week_2]
    weeks_mock = mocker.MagicMock(return_value=expected_weeks)
    all_mock = mocker.MagicMock(all=weeks_mock)
    scalars_mock = mocker.MagicMock(return_value=all_mock)
    mocked_session.execute.return_value = mocker.MagicMock(scalars=scalars_mock)

    weeks = await mocked_week_service.get_weeks(created_user)

    assert weeks == expected_weeks
