from typing import Any

from loguru import logger
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class WeekDAO(BaseDAO):
    """Data Access Object for managing weeks."""

    model = db_model.Week

    async def find_all(self, **filter_by: Any) -> list[db_model.Week]:
        """Retrieves all week records for a given user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of Week objects.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Querying for {self.model.__name__} records with {filter_by}.')
        try:
            query = select(self.model).filter_by(**filter_by)
            result = await self._session.execute(query)
            records = result.scalars().all()
            logger.debug(f'Found {len(records)} {self.model.__name__} records with {filter_by}.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} records with {filter_by}: {exc}.')
            raise exc

        return list(records)
