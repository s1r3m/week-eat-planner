from datetime import datetime, timezone
from typing import Any, Generic, TypeVar
from uuid import UUID

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import DateTime, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from week_eat_planner.helpers import generate_uuid7


class Base(AsyncAttrs, DeclarativeBase):
    """Abstract base model for all database models."""

    __abstract__ = True
    id: Mapped[UUID] = mapped_column(primary_key=True, default=lambda: generate_uuid7())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


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

    async def add(self, model: T) -> T:
        logger.debug(f'Creating {self.model.__name__} record from {model}.')
        try:
            self._session.add(model)
            await self._session.flush()
            await self._session.refresh(model)
        except SQLAlchemyError as exc:
            logger.error(f'Error while inserting into {self.model.__name__} from {model}: {exc}.')
            raise exc

        logger.debug(f'{self.model.__name__} from {model} has been successfully inserted.')
        return model

    async def get_one_or_none(
        self,
        for_update: bool = False,
        **filter_by: Any,
    ) -> T | None:
        """Fetches a single record from the database or None if not found.

        Args:
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.
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

    async def update(self, db_obj: T, values: BaseModel) -> T:
        logger.debug(f'Updating {self.model.__name__}({db_obj.id}) with {values}.')
        try:
            query = (
                update(
                    self.model,
                )
                .filter_by(
                    id=db_obj.id,
                )
                .values(
                    **values.model_dump(exclude_unset=True),
                )
                .returning(self.model)
            )
            result = await self._session.execute(query)
            updated_db_obj = result.scalar_one()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating {self.model.__name__}({db_obj.id}) with {values}: {exc}')
            raise exc
        logger.debug(f'Successfully updated {self.model.__name__}({db_obj.id}).')
        return updated_db_obj

    async def delete(self, db_obj: T) -> None:
        logger.debug(f'Deleting {self.model.__name__} record {db_obj.id}.')
        try:
            await self._session.delete(db_obj)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {self.model.__name__} record {db_obj.id}: {exc}')
            raise exc

        logger.debug(f'{self.model.__name__} record {db_obj.id} has been successfully deleted.')
        return None
