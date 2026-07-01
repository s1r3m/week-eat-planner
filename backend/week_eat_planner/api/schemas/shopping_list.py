from pydantic import BaseModel

from week_eat_planner.api.schemas.recipe import Ingredient


class ShoppingListItem(Ingredient):
    """Represents an item in a shopping list, extending Ingredient with a checked status.

    Attributes:
        checked: Whether the item has been marked as bought/acquired.
    """

    checked: bool


class ShoppingListItems(BaseModel):
    """The collection of ingredients stored in the shopping list.

    Attributes:
        ingredients: A list of shopping list items.
    """

    ingredients: list[ShoppingListItem]


class ShoppingListRead(ShoppingListItems):
    """Schema for reading a shopping list, including the associated week's name.

    Attributes:
        week_name: The name of the week this shopping list belongs to.
    """

    week_name: str


class ShoppingListUpdate(ShoppingListItems):
    """Schema for updating the items in a shopping list."""
