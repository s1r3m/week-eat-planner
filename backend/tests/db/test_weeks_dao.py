import pytest
from sqlalchemy.exc import SQLAlchemyError

import week_eat_planner.db.models as db_model
from tests.conftest_api import WEEK_1_ID, WEEK_1_NAME, WEEK_2_ID, WEEK_2_NAME

DB_ERROR = 'DB Week Error'


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

    weeks = await mocked_week_dao.find_all(created_user)

    assert weeks == weeks_from_db


async def test_get_weeks__exception__error_response(mocked_session, mocked_week_dao, created_user):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.find_all(created_user)

    assert str(exc.value) == DB_ERROR


async def test_get_week__week_exists__week_found(mocker, mocked_session, mocked_week_dao, db_week):
    scalars_mock = mocker.MagicMock(return_value=db_week)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    week = await mocked_week_dao.find_one_or_none(id=db_week.id, for_update=False)

    assert week == db_week


async def test_delete_week__db_error__error_raised(mocked_session, mocked_week_dao, db_week):
    mocked_session.delete.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_week_dao.delete(db_week)

    assert str(exc.value) == DB_ERROR
