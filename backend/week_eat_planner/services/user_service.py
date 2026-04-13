from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email
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
            The User object if found, otherwise None.

        Raises:
            InvalidCredentials: If the user is not found or is not active.
        """
        logger.info(f'Retrieving user from {token=}.')
        user = await self._user_dao.find_one_or_none(Email(email=get_email_from_token(token)))
        if not user or not user.is_active:
            logger.error(f'User not found for token {token=}.')
            raise InvalidCredentialsException()

        logger.info(f'Retrieved {user} from DB')
        return user
