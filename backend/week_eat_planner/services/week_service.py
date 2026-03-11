from typing import NamedTuple
from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import (
    MealSlotAssign,
    OwnerId,
    UserRead,
    WeekCreate,
    WeekRead,
    WeekReadMinimal,
    WeekUpdate,
)
from week_eat_planner.api.schemas.meal_slot import MealSlotId, MealSlotUpdate
from week_eat_planner.db.dao import MealSlotDAO, RecipeDAO, WeekDAO
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Week
from week_eat_planner.exceptions import MealSlotAssignException, WeekForbidden, WeekNotFound


class ValidatedAssignments(NamedTuple):
    meal_slot: MealSlotId
    recipe: MealSlotUpdate


class WeekService:
    """Service layer for handling week-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._meal_slot_dao = MealSlotDAO(session)
        self._recipe_dao = RecipeDAO(session)
        self._week_dao = WeekDAO(session)

    async def create_week_with_slots(self, user: UserRead, week_data: WeekCreate) -> Week:
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
        return week

    async def get_week_for_user(self, week_id: str, user: UserRead, for_update: bool) -> Week:
        """Retrieves a single week by its ID.

        Args:
            week_id: The ID of the week to retrieve.
            user: The user for whom to retrieve the week.
            for_update: Whether to lock the database row for update.

        Returns:
            The Week object if found.

        Raises:
            WeekNotFound: If the week does not exist or the ID is invalid.
            WeekForbidden: If the week does not belong to the user.
        """
        logger.info(f'Retrieving week {week_id} {for_update=}.')
        try:
            week_uuid = UUID(week_id)
        except ValueError as exc:
            logger.error(f'Invalid recipe ID -- not UUID: {week_id}')
            raise WeekNotFound(week_id) from exc

        week = await self._week_dao.find_one_or_none_by_id(week_uuid, for_update=for_update)
        if not week:
            logger.error(f'Week {week_uuid} does not exist.')
            raise WeekNotFound(week_uuid)

        if week.user_id != user.id:
            logger.error(f'The week {week_uuid} is not owned by {user.id}.')
            raise WeekForbidden(week_uuid)

        return week

    async def get_weeks(self, user: UserRead) -> list[Week]:
        """Retrieves all weeks for a specific user.

        Args:
            user: The user whose weeks to retrieve.

        Returns:
            A list of the user's weeks.
        """
        logger.info(f'Retrieving all weeks for user {user.id}.')
        weeks = await self._week_dao.find_all(OwnerId(user_id=user.id))
        logger.info(f'Successfully retrieved {len(weeks)} weeks for user {user.id}.')

        return weeks

    async def update_week(self, week: WeekReadMinimal, new_data: WeekUpdate) -> Week:
        """Updates the details of a specific week.

        Args:
            week: The week to be updated.
            new_data: The new data for the week.

        Returns:
            The updated Week object.
        """
        updated_week = await self._week_dao.update(week, new_data)
        logger.info(f'Successfully updated {updated_week.id}.')
        return updated_week

    async def delete_week(self, week: WeekReadMinimal) -> None:
        """Deletes a specific week.

        Args:
            week: The week to delete.
        """
        logger.info(f'Deleting {week} for user {week.user_id}.')
        await self._week_dao.delete(week)
        logger.info(f'Successfully deleted {week}.')

    async def _validate_slot_and_recipe_data(
        self, week: WeekRead, *slots_data: MealSlotAssign
    ) -> list[ValidatedAssignments]:
        """Validate MealSlotAssigns and return valid assignments ready for update."""
        slot_errors = []
        valid_assignments = []

        logger.info(f'Starting validation for {len(slots_data)} slot assignments for week {week.id}.')
        slot_uuids = []
        recipe_uuids = []
        for data in slots_data:
            try:
                slot_uuids.append(UUID(data.slot_id))
            except ValueError:
                logger.error(f'Invalid slot ID -- not UUID: {data.slot_id}')
                slot_errors.append({**data.model_dump(), 'error': 'Invalid slot ID'})
                continue

            if data.recipe_id:
                try:
                    recipe_uuids.append(UUID(data.recipe_id))
                except ValueError:
                    logger.error(f'Invalid recipe ID -- not UUID: {data.recipe_id}')
                    slot_errors.append({**data.model_dump(), 'error': 'Invalid recipe ID'})
                    continue

        if slot_errors:
            logger.error(f'There were errors during validation: {slot_errors}.')
            raise MealSlotAssignException(slot_errors)

        logger.info('UUIDs validation complete!')
        db_meal_slots = await self._meal_slot_dao.find_many_by_ids(slot_uuids, for_update=True)
        db_recipes = await self._recipe_dao.find_many_by_ids(recipe_uuids, for_update=False)

        meal_slot_map = {str(meal_slot.id): meal_slot for meal_slot in db_meal_slots}
        recipe_map = {str(recipe.id): recipe for recipe in db_recipes}

        for slot_data in slots_data:
            db_meal_slot = meal_slot_map.get(slot_data.slot_id)
            if not db_meal_slot:
                slot_errors.append({**slot_data.model_dump(), 'error': 'Meal slot not found'})
                continue

            if db_meal_slot.week_id != week.id:
                slot_errors.append({**slot_data.model_dump(), 'error': f'Meal slot not part of week {week.id}'})
                continue

            if slot_data.recipe_id:
                db_recipe = recipe_map.get(slot_data.recipe_id)
                if not db_recipe:
                    slot_errors.append({**slot_data.model_dump(), 'error': 'Recipe not found'})
                    continue

                if not db_recipe.is_public and db_recipe.user_id != week.user_id:
                    slot_errors.append({**slot_data.model_dump(), 'error': 'Recipe not owned by user'})
                    continue

            valid_assignments.append(
                ValidatedAssignments(
                    meal_slot=MealSlotId.model_validate(db_meal_slot),
                    recipe=MealSlotUpdate(recipe_id=slot_data.recipe_id),
                )
            )

            logger.info('Validation complete!')

        if slot_errors:
            logger.error(f'There were errors during validation: {slot_errors}.')
            raise MealSlotAssignException(slot_errors)

        return valid_assignments

    async def assign_recipes_to_meal_slots(self, week: WeekRead, *slots_data: MealSlotAssign) -> list[MealSlot]:
        """Assigns recipes to meal slots in a single transaction.

        This method processes multiple recipe-to-slot assignments at once. It ensures that all
        provided data is valid—including UUID formats, existence of slots and recipes, and user
        permissions—before committing any changes to the database. The entire operation is atomic;
        if any single assignment fails validation, no changes are made.

        Args:
            week: The week containing the meal slots to be updated.
            slots_data: A variable number of `MealSlotAssign` objects, each specifying a
                `slot_id` and the `recipe_id` to be assigned.

        Returns:
            A list of `MealSlot` objects representing the newly updated meal slots.

        Raises:
            MealSlotAssignException: If there are any validation errors, containing a list
                of all the issues found.
        """
        valid_assignments = await self._validate_slot_and_recipe_data(week, *slots_data)
        logger.info(f'Updating {len(slots_data)} slots for week {week.id}.')
        updated_slots = [
            await self._meal_slot_dao.update(assignment.meal_slot, assignment.recipe)
            for assignment in valid_assignments
        ]
        logger.debug(f'Updated meal_slots {updated_slots}')
        logger.info(f'Successfully updated {len(slots_data)} slots for week {week.id}.')
        return updated_slots
