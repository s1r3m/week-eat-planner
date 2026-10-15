from unittest.mock import AsyncMock

import pytest

from week_eat_planner.db.models.auth import Session
from week_eat_planner.exceptions import SessionNotFoundException
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.session_service import SessionService


@pytest.fixture
def mocked_session_dao(mocker) -> AsyncMock:
    session_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.session_service.SessionDAO', return_value=session_dao_mock)
    return session_dao_mock


@pytest.fixture
def session_token() -> str:
    return TokenProvider.get_session_token()


@pytest.fixture
def auth_session(db_user, session_token) -> Session:
    hashed_token = TokenProvider.hash_token(session_token)
    session = Session(user_id=db_user.id, hashed_token=hashed_token, user=db_user)
    return session


async def test_create_session_token__valid_user__token_created(mocked_session_dao, mocked_session, db_user):
    token = await SessionService(mocked_session).create_session_token(db_user)

    assert token
    mocked_session_dao.add.assert_awaited_once()


async def test_get_session_by_token__valid_token__session_returned(
    mocked_session_dao, mocked_session, session_token, auth_session
):
    mocked_session_dao.find_one_or_none.return_value = auth_session

    result = await SessionService(mocked_session).get_sesion_by_token(session_token)

    assert result == auth_session
    mocked_session_dao.find_one_or_none.assert_awaited_once()


async def test_get_session_by_token__no_session__error_raised(mocked_session_dao, mocked_session, session_token):
    mocked_session_dao.find_one_or_none.return_value = None

    with pytest.raises(SessionNotFoundException) as exc:
        await SessionService(mocked_session).get_sesion_by_token(session_token)

    assert 'Session not found' in str(exc.value)
    mocked_session_dao.find_one_or_none.assert_awaited_once()
