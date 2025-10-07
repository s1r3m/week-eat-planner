import pytest
from sqlalchemy.exc import SQLAlchemyError

import week_eat_planner.db.models as db_model
from tests.conftest_api import WEEK_1_ID, WEEK_1_NAME
from week_eat_planner.api.schemas import WeekUpdate
from week_eat_planner.helpers import generate_uuid7

DB_ERROR = 'DB Week Error'
WEEK_2_ID = generate_uuid7()
WEEK_2_NAME = 'second'


async def test_create_week__valid_data__week_created(mocked_session, created_user, mocked_week_dao):
    week = await mocked_week_dao.insert_week(created_user, WEEK_1_NAME)

    assert week.user_id == created_user.id
    assert week.name == week.name


async def test_create_week__db_error__week_created(mocked_session, created_user, mocked_week_dao):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.insert_week(created_user, WEEK_2_NAME)

    assert str(exc.value) == DB_ERROR


@pytest.mark.parametrize(
    'weeks_from_db',
    [
        pytest.param([], id='no_weeks'),
        pytest.param([db_model.Week(id=WEEK_1_ID, name=WEEK_1_NAME)], id='one_week'),
        pytest.param(
            [
                db_model.Week(id=WEEK_1_ID, name=WEEK_1_NAME),
                db_model.Week(id=WEEK_2_ID, name=WEEK_2_NAME),
            ],
            id='two_weeks',
        ),
    ],
)
async def test_get_weeks__valid_data__data_returned(
    mocked_session, mocker, mocked_week_dao, created_user, weeks_from_db
):
    for week in weeks_from_db:
        week.user_id = created_user.id
    weeks_mock = mocker.MagicMock(return_value=weeks_from_db)
    all_mock = mocker.MagicMock(all=weeks_mock)
    scalars_mock = mocker.MagicMock(return_value=all_mock)
    mocked_session.execute.return_value = mocker.AsyncMock(scalars=scalars_mock)

    weeks = await mocked_week_dao.get_all_weeks_by_user(created_user)

    assert weeks == weeks_from_db


async def test_get_weeks__exception__error_response(mocked_session, mocked_week_dao, created_user):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.get_all_weeks_by_user(created_user)

    assert str(exc.value) == DB_ERROR


async def test_get_week__week_exists__week_found(mocker, mocked_session, mocked_week_dao, db_week):
    scalars_mock = mocker.MagicMock(return_value=db_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await mocked_week_dao.get_week_by_id(db_week.id, for_update=False)

    assert week == db_week


async def test_get_week__week_not_exists__week_not_found(mocker, mocked_session, mocked_week_dao):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await mocked_week_dao.get_week_by_id('Some_id', for_update=False)

    assert not week


async def test_get_week__db_error__error_raised(mocked_session, mocked_week_dao):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.get_week_by_id(WEEK_2_ID, for_update=False)

    assert str(exc.value) == DB_ERROR


async def test_update_week__new_name__week_updated(mocked_session, mocked_week_dao, db_week):
    updated_week = await mocked_week_dao.update_week(db_week, WeekUpdate(name=WEEK_2_NAME))
    assert updated_week.name == WEEK_2_NAME


async def test_update_week__db_error__error_raised(mocked_session, mocked_week_dao, db_week):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.update_week(db_week, WeekUpdate(name=WEEK_2_NAME))

    assert str(exc.value) == DB_ERROR


async def test_delete_week__db_error__error_raised(mocked_session, mocked_week_dao, db_week):
    mocked_session.delete.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.delete_week(db_week)

    assert str(exc.value) == DB_ERROR


async def test_get_week_for_update__week_exists__week_returned(mocker, mocked_session, mocked_week_dao, db_week):
    scalars_mock = mocker.MagicMock(return_value=db_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await mocked_week_dao.get_week_by_id(db_week.id, for_update=True)

    assert week == db_week


async def test_get_week_for_update__week_disappeared__none_returned(mocker, mocked_session, mocked_week_dao, db_week):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await mocked_week_dao.get_week_by_id(db_week.id, for_update=True)

    assert week is None


async def test_get_week_for_update__db_error__error_raised(mocked_session, mocked_week_dao, db_week):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.get_week_by_id(db_week.id, for_update=True)

    assert str(exc.value) == DB_ERROR
