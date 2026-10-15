"""Service layer for user-related business logic."""

from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import HashedPassword, RecordId, UserUpdate
from week_eat_planner.db.dao import UserDAO
from week_eat_planner.db.models import User
from week_eat_planner.exceptions import InvalidCredentialsException, OAuthAccountException, UserNotFoundException
from week_eat_planner.security.hashing import get_password_hash, verify_password


class UserService:
    """Service for handling user-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)

    async def get_user(self, user_id: UUID) -> User:
        logger.debug(f'Retrieving user with {user_id=}')
        user = await self._user_dao.find_one_or_none_by_id(user_id)
        if not user or not user.is_active:
            logger.error(f'User not found with {user_id=}')
            raise UserNotFoundException(user_id)

        return user

    async def update_user(self, user: User, values: UserUpdate) -> User:
        """Updates a user's profile with the provided values.

        Args:
            user_id: The ID of the current user.
            values: The fields to update.

        Returns:
            The updated User model.

        Raises:
            UserNotFoundException: If the user record is missing in the database.
        """
        logger.debug(f'Updating user {user.id}')
        db_user = await self._user_dao.find_one_or_none_by_id(user.id)
        if not db_user:
            logger.error(f'User {user.id} was not found!')
            raise UserNotFoundException(user.id)

        updated_user = await self._user_dao.update(RecordId(id=user.id), values)
        logger.debug(f'User {updated_user.id} was successfully updated')
        return updated_user

    async def change_password(self, user: User, old_password: str, new_password: str) -> User:
        """Changes User's password if old_password matches the hash.

        Args:
            user_id: The ID of the current user.
            old_password: The current password of the user.
            new_password: The new desired password.

        Returns:
            The updated User model.

        Raises:
            UserNotFoundException: If the user record is missing in the database.
            OAuthAccountException: If the user is an OAuth account and has no password.
            InvalidCredentialsException: If the old password does not match.
        """
        logger.debug(f'Changing password for user {user.id}')
        db_user = await self._user_dao.find_one_or_none_by_id(user.id)
        if not db_user:
            logger.error(f'User {user.id} was not found!')
            raise UserNotFoundException(user.id)

        if not db_user.hashed_password:
            logger.error(f'User {user.id} was registered with {user.oauth_provider}')
            raise OAuthAccountException()

        if not verify_password(old_password, db_user.hashed_password):
            logger.error(f'Old password mismatch for user {user.id}')
            raise InvalidCredentialsException()

        new_hash = get_password_hash(new_password)
        updated_user = await self._user_dao.update(RecordId(id=user.id), HashedPassword(hashed_password=new_hash))
        logger.debug('User password was changed.')
        return updated_user
