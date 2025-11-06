from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import (
    OwnerId,
    UserRead,
    WeekCreate,
    WeekRead,
    WeekReadMinimal,
    WeekUpdate,
)
from week_eat_planner.db.dao import MealSlotDAO, RecipeDAO, WeekDAO
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Week
from week_eat_planner.exceptions import WeekForbidden, WeekNotFound


class WeekService:
    """Service layer for handling week-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._meal_slot_dao = MealSlotDAO(session)
        self._recipe_dao = RecipeDAO(session)
        self._week_dao = WeekDAO(session)

    async def create_week_with_slots(self, user: UserRead, week_data: WeekCreate) -> WeekReadMinimal:
        """Creates a new week with its initial meal slots for a user.

        This now builds the object graph in memory and persists it in one go,
        relying on the relationship's cascade behavior.

        Args:
            user: The user for whom to create the week.
            week_data: The data for the new week.

        Returns:
            The newly created Week object, with its slots attached.
        """
        logger.info(f'Creating a new week named "{week_data.name}" for user {user.id}.')
        new_week = Week(user_id=user.id, name=week_data.name)
        new_week.meal_slots = [
            MealSlot(day_of_week=day, meal_type=meal_type) for day in DayOfWeek for meal_type in MealType
        ]
        week = await self._week_dao.add(new_week)
        logger.info(f'Successfully created week {week.id} and initialized its meal slots.')
        return WeekReadMinimal.model_validate(week)

    async def get_week_for_user(self, week_id: str, user: UserRead, for_update: bool) -> WeekRead:
        """Retrieves a single week by its ID.

        Args:
            week_id: The ID of the week to retrieve.
            user: The user for whom to retrieve the week.
            for_update: Whether to lock the database row for update.

        Returns:
            The Week object if found.

        """
        logger.info(f'Retrieving week {week_id} {for_update=}.')
        try:
            week_uuid = UUID(week_id)
        except ValueError:
            logger.error(f'Invalid recipe ID -- not UUID: {week_id}')
            raise WeekNotFound

        week = await self._week_dao.find_one_or_none_by_id(week_uuid, for_update=for_update)
        if not week:
            logger.error(f'Week {week_uuid} does not exist.')
            raise WeekNotFound

        if week.user_id != user.id:
            logger.error(f'The week {week_uuid} is not owned by {user.id}.')
            raise WeekForbidden

        return WeekRead.model_validate(week)

    async def get_weeks(self, user: UserRead) -> list[WeekReadMinimal]:
        """Retrieves all weeks for a specific user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of the user's weeks.
        """
        logger.info(f'Retrieving all weeks for user {user.id}.')
        weeks = await self._week_dao.find_all(OwnerId(user_id=user.id))
        logger.info(f'Successfully retrieved {len(weeks)} weeks for user {user.id}.')

        return [WeekReadMinimal.model_validate(week) for week in weeks]

    async def update_week(self, week: WeekReadMinimal, new_data: WeekUpdate) -> WeekReadMinimal:
        """Updates the details of a specific week.

        Args:
            week: The week to be updated.
            new_data: The new data for the week.

        Returns:
            The updated Week object.
        """
        updated_week = await self._week_dao.update(week, new_data)
        logger.info(f'Successfully updated {updated_week.id}.')
        return WeekReadMinimal.model_validate(updated_week)

    async def delete_week(self, week: WeekReadMinimal) -> None:
        """Deletes a specific week.

        Args:
            week: The week to delete.
        """
        logger.info(f'Deleting {week} for user {week.user_id}.')
        await self._week_dao.delete(week)
        logger.info(f'Successfully deleted {week}.')
