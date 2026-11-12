from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from pydantic_core import ValidationError
from tests.constants import PASSWORD

from week_eat_planner.api.schemas import UserCreate
from week_eat_planner.api.schemas.session import UserSession
from week_eat_planner.api.schemas.user import GoogleCode, OAuthUserData, UserLogin
from week_eat_planner.constants import ACTIVATION_TOKEN_TTL, OAuthProvider, PASSWORD_RESET_TOKEN_TTL
from week_eat_planner.db.models.auth import ActionToken, Session, TokenPurpose, TokenStatus
from week_eat_planner.exceptions import (
    BadActivationTokenException,
    InvalidCredentialsException,
    OAuthAccountException,
    PasswordAccountException,
    UserAlreadyExistsException,
)
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.auth_service import AuthService


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


@pytest.fixture
def mocked_session_dao(mocker) -> AsyncMock:
    session_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.SessionDAO', return_value=session_dao_mock)
    return session_dao_mock


@pytest.fixture
def mocked_token_dao(mocker) -> AsyncMock:
    token_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.ActionTokenDAO', return_value=token_dao_mock)
    return token_dao_mock


@pytest.fixture
def mocked_google_auth_client(mocker) -> AsyncMock:
    client_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.auth_service.GoogleAuthClient', return_value=client_mock)
    return client_mock


@pytest.fixture
def activation_token(db_user):
    token = TokenProvider.create_token()
    token_hash = TokenProvider.get_token_hash(token)
    expires_at = datetime.now(UTC) + timedelta(hours=ACTIVATION_TOKEN_TTL)
    db_token = ActionToken(
        user_id=db_user.id,
        hashed_token=token_hash,
        expires_at=expires_at,
        purpose=TokenPurpose.ACTIVATE_ACCOUNT,
        status=TokenStatus.ACTIVE,
        user=db_user,
    )

    return db_token, token


@pytest.fixture
def reset_password_token(db_user):
    token = TokenProvider.create_token()
    token_hash = TokenProvider.get_token_hash(token)
    expires_at = datetime.now(UTC) + timedelta(hours=PASSWORD_RESET_TOKEN_TTL)
    db_token = ActionToken(
        user_id=db_user.id,
        hashed_token=token_hash,
        expires_at=expires_at,
        purpose=TokenPurpose.RESET_PASSWORD,
        status=TokenStatus.ACTIVE,
        user=db_user,
    )

    return db_token, token


@pytest.fixture
def oauth_user_data() -> OAuthUserData:
    return OAuthUserData(
        oauth_provider=OAuthProvider.GOOGLE,
        oauth_id='google-sub-123',
        email='oauth@example.com',
        username='OAuth User',
        avatar_url='https://example.com/avatar.jpg',
    )


@pytest.fixture
def auth_session(user_read) -> Session:
    return Session(user_id=user_read.id, hashed_token='hashed_token', user=user_read)


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


async def test_login__valid_credentials__user_returned(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = db_user
    user = await AuthService(mocked_session).login(UserLogin(email=db_user.email, password=PASSWORD))
    assert user == db_user


async def test_login__no_user_with_email__error_raised(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentialsException) as exc:
        await AuthService(mocked_session).login(UserLogin(email=db_user.email, password=PASSWORD))

    error = InvalidCredentialsException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_login__invalid_email__error_raised(mocked_session):
    bad_email = 'not_an_email'

    with pytest.raises(ValidationError) as exc:
        await AuthService(mocked_session).login(UserLogin(email=bad_email, password=PASSWORD))

    assert 'An email address must have an @-sign' in str(exc.value)


async def test_login__oauth_account_no_password__error_raised(mocked_user_dao, mocked_session, db_user):
    db_user.hashed_password = None
    mocked_user_dao.find_one_or_none.return_value = db_user

    with pytest.raises(OAuthAccountException) as exc:
        await AuthService(mocked_session).login(UserLogin(email=db_user.email, password=PASSWORD))

    error = OAuthAccountException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_login_with_google__existing_user__user_returned(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    mocked_user_dao.find_one_or_none.return_value = db_user

    user = await AuthService(mocked_session).login_with_google(GoogleCode(code='auth_code'), AsyncMock())

    assert user == db_user


async def test_login_with_google__new_user__user_created_and_tokens_returned(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client, mock_httpx_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    mocked_user_dao.find_one_or_none.side_effect = [None, None]
    mocked_user_dao.add.return_value = db_user

    session_token = await AuthService(mocked_session).login_with_google(GoogleCode(code='auth_code'), mock_httpx_client)

    assert session_token
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


async def test_login_with_google__email_registered_other_oauth__error_raised(
    mocked_user_dao, mocked_session, db_user, oauth_user_data, mocked_google_auth_client, mock_httpx_client
):
    mocked_google_auth_client.get_oauth_user.return_value = oauth_user_data
    db_user.hashed_password = None
    mocked_user_dao.find_one_or_none.side_effect = [None, db_user]

    with pytest.raises(OAuthAccountException) as exc:
        await AuthService(mocked_session).login_with_google(GoogleCode(code='auth_code'), mock_httpx_client)

    error = OAuthAccountException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_logout__valid_token__token_revoked(mocked_session_dao, mocked_session, auth_session):
    await AuthService(mocked_session).logout(auth_session)

    mocked_session_dao.delete.assert_awaited_once_with(
        UserSession(user_id=auth_session.user.id, hashed_token=auth_session.hashed_token)
    )


async def test_create_activation_token__valid_user__token_created(mocked_token_dao, mocked_session, db_user):
    mocked_token_dao.find_one_or_none.return_value = None

    token = await AuthService(mocked_session).create_activation_token(db_user)

    mocked_token_dao.add.assert_awaited_once()
    assert token


async def test_create_activation_token__old_active_token_present__old_token_canceled(
    mocked_token_dao, mocked_session, db_user, activation_token
):
    db_token, old_token = activation_token
    mocked_token_dao.find_one_or_none.return_value = db_token

    token = await AuthService(mocked_session).create_activation_token(db_user)

    assert token != old_token
    mocked_token_dao.add.assert_awaited_once()
    assert db_token.status == TokenStatus.CANCELED


async def test_create_activation_token__old_redeemed_token_present__old_token_not_changed(
    mocked_token_dao, mocked_session, db_user, activation_token
):
    db_token, old_token = activation_token
    db_token.status = TokenStatus.REDEEMED
    mocked_token_dao.find_one_or_none.return_value = db_token

    token = await AuthService(mocked_session).create_activation_token(db_user)

    assert token != old_token
    mocked_token_dao.add.assert_awaited_once()
    assert db_token.status == TokenStatus.REDEEMED


async def test_activate_user_with_token__valid_token__user_activated(
    mocked_token_dao, mocked_session, activation_token, db_user
):
    db_token, token = activation_token
    mocked_token_dao.find_one_or_none.return_value = db_token

    await AuthService(mocked_session).activate_user_with_token(token)

    assert db_user.is_email_verified
    assert db_token.status == TokenStatus.REDEEMED


async def test_activate_user_with_token__no_token__error_raised(
    mocked_token_dao, mocked_session, activation_token, db_user
):
    _, token = activation_token
    mocked_token_dao.find_one_or_none.return_value = None

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_activate_user_with_token__no_user_found__error_raised(
    mocked_token_dao, mocked_session, activation_token, db_user
):
    db_token, token = activation_token
    db_token.user = None
    mocked_token_dao.find_one_or_none.return_value = db_token

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_activate_user_with_token__wrong_purpose_token__error_raised(
    mocked_token_dao, mocked_session, activation_token, db_user
):
    db_token, token = activation_token
    db_token.purpose = TokenPurpose.RESET_PASSWORD
    mocked_token_dao.find_one_or_none.return_value = db_token

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_activate_user_with_token__expired_token__error_raised(
    mocked_token_dao, mocked_session, activation_token, db_user
):
    db_token, token = activation_token
    db_token.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    mocked_token_dao.find_one_or_none.return_value = db_token

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


@pytest.mark.parametrize(
    'status',
    [
        TokenStatus.CANCELED,
        TokenStatus.REDEEMED,
    ],
)
async def test_activate_user_with_token__not_active_token__error_raised(
    mocked_token_dao, mocked_session, activation_token, db_user, status
):
    db_token, token = activation_token
    db_token.status = status
    mocked_token_dao.find_one_or_none.return_value = db_token

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_activate_user_with_token__reset_password_token__error_raised(
    mocked_token_dao, mocked_session, reset_password_token, db_user
):
    db_token, token = reset_password_token
    mocked_token_dao.find_one_or_none.return_value = db_token

    with pytest.raises(BadActivationTokenException) as exc:
        await AuthService(mocked_session).activate_user_with_token(token)

    assert not db_user.is_email_verified
    error = BadActivationTokenException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
