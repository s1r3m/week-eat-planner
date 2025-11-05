from datetime import datetime, timedelta, timezone

from loguru import logger
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email, RefreshTokenFromDB, TokenUpdate, UserCreate, UserRead
from week_eat_planner.config import settings
from week_eat_planner.db.dao import RefreshTokenDAO, UserDAO
from week_eat_planner.db.models import RefreshToken, User
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
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import TokenProvider


class AuthService:
    """Service for handling authentication-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)
        self._refresh_token_dao = RefreshTokenDAO(session)

    async def register_user(self, user_data: UserCreate) -> UserRead:
        """Registers a new user.

        Checks if a user with the given email already exists. If not, it hashes the
        password and creates a new user.

        Args:
            user_data: User data according to UserCreate.

        Returns:
            The created user object.

        Raises:
            UserAlreadyExists: If a user with the same email is already registered.
        """
        logger.info(f'New user registration attempt for {user_data.email=}.')
        existing_user = await self._user_dao.find_one_or_none(Email(email=user_data.email))
        if existing_user:
            logger.error(f'User with {user_data.email=} already exists.')
            raise UserAlreadyExists

        user = User(email=str(user_data.email), hashed_password=get_password_hash(user_data.password))
        created_user = await self._user_dao.add(user)
        logger.info(f'User {user_data.email=} registered successfully.')

        return UserRead.model_validate(created_user)

    async def login(self, username: str, password: str) -> tuple[str, str]:
        """Logs a user in.

        Validates user credentials and returns access and refresh tokens upon success.

        Args:
            username: The user's email.
            password: The user's password.

        Returns:
            A tuple containing the access and refresh tokens.

        Raises:
            InvalidEmail: If the email format is invalid.
            InvalidCredentials: If the user is not registered or the password is incorrect.
        """
        logger.info(f'Login attempt for user: {username}.')
        try:
            email = Email(email=username)
        except ValidationError as exc:
            logger.error(f'Invalid email format for {username}: {exc}')
            raise InvalidEmail from exc

        db_user = await self._user_dao.find_one_or_none(email)
        if not (db_user and verify_password(password, str(db_user.hashed_password))):
            logger.error(f'Invalid credentials for {email}!')
            raise InvalidCredentials

        access_token = TokenProvider.create_access_token(username)
        refresh_token = TokenProvider.create_refresh_token()
        now = datetime.now(timezone.utc)
        db_refresh_token = RefreshToken(
            token_hash=TokenProvider.hash_refresh_token(refresh_token),
            user_id=db_user.id,
            expires_at=now + timedelta(days=settings.REFRESH_TOKEN_TTL),
            revoked=False,
        )
        await self._refresh_token_dao.add(db_refresh_token)

        logger.info(f'User {email} logged in successfully.')
        return access_token, refresh_token

    async def refresh_tokens(self, user: UserRead, old_refresh_token: str) -> tuple[str, str]:
        """Refreshes access and refresh tokens.

        Args:
            user: The user requesting the token refresh.
            old_refresh_token: The raw (unhashed) refresh token to be replaced.

        Returns:
            A tuple containing the new access and refresh tokens.

        Raises:
            InvalidRefreshToken: If the provided token is invalid or revoked.
            TokenExpired: If the provided token has expired.
        """
        logger.info(f'Attempting to refresh tokens for {user}.')
        old_token = RefreshTokenFromDB(
            token_hash=TokenProvider.hash_refresh_token(old_refresh_token),
            user_id=user.id,
        )
        db_refresh_token = await self._refresh_token_dao.find_one_or_none(old_token)

        if not db_refresh_token or db_refresh_token.revoked:
            logger.error(f'Invalid refresh token provided for {user}.')
            raise InvalidRefreshToken

        if db_refresh_token.expires_at <= datetime.now(timezone.utc):
            logger.error(f'Refresh token expired for {user}.')
            raise TokenExpired

        access_token = TokenProvider.create_access_token(user.email)
        refresh_token = TokenProvider.create_refresh_token()
        now = datetime.now(timezone.utc)
        rt_instance = RefreshToken(
            token_hash=TokenProvider.hash_refresh_token(refresh_token),
            user_id=user.id,
            expires_at=now + timedelta(days=settings.REFRESH_TOKEN_TTL),
            revoked=False,
        )
        new_db_token = await self._refresh_token_dao.add(rt_instance)
        await self._refresh_token_dao.update(old_token, TokenUpdate(replaced_by=new_db_token.id))

        logger.info(f'Tokens for {user} refreshed successfully.')
        return access_token, refresh_token

    async def logout(self, user: UserRead, raw_token: str) -> None:
        """Logs out a user by revoking their refresh token.

        Args:
            user: The user who is logging out.
            raw_token: The raw (unhashed) refresh token to revoke.

        Raises:
            TokenNotFound: If the refresh token does not exist.
            TokenExpired: If the refresh token has expired.
            TokenForbidden: If the refresh token does not belong to the user.
            TokenRevoked: If the refresh token has already been revoked.
        """
        logger.info(f'Logout attempt for {user}.')
        refresh_token = RefreshTokenFromDB(
            token_hash=TokenProvider.hash_refresh_token(raw_token),
            user_id=user.id,
        )
        db_refresh_token = await self._refresh_token_dao.find_one_or_none(refresh_token)

        if not db_refresh_token:
            logger.warning(f'Attempted logout with a non-existent refresh token for {user}.')
            raise TokenNotFound

        if db_refresh_token.expires_at <= datetime.now(timezone.utc):
            logger.warning(f'Attempted logout with expired refresh token for {user}.')
            raise TokenExpired

        if db_refresh_token.user_id != user.id:
            logger.warning(f'Attempted logout with refresh token that does not belong to user {user}.')
            raise TokenForbidden

        if db_refresh_token.revoked:
            logger.warning(f'Attempted logout with an already revoked token for user {user}.')
            raise TokenRevoked

        await self._refresh_token_dao.update(refresh_token, TokenUpdate(replaced_by=None))
        logger.info(f'{user} logged out successfully.')
        return
