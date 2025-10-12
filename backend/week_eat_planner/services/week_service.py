from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import UserID, UserOut, WeekOut, WeekPreviewOut, WeekUpdate
from week_eat_planner.db.dao import WeekDAO
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Week


class WeekService:
    """Service layer for handling week-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._week_dao = WeekDAO(session)

    async def create_week_with_slots(self, user: UserOut, name: str) -> WeekPreviewOut:
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
        new_week = Week(user_id=user.id, name=name)
        new_week.meal_slots = [
            MealSlot(day_of_week=day, meal_type=meal_type) for day in DayOfWeek for meal_type in MealType
        ]
        week = await self._week_dao.add(new_week)
        logger.info(f'Successfully created week {week.id} and initialized its meal slots.')
        return WeekPreviewOut.model_validate(week)

    async def get_week(self, week_id: UUID, for_update: bool = False) -> WeekOut | None:
        """Retrieves a single week by its ID.

        Args:
            week_id: The ID of the week to retrieve.
            for_update: Whether to lock the database row for update.

        Returns:
            The Week object if found.

        """
        logger.info(f'Retrieving week {week_id} {for_update=}.')
        week = await self._week_dao.find_one_or_none_by_id(obj_id=week_id, for_update=for_update)
        return WeekOut.model_validate(week) if week else None

    async def get_weeks(self, user: UserOut) -> list[WeekPreviewOut]:
        """Retrieves all weeks for a specific user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of the user's weeks.
        """
        logger.info(f'Retrieving all weeks for user {user.id}.')
        weeks = await self._week_dao.find_all(UserID(id=user.id))
        logger.info(f'Successfully retrieved {len(weeks)} weeks for user {user.id}.')

        return [WeekPreviewOut.model_validate(week) for week in weeks]

    async def update_week(self, week: WeekPreviewOut, new_data: WeekUpdate) -> WeekPreviewOut:
        """Updates the details of a specific week.

        Args:
            week: The week to be updated.
            new_data: The new data for the week.

        Returns:
            The updated Week object.
        """
        logger.info(f'Updating week {week} with {new_data}.')

        updated_week = await self._week_dao.update(WeekPreviewOut(**week.model_dump()), new_data)
        logger.info(f'Successfully updated {updated_week.id}.')
        return WeekPreviewOut.model_validate(updated_week)

    async def delete_week(self, week: WeekPreviewOut) -> None:
        """Deletes a specific week.

        Args:
        """
        logger.info(f'Deleting {week} for user {week.user_id}.')
        await self._week_dao.delete(WeekPreviewOut(**week.model_dump()))
        logger.info(f'Successfully deleted {week}.')
