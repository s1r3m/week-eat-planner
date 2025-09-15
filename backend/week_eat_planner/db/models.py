from enum import StrEnum
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    weeks: Mapped[list['Week']] = relationship(back_populates='user')
    recipes: Mapped[list['Recipe']] = relationship(back_populates='user')

    def __repr__(self) -> str:
        return f'User({self.id=}, {self.email=}, {self.is_active=}'


class Recipe(Base):
    __tablename__ = 'recipes'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=False)
    user: Mapped['User'] = relationship(back_populates='recipes')

    def __repr__(self) -> str:
        return f'Recipe({self.id=}, {self.name=}, {self.user_id=})'


class DayOfWeek(StrEnum):
    MONDAY = 'MONDAY'
    TUESDAY = 'TUESDAY'
    WEDNESDAY = 'WEDNESDAY'
    THURSDAY = 'THURSDAY'
    FRIDAY = 'FRIDAY'
    SATURDAY = 'SATURDAY'
    SUNDAY = 'SUNDAY'


class MealType(StrEnum):
    BREAKFAST = 'BREAKFAST'
    LUNCH = 'LUNCH'
    DINNER = 'DINNER'
    SNACK = 'SNACK'


class MealSlot(Base):
    __tablename__ = 'meal_slots'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    week_id: Mapped[UUID] = mapped_column(ForeignKey('weeks.id'), nullable=False, index=True)
    day_of_week: Mapped[DayOfWeek] = mapped_column(nullable=False)
    meal_type: Mapped[MealType] = mapped_column(nullable=False)
    recipe_id: Mapped[UUID | None] = mapped_column(ForeignKey('recipes.id'), nullable=True)

    week: Mapped['Week'] = relationship(back_populates='meal_slots')
    recipe: Mapped['Recipe | None'] = relationship(lazy='joined')

    __table_args__ = (UniqueConstraint('week_id', 'day_of_week', 'meal_type', name='_week_day_meal_uc'),)

    def __repr__(self) -> str:
        return f'MealSlot({self.id=}, {self.week_id=}, {self.day_of_week=}, {self.meal_type=}, {self.recipe_id=})'


class Week(Base):
    __tablename__ = 'weeks'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='weeks')
    meal_slots: Mapped[list['MealSlot']] = relationship(back_populates='week', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'Week({self.id=}, {self.name=}, {self.user_id=})'
