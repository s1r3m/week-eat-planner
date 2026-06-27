from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas.recipe import Ingredient
from week_eat_planner.api.schemas.shopping_list import ShoppingListItems
from week_eat_planner.constants import Unit
from week_eat_planner.db.dao import ShoppingListDAO
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.db.models.week import Week


class ShoppingListService:
    def __init__(self, session: AsyncSession) -> None:
        self._shopping_list_dao = ShoppingListDAO(session)

    async def create(self, week: Week) -> ShoppingList:
        """Creates a shopping list for given week."""
        ingredients = self._get_aggregated_ingredients(week)
        items = ShoppingListItems(ingredients=ingredients)
        created = await self._shopping_list_dao.add(ShoppingList(week_id=week.id, items=items.model_dump()))

        return created

    def _get_aggregated_ingredients(self, week: Week) -> list[Ingredient]:
        """Aggregates all ingredients from all assigned recipes from a given week."""
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

        ingredients = [Ingredient(name=name, unit=unit, amount=amount) for (name, unit), amount in aggregated.items()]
        return ingredients
