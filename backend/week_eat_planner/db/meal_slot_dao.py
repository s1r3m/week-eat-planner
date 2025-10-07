from loguru import logger
from sqlalchemy.exc import SQLAlchemyError

import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.helpers import generate_uuid7


class MealSlotDAO(BaseDAO):
    """Data Access Object for managing meal slots."""

    model = db_model.MealSlot

    async def insert_initial_meal_slots_for_week(self, week: db_model.Week) -> list[db_model.MealSlot]:
        """Inserts initial meal slot records for a given week.

        Creates a meal slot for each day of the week and each meal type.

        Args:
            week: The week for which to create meal slot records.

        Returns:
            A list of the created MealSlot objects.

        Raises:
            SQLAlchemyError: If a database error occurs during insertion.
        """
        logger.debug(f'Creating initial {self.model.__name__} records for {week.id=}.')
        slots: list[db_model.MealSlot] = []
        for day in db_model.DayOfWeek:
            for meal_type in db_model.MealType:
                slot_id = generate_uuid7()
                slot = db_model.MealSlot(id=slot_id, week_id=week.id, day_of_week=day, meal_type=meal_type)
                try:
                    self._session.add(slot)
                    logger.debug(f'{slot} created successfully.')
                    slots.append(slot)
                except SQLAlchemyError as exc:
                    logger.error(f'Error while creating {self.model.__name__} record {slot} for {week.id=}: {exc}')
                    raise exc

        logger.debug(f'Successfully created {len(slots)} initial {self.model.__name__} records for {week.id=}.')
        return slots
