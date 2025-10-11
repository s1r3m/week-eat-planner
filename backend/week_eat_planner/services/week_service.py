from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.db.week_dao import WeekDAO


class WeekService:
    """Service layer for handling week-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._week_dao = WeekDAO(session)

    async def create_week_with_slots(self, user: db_model.User, name: str) -> db_model.Week:
        """Creates a new week with its initial meal slots for a user.

        This now builds the object graph in memory and persists it in one go,
        relying on the relationship's cascade behavior.

        Args:
            user: The user for whom to create the week.
            name: The name of the week.

        Returns:
            The newly created Week object, with its slots attached.
        """
        logger.info(f'Creating a new week named "{name}" for user {user.id}.')
        new_week = db_model.Week(user_id=user.id, name=name)
        new_week.meal_slots = [
            db_model.MealSlot(day_of_week=d, meal_type=m) for d in db_model.DayOfWeek for m in db_model.MealType
        ]
        week = await self._week_dao.add(new_week)
        logger.info(f'Successfully created week {week.id} and initialized its meal slots.')
        return week

    async def get_week(self, week_id: str | UUID, for_update: bool = False) -> db_model.Week | None:
        """Retrieves a single week by its ID.

        Args:
            week_id: The ID of the week to retrieve.
            for_update: Whether to lock the database row for update.

        Returns:
            The Week object if found, otherwise None.
        """
        logger.info(f'Retrieving week {week_id} {for_update=}.')
        week = await self._week_dao.get_one_or_none(id=week_id, for_update=for_update)
        logger.info(f'Successfully retrieved week {week_id}.')
        return week

    async def get_weeks(
        self, user: db_model.User, load_slots: bool = False, load_recipes: bool = False
    ) -> list[db_model.Week]:
        """Retrieves all weeks for a specific user.

        Args:
            user: The user whose weeks to retrieve.
            load_slots: If True, eagerly loads the meal slots for each week.
            load_recipes: If True, eagerly loads the recipes for each meal slot.

        Returns:
            A list of the user's weeks.
        """
        logger.info(f'Retrieving all weeks for user {user.id}.')
        weeks = await self._week_dao.find_all(user_id=user.id)
        logger.info(f'Successfully retrieved {len(weeks)} weeks for user {user.id}.')
        return weeks

    async def update_week(self, week: db_model.Week, new_data: schema.WeekUpdate) -> db_model.Week:
        """Updates the details of a specific week.

        Args:
            week: The week to be updated.
            new_data: The new data for the week.

        Returns:
            The updated Week object.
        """
        logger.info(f'Updating week {week.id} with {new_data}.')
        updated_week = await self._week_dao.update(week, new_data)
        logger.info(f'Successfully updated week {week.id}.')
        return updated_week

    async def delete_week(self, week: db_model.Week) -> None:
        """Deletes a specific week.

        Args:
            week: The week to be deleted.
        """
        logger.info(f'Deleting week {week.id} for user {week.user_id}.')
        await self._week_dao.delete(week)
        logger.info(f'Successfully deleted week {week.id}.')
