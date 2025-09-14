import uuid

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import User


class UserDAO(BaseDAO):
    model = User

    async def create_user(self, email: str, hashed_password: str) -> User:
        logger.debug(f'Creating user with {email=}.')
        user_id = uuid.uuid4()
        user = User(id=user_id, email=email, hashed_password=hashed_password)
        self._session.add(user)
        await self._session.flush()
        logger.info(f'User with {email=} has been successfully created.')

        return user

    async def get_user_by_email(self, email: str) -> User | None:
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
