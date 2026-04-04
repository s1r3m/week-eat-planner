from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .recipe import Recipe
    from .week import Week


class DayOfWeek(StrEnum):
    """Enumeration for the days of the week."""

    MONDAY = 'MONDAY'
    TUESDAY = 'TUESDAY'
    WEDNESDAY = 'WEDNESDAY'
    THURSDAY = 'THURSDAY'
    FRIDAY = 'FRIDAY'
    SATURDAY = 'SATURDAY'
    SUNDAY = 'SUNDAY'


class MealType(StrEnum):
    """Enumeration for the different types of meals."""

    BREAKFAST = 'BREAKFAST'
    LUNCH = 'LUNCH'
    DINNER = 'DINNER'
    SNACK = 'SNACK'


class MealSlot(Base):
    """Represents a specific meal slot in a week's schedule.

    Attributes:
        id: The unique identifier for the meal slot.
        week_id: The ID of the week this slot belongs to.
        day_of_week: The day of the week for this slot (e.g., MONDAY).
        meal_type: The type of meal (e.g., BREAKFAST, LUNCH).
        recipe_id: The ID of the recipe assigned to this slot, if any.
        week: The SQLAlchemy relationship to the parent Week object.
        recipe: The SQLAlchemy relationship to the assigned Recipe object.
    """

    __tablename__ = 'meal_slots'

    week_id: Mapped[UUID] = mapped_column(ForeignKey('weeks.id', ondelete='CASCADE'), nullable=False, index=True)
    day_of_week: Mapped[DayOfWeek] = mapped_column(nullable=False)
    meal_type: Mapped[MealType] = mapped_column(nullable=False)
    recipe_id: Mapped[UUID] = mapped_column(ForeignKey('recipes.id', ondelete='SET NULL'), nullable=True, unique=False)

    week: Mapped['Week'] = relationship(back_populates='meal_slots', lazy='selectin')
    recipe: Mapped['Recipe'] = relationship(back_populates='meal_slots', lazy='selectin', foreign_keys=[recipe_id])

    __table_args__ = (UniqueConstraint('week_id', 'day_of_week', 'meal_type', name='_week_day_meal_uc'),)

    def __repr__(self) -> str:
        return f'MealSlot({self.id=}, {self.week_id=}, {self.day_of_week=}, {self.meal_type=}, {self.recipe_id=})'
