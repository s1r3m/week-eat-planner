from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .meal_slot import MealSlot
    from .user import User


class Week(Base):
    """Represents a week-long meal plan for a user.

    Attributes:
        id: The unique identifier for the week.
        name: The name or label given to the week.
        user_id: The foreign key linking to the owner of this week.
        user: The SQLAlchemy relationship to the User who owns this week.
        meal_slots: The SQLAlchemy relationship to the MealSlots associated with this week.
    """

    __tablename__ = 'weeks'

    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='weeks')
    meal_slots: Mapped[list['MealSlot']] = relationship(
        back_populates='week', cascade='all, delete-orphan', lazy='selectin'
    )

    def __repr__(self) -> str:
        return f'Week({self.id=}, {self.name=}, {self.user_id=})'
