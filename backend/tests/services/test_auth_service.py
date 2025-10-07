from datetime import datetime, timedelta, timezone

import pytest
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest_api import EMAIL, PASSWORD
from tests.conftest_mock import REFRESH_TOKEN
from week_eat_planner.exceptions import (
    InvalidCredentials,
    InvalidEmail,
    InvalidRefreshToken,
    TokenExpired,
    TokenForbidden,
    TokenNotFound,
    TokenRevoked,
    UserAlreadyExists,
)
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.auth_service import AuthService


@pytest.fixture
def mocked_auth_service(mocked_session: AsyncSession) -> AuthService:
    return AuthService(mocked_session)


@pytest.fixture
def valid_old_token(mocker, mocked_session, db_refresh_token):
    old_token = REFRESH_TOKEN
    db_refresh_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=10)
    scalars_mock = mocker.MagicMock(return_value=db_refresh_token)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)
    return old_token


@pytest.fixture
def expired_old_token(mocker, mocked_session, db_refresh_token):
    old_token = REFRESH_TOKEN
    db_refresh_token.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    scalars_mock = mocker.MagicMock(return_value=db_refresh_token)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)
    return old_token


async def test_register_user__valid_email__user_returned(mocker, mocked_session, mocked_auth_service):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user = await mocked_auth_service.register_user(EMAIL, PASSWORD)

    assert user.email == EMAIL
    assert user.hashed_password != PASSWORD


async def test_register_user__invalid_email__error_raised(mocker, mocked_session, mocked_auth_service, db_user):
    scalars_mock = mocker.MagicMock(return_value=db_user)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.register_user(db_user.email, PASSWORD)

    assert exc.value.status_code == UserAlreadyExists.status_code
    assert exc.value.detail == UserAlreadyExists.detail


async def test_login__valid_credentials__tokens_returned(mocker, mocked_session, mocked_auth_service, db_user):
    scalars_mock = mocker.MagicMock(return_value=db_user)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    access_token, refresh_token = await mocked_auth_service.login(db_user.email, PASSWORD)

    assert access_token
    assert refresh_token


async def test_login__no_user_with_email__error_raised(mocker, mocked_session, mocked_auth_service):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.login('bad@email.com', PASSWORD)

    assert exc.value.status_code == InvalidCredentials.status_code
    assert exc.value.detail == InvalidCredentials.detail


async def test_login__invalid_email__error_raised(mocked_auth_service):
    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.login('not_email', PASSWORD)

    assert exc.value.status_code == InvalidEmail.status_code
    assert exc.value.detail == InvalidEmail.detail


async def test_refresh_tokens__valid_old_token__new_tokens_returned(mocked_auth_service, valid_old_token, db_user):
    access_token, refresh_token = await mocked_auth_service.refresh_tokens(db_user, valid_old_token)

    assert access_token
    assert refresh_token != valid_old_token


async def test_refresh_tokens__invalid_token__error_raised(mocker, mocked_session, mocked_auth_service, db_user):
    old_token = 'not_a_token'
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.refresh_tokens(db_user, old_token)

    assert exc.value.status_code == InvalidRefreshToken.status_code
    assert exc.value.detail == InvalidRefreshToken.detail


async def test_refresh_tokens__expired_token__error_raised(mocked_auth_service, expired_old_token, db_user):
    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.refresh_tokens(db_user, expired_old_token)

    assert exc.value.status_code == TokenExpired.status_code
    assert exc.value.detail == TokenExpired.detail


async def test_logout__valid_token__token_revoked(mocked_auth_service, valid_old_token, db_user, db_refresh_token):
    await mocked_auth_service.logout(db_user, valid_old_token)

    assert db_refresh_token.revoked is True


async def test_logout__not_existing_token__error_raised(
    mocker, mocked_session, mocked_auth_service, db_user, db_refresh_token
):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.logout(db_user, 'some_old_token')

    assert exc.value.status_code == TokenNotFound.status_code
    assert exc.value.detail == TokenNotFound.detail
    assert db_refresh_token.revoked is False


async def test_logout__expired_token__error_raised(mocked_auth_service, expired_old_token, db_user, db_refresh_token):
    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.logout(db_user, expired_old_token)

    assert exc.value.status_code == TokenExpired.status_code
    assert exc.value.detail == TokenExpired.detail
    assert db_refresh_token.revoked is False


async def test_logout__belong_to_other_user_token__error_raised(
    mocker, mocked_session, mocked_auth_service, db_user, db_refresh_token
):
    old_token = REFRESH_TOKEN
    db_refresh_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=10)
    db_refresh_token.user_id = generate_uuid7()
    scalars_mock = mocker.MagicMock(return_value=db_refresh_token)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.logout(db_user, old_token)

    assert exc.value.status_code == TokenForbidden.status_code
    assert exc.value.detail == TokenForbidden.detail
    assert db_refresh_token.revoked is False


async def test_logout__revoked_token__error_raised(
    mocker, mocked_session, mocked_auth_service, db_user, db_refresh_token
):
    old_token = REFRESH_TOKEN
    db_refresh_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=10)
    db_refresh_token.revoked = True
    scalars_mock = mocker.MagicMock(return_value=db_refresh_token)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    with pytest.raises(HTTPException) as exc:
        await mocked_auth_service.logout(db_user, old_token)

    assert exc.value.status_code == TokenRevoked.status_code
    assert exc.value.detail == TokenRevoked.detail
    assert db_refresh_token.revoked is True
