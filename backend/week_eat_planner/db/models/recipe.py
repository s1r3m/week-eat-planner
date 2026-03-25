from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base
from week_eat_planner.db.models.meal_slot import MealSlot

if TYPE_CHECKING:
    from .user import User


class Recipe(Base):
    """Represents a recipe created by a user.

    Attributes:
        id: The unique identifier for the recipe.
        name: The name of the recipe.
        is_public: A flag indicating if the recipe is visible to other users.
        steps: A JSON object storing the cooking steps.
        ingredients: A JSON object storing the ingredients and their quantities.
        user_id: The foreign key linking to the user who created this recipe.
        user: The SQLAlchemy relationship to the User object.
    """

    __tablename__ = 'recipes'

    name: Mapped[str] = mapped_column(nullable=False)
    is_public: Mapped[bool] = mapped_column(default=False, nullable=False)
    steps: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list, server_default='[]')
    ingredients: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list, server_default='[]')
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='recipes', lazy='selectin')
    meal_slots: Mapped[list['MealSlot']] = relationship(back_populates='recipe')

    def __repr__(self) -> str:
        return f'Recipe({self.id=}, {self.name=}, {self.is_public=}, {self.user_id=})'

    @property
    def author(self) -> str:
        return self.user.username or self.user.email
