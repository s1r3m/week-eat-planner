import uuid

import pytest
from sqlalchemy.exc import SQLAlchemyError

from tests.conftest import USER_ID, WEEK_1_ID, WEEK_1_NAME
from week_eat_planner.db.models import Week

DB_ERROR = 'DB Week Error'
WEEK_2_ID = uuid.uuid4()
WEEK_2_NAME = 'second'


@pytest.fixture
def db_week() -> Week:
    return Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=USER_ID)


async def test_create_week__valid_data__week_created(mocked_session, user, week_dao):
    week = await week_dao.create_week(user, WEEK_1_NAME)

    assert week.user_id == USER_ID
    assert week.name == WEEK_1_NAME


async def test_create_week__db_error__week_created(mocked_session, user, week_dao):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await week_dao.create_week(user, WEEK_2_NAME)

    assert str(exc.value) == DB_ERROR


@pytest.mark.parametrize(
    'weeks_from_db',
    [
        pytest.param([], id='no_weeks'),
        pytest.param([Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=USER_ID)], id='one_week'),
        pytest.param(
            [
                Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=USER_ID),
                Week(id=WEEK_2_ID, name=WEEK_2_NAME, user_id=USER_ID),
            ],
            id='two_weeks',
        ),
    ],
)
async def test_get_weeks__valid_data__data_returned(mocked_session, mocker, week_dao, user, weeks_from_db):
    weeks_mock = mocker.MagicMock(return_value=weeks_from_db)
    all_mock = mocker.MagicMock(all=weeks_mock)
    scalars_mock = mocker.MagicMock(return_value=all_mock)
    mocked_session.execute.return_value = mocker.AsyncMock(scalars=scalars_mock)

    weeks = await week_dao.get_weeks(user)

    assert weeks == weeks_from_db


async def test_get_weeks__exception__error_response(mocked_session, week_dao, user):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await week_dao.get_weeks(user)

    assert str(exc.value) == DB_ERROR


async def test_get_week__week_exists__week_found(mocker, mocked_session, week_dao, db_week):
    scalars_mock = mocker.MagicMock(return_value=db_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await week_dao.get_week(str(db_week.id))

    assert week == db_week


async def test_get_week__week_not_exists__week_not_found(mocker, mocked_session, week_dao):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await week_dao.get_week('Some_id')

    assert not week


async def test_get_week__db_error__error_raised(mocked_session, week_dao):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await week_dao.get_week(str(WEEK_2_ID))

    assert str(exc.value) == DB_ERROR
