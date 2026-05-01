from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from tests.constants import HASHED_REFRESH_TOKEN, PASSWORD, REFRESH_TOKEN

from week_eat_planner.api.schemas import RefreshTokenFromDB, TokenUpdate, UserCreate
from week_eat_planner.api.schemas.user import GoogleCode, OAuthUserData
from week_eat_planner.config import settings
from week_eat_planner.constants import OAuthProvider
from week_eat_planner.db.models import RefreshToken
from week_eat_planner.exceptions import (
    InvalidCredentialsException,
    InvalidEmailException,
    OAuthAccountException,
    PasswordAccountException,
    RefreshTokenNotFoundException,
    RefreshTokenRevokedException,
    TokenExpiredException,
    TokenForbidden,
    TokenRevokedException,
    UserAlreadyExistsException,
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
        expires_at=datetime.now(UTC) + timedelta(minutes=settings.REFRESH_TOKEN_TTL),
    )
    token.user = user_read
    return token


@pytest.fixture
def new_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        id=generate_uuid7(),
        token_hash='some_hash',
        user_id=user_read.id,
        expires_at=datetime.now(UTC) + timedelta(minutes=settings.REFRESH_TOKEN_TTL),
    )


@pytest.fixture
def expired_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        token_hash=HASHED_REFRESH_TOKEN,
        user_id=user_read.id,
        expires_at=datetime.now(UTC) - timedelta(minutes=5),
    )


@pytest.fixture
def revoked_db_refresh_token(user_read) -> RefreshToken:
    return RefreshToken(
        token_hash=HASHED_REFRESH_TOKEN,
        user_id=user_read.id,
        expires_at=datetime.now(UTC) + timedelta(minutes=10),
        revoked=True,
    )


@pytest.fixture
def mock_httpx_client() -> AsyncMock:
    return AsyncMock()


async def test_register_user__valid_email__user_returned(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none.return_value = None
    mocked_user_dao.add.return_value = user_read

    user = await AuthService(mocked_session).register_user(
        UserCreate(email=user_read.email, password=PASSWORD, username=user_read.username)
    )

    assert user == user_read


async def test_register_user__user_exists__error_raised(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none.return_value = user_read

    with pytest.raises(UserAlreadyExistsException) as exc:
        await AuthService(mocked_session).register_user(
            UserCreate(email=user_read.email, password=PASSWORD, username=user_read.username)
        )

    error = UserAlreadyExistsException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_login__valid_credentials__tokens_returned(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = db_user

    access_token, refresh_token = await AuthService(mocked_session).login(db_user.email, PASSWORD)

    assert access_token
    assert refresh_token


async def test_login__no_user_with_email__error_raised(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentialsException) as exc:
        await AuthService(mocked_session).login(db_user.email, PASSWORD)

    error = InvalidCredentialsException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_login__invalid_email__error_raised(mocked_session):
    bad_email = 'not_an_email'

    with pytest.raises(InvalidEmailException) as exc:
        await AuthService(mocked_session).login(bad_email, PASSWORD)

    error = InvalidEmailException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_login__oauth_account_no_password__error_raised(mocked_user_dao, mocked_session, db_user):
    db_user.hashed_password = None
    mocked_user_dao.find_one_or_none.return_value = db_user

    with pytest.raises(OAuthAccountException) as exc:
        await AuthService(mocked_session).login(db_user.email, PASSWORD)

    error = OAuthAccountException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


@pytest.fixture
def mocked_google_auth_client(mocker) -> AsyncMock:
    client_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.GoogleAuthClient', return_value=client_mock)
    return client_mock


@pytest.fixture
def oauth_user_data() -> OAuthUserData:
    return OAuthUserData(
        oauth_provider=OAuthProvider.GOOGLE,
        oauth_id='google-sub-123',
        email='oauth@example.com',
        username='OAuth User',
        avatar_url='https://example.com/avatar.jpg',
    )


async def test_login_with_google__existing_user__tokens_returned(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    mocked_user_dao.find_one_or_none.return_value = db_user

    access_token, refresh_token = await AuthService(mocked_session).login_with_google(
        GoogleCode(code='auth_code'), AsyncMock()
    )

    assert access_token
    assert refresh_token


async def test_login_with_google__new_user__user_created_and_tokens_returned(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client, mock_httpx_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    mocked_user_dao.find_one_or_none.side_effect = [None, None]
    mocked_user_dao.add.return_value = db_user

    access_token, refresh_token = await AuthService(mocked_session).login_with_google(
        GoogleCode(code='auth_code'), mock_httpx_client
    )

    assert access_token
    assert refresh_token
    mocked_user_dao.add.assert_awaited_once()


async def test_login_with_google__email_registered_with_password__error_raised(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client, mock_httpx_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    mocked_user_dao.find_one_or_none.side_effect = [None, db_user]

    with pytest.raises(PasswordAccountException) as exc:
        await AuthService(mocked_session).login_with_google(GoogleCode(code='auth_code'), mock_httpx_client)

    error = PasswordAccountException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_refresh_tokens__valid_old_token__new_access_token_returned(
    mocked_refresh_token_dao, mocked_session, db_refresh_token, new_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token
    mocked_refresh_token_dao.add.return_value = new_db_refresh_token

    access_token, refresh_token = await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN)

    assert access_token
    assert refresh_token == REFRESH_TOKEN


async def test_refresh_tokens__old_about_to_expire__new_refresh_token_returned(
    mocked_refresh_token_dao, mocked_session, db_refresh_token, new_db_refresh_token
):
    db_refresh_token.expires_at = datetime.now(UTC) + timedelta(minutes=settings.ROTATE_TOKEN_EXPIRE_DELTA - 10)
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token
    mocked_refresh_token_dao.add.return_value = new_db_refresh_token

    access_token, refresh_token = await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN)

    assert access_token
    assert refresh_token != REFRESH_TOKEN


async def test_refresh_tokens__invalid_token__error_raised(mocked_refresh_token_dao, mocked_session):
    mocked_refresh_token_dao.find_one_or_none.return_value = None

    with pytest.raises(RefreshTokenRevokedException) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN)

    error = RefreshTokenRevokedException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_refresh_tokens__bad_refresh_token__error_raised(
    mocked_refresh_token_dao, mocked_session, expired_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = expired_db_refresh_token

    with pytest.raises(TokenExpiredException) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN)

    error = TokenExpiredException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_refresh_tokens__revoked_token__error_raised(
    mocked_refresh_token_dao, mocked_session, revoked_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = revoked_db_refresh_token

    with pytest.raises(RefreshTokenRevokedException) as exc:
        await AuthService(mocked_session).refresh_tokens(REFRESH_TOKEN)

    error = RefreshTokenRevokedException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_logout__valid_token__token_revoked(
    mocked_refresh_token_dao, mocked_session, user_read, db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token

    await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    refresh_token = RefreshTokenFromDB(
        token_hash=TokenProvider.hash_refresh_token(REFRESH_TOKEN),
        user_id=user_read.id,
    )
    mocked_refresh_token_dao.update.assert_awaited_once_with(refresh_token, TokenUpdate(revoked=True, replaced_by=None))


async def test_logout__not_existing_token__error_raised(mocked_refresh_token_dao, mocked_session, user_read):
    mocked_refresh_token_dao.find_one_or_none.return_value = None

    with pytest.raises(RefreshTokenNotFoundException) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    error = RefreshTokenNotFoundException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_logout__expired_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, expired_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = expired_db_refresh_token

    with pytest.raises(TokenExpiredException) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    error = TokenExpiredException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_logout__belong_to_other_user_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, db_refresh_token
):
    db_refresh_token.user_id = generate_uuid7()
    mocked_refresh_token_dao.find_one_or_none.return_value = db_refresh_token

    with pytest.raises(TokenForbidden) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    error = TokenForbidden()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_logout__revoked_token__error_raised(
    mocked_refresh_token_dao, mocked_session, user_read, revoked_db_refresh_token
):
    mocked_refresh_token_dao.find_one_or_none.return_value = revoked_db_refresh_token

    with pytest.raises(TokenRevokedException) as exc:
        await AuthService(mocked_session).logout(user_read, REFRESH_TOKEN)

    error = TokenRevokedException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
