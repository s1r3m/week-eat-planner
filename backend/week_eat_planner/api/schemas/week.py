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


class WeekDayRead(BaseModel):
    """Schema for a single day with meal_slots.

    Attributes:
        name: a day that it represents.
        slots: actual slots of the day.
    """

    name: DayOfWeek
    slots: list[MealSlotRead]


class WeekRead(WeekReadMinimal):
    """Schema for a detailed representation of a week, including meal slots.

    Attributes:
        week_days: A structured list of days, each containing its assigned meal slots.
    """

    week_days: list[WeekDayRead]

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def structure_week_days(cls, week: Week) -> dict[str, Any]:
        """Transforms flat meal_slots into structured week_days."""

        return {
            'id': week.id,
            'user_id': week.user_id,
            'name': week.name,
            'week_days': [
                {
                    'name': day,
                    'slots': [slot for slot in week.meal_slots if slot.day_of_week == day],
                }
                for day in DayOfWeek
            ],
        }
