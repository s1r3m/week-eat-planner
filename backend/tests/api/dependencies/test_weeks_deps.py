from unittest.mock import AsyncMock

import pytest

from week_eat_planner.api.dependencies.week_deps import get_week_by_id, get_week_for_update
from week_eat_planner.api.schemas import WeekReadMinimal


@pytest.fixture
def mocked_week_service(mocker) -> AsyncMock:
    week_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.week_deps.WeekService', return_value=week_service_mock)
    return week_service_mock


async def test_get_week_by_id__week_exist__week_returned(mocked_week_service, mocked_session, week_out, user_read):
    str_week_id = str(week_out.id)
    mocked_week_service.get_week_for_user.return_value = week_out

    week = await get_week_by_id(str_week_id, user_read, mocked_session)

    assert week == week_out
    mocked_week_service.get_week_for_user.assert_awaited_once_with(str_week_id, user_read, for_update=False)


async def test_get_week_for_update__week_exist__week_returned(mocked_week_service, mocked_session, week_out, user_read):
    str_week_id = str(week_out.id)
    mocked_week_service.get_week_for_user.return_value = week_out

    week = await get_week_for_update(str_week_id, user_read, mocked_session)

    assert week == WeekReadMinimal.model_validate(week_out.model_dump())
    mocked_week_service.get_week_for_user.assert_awaited_once_with(str_week_id, user_read, for_update=True)
