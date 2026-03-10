from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .recipe import Recipe
    from .week import Week


class User(Base):
    """Represents a user of the application."""

    __tablename__ = 'users'

    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    username: Mapped[str] = mapped_column(unique=False, nullable=True)
    avatar_url: Mapped[str] = mapped_column(unique=False, nullable=True)
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

    def __repr__(self) -> str:
        return f'RefreshToken({self.id=}, {self.user_id=}, {self.expires_at=}, {self.revoked=}, {self.replaced_by=})'
