from typing import Any, Generic, TypeVar

from loguru import logger
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
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

    async def _get_one_or_none(
        self,
        for_update: bool = False,
        options: list[Any] | None = None,
        **filter_by: Any,
    ) -> T | None:
        """Fetches a single record from the database or None if not found.

        Args:
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.
            options: A list of options to pass to SQLAlchemy's `options`.
            **filter_by: Keyword arguments to filter the query by.
                These are passed directly to SQLAlchemy's `filter_by`.

        Returns:
            An instance of the model if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs during the query execution.
        """
        try:
            query = select(self.model).filter_by(**filter_by)

            if for_update:
                query = query.with_for_update()
            if options:
                query = query.options(*options)

            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.debug(f'{self.model.__name__} with {filter_by} has been successfully found.')
            else:
                logger.warning(f'{self.model.__name__} with {filter_by} was not found.')
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} with {filter_by}: {exc}.')
            raise exc

        return record
