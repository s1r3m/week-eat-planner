import uuid

from loguru import logger

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Week


class MealSlotDAO(BaseDAO):
    model = MealSlot

    async def init_meal_slots_for_week(self, week: Week) -> None:
        logger.debug(f'Init MealSlots for {week}.')
        for day in DayOfWeek:
            for meal_type in MealType:
                slot_id = uuid.uuid4()
                slot = MealSlot(id=slot_id, week_id=week.id, day_of_week=day, meal_type=meal_type)
                self._session.add(slot)
                logger.debug(f'Created MealSlot {slot}.')
        await self._session.flush()
        logger.info(f'MealSlots for {week} has been successfully created.')
