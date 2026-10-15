"""One persistent shopping list per week, with items stored as a JSON array."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .week import Week


class ShoppingList(Base):
    """A week's unique shopping list stored independently of later recipe changes.

    Attributes:
        week_id: ID of the associated week, with at most one list per week.
        items: JSON array of ingredient dictionaries with checked flags.
        week: Week from which the list was created.
    """

    __tablename__ = 'shopping_lists'

    week_id: Mapped[UUID] = mapped_column(
        ForeignKey('weeks.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True,
    )
    items: Mapped[list] = mapped_column(JSONB, nullable=False, default=list, server_default='[]')

    week: Mapped[Week] = relationship(back_populates='shopping_list')
