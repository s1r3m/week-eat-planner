from datetime import datetime
from enum import StrEnum
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base


class User(Base):
    """Represents a user of the application."""

    __tablename__ = 'users'

    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)

    weeks: Mapped[list['Week']] = relationship(back_populates='user', cascade='all, delete-orphan')
    recipes: Mapped[list['Recipe']] = relationship(back_populates='user', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'User({self.id=}, {self.email=}, {self.is_active=}'


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'

    token_hash: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(default=False, nullable=False)
    replaced_by: Mapped[UUID | None] = mapped_column(ForeignKey('refresh_tokens.id'), nullable=True, default=None)

    user: Mapped['User'] = relationship(lazy='selectin')

    # def __repr__(self) -> str:
    #     return f'RefreshToken({self.id=}, {self.user_id=}, {self.expires_at=}, {self.revoked=}, {self.replaced_by=})'


class Recipe(Base):
    """Represents a recipe created by a user."""

    __tablename__ = 'recipes'

    name: Mapped[str] = mapped_column(nullable=False)
    is_public: Mapped[bool] = mapped_column(default=False, nullable=False)
    ingredients: Mapped[dict] = mapped_column(JSONB, nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='recipes')

    def __repr__(self) -> str:
        return f'Recipe({self.id=}, {self.name=}, {self.is_public=}, {self.user_id=})'


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

    def __repr__(self) -> str:
        return f'MealSlot({self.id=}, {self.week_id=}, {self.day_of_week=}, {self.meal_type=}, {self.recipe_id=})'


class Week(Base):
    """Represents a week-long meal plan for a user."""

    __tablename__ = 'weeks'

    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='weeks')
    meal_slots: Mapped[list['MealSlot']] = relationship(
        back_populates='week', cascade='all, delete-orphan', lazy='selectin'
    )

    def __repr__(self) -> str:
        return f'Week({self.id=}, {self.name=}, {self.user_id=})'
