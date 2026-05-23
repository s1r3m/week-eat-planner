"""Service layer for user-related business logic."""

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email
from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.api.schemas.user import HashedPassword, UserRead, UserUpdate
from week_eat_planner.db.dao import UserDAO
from week_eat_planner.db.models.user import User
from week_eat_planner.exceptions import InvalidCredentialsException, OAuthAccountException, UserRemovedException
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import get_email_from_token


class UserService:
    """Service for handling user-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)

    async def get_user_by_token(self, token: str) -> User:
        """Retrieves a user based on their authentication token.

        Args:
            token: The JWT access token.

        Returns:
            The User object.

        Raises:
            InvalidCredentialsException: If the user is not found or is not active.
        """
        email = get_email_from_token(token)
        logger.info(f'Retrieving user for email={email}')
        user = await self._user_dao.find_one_or_none(Email(email=email))
        if not user or not user.is_active:
            logger.error(f'User not found for email={email}')
            raise InvalidCredentialsException()

        logger.info(f'Retrieved User(id={user.id}) from DB')
        return user

    async def update_user(self, user: UserRead, values: UserUpdate) -> User:
        """Updates a user's profile with the provided values.

        Args:
            user: The current user schema (used for ID lookup).
            values: The fields to update.

        Returns:
            The updated User model.
        """
        logger.debug(f'Updating user {user.id}')
        updated_user = await self._user_dao.update(RecordId(id=user.id), values)
        logger.debug(f'User {user.id} was successfully updated')
        return updated_user

    async def change_password(self, user_read: UserRead, old_password: str, new_password: str) -> User:
        """Changes User's password if old_password matches the hash. Sets the new_password.

        Args:
            user_read: The current user schema (used for ID lookup).
            old_password: The current password of the user.
            new_password: The new desired password.

        Returns:
            The updated User model.
        """
        logger.debug(f'Changing password for user {user_read.id}')
        user = await self._user_dao.find_one_or_none_by_id(user_read.id)
        if not user:
            msg = f'User {user_read.id} was removed somehow!'
            logger.error(msg)
            raise UserRemovedException(msg)

        if not user.hashed_password:
            logger.error(f'User {user.id} was registered with {user.oauth_provider}')
            raise OAuthAccountException()

        if not verify_password(old_password, user.hashed_password):
            msg = 'Old password does not match!'
            logger.error(msg)
            raise InvalidCredentialsException(msg)

        new_hash = get_password_hash(new_password)
        updated_user = await self._user_dao.update(RecordId(id=user.id), HashedPassword(hashed_password=new_hash))
        logger.debug('User password was changed.')
        return updated_user
