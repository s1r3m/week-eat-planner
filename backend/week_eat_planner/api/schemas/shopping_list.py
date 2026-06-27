from pydantic import BaseModel

from week_eat_planner.api.schemas.recipe import Ingredient


class ShoppingListItems(BaseModel):
    """The actual structure stored in the JSONB 'items' coulmn."""

    ingredients: list[Ingredient]


class ShoppingListRead(ShoppingListItems):
    """Returns a list of ingredients to show."""

    week_name: str
