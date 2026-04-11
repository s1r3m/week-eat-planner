from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.db.models.meal_slot import DayOfWeek, MealType

if TYPE_CHECKING:
    from .recipe import RecipeReadMinimal


class MealSlotUpdate(BaseModel):
    """Schema for updating an existing meal slot's recipe reference."""

    recipe_id: str | None


class MealSlotAssign(MealSlotUpdate):
    """Schema for assigning a recipe to a meal slot."""

    slot_id: str


class MealSlotId(RecordId):
    """Schema containing only the meal slot's unique identifier."""

    model_config = ConfigDict(from_attributes=True)


class MealSlotRead(MealSlotId):
    """Schema for a meal slot representation."""

    day_of_week: DayOfWeek
    meal_type: MealType
    recipe: 'RecipeReadMinimal | None' = None
