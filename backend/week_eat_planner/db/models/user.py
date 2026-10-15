from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base

if TYPE_CHECKING:
    from .recipe import Recipe
    from .user_favorites import UserFavorite
    from .week import Week


class User(Base):
    """Represents a user of the application.

    Attributes:
        id: The unique identifier for the user.
        email: The user's unique email address.
        username: The user's chosen display name.
        avatar_url: The URL to the user's avatar image.
        avatar_key: The storage key for the user's avatar (used for deletion/replacement).
        oauth_provider: The OAuth provider name (e.g. 'google'), or None for local accounts.
        oauth_id: The provider-scoped user identifier, or None for local accounts.
        hashed_password: The hashed version of the user's password.
        is_active: A flag indicating if the user account is active.
        weeks: The SQLAlchemy relationship to the user's weeks.
        recipes: The SQLAlchemy relationship to the user's recipes.
        favorites: The SQLAlchemy relationship to the user's favourite recipes.
    """

    __tablename__ = 'users'
    __table_args__ = (
        UniqueConstraint('oauth_provider', 'oauth_id', name='uq_users_oauth_provider_oauth_id'),
        CheckConstraint(
            '(oauth_provider IS NULL) = (oauth_id IS NULL)',
            name='ck_users_oauth_provider_id_both_or_neither',
        ),
        CheckConstraint(
            'hashed_password IS NOT NULL OR (oauth_provider IS NOT NULL AND oauth_id IS NOT NULL)',
            name='ck_users_has_login_method',
        ),
    )

    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    username: Mapped[str] = mapped_column(unique=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(nullable=True)
    avatar_key: Mapped[str | None] = mapped_column(nullable=True)
    oauth_provider: Mapped[str | None] = mapped_column(nullable=True)
    oauth_id: Mapped[str | None] = mapped_column(nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_email_verified: Mapped[bool] = mapped_column(default=False, server_default='false')

    weeks: Mapped[list[Week]] = relationship(back_populates='user', cascade='all, delete-orphan')
    recipes: Mapped[list[Recipe]] = relationship(back_populates='user', cascade='all, delete-orphan')
    favorites: Mapped[list[UserFavorite]] = relationship(back_populates='user', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'<User> (id={self.id}, email={self.email}, is_email_activated={self.is_email_verified})'
