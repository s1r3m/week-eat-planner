"""Shared ORM identifiers and timestamps, and generic asynchronous database operations."""

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import DateTime, delete as sql_delete, select, update as sql_update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql.base import ExecutableOption

from week_eat_planner.helpers import generate_uuid7


class Base(AsyncAttrs, DeclarativeBase):
    """Abstract ORM model with UUID v7 identifiers and UTC timestamps.

    Attributes:
        id: UUID v7 primary key, generated on insertion when not supplied.
        created_at: Time of record creation, defaulting to the current UTC time.
        updated_at: Time of creation or the latest SQLAlchemy-managed update.
    """

    __abstract__ = True
    id: Mapped[UUID] = mapped_column(primary_key=True, default=generate_uuid7)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    def __repr__(self) -> str:
        """Return the model class name and record ID.

        Returns:
            A diagnostic string describing the record.
        """
        return f'<{type(self).__name__}> (id={self.id})'


class BaseDAO[T: Base]:
    """Perform asynchronous CRUD operations for a configured ORM model.

    Writes use the supplied session and do not commit. The caller manages
    transaction completion and rollback after failures.

    Attributes:
        model: ORM model configured by each concrete DAO subclass.
    """

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
        """Add, flush, and refresh an instance without committing the transaction.

        Args:
            instance: Model instance to add.

        Returns:
            The added model instance, refreshed from the database.

        Raises:
            SQLAlchemyError: If insertion, flushing, or refreshing fails.
        """
        logger.debug(f'Adding {self.model.__name__}: {instance}')
        try:
            self._session.add(instance)
            await self._session.flush()
            await self._session.refresh(instance)
        except SQLAlchemyError as exc:
            logger.error(f'Error while inserting {self.model.__name__} {instance.id}: {exc}')
            raise exc

        logger.debug(f'{self.model.__name__} {instance.id} has been successfully inserted')
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
        logger.debug(f'Getting {self.model.__name__} by ID={obj_id}')
        try:
            query = select(self.model).filter_by(id=obj_id)

            if for_update:
                query = query.with_for_update()

            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.debug(f'{self.model.__name__} by ID={obj_id} has been successfully found')
            else:
                logger.debug(f'{self.model.__name__} by ID={obj_id} was not found')
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} by ID={obj_id}: {exc}')
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

        Raises:
            SQLAlchemyError: If the query fails.
        """
        logger.debug(f'Getting {self.model.__name__} by IDs={obj_ids}')
        if not obj_ids:
            return []

        try:
            query = select(self.model).filter(self.model.id.in_(obj_ids))
            if for_update:
                query = query.with_for_update()

            result = await self._session.execute(query)
            records = result.scalars().all()
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} by IDs={obj_ids}: {exc}')
            raise exc

        return list(records)

    async def find_one_or_none(self, filters: BaseModel, for_update: bool = False) -> T | None:
        """Fetches a single record from the database or None if not found.

        Args:
            filters: Filter fields; only explicitly supplied values, including None, are applied.
            for_update: If True, applies a "FOR UPDATE" lock to the selected row. Defaults to False.

        Returns:
            An instance of the model if found, otherwise None.

        Raises:
            SQLAlchemyError: If a database error occurs during the query execution.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        logger.debug(f'Getting {self.model.__name__} with {filter_by}')
        try:
            query = select(self.model).filter_by(**filter_by)

            if for_update:
                query = query.with_for_update()

            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.debug(f'{self.model.__name__} with {filter_by} has been successfully found')
            else:
                logger.debug(f'{self.model.__name__} with {filter_by} was not found')
        except SQLAlchemyError as exc:
            logger.error(f'Error while getting {self.model.__name__} with {filter_by}: {exc}')
            raise exc

        return record

    async def find_all(
        self, filters: BaseModel | None = None, options: Sequence[ExecutableOption] | None = None
    ) -> list[T]:
        """Retrieves all records matching the given filters.

        Args:
            filters: Explicitly supplied filter fields; None or an empty model selects all records.
            options: SQLAlchemy loader/execution options applied to the select query.

        Returns:
            A list of model instances.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        filter_by = filters.model_dump(exclude_unset=True) if filters else {}
        options = options or []
        logger.debug(f'Querying for {self.model.__name__} records with {filter_by}')
        try:
            query = select(self.model).filter_by(**filter_by).options(*options)
            result = await self._session.execute(query)
            records = result.scalars().all()
            logger.debug(f'Found {len(records)} {self.model.__name__} records with {filter_by}')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} records with {filter_by}: {exc}')
            raise exc

        return list(records)

    async def update(self, filters: BaseModel, values: BaseModel) -> T:
        """Update matching records and return the single affected model instance.

        Use only explicitly supplied filter and update fields, including explicit
        None values. Flush and refresh the result without committing. Filters
        must match exactly one record for a successful return.

        Args:
            filters: Pydantic model containing the filter criteria.
            values: Pydantic model containing replacement field values.

        Returns:
            The updated model instance, refreshed from the database.

        Raises:
            SQLAlchemyError: If the database operation fails, including when no
                record or multiple records are returned.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        values_dict = values.model_dump(exclude_unset=True)
        logger.debug(f'Updating {self.model.__name__} by {filter_by} with {values_dict}')
        try:
            query = sql_update(self.model).filter_by(**filter_by).values(**values_dict).returning(self.model)
            result = await self._session.execute(query)
            await self._session.flush()
            updated_db_obj = result.scalar_one()
            await self._session.refresh(updated_db_obj)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while updating {self.model.__name__} by {filter_by} with {values_dict}: {exc}')
            raise exc

        return updated_db_obj

    async def delete(self, filters: BaseModel) -> int:
        """Deletes records matching the given filters.

        Args:
            filters: Explicitly supplied filter fields; an empty model selects all records for deletion.

        Returns:
            The number of deleted records.

        Raises:
            SQLAlchemyError: If a database error occurs.
        """
        filter_by = filters.model_dump(exclude_unset=True)
        logger.debug(f'Deleting {self.model.__name__} record by {filter_by}')
        try:
            query = sql_delete(self.model).filter_by(**filter_by)
            result = await self._session.execute(query)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while deleting {self.model.__name__} record by {filter_by}: {exc}')
            raise exc

        return result.rowcount  # type: ignore
