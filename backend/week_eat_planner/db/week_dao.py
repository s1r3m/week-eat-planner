import uuid

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from week_eat_planner.api.schemas import WeekUpdate
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import Week, User


class WeekDAO(BaseDAO):
    """Data Access Object for managing weeks."""

    model = Week

    async def create_week(self, user: User, name: str) -> Week:
        """Creates a new week for the given user.

        Args:
            user: The user for whom to create the week.
            name: The name of the week.

        Returns:
            The created Week object.

        Raises:
            SQLAlchemyError: If a database error occurs.
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

    async def get_weeks(self, user: User) -> list[Week]:
        """Retrieves all weeks for a given user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of Week objects.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
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
        """Retrieves a specific week by its ID, including its meal slots.

        Args:
            week_id: The ID of the week to retrieve.

        Returns:
            The Week object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
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

    async def update_week(self, week: Week, new_data: WeekUpdate) -> Week:
        """Updates a week's data.

        Args:
            week: The Week object to update.
            new_data: An object containing the new data for the week.

        Returns:
            The updated Week object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Updating week {week} with {new_data=}.')
        try:
            self._session.add(week)
            week.name = new_data.name
            await self._session.flush()
            await self._session.refresh(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating week {week}: {exc}')
            raise exc
        return week

    async def delete_week(self, week: Week) -> None:
        """Deletes a week and its associated meal slots via ORM cascade.

        Args:
            week: The Week object to delete.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Deleting {week=}.')
        try:
            self._session.add(week)
            await self._session.delete(week)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {week=}: {exc}')
            raise exc

        logger.info(f'Week {week} has been successfully deleted.')
        return None
