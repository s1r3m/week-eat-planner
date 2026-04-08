from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base
from week_eat_planner.db.models.user_favorites import UserFavorite

if TYPE_CHECKING:
    from .recipe import Recipe
    from .week import Week


class User(Base):
    """Represents a user of the application.

    Attributes:
        id: The unique identifier for the user.
        email: The user's unique email address.
        username: The user's chosen display name.
        avatar_url: The URL to the user's avatar image.
        hashed_password: The hashed version of the user's password.
        is_active: A flag indicating if the user account is active.
        weeks: The SQLAlchemy relationship to the user's weeks.
        recipes: The SQLAlchemy relationship to the user's recipes.
    """

    __tablename__ = 'users'

    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    username: Mapped[str] = mapped_column(unique=False, nullable=True)
    avatar_url: Mapped[str] = mapped_column(unique=False, nullable=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)

    weeks: Mapped[list['Week']] = relationship(back_populates='user', cascade='all, delete-orphan')
    recipes: Mapped[list['Recipe']] = relationship(back_populates='user', cascade='all, delete-orphan')
    favorites: Mapped[list['UserFavorite']] = relationship(back_populates='user', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'User({self.id=}, {self.email=}, {self.is_active=}'


class RefreshToken(Base):
    """Represents a JWT refresh token stored in the database.

    Attributes:
        id: The unique identifier for the token.
        token_hash: The hashed value of the refresh token.
        user_id: The ID of the user who owns this token.
        expires_at: The timestamp when the token expires.
        revoked: A flag indicating if the token has been revoked.
        replaced_by: The ID of the token that replaced this one during rotation.
        user: The SQLAlchemy relationship to the owner of this token.
    """

    __tablename__ = 'refresh_tokens'

    token_hash: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(default=False, nullable=False)
    replaced_by: Mapped[UUID | None] = mapped_column(ForeignKey('refresh_tokens.id'), nullable=True, default=None)

    user: Mapped['User'] = relationship(lazy='selectin')

    def __repr__(self) -> str:
        return f'RefreshToken({self.id=}, {self.user_id=}, {self.expires_at=}, {self.revoked=}, {self.replaced_by=})'
