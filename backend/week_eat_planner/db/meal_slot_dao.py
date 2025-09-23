import uuid

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Week


class MealSlotDAO(BaseDAO):
    """Data Access Object for managing meal slots."""

    model = MealSlot

    async def init_meal_slots_for_week(self, week: Week) -> list[MealSlot]:
        """Initializes meal slots for all days and meal types for a given week.

        Args:
            week: The week for which to create meal slots.

        Returns:
            A list of the created MealSlot objects.

        Raises:
            SQLAlchemyError: If a database error occurs during creation.
        """
        logger.debug(f'Init MealSlots for {week}.')
        slots: list[MealSlot] = []
        for day in DayOfWeek:
            for meal_type in MealType:
                slot_id = uuid.uuid4()
                slot = MealSlot(id=slot_id, week_id=week.id, day_of_week=day, meal_type=meal_type)
                try:
                    self._session.add(slot)
                    slots.append(slot)
                except SQLAlchemyError as exc:
                    logger.exception(f'Error while creating MealSlot {slot} for {week=}: {exc}')
                    raise exc

                logger.debug(f'Created MealSlot {slot}.')
        logger.info(f'MealSlots for {week} has been successfully created.')
        return slots
