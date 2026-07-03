"""Service layer for shopping list related business logic."""

from decimal import Decimal
from uuid import UUID

from loguru import logger
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas.common import RecordId, WeekId
from week_eat_planner.api.schemas.recipe import Ingredient
from week_eat_planner.api.schemas.shopping_list import ShoppingListItem, ShoppingListUpdate
from week_eat_planner.constants import Unit
from week_eat_planner.db.dao import ShoppingListDAO
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.db.models.week import Week
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
        """Creates a shopping list for given week.

        Args:
            week: The week for which to create the shopping list.

        Returns:
            The newly created ShoppingList object.

        Raises:
            ShoppingListAlreadyExistsException: If a shopping list for the week already exists.
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
        """Aggregates all ingredients from all assigned recipes from a given week.

        Args:
            week: The week from which to aggregate ingredients.

        Returns:
            A list of ShoppingListItem objects representing the aggregated ingredients.
        """
        recipe_counts: dict[Recipe, int] = {}
        for meal_slot in week.meal_slots:
            if meal_slot.recipe_id is None:
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
            ShoppingListItem(name=name, unit=unit, amount=amount.normalize(), checked=False)
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
        """Retrieves a shopping list for updating.

        Args:
            week: The week the shopping list belongs to.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist.
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
