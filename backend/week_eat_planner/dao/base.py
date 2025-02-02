from typing import Generic, TypeVar

from loguru import logger
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from week_eat_planner.dao.database import Base


T = TypeVar('T', bound=Base)


class BaseDAO(Generic[T]):
    model: type[T] = None  # type: ignore

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        if not self.model:
            raise ValueError('A model must be specified in child classes!')

    async def get_one_or_none_by_id(self, obj_id: int) -> T | None:
        logger.info(f'Getting {self.model.__name__} by id={obj_id}')
        try:
            query = select(self.model).filter(self.model.id == obj_id)  # type: ignore
            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.info(f'{self.model.__name__} with id={obj_id} has been successfully found')
            else:
                logger.warning(f'{self.model.__name__} with id={obj_id} not found')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} by id={obj_id}: {exc}')
            raise exc

        return record

    async def get_one_or_none(self, _filter: BaseModel) -> T | None:
        model_dict = _filter.model_dump(exclude_unset=True)
        logger.info(f'Getting {self.model.__name__} by filter={model_dict}')
        try:
            query = select(self.model).filter_by(**model_dict)
            result = await self._session.execute(query)
            record = result.scalar_one_or_none()
            if record:
                logger.info(f'{self.model.__name__} with filter={model_dict} has been successfully found')
            else:
                logger.warning(f'{self.model.__name__} with filter={model_dict} not found')
        except SQLAlchemyError as exc:
            logger.exception(f'Error while getting {self.model.__name__} by filter={model_dict}: {exc}')
            raise exc

        return record

    async def add(self, model: BaseModel) -> T:
        model_dict = model.model_dump(exclude_unset=True)
        logger.info(f'Adding {self.model.__name__} with data={model_dict}')
        instance = self.model(**model_dict)  # pylint: disable=not-callable
        try:
            self._session.add(instance)
            await self._session.flush()
            logger.info(f'{self.model.__name__} has been successfully added')
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.exception(f'Error while adding {self.model.__name__}: {exc}')
            raise exc

        return instance
