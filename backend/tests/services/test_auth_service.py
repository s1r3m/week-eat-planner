from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest
from fastapi import status

from tests.constants import CLIENT_ID, HASHED_REFRESH_TOKEN, PASSWORD, REFRESH_TOKEN, USERAGENT
from week_eat_planner.api.schemas import RefreshTokenFromDB, TokenUpdate, UserCreate
from week_eat_planner.config import settings
from week_eat_planner.db.models import RefreshToken
from week_eat_planner.exceptions import (
    InvalidCredentials,
    InvalidEmail,
    RefreshTokenNotFound,
    RefreshTokenRevoked,
    TokenExpired,
    TokenForbidden,
    TokenRevoked,
    UserAlreadyExists,
)
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.auth_service import AuthService


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


@pytest.fixture
def mocked_refresh_token_dao(mocker) -> AsyncMock:
    token_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.RefreshTokenDAO', return_value=token_dao_mock)
    return token_dao_mock


@pytest.fixture
def db_refresh_token(user_read) -> RefreshToken:
    token = RefreshToken(
        token_hash=HASHED_REFRESH_TOKEN,
        user_id=user_read.id,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_TTL),
    )
    token.user = user_read
    return token


@pytest.fixture
def new_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        id=generate_uuid7(),
        token_hash='some_hash',
        user_id=user_read.id,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_TTL),
    )


@pytest.fixture
def expired_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        token_hash=HASHED_REFRESH_TOKEN,
        user_id=user_read.id,
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=5),
    )


@pytest.fixture
def revoked_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        token_hash=HASHED_REFRESH_TOKEN,
        user_id=user_read.id,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        revoked=True,
    )


async def test_register_user__valid_email__user_returned(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none.return_value = None
    mocked_user_dao.add.return_value = user_read

    user = await AuthService(mocked_session).register_user(UserCreate(email=user_read.email, password=PASSWORD))

    assert user == user_read


async def test_register_user__user_exists__error_raised(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none.return_value = user_read

    with pytest.raises(UserAlreadyExists) as exc:
        await AuthService(mocked_session).register_user(UserCreate(email=user_read.email, password=PASSWORD))

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f"User with email='{user_read.email}' already exists"


async def test_login__valid_credentials__tokens_returned(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = db_user

    access_token, refresh_token = await AuthService(mocked_session).login(db_user.email, PASSWORD, CLIENT_ID, USERAGENT)

    assert access_token
    assert refresh_token


async def test_login__no_user_with_email__error_raised(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentials) as exc:
        await AuthService(mocked_session).login(db_user.email, PASSWORD, CLIENT_ID, USERAGENT)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Could not validate credentials'


async def test_login__invalid_email__error_raised(mocked_session):
    with pytest.raises(InvalidEmail) as exc:
        await AuthService(mocked_session).login('not_an_email', PASSWORD, CLIENT_ID, USERAGENT)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == 'Invalid email'


async def test_refresh_tokens__valid_old_token__new_access_token_returned(
    mocked_refresh_token_dao, mocked_session, db_refresh_token, new_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token
    mocked_refresh_token_dao.add.return_value = new_db_refresh_token

    access_token, refresh_token = await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN, CLIENT_ID, USERAGENT)

    assert access_token
    assert refresh_token == REFRESH_TOKEN


async def test_refresh_tokens__old_about_to_expire__new_refresh_token_returned(
    mocked_refresh_token_dao, mocked_session, db_refresh_token, new_db_refresh_token
):
    db_refresh_token.expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ROTATE_TOKEN_EXPIRE_DELTA - 10)
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token
    mocked_refresh_token_dao.add.return_value = new_db_refresh_token

    access_token, refresh_token = await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN, CLIENT_ID, USERAGENT)

    assert access_token
    assert refresh_token != REFRESH_TOKEN


async def test_refresh_tokens__invalid_token__error_raised(mocked_refresh_token_dao, mocked_session):
    mocked_refresh_token_dao.find_one_or_none.return_value = None

    with pytest.raises(RefreshTokenRevoked) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN, CLIENT_ID, USERAGENT)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Refresh token revoked'


async def test_refresh_tokens__bad_refresh_token__error_raised(
    mocked_refresh_token_dao, mocked_session, expired_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = expired_db_refresh_token

    with pytest.raises(TokenExpired) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN, CLIENT_ID, USERAGENT)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Token expired'


async def test_refresh_tokens__revoked_token__error_raised(
    mocked_refresh_token_dao, mocked_session, revoked_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = revoked_db_refresh_token

    with pytest.raises(RefreshTokenRevoked) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN, CLIENT_ID, USERAGENT)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Refresh token revoked'


async def test_logout__valid_token__token_revoked(
    mocked_refresh_token_dao, mocked_session, user_read, db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token

    await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    refresh_token = RefreshTokenFromDB(
        token_hash=TokenProvider.hash_refresh_token(REFRESH_TOKEN),
        user_id=user_read.id,
    )
    mocked_refresh_token_dao.update.assert_awaited_once_with(refresh_token, TokenUpdate(replaced_by=None))


async def test_logout__not_existing_token__error_raised(mocked_refresh_token_dao, mocked_session, user_read):
    mocked_refresh_token_dao.find_one_or_none.return_value = None

    with pytest.raises(RefreshTokenNotFound) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == f'Token {REFRESH_TOKEN} not found'


async def test_logout__expired_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, expired_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = expired_db_refresh_token

    with pytest.raises(TokenExpired) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Token expired'


async def test_logout__belong_to_other_user_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, db_refresh_token
):
    db_refresh_token.user_id = generate_uuid7()
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token

    with pytest.raises(TokenForbidden) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == f'Token {REFRESH_TOKEN} forbidden'


async def test_logout__revoked_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, revoked_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = revoked_db_refresh_token

    with pytest.raises(TokenRevoked) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == f'Token {REFRESH_TOKEN} revoked'
