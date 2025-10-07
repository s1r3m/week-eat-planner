from uuid import UUID

from loguru import logger
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.helpers import generate_uuid7


class WeekDAO(BaseDAO):
    """Data Access Object for managing weeks."""

    model = db_model.Week

    async def insert_week(self, user: db_model.User, name: str) -> db_model.Week:
        """Inserts a new week record into the database.

        Args:
            user: The user for whom to create the week.
            name: The name of the week.

        Returns:
            The created Week object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Creating {self.model.__name__} record with {name=}.')
        week_id = generate_uuid7()
        week = db_model.Week(id=week_id, user_id=user.id, name=name)
        try:
            self._session.add(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating {self.model.__name__} record for {user.id=}: {exc}')
            raise exc

        logger.debug(f'{self.model.__name__} {week.id} created successfully.')
        return week

    async def get_all_weeks_by_user(self, user: db_model.User) -> list[db_model.Week]:
        """Retrieves all week records for a given user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of Week objects.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Querying for {self.model.__name__} records with filter {user.id=}.')
        try:
            query = select(self.model).filter_by(user_id=user.id)
            result = await self._session.execute(query)
            records = result.scalars().all()
            logger.debug(f'Found {len(records)} {self.model.__name__} records for {user.id=}.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} records by filter {user.id=}: {exc}.')
            raise exc

        return list(records)

    async def get_week_by_id(self, week_id: str | UUID, for_update: bool) -> db_model.Week | None:
        """Retrieves a specific week record by its ID, including its meal slots.

        Args:
            week_id: The ID of the week to retrieve.
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.

        Returns:
            The Week object if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Querying for {self.model.__name__} record with {week_id=}.')
        record = await self._get_one_or_none(
            id=str(week_id), for_update=for_update, options=[selectinload(self.model.meal_slots)]
        )
        return record

    async def update_week(self, week: db_model.Week, new_data: schema.WeekUpdate) -> db_model.Week:
        """Updates a week's data in the database.

        Args:
            week: The Week object to update.
            new_data: An object containing the new data for the week.

        Returns:
            The updated Week object.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Updating {self.model.__name__} record {week.id} with {new_data}.')
        try:
            week.name = new_data.name
            self._session.add(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating {self.model.__name__} record {week.id}: {exc}')
            raise exc
        return week

    async def delete_week(self, week: db_model.Week) -> None:
        """Deletes a week record and its associated meal slots via ORM cascade.

        Args:
            week: The Week object to delete.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Deleting {self.model.__name__} record {week.id}.')
        try:
            await self._session.delete(week)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {self.model.__name__} record {week.id}: {exc}')
            raise exc

        logger.debug(f'{self.model.__name__} record {week.id} has been successfully deleted.')
        return None
