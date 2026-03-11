from uuid import UUID

from pydantic import BaseModel, ConfigDict

from week_eat_planner.api.schemas.meal_slot import MealSlotRead
from week_eat_planner.db.models.meal_slot import DayOfWeek


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


class WeekRead(WeekReadMinimal):
    """Schema for a detailed representation of a week, including meal slots."""

    week_days: list[dict[str, DayOfWeek | list[MealSlotRead]]]

    model_config = ConfigDict(from_attributes=True)
