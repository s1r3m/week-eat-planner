from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select

from week_eat_planner.api.schemas import UserShow
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import Meal, User, Week


class MealDAO(BaseDAO):
    model = Meal


class UserDAO(BaseDAO):
    model = User

    async def create_user(self, email: str, hashed_password: str) -> User:
        logger.debug(f'Creating user with {email=}')
        user = User(email=email, hashed_password=hashed_password)
        self._session.add(user)
        await self._session.flush()
        logger.info(f'User with {email=} has been successfully created')

        return user


class WeekDAO(BaseDAO):
    model = Week

    async def get_weeks_by_user(self, user: UserShow) -> list[Week]:
        logger.debug(f'Getting weeks to {user=}')
        try:
            query = select(self.model).filter_by(user_id=user.id)
            result = await self._session.execute(query)
            records = result.scalars().all()
            logger.info(f'Found {len(records)} Weeks with filter user_id={user.id}')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting weeks by filter user_id={user.id}: {exc}')
            raise exc

        return list(records)
