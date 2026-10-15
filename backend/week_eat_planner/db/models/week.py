"""User-owned weekly meal plans with meal slots and an optional shopping list."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .meal_slot import MealSlot
    from .shopping_list import ShoppingList
    from .user import User


class Week(Base):
    """Private weekly meal plan belonging to a user.

    Attributes:
        name: Name or label of the week.
        user_id: ID of the week's owner.
        user: Owner account.
        meal_slots: Eagerly loaded slots, deleted with the week or when orphaned.
        shopping_list: Optional shopping list, deleted with the week or when orphaned.
    """

    __tablename__ = 'weeks'

    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    user: Mapped[User] = relationship(back_populates='weeks')
    meal_slots: Mapped[list[MealSlot]] = relationship(
        back_populates='week', cascade='all, delete-orphan', lazy='selectin'
    )
    shopping_list: Mapped[ShoppingList | None] = relationship(
        back_populates='week', cascade='all, delete-orphan', uselist=False
    )
