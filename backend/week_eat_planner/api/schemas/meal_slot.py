from typing import TYPE_CHECKING
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from week_eat_planner.db.models.meal_slot import DayOfWeek, MealType

if TYPE_CHECKING:
    from .recipe import RecipeReadMinimal


class MealSlotUpdate(BaseModel):
    recipe_id: str | None


class MealSlotAssign(MealSlotUpdate):
    """Schema for assigning a recipe to a meal slot."""

    slot_id: str


class MealSlotRead(BaseModel):
    """Schema for a meal slot representation."""

    id: UUID
    day_of_week: DayOfWeek
    meal_type: MealType
    recipe: 'RecipeReadMinimal | None' = None

    model_config = ConfigDict(from_attributes=True)
