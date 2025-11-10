from datetime import datetime, timezone
from typing import Generic, TypeVar
from uuid import UUID

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import DateTime, delete as sql_delete, select, update as sql_update
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

    async def add(self, instance: T) -> T:
        """Adds a new instance of the model to the database.

        Args:
            instance: The model instance to add.

        Returns:
            The added model instance, refreshed from the database.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        logger.debug(f'Adding {self.model.__name__}: {instance}.')
        try:
            self._session.add(instance)
            await self._session.flush()
            await self._session.refresh(instance)
        except SQLAlchemyError as exc:
            logger.error(f'Error while inserting {self.model.__name__} {instance}: {exc}.')
            raise exc

        logger.debug(f'{self.model.__name__} {instance} has been successfully inserted.')
        return instance

    async def find_one_or_none_by_id(self, obj_id: UUID, for_update: bool = False) -> T | None:
        """Fetches a single record by id from the database or None if not found.

        Args:
            obj_id: The ID of the object to find.
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.

        Returns:
            An instance of the model if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs during the query execution.
        """
        logger.debug(f'Getting {self.model.__name__} by ID={obj_id}.')
        try:
            query = select(self.model).filter_by(id=obj_id)

            if for_update:
                query = query.with_for_update()

            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.debug(f'{self.model.__name__} by ID={obj_id} has been successfully found.')
            else:
                logger.warning(f'{self.model.__name__} by ID={obj_id} was not found.')
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} by ID={obj_id}: {exc}.')
            raise exc

        return record

    async def find_many_by_ids(self, obj_ids: list[UUID], for_update: bool = False) -> list[T]:
        """Finds multiple model instances by their IDs.

        Args:
            obj_ids: A list of UUIDs to search for.
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.

        Returns:
            A list of found model instances. Returns an empty list if no IDs
            are provided or none are found.
        """
        logger.debug(f'Getting {self.model.__name__} by IDs={obj_ids}.')
        if not obj_ids:
            return []

        try:
            query = select(self.model).filter(self.model.id.in_(obj_ids))
            if for_update:
                query = query.with_for_update()

            result = await self._session.execute(query)
            records = result.scalars().all()
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} by IDs={obj_ids}: {exc}.')
            raise exc

        return list(records)

    async def find_one_or_none(self, filters: BaseModel) -> T | None:
        """Fetches a single record from the database or None if not found.

        Args:
            filters: A Pydantic model containing the filter criteria.

        Returns:
            An instance of the model if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs during the query execution.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        logger.debug(f'Getting {self.model.__name__} with {filter_by}.')
        try:
            query = select(self.model).filter_by(**filter_by)
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

    async def find_all(self, filters: BaseModel | None = None) -> list[T]:
        """Retrieves all records matching the given filters.

        Args:
            filters: A Pydantic model containing filter criteria. If None, all records are returned.

        Returns:
            A list of model instances.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        filter_by = filters.model_dump(exclude_unset=True) if filters else {}
        logger.debug(f'Querying for {self.model.__name__} records with {filter_by}.')
        try:
            query = select(self.model).filter_by(**filter_by)
            result = await self._session.execute(query)
            records = result.scalars().all()
            logger.debug(f'Found {len(records)} {self.model.__name__} records with {filter_by}.')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} records with {filter_by}: {exc}.')
            raise exc

        return list(records)

    async def update(self, filters: BaseModel, values: BaseModel) -> T:
        """Updates records matching the given filters with new values.

        Args:
            filters: A Pydantic model containing the filter criteria for the records to update.
            values: A Pydantic model containing the new values to apply.

        Returns:
            The updated model instance.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        values_dict = values.model_dump(exclude_unset=True)
        logger.debug(f'Updating {self.model.__name__} by {filters} with {values}.')
        try:
            query = sql_update(self.model).filter_by(**filter_by).values(**values_dict).returning(self.model)
            result = await self._session.execute(query)
            await self._session.flush()
            updated_db_obj = result.scalar_one()
            await self._session.refresh(updated_db_obj)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating {self.model.__name__}by {filters} with {values}: {exc}')
            raise exc

        return updated_db_obj

    async def delete(self, filters: BaseModel) -> int:
        """Deletes records matching the given filters.

        Args:
            filters: A Pydantic model containing the filter criteria for the records to delete.

        Returns:
            The number of deleted records.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        logger.debug(f'Deleting {self.model.__name__} record by {filter_by}.')
        try:
            query = sql_delete(self.model).filter_by(**filter_by)
            result = await self._session.execute(query)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {self.model.__name__} record by {filter_by}: {exc}')
            raise exc

        return result.rowcount
