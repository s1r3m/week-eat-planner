from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.db.models as db_model
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.security.token_provider import get_email_from_token


class UserService:
    """Service for handling user-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self._user_dao = UserDAO(session)

    async def get_user_by_token(self, token: str) -> db_model.User | None:
        """Retrieves a user based on their authentication token.

        Args:
            token: The JWT access token.

        Returns:
            The User object if found, otherwise None.
        """
        logger.info(f'Retrieving user from {token=}.')
        email = get_email_from_token(token)
        user = await self._user_dao.get_one_or_none(email=email)

        return user
