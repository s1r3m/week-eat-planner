from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """Abstract base model for all database models."""

    __abstract__ = True


T = TypeVar('T', bound=Base)


class BaseDAO(Generic[T]):
    """Generic Data Access Object for database operations."""

    model: type[T] = None  # type: ignore

    def __init__(self, session: AsyncSession) -> None:
        """Initializes the DAO with a database session.

        Args:
            session: The asynchronous database session.

        Raises:
            ValueError: If the `model` attribute is not set in a child class.
        """
        self._session = session
        if not self.model:
            raise ValueError('A model must be specified in child classes!')
