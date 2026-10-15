"""Recipes, their authors, image references, meal slots, and favorites."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base
from week_eat_planner.db.models import MealSlot

if TYPE_CHECKING:
    from .user import User
    from .user_favorites import UserFavorite


class Recipe(Base):
    """Recipe content owned by a user, with optional public visibility.

    Attributes:
        name: Name of the recipe.
        is_public: Whether users other than the owner may view the recipe.
        steps: JSON array of cooking step dictionaries.
        ingredients: JSON array of ingredient dictionaries with amounts and units.
        user_id: ID of the user who created the recipe.
        image_key: Optional bucket/key reference to the recipe image.
        user: Eagerly loaded author account.
        meal_slots: Meal slots referencing the recipe.
        favorites: Favorite associations deleted when the recipe is deleted.
        is_favorite: Unmapped flag populated for the requesting user by recipe services.
    """

    __tablename__ = 'recipes'
    __allow_unmapped__ = True

    name: Mapped[str] = mapped_column(nullable=False)
    is_public: Mapped[bool] = mapped_column(default=False, nullable=False)
    steps: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list, server_default='[]')
    ingredients: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list, server_default='[]')
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    image_key: Mapped[str | None] = mapped_column(nullable=True)

    user: Mapped[User] = relationship(back_populates='recipes', lazy='selectin')
    meal_slots: Mapped[list[MealSlot]] = relationship(back_populates='recipe')
    favorites: Mapped[list[UserFavorite]] = relationship(back_populates='recipe', cascade='all, delete-orphan')

    is_favorite: bool = False

    @property
    def author(self) -> str:
        """The author of the recipe.

        Returns:
            The username of the recipe's author.
        """
        return self.user.username
