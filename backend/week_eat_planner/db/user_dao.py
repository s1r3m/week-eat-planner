from loguru import logger
from sqlalchemy.exc import SQLAlchemyError

import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.helpers import generate_uuid7


class UserDAO(BaseDAO):
    """Data Access Object for managing users."""

    model = db_model.User

    async def insert_user(self, email: str, hashed_password: str) -> db_model.User:
        """Inserts a new user record into the database.

        Args:
            email: The email of the new user.
            hashed_password: The pre-hashed password for the new user.

        Returns:
            The created User object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Creating {self.model.__name__} record for {email=}.')
        user_id = generate_uuid7()
        user = db_model.User(id=user_id, email=email, hashed_password=hashed_password)
        try:
            self._session.add(user)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating {self.model.__name__} record for {email=}: {exc}.')
            raise exc
        logger.debug(f'{self.model.__name__} record for {email=} created successfully.')

        return user

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
        record = await self._get_one_or_none(email=email)

        return record
