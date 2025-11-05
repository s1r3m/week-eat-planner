from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email, UserRead
from week_eat_planner.db.dao import UserDAO
from week_eat_planner.security.token_provider import get_email_from_token


class UserService:
    """Service for handling user-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self._user_dao = UserDAO(session)

    async def get_user_by_token(self, token: str) -> UserRead | None:
        """Retrieves a user based on their authentication token.

        Args:
            token: The JWT access token.

        Returns:
            The User object if found, otherwise None.
        """
        logger.info(f'Retrieving user from {token=}.')
        user = await self._user_dao.find_one_or_none(Email(email=get_email_from_token(token)))
        logger.info(f'Retrieved {user} from DB')
        if user:
            user = UserRead.model_validate(user)
        return user
