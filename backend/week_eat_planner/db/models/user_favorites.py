from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .recipe import Recipe
    from .user import User


class UserFavorite(Base):
    """Join table recording which recipes a user has marked as favorites."""

    __tablename__ = 'user_favorites'
    __table_args__ = (UniqueConstraint('user_id', 'recipe_id', name='uq_user_favorites_user_recipe'),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    recipe_id: Mapped[UUID] = mapped_column(ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='favorites')
    recipe: Mapped['Recipe'] = relationship(back_populates='favorites', lazy='selectin')
