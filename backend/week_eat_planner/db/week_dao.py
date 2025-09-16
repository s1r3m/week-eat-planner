import uuid

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from week_eat_planner.api.schemas import UserOut, WeekUpdate
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import Week


class WeekDAO(BaseDAO):
    model = Week

    async def create_week(self, user: UserOut, name: str) -> Week:
        """Create a new week for the given user.
        Create new days and meal slots for it.
        """
        logger.debug(f'Creating week for {user}.')
        week_id = uuid.uuid4()
        week = Week(id=week_id, user_id=user.id, name=name)
        try:
            self._session.add(week)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating week for {user}: {exc}')
            raise exc

        logger.info(f'Week {week} has been successfully created.')
        return week

    async def get_weeks(self, user: UserOut) -> list[Week]:
        logger.debug(f'Getting weeks for {user}.')
        try:
            query = select(self.model).filter_by(user_id=user.id)
            result = await self._session.execute(query)
            scalars = result.scalars()
            records = scalars.all()
            logger.info(f'Found {len(records)} Weeks with filter user_id={user.id}.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting weeks by filter user_id={user.id}: {exc}.')
            raise exc

        return list(records)

    async def get_week(self, week_id: str) -> Week | None:
        logger.debug(f'Getting week with {week_id=}.')
        try:
            query = select(self.model).filter_by(id=week_id).options(selectinload(self.model.meal_slots))
            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.info(f'Week with {week_id=} has been successfully found.')
            else:
                logger.warning(f'Week with {week_id=} not found.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while fetching week with {week_id=}: {exc}')
            raise exc

        return record

    async def update_week(self, week_id: str, new_data: WeekUpdate) -> Week:
        logger.debug(f'Updating week {week_id=} with {new_data=}.')
        try:
            query = update(self.model).filter_by(id=week_id).values(name=new_data.name)
            await self._session.execute(query)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating week {week_id=}: {exc}')
            raise exc
