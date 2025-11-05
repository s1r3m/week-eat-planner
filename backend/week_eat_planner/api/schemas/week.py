from uuid import UUID

from pydantic import BaseModel, ConfigDict

from week_eat_planner.db.models import DayOfWeek, MealType

from .recipe import RecipeReadMinimal


class WeekBase(BaseModel):
    """Base schema for week data."""

    name: str


class WeekCreate(WeekBase):
    """Schema for creating a new week."""

    pass


class WeekUpdate(WeekBase):
    """Schema for updating a week's data."""

    pass


class OwnerId(BaseModel):
    user_id: UUID


class WeekReadMinimal(WeekBase, OwnerId):
    """Schema for a minimal representation of a week."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MealSlotRead(BaseModel):
    """Schema for a meal slot representation."""

    id: UUID
    day_of_week: DayOfWeek
    meal_type: MealType
    recipe: RecipeReadMinimal | None = None

    model_config = ConfigDict(from_attributes=True)


class MealSlotAssign(BaseModel):
    """Schema for assigning a recipe to a meal slot."""
    slot_id: UUID
    recipe_id: UUID


class WeekRead(WeekReadMinimal):
    """Schema for a detailed representation of a week, including meal slots."""

    meal_slots: list[MealSlotRead]

    model_config = ConfigDict(from_attributes=True)
