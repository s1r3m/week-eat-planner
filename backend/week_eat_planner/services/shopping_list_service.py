"""Service layer for shopping list related business logic."""

from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.api.schemas.recipe import Ingredient
from week_eat_planner.api.schemas.shopping_list import ShoppingListItem, ShoppingListItems, ShoppingListUpdate
from week_eat_planner.constants import Unit
from week_eat_planner.db.dao import ShoppingListDAO, UserDAO
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.db.models.week import Week
from week_eat_planner.exceptions import ShoppingListNotFoundException, UserNotFoundException


class ShoppingListService:
    """Service layer for handling shopping list related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._shopping_list_dao = ShoppingListDAO(session)
        self._user_dao = UserDAO(session)

    async def create(self, week: Week, user_id: UUID) -> ShoppingList:
        """Creates a shopping list for given week.

        Args:
            week: The week for which to create the shopping list.
            user_id: The ID of the user creating the shopping list.

        Returns:
            The newly created ShoppingList object.

        Raises:
            UserNotFoundException: If the user with the given ID does not exist.
        """
        user = await self._user_dao.find_one_or_none_by_id(user_id)
        if not user:
            logger.error(f'User {user_id} not found during creating shooping list for week {week.id}')
            raise UserNotFoundException(user_id)

        ingredients = await self._get_aggregated_ingredients(week)
        items = ShoppingListItems(ingredients=ingredients)
        created = await self._shopping_list_dao.add(
            ShoppingList(week_id=week.id, user_id=user.id, items=items.model_dump()),
        )

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

        aggregated: dict[tuple[str, Unit], float] = {}
        for recipe, portions in recipe_counts.items():
            base_portions: int = getattr(recipe, 'portions', 1)  # TODO: implement portions
            scale_factor = portions / base_portions

            for ing_data in recipe.ingredients:
                ing = Ingredient.model_validate(ing_data)
                key = (ing.name, ing.unit)
                scaled_amount = ing.amount * scale_factor
                aggregated[key] = aggregated.get(key, 0.0) + scaled_amount

        ingredients = [
            ShoppingListItem(name=name, unit=unit, amount=amount, checked=False)
            for (name, unit), amount in aggregated.items()
        ]
        return ingredients

    async def get_by_id(self, list_id: str, user_id: UUID) -> ShoppingList:
        """Retrieves a shopping list by its ID.

        Args:
            list_id: The ID of the shopping list to retrieve.
            user_id: The ID of the user requesting the shopping list.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist, belongs to another user,
            or list_id is invalid.
        """
        list = await self._get_shopping_list(list_id, user_id)
        return list

    async def get_by_id_for_update(self, list_id: str, user_id: UUID) -> ShoppingList:
        """Retrieves a shopping list for updating.

        Ensures the user owns the list and locks it for update.

        Args:
            list_id: The ID of the shopping list to retrieve.
            user_id: The ID of the user requesting the shopping list for update.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist, belongs to another user,
            or list_id is invalid.
        """
        list = await self._get_shopping_list(list_id, user_id, for_update=True)
        return list

    async def _get_shopping_list(self, list_id: str, user_id: UUID, for_update: bool = False) -> ShoppingList:
        """Internal helper to retrieve a shopping list from the database.

        Args:
            list_id: The ID of the shopping list to retrieve.
            user_id: The ID of the user requesting the shopping list.
            for_update: Whether to lock the database row for update. Defaults to False.

        Returns:
            The requested ShoppingList object.

        Raises:
            ShoppingListNotFoundException: If the shopping list does not exist, belongs to another user,
            or list_id is invalid.
        """
        try:
            list_uuid = UUID(list_id)
        except (ValueError, AttributeError) as exc:
            logger.error(f'Invalid shopping list ID -- not UUID: {list_id}')
            raise ShoppingListNotFoundException(list_id=list_id) from exc

        shopping_list = await self._shopping_list_dao.find_one_or_none_by_id(list_uuid, for_update=for_update)
        if not shopping_list:
            logger.error(f'Shopping list {list_uuid} not found')
            raise ShoppingListNotFoundException(list_id=list_uuid)

        if shopping_list.user_id != user_id:
            logger.error(f'Shopping list {list_uuid} does not belong to {user_id}')
            raise ShoppingListNotFoundException(list_id=list_uuid)

        return shopping_list
