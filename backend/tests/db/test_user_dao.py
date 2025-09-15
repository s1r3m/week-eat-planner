import pytest
from sqlalchemy.exc import SQLAlchemyError

from tests.conftest import EMAIL, PASSWORD, USER_ID
from week_eat_planner.db.models import User

DB_ERROR = 'DB User Error'


@pytest.fixture
def db_user() -> User:
    return User(id=USER_ID, email=EMAIL, hashed_password=PASSWORD, is_active=True)


async def test_user_dao_create_user__valid_data__user_created(user_dao):
    user = await user_dao.create_user(EMAIL, PASSWORD)

    assert user.email == EMAIL
    assert user.hashed_password == PASSWORD


async def test_create_user__db_error__exception(mocked_session, user_dao):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await user_dao.create_user(EMAIL, PASSWORD)

    assert str(exc.value) == DB_ERROR


async def test_get_user_by_email__user_exists__user_found(mocker, mocked_session, db_user, user_dao):
    scalars_mock = mocker.MagicMock(return_value=db_user)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user_from_db = await user_dao.get_user_by_email(EMAIL)

    assert user_from_db == db_user


async def test_get_user_by_email__user_not_exists__no_error(mocker, mocked_session, user_dao):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user_from_db = await user_dao.get_user_by_email(EMAIL)

    assert not user_from_db


async def test_get_user_by_email__db_error__error_returned(mocked_session, user_dao):
    mocked_session.execute.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await user_dao.get_user_by_email(EMAIL)

    assert str(exc.value) == DB_ERROR
