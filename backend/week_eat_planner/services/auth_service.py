"""Service layer for authentication and user registration logic."""

from datetime import UTC, datetime, timedelta

from httpx import AsyncClient
from loguru import logger
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email, RefreshTokenFromDB, TokenUpdate, UserCreate, UserRead
from week_eat_planner.api.schemas.user import GoogleCode, UserFilter
from week_eat_planner.clients.google_auth_client import GoogleAuthClient
from week_eat_planner.config import settings
from week_eat_planner.db.dao import RefreshTokenDAO, UserDAO
from week_eat_planner.db.models import RefreshToken, User
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
from week_eat_planner.helpers import get_email_token
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import TokenProvider


class AuthService:
    """Service for handling authentication-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)
        self._refresh_token_dao = RefreshTokenDAO(session)

    async def register_user(self, user_data: UserCreate) -> User:
        """Registers a new user.

        Checks if a user with the given email already exists. If not, it hashes the
        password and creates a new user.

        Args:
            user_data: User data according to UserCreate.

        Returns:
            The created user object.

        Raises:
            UserAlreadyExistsException: If a user with the same email is already registered.
        """
        logger.info(f'New user registration attempt for {user_data.email=}')
        existing_user = await self._user_dao.find_one_or_none(Email(email=user_data.email))
        if existing_user:
            logger.error(f'User with {user_data.email=} already exists')
            raise UserAlreadyExistsException()

        user = User(
            email=str(user_data.email),
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
        )
        created_user = await self._user_dao.add(user)
        logger.info(f'User {user_data.email=} registered successfully')

        return created_user

    async def login(self, username: str, password: str) -> tuple[str, str]:
        """Logs a user in.

        Validates user credentials and returns access and refresh tokens upon success.

        Args:
            username: The user's email.
            password: The user's password.

        Returns:
            A tuple containing the access and refresh tokens.

        Raises:
            InvalidEmailException: If the email format is invalid.
            InvalidCredentialsException: If the user is not registered or the password is incorrect.
        """
        logger.info(f'Login attempt for user: {username}')
        try:
            email = Email(email=username)
        except ValidationError as exc:
            logger.error(f'Invalid email format for {username}: {exc}')
            raise InvalidEmailException() from exc

        db_user = await self._user_dao.find_one_or_none(email)
        if db_user and not db_user.hashed_password:
            logger.error(f'OAuth account attempted password login for {get_email_token(username)}')
            raise OAuthAccountException()
        if not (db_user and verify_password(password, str(db_user.hashed_password))):
            logger.error(f'Invalid credentials for {email}')
            raise InvalidCredentialsException()

        access_token, refresh_token, _ = await self._generate_tokens_for_user(db_user)

        logger.info(f'User {email} logged in successfully')
        return access_token, refresh_token

    async def login_with_google(self, data: GoogleCode, httpx_client: AsyncClient) -> tuple[str, str]:
        """Authenticates a user via Google OAuth 2.0 authorization code flow.

        Exchanges the authorization code for verified user identity, then either
        logs in an existing OAuth user or creates a new account. Raises an error
        if the email is already registered with a password.

        Args:
            data: The authorization code payload received from the Google consent screen.
            httpx_client: An async HTTP client passed to the Google OAuth client.

        Returns:
            A tuple of (access_token, refresh_token).

        Raises:
            PasswordAccountException: If the email from Google is already registered
                with a password account.
            OAuthAccountException: If the email was used in some other OAuth registration.
            OAuthInvalidCodeException: If Google rejects the authorization code.
            OAuthProviderException: If the Google token exchange or JWT verification fails.
        """
        logger.info('Google OAuth login attempt started')
        client = GoogleAuthClient(httpx_client)
        user_data = await client.get_oauth_user(data.code)
        db_user = await self._user_dao.find_one_or_none(
            UserFilter(oauth_provider=user_data.oauth_provider, oauth_id=user_data.oauth_id)
        )
        if not db_user:
            email_user = await self._user_dao.find_one_or_none(UserFilter(email=user_data.email))
            if email_user:
                email_token = get_email_token(user_data.email)
                if email_user.hashed_password:
                    logger.error(f'Email token={email_token} already has a password account')
                    raise PasswordAccountException()
                logger.error(f'Email token={email_token} is already registered via OAuth')
                raise OAuthAccountException()

            user = User(**user_data.model_dump())
            db_user = await self._user_dao.add(user)
            logger.info(f'Created new user via Google OAuth (token={get_email_token(user_data.email)})')
        else:
            logger.info(f'Existing Google OAuth user logged in (token={get_email_token(user_data.email)})')

        access_token, refresh_token, _ = await self._generate_tokens_for_user(db_user)
        return access_token, refresh_token

    async def refresh_tokens(self, old_refresh_token: str) -> tuple[str, str]:
        """Refreshes access and refresh tokens.

        Args:
            old_refresh_token: The raw (unhashed) refresh token to be replaced.

        Returns:
            A tuple containing the new access and refresh tokens.

        Raises:
            RefreshTokenRevokedException: If the provided token is invalid or revoked.
            TokenExpiredException: If the provided token has expired.
        """
        logger.info('Attempting to refresh tokens')
        old_token = RefreshTokenFromDB(token_hash=TokenProvider.hash_refresh_token(old_refresh_token))
        db_refresh_token = await self._refresh_token_dao.find_one_or_none(old_token)

        if not db_refresh_token or db_refresh_token.revoked:
            logger.error('Token is revoked')
            raise RefreshTokenRevokedException()

        now = datetime.now(UTC)
        if db_refresh_token.expires_at <= now:
            logger.error('Refresh token expired')
            raise TokenExpiredException()

        db_user = db_refresh_token.user
        if db_refresh_token.expires_at <= now + timedelta(minutes=settings.ROTATE_TOKEN_EXPIRE_DELTA):
            access_token, refresh_token, new_db_token = await self._generate_tokens_for_user(db_user)
            await self._refresh_token_dao.update(old_token, TokenUpdate(revoked=True, replaced_by=new_db_token.id))
        else:
            access_token = TokenProvider.create_access_token(db_user.email)
            refresh_token = old_refresh_token

        logger.info(f'Tokens for {db_user.email} refreshed successfully')
        return access_token, refresh_token

    async def _generate_tokens_for_user(self, db_user: User) -> tuple[str, str, RefreshToken]:
        """Generates access and refresh tokens for a given user.

        Args:
            db_user: The user for whom to generate tokens.

        Returns:
            A tuple containing the access and refresh tokens, and the DB refresh token instance.
        """
        access_token = TokenProvider.create_access_token(db_user.email)
        refresh_token = TokenProvider.create_refresh_token()
        now = datetime.now(UTC)
        db_refresh_token = RefreshToken(
            token_hash=TokenProvider.hash_refresh_token(refresh_token),
            user_id=db_user.id,
            expires_at=now + timedelta(days=settings.REFRESH_TOKEN_TTL),
            revoked=False,
        )
        await self._refresh_token_dao.add(db_refresh_token)

        return access_token, refresh_token, db_refresh_token

    async def logout(self, user: UserRead, raw_token: str) -> None:
        """Logs out a user by revoking their refresh token.

        Args:
            user: The user who is logging out.
            raw_token: The raw (unhashed) refresh token to revoke.

        Raises:
            RefreshTokenNotFoundException: If the refresh token does not exist.
            TokenExpiredException: If the refresh token has expired.
            TokenForbidden: If the refresh token does not belong to the user.
            TokenRevokedException: If the refresh token has already been revoked.
        """
        logger.info(f'Logout attempt for user {user.id}')
        refresh_token = RefreshTokenFromDB(
            token_hash=TokenProvider.hash_refresh_token(raw_token),
            user_id=user.id,
        )
        db_refresh_token = await self._refresh_token_dao.find_one_or_none(refresh_token)

        if not db_refresh_token:
            logger.warning(f'Attempted logout with a non-existent refresh token for user {user.id}')
            raise RefreshTokenNotFoundException()

        if db_refresh_token.expires_at <= datetime.now(UTC):
            logger.warning(f'Attempted logout with expired refresh token for user {user.id}')
            raise TokenExpiredException()

        if db_refresh_token.user_id != user.id:
            logger.warning(f'Attempted logout with refresh token that does not belong to user {user.id}')
            raise TokenForbidden()

        if db_refresh_token.revoked:
            logger.warning(f'Attempted logout with an already revoked token for user {user.id}')
            raise TokenRevokedException()

        await self._refresh_token_dao.update(refresh_token, TokenUpdate(revoked=True, replaced_by=None))
        logger.info(f'User {user.id} logged out successfully')
