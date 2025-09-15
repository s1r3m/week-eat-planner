from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True


T = TypeVar('T', bound=Base)


class BaseDAO(Generic[T]):
    model: type[T] = None  # type: ignore

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        if not self.model:
            raise ValueError('A model must be specified in child classes!')
