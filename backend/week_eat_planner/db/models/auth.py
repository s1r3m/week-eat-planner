"""Persistent authentication sessions containing hashed opaque tokens."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .user import User


class Session(Base):
    """Stored authentication session containing a hashed opaque token.

    Attributes:
        user_id: ID of the user who owns the session.
        hashed_token: SHA-256 hex digest used to look up the session.
        last_used_at: Recorded usage time, set on creation and not updated by token lookup.
        expires_at: UTC expiration time used to reject expired sessions.
        user: Eagerly loaded user associated with the session.
    """

    __tablename__ = 'sessions'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    hashed_token: Mapped[str] = mapped_column(nullable=False, index=True)
    last_used_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship(lazy='selectin')

    def __repr__(self) -> str:
        """Return the session ID, owner ID, and expiration time.

        Returns:
            A diagnostic string describing the record.
        """
        return f'<Session>(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})'
