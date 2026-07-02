from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .week import Week


class ShoppingList(Base):
    """Represents a shopping list with items from a corresponding week.

    Attributes:
        id: The unique identifier for the shopping_list.
        week_id: The foreign key linking to the week from which it was created.
        items: A JSON object storing the ingredients.
        week: The SQLAlchemy relationship to the Week object.
    """

    __tablename__ = 'shopping_lists'

    week_id: Mapped[UUID] = mapped_column(ForeignKey('weeks.id', ondelete='CASCADE'), nullable=False)
    items: Mapped[dict] = mapped_column(JSONB, nullable=False)

    week: Mapped['Week'] = relationship(back_populates='shopping_list')
