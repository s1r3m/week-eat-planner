from datetime import datetime, timezone

from loguru import logger
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.db.refresh_token_dao import RefreshTokenDAO
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.exceptions import (
    InvalidCredentials,
    InvalidEmail,
    InvalidRefreshToken,
    TokenExpired,
    UserAlreadyExists,
)
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import TokenProvider


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)
        self._refresh_token_dao = RefreshTokenDAO(session)

    async def register_user(self, email: str, password: str) -> db_model.User:
        """Adds a user.

        Checks if a user with the given email already exists. If not, it hashes the
        password and creates a new user in the database.

        Args:
            email: The user email.
            password: The user's password in plain.

        Returns:
            The created user.

        Raises:
            UserAlreadyExists: If a user with the same email is already registered.
            SQLAlchemyError: If a database error occurs during the save operation.
        """
        logger.debug(f'Check if User with {email=} exists.')
        db_user = await self._user_dao.get_user_by_email(str(email))
        if db_user:
            logger.error(f'User with {email=} already exists.')
            raise UserAlreadyExists

        logger.debug(f'Create a new user with {email=}')
        hashed_password = get_password_hash(password)
        new_user = await self._user_dao.create_user(email=str(email), hashed_password=hashed_password)

        return new_user

    async def login(self, email: str, password: str) -> tuple[str, str]:
        """Login the user and return a user model.

        Validates credentials and returns a user model upon success.

        Args:
            email: The user's email.
            password: The user's password.

        Returns:
            Access and refresh tokens.

        Raises:
            InvalidEmail: If the email format is invalid.
            InvalidCredentials: If a user with the email is not registered or wrong password.
            SQLAlchemyError: If a database error occurs during the save operation.
        """
        logger.debug(f'Check if {email=} is EmailStr.')
        try:
            schema.Email(email=email)
        except ValidationError as exc:
            logger.error(f'Invalid {email=}: {exc}')
            raise InvalidEmail from exc

        db_user = await self._user_dao.get_user_by_email(email)
        if not (db_user and verify_password(password, str(db_user.hashed_password))):
            logger.error(f'Invalid credentials for {email=}!')
            raise InvalidCredentials

        access_token = TokenProvider.create_access_token(email)
        refresh_token = TokenProvider.create_refresh_token()
        await self._refresh_token_dao.save(db_user, refresh_token)

        return access_token, refresh_token

    async def refresh_tokens(self, user: db_model.User, old_refresh_token: str) -> tuple[str, str]:
        """Refreshes an access token using a refresh token.

        Args:
            user: The user requesting the token refresh.
            old_refresh_token: The raw (unhashed) refresh token to be replaced.

        Returns:
            A Tokens object with the new tokens.

        Raises:
            InvalidRefreshToken: If the provided token is invalid or revoked.
            TokenExpiredException: If the provided token has expired.
            SQLAlchemyError: If a database error occurs during the save operation.
        """
        old_hash = TokenProvider.hash_refresh_token(old_refresh_token)
        old_token = await self._refresh_token_dao.get_token_by_hash(old_hash)
        if not old_token or old_token.revoked:
            logger.error(f'Invalid refresh token in request cookies for {user}.')
            raise InvalidRefreshToken

        if old_token.expires_at <= datetime.now(timezone.utc):
            logger.error(f'Refresh token expired for {user}.')
            raise TokenExpired

        access_token = TokenProvider.create_access_token(user.email)
        refresh_token = TokenProvider.create_refresh_token()
        db_refresh_token = await self._refresh_token_dao.save(user, refresh_token)
        await self._refresh_token_dao.revoke_token(old_token, revoked_by=db_refresh_token)

        return access_token, refresh_token

    async def logout(self, user: db_model.User, raw_token: str) -> None:
        token_hash = TokenProvider.hash_refresh_token(raw_token)
        refresh_token = await self._refresh_token_dao.get_token_by_hash(token_hash)

        if not refresh_token:
            logger.warning(f'Attempted logout with a non-existent refresh token for {user}.')
            return

        if refresh_token.expires_at <= datetime.now(timezone.utc):
            logger.warning(f'Attempted logout with expired refresh token for {user}.')
            return

        if refresh_token.user_id != user.id:
            logger.warning(f'Attempted logout with refresh token that does not belong to user {user}.')
            return

        if refresh_token.revoked:
            logger.warning(f'Attempted logout with an already revoked token for user {user.email}.')
            return

        await self._refresh_token_dao.revoke_token(refresh_token, revoked_by=None)
        return
