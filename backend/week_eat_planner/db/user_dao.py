from loguru import logger

import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class UserDAO(BaseDAO):
    """Data Access Object for managing users."""

    model = db_model.User

    async def get_user_by_email(self, email: str) -> db_model.User | None:
        """Retrieves a user record by its email address.

        Args:
            email: The email of the user to retrieve.

        Returns:
            The User object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Querying for {self.model.__name__} record with {email=}.')
        record = await self.get_one_or_none(email=email)

        return record
