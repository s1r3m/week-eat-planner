"""Service layer for shopping list related business logic."""

from decimal import Decimal
from uuid import UUID

from loguru import logger
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Ingredient, RecordId, ShoppingListItem, ShoppingListUpdate, WeekId
from week_eat_planner.constants import Unit
from week_eat_planner.db.dao import ShoppingListDAO
from week_eat_planner.db.models import Recipe, ShoppingList, Week
from week_eat_planner.exceptions import ShoppingListAlreadyExistsException, ShoppingListNotFoundException
from week_eat_planner.helpers import generate_uuid7


class ShoppingListService:
    """Service layer for handling shopping list related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        """Initializes the shopping list service.

        Args:
            session: The database session to use for database operations.
        """
        self._shopping_list_dao = ShoppingListDAO(session)

    async def create(self, week: Week) -> ShoppingList:
        """Persist a snapshot of aggregated ingredients from a week's assigned recipes.

        The week and recipe relationships must be loaded. New items start
        unchecked; the list does not automatically track subsequent recipe changes.

        Args:
            week: Week whose meal slots supply the shopping list ingredients.

        Returns:
            The newly created shopping list, possibly containing no items.

        Raises:
            ShoppingListAlreadyExistsException: If the week already has a shopping
                list, including when a concurrent insert triggers IntegrityError.
        """
        logger.info(f'Creating a shopping list for week {week.id}')
        existing_list = await self._shopping_list_dao.find_one_or_none(WeekId(week_id=week.id))
        if existing_list:
            logger.error(f'Week {week.id} already has created list {existing_list.id}')
            raise ShoppingListAlreadyExistsException(week_id=week.id)

        ingredients = await self._get_aggregated_ingredients(week)
        try:
            created = await self._shopping_list_dao.add(
                ShoppingList(
                    id=generate_uuid7(),
                    week_id=week.id,
                    items=[ing.model_dump(mode='json') for ing in ingredients],
                )
            )
        except IntegrityError as exc:
            logger.error(f'Week {week.id} already has a created list (concurrent insert)')
            raise ShoppingListAlreadyExistsException(week_id=week.id) from exc

        logger.info(f'A shopping list for week {week.id} was created')

        return created

    async def _get_aggregated_ingredients(self, week: Week) -> list[ShoppingListItem]:
        """Sum ingredients from recipes assigned to the week's meal slots.

        Skip empty slots and combine amounts by exact ingredient name and unit
        without unit conversion. Scale by slot portions divided by recipe portions;
        missing portions attributes default to one. New items are unchecked.

        Args:
            week: Week whose slots and their assigned recipe data are loaded.

        Returns:
            Aggregated shopping list items, or an empty list if no recipes are assigned.
        """
        recipe_counts: dict[Recipe, int] = {}
        for meal_slot in week.meal_slots:
            if meal_slot.recipe is None:
                continue

            slot_portions: int = getattr(meal_slot, 'portions', 1)  # TODO: implement porions
            recipe_counts[meal_slot.recipe] = recipe_counts.get(meal_slot.recipe, 0) + slot_portions

        aggregated: dict[tuple[str, Unit], Decimal] = {}
        for recipe, portions in recipe_counts.items():
            base_portions: int = getattr(recipe, 'portions', 1)  # TODO: implement portions
            scale_factor = Decimal(portions) / Decimal(base_portions)

            for ing_data in recipe.ingredients:
                ing = Ingredient.model_validate(ing_data)
                key = (ing.name, ing.unit)
                scaled_amount = ing.amount * scale_factor
                aggregated[key] = aggregated.get(key, Decimal(0)) + scaled_amount

        ingredients = [
            ShoppingListItem(name=name, unit=unit, amount=amount, checked=False)
            for (name, unit), amount in aggregated.items()
        ]
        return ingredients

    async def get_by_week(self, week: Week) -> ShoppingList:
        """Retrieves a shopping list by the associated week.

        Args:
            week: The week the shopping list belongs to.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist.
        """
        logger.info(f'Getting a shopping list read-only for week {week.id}')
        list = await self._get_shopping_list(week.id)
        return list

    async def get_by_week_for_update(self, week: Week) -> ShoppingList:
        """Retrieve a week's shopping list and lock its row for update.

        Args:
            week: Week the shopping list belongs to.

        Returns:
            The shopping list locked within the caller's transaction.

        Raises:
            ShoppingListNotFoundException: If the week has no shopping list.
        """
        logger.info(f'Getting a shopping list for update {week.id}')
        list = await self._get_shopping_list(week.id, for_update=True)
        return list

    async def _get_shopping_list(self, week_id: UUID, for_update: bool = False) -> ShoppingList:
        """Internal helper to retrieve a shopping list from the database.

        Args:
            week_id: The ID of the week the shopping list belongs to.
            for_update: Whether to lock the database row for update. Defaults to False.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist.
        """
        shopping_list = await self._shopping_list_dao.find_one_or_none(WeekId(week_id=week_id), for_update=for_update)
        if not shopping_list:
            logger.error(f'Shopping list for week {week_id} not found')
            raise ShoppingListNotFoundException(week_id=week_id)

        return shopping_list

    async def update(self, shopping_list: ShoppingList, new_items: ShoppingListUpdate) -> ShoppingList:
        """Saves the given list with new items.

        Args:
            shopping_list: The ShoppingList object to update.
            new_items: The data to update the shopping list items with.

        Returns:
            The updated ShoppingList object.
        """
        logger.info(f'Updating the shopping list {shopping_list.id} with {new_items}')
        updated_list = await self._shopping_list_dao.update(RecordId(id=shopping_list.id), new_items)
        logger.info(f'Shopping list {shopping_list.id} was updated successfully')
        return updated_list

    async def delete(self, shopping_list: ShoppingList) -> None:
        """Deletes the given list.

        Args:
            shopping_list: The shopping list to delete.
        """
        logger.info(f'Deleting the shopping list {shopping_list.id}')
        count = await self._shopping_list_dao.delete(RecordId(id=shopping_list.id))
        logger.info(f'The shopping list {shopping_list.id} deleted successgully: {count=}')
