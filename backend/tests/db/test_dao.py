import pytest
from sqlalchemy.exc import SQLAlchemyError

from tests.conftest import EMAIL, PASSWORD, USER_ID
from week_eat_planner.api.dao import WeekDAO
from week_eat_planner.api.schemas import WeekModel


@pytest.fixture
def week_dao(mocked_session) -> WeekDAO:
    return WeekDAO(mocked_session)


async def test_user_dao_create_user__valid_data__user_created(user_dao):
    user = await user_dao.create_user(EMAIL, PASSWORD)

    assert user.email == EMAIL
    assert user.hashed_password == PASSWORD


@pytest.mark.parametrize(
    'weeks_from_db',
    [
        pytest.param([], id='empty'),
        pytest.param([WeekModel(name='1', user_id=USER_ID)], id='one_week'),
        pytest.param(
            [
                WeekModel(name='1', user_id=USER_ID),
                WeekModel(name='2', user_id=USER_ID),
            ],
            id='two_week',
        ),
    ],
)
async def test_week_dao_get_weeks__no_data__empty_response(mocked_session, mocker, week_dao, user, weeks_from_db):
    weeks_mock = mocker.MagicMock(return_value=weeks_from_db)
    all_mock = mocker.MagicMock(all=weeks_mock)
    scalars_mock = mocker.MagicMock(return_value=all_mock)
    mocked_session.execute.return_value = mocker.AsyncMock(scalars=scalars_mock)

    weeks = await week_dao.get_weeks(user)

    assert weeks == weeks_from_db


async def test_week_dao_get_weeks__exception__error_response(mocked_session, week_dao, user):
    mocked_session.execute.side_effect = SQLAlchemyError('DB error')

    with pytest.raises(SQLAlchemyError) as exc:
        await week_dao.get_weeks(user)

    assert str(exc.value) == 'DB error'
