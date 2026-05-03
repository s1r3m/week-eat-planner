"""Service layer for user-related business logic."""

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email
from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.api.schemas.user import UserRead, UserUpdate
from week_eat_planner.db.dao import UserDAO
from week_eat_planner.db.models.user import User
from week_eat_planner.exceptions import InvalidCredentialsException
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
        logger.debug(f'Updating user {user.id} with {values}')
        updated_user = await self._user_dao.update(RecordId(id=user.id), values)
        logger.debug(f'User {user.id} was successfully updated')
        return updated_user
