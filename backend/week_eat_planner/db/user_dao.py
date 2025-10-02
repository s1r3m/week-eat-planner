from uuid import UUID

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from uuid_utils import uuid7

import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class UserDAO(BaseDAO):
    """Data Access Object for managing users."""

    model = db_model.User

    async def create_user(self, email: str, hashed_password: str) -> db_model.User:
        """Creates a new user in the database.

        Args:
            email: The email of the new user.
            hashed_password: The hashed password for the new user.

        Returns:
            The created db_model.User object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Creating user with {email=}.')
        user_id = UUID(str(uuid7()))
        user = db_model.User(id=user_id, email=email, hashed_password=hashed_password)
        try:
            self._session.add(user)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating user with {email=}: {exc}.')
            raise exc
        logger.info(f'User with {email=} has been successfully created.')

        return user

    async def get_user_by_email(self, email: str) -> db_model.User | None:
        """Retrieves a user by their email address.

        Args:
            email: The email of the user to retrieve.

        Returns:
            The User object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.info(f'Getting User by {email=}.')
        record = await self._get_one_or_none(email=email)

        return record
