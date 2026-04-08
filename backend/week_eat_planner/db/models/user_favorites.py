from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .recipe import Recipe
    from .user import User



class UserFavorite(Base):
    __tablename__ = 'user_favorites'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    recipe_id: Mapped[UUID] = mapped_column(ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)

    user: Mapped['User'] = relationship(back_populates='favorites')
    recipe: Mapped['Recipe'] = relationship(back_populates='favorites')

    def __repr__(self) -> str:
        return f'UserFavorite({self.id=}, {self.user_id=}, {self.recipe_id=})'
