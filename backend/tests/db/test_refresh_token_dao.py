from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.exc import SQLAlchemyError

from tests.conftest_mock import HASHED_REFRESH_TOKEN, REFRESH_TOKEN
from week_eat_planner.config import settings

DB_ERROR = 'DB Week Error'


async def test_save_token__valid_token__token_saved_and_returned(mocked_refresh_token_dao, db_user):
    db_token = await mocked_refresh_token_dao.save(db_user, REFRESH_TOKEN)

    now = datetime.now(timezone.utc)
    assert db_token.user_id == db_user.id
    assert db_token.token_hash == HASHED_REFRESH_TOKEN
    assert db_token.revoked is False
    assert now - timedelta(seconds=1) < db_token.issued_at < now + timedelta(seconds=1)
    assert db_token.expires_at > now + timedelta(days=settings.REFRESH_TOKEN_TTL) - timedelta(seconds=1)
    assert db_token.expires_at < now + timedelta(days=settings.REFRESH_TOKEN_TTL) + timedelta(seconds=1)


async def test_save_token__db_error__error_raised(mocked_session, db_user, mocked_refresh_token_dao):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_refresh_token_dao.save(db_user, REFRESH_TOKEN)

    assert str(exc.value) == DB_ERROR


async def test_get_token_by_hash__valid_hash__token_returned(
    mocker, mocked_session, mocked_refresh_token_dao, db_refresh_token, db_user
):
    scalars_mock = mocker.MagicMock(return_value=db_refresh_token)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    db_token = await mocked_refresh_token_dao.get_token_by_hash(HASHED_REFRESH_TOKEN)

    assert db_token.user_id == db_user.id
    assert db_token.revoked is False


async def test_get_token_by_hash__token_not_exist__token_returned(mocker, mocked_session, mocked_refresh_token_dao):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    db_token = await mocked_refresh_token_dao.get_token_by_hash('NOT_A_HASHED_TOKEN')

    assert not db_token


async def test_revoke_token__token_exists__token_revoked(mocked_refresh_token_dao, db_user, db_refresh_token):
    new_token = await mocked_refresh_token_dao.save(db_user, REFRESH_TOKEN)

    revoked_token = await mocked_refresh_token_dao.revoke_token(db_refresh_token, revoked_by=new_token)

    assert revoked_token.revoked is True
    assert revoked_token.replaced_by == new_token.id


async def test_revoke_token__db_error__error_raised(
    mocked_session, db_user, mocked_refresh_token_dao, db_refresh_token
):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await mocked_refresh_token_dao.revoke_token(db_refresh_token, revoked_by=None)

    assert str(exc.value) == DB_ERROR
