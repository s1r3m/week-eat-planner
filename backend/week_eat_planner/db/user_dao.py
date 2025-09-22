import uuid

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import User


class UserDAO(BaseDAO):
    """Data Access Object for managing users."""
    model = User

    async def create_user(self, email: str, hashed_password: str) -> User:
        """Creates a new user in the database.

        Args:
            email: The email of the new user.
            hashed_password: The hashed password for the new user.

        Returns:
            The created User object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Creating user with {email=}.')
        user_id = uuid.uuid4()
        user = User(id=user_id, email=email, hashed_password=hashed_password)
        try:
            self._session.add(user)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating user with {email=}: {exc}.')
            raise exc
        logger.info(f'User with {email=} has been successfully created.')

        return user

    async def get_user_by_email(self, email: str) -> User | None:
        """Retrieves a user by their email address.

        Args:
            email: The email of the user to retrieve.

        Returns:
            The User object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.info(f'Getting User by {email=}.')
        try:
            query = select(self.model).filter_by(email=email)
            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.info(f'User with {email=}has been successfully found.')
            else:
                logger.warning(f'User with {email=} not found.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting User by {email=}: {exc}.')
            raise exc

        return record
