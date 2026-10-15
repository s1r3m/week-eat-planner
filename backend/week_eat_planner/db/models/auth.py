from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .user import User


class Session(Base):
    """Represents a session in DB.

    Attributes:
        user_id: An ID of a user that owns the session.
        hashed_token: A hash of a session token of the session.
        last_used_at: Datetime of the last usage.
        expires_at: Datetime when the session will expire.
    """

    __tablename__ = 'sessions'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    hashed_token: Mapped[str] = mapped_column(nullable=False, index=True)
    last_used_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship(lazy='selectin')

    def __repr__(self) -> str:
        return f'<Session>(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})'
