from typing import Any

from pydantic import BaseModel, ConfigDict, model_validator

from week_eat_planner.api.schemas.common import OwnerId, RecordId
from week_eat_planner.api.schemas.meal_slot import MealSlotRead
from week_eat_planner.db.models.meal_slot import DayOfWeek
from week_eat_planner.db.models.week import Week


class WeekBase(BaseModel):
    """Base schema for week data.

    Attributes:
        name: The name or label for the week.
    """

    name: str


class WeekCreate(WeekBase):
    """Schema for creating a new week."""

    pass


class WeekUpdate(WeekBase):
    """Schema for updating a week's data."""

    pass


class WeekReadMinimal(WeekBase, OwnerId, RecordId):
    """Schema for a minimal representation of a week."""

    model_config = ConfigDict(from_attributes=True)


class WeekRead(WeekReadMinimal):
    """Schema for a detailed representation of a week, including meal slots.

    Attributes:
        week_days: A structured list of days, each containing its assigned meal slots.
    """

    week_days: list[dict[str, DayOfWeek | list[MealSlotRead]]]

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def structure_week_days(cls, data: Week) -> dict[str, Any]:
        """Transforms flat meal_slots into structured week_days."""
        structured_slots = [
            {
                'name': day,
                'slots': [slot for slot in data.meal_slots if slot.day_of_week == day],
            }
            for day in DayOfWeek
        ]

        return {
            'id': data.id,
            'user_id': data.user_id,
            'name': data.name,
            'week_days': structured_slots,
        }
