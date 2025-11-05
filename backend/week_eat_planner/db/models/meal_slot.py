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
    """Represents a specific meal slot in a week's schedule."""

    __tablename__ = 'meal_slots'

    week_id: Mapped[UUID] = mapped_column(ForeignKey('weeks.id', ondelete='CASCADE'), nullable=False, index=True)
    day_of_week: Mapped[DayOfWeek] = mapped_column(nullable=False)
    meal_type: Mapped[MealType] = mapped_column(nullable=False)
    recipe_id: Mapped[UUID | None] = mapped_column(
        ForeignKey('recipes.id', ondelete='SET NULL'), nullable=True, unique=False
    )

    week: Mapped['Week'] = relationship(back_populates='meal_slots', lazy='joined')
    recipe: Mapped['Recipe | None'] = relationship(lazy='joined')

    __table_args__ = (UniqueConstraint('week_id', 'day_of_week', 'meal_type', name='_week_day_meal_uc'),)
