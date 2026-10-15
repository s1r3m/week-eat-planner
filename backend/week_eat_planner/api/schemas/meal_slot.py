"""Schemas for reading meal slots and assigning or clearing their recipes."""

from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.db.models import DayOfWeek, MealType

if TYPE_CHECKING:
    from .recipe import RecipeReadMinimal


class MealSlotUpdate(BaseModel):
    """Schema for updating an existing meal slot's recipe reference.

    Attributes:
        recipe_id: The ID of the recipe to assign, or None to clear the slot.
    """

    recipe_id: str | None


class MealSlotAssign(MealSlotUpdate):
    """Schema for assigning a recipe to a meal slot.

    Attributes:
        slot_id: The ID of the meal slot to update.
    """

    slot_id: str


class MealSlotId(RecordId):
    """Schema containing only the meal slot's unique identifier."""

    model_config = ConfigDict(from_attributes=True)


class MealSlotRead(MealSlotId):
    """Meal slot response with its ID, schedule, and optional recipe preview.

    Attributes:
        day_of_week: Day of the week for this slot.
        meal_type: Meal type: breakfast, lunch, dinner, or snack.
        recipe: Assigned recipe preview, defaulting to None.
    """

    day_of_week: DayOfWeek
    meal_type: MealType
    recipe: RecipeReadMinimal | None = None
