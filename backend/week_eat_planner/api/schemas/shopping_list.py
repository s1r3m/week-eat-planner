from pydantic import BaseModel, ConfigDict

from week_eat_planner.api.schemas.common import WeekId
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
        items: A list of shopping list items.
    """

    items: list[ShoppingListItem]


class ShoppingListRead(ShoppingListItems, WeekId):
    """Schema for reading a shopping list, including the associated week's ID.

    Attributes:
        items: A list of shopping list items.
        week_id: The ID of the week the shopping list belongs to.
    """

    model_config = ConfigDict(from_attributes=True)


class ShoppingListUpdate(ShoppingListItems):
    """Schema for updating the items in a shopping list.

    Attributes:
        items: The updated list of shopping list items.
    """
