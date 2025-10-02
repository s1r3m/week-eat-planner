from uuid import UUID

from loguru import logger
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from uuid_utils import uuid7

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class WeekDAO(BaseDAO):
    """Data Access Object for managing weeks."""

    model = db_model.Week

    async def create_week(self, user: db_model.User, name: str) -> db_model.Week:
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
        week_id = UUID(str(uuid7()))
        week = db_model.Week(id=week_id, user_id=user.id, name=name)
        try:
            self._session.add(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating week for {user}: {exc}')
            raise exc

        logger.info(f'Week {week} has been successfully created.')
        return week

    async def get_weeks(self, user: db_model.User) -> list[db_model.Week]:
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

    async def get_week(self, week_id: str | UUID, for_update: bool = False) -> db_model.Week | None:
        """Retrieves a specific week by its ID, including its meal slots.

        Args:
            week_id: The ID of the week to retrieve.
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.

        Returns:
            The Week object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Getting week with {week_id=}.')
        record = await self._get_one_or_none(
            id=str(week_id), for_update=for_update, options=[selectinload(self.model.meal_slots)]
        )
        return record

    async def update_week(self, week: db_model.Week, new_data: schema.WeekUpdate) -> db_model.Week:
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
            week.name = new_data.name
            self._session.add(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating week {week}: {exc}')
            raise exc
        return week

    async def delete_week(self, week: db_model.Week) -> None:
        """Deletes a week and its associated meal slots via ORM cascade.

        Args:
            week: The Week object to delete.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Deleting {week=}.')
        try:
            await self._session.delete(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {week=}: {exc}')
            raise exc

        logger.info(f'Week {week} has been successfully deleted.')
        return None
