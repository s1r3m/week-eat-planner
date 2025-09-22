from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from week_eat_planner.config import database_url

_engine = create_async_engine(url=database_url)
_async_session_maker = async_sessionmaker(_engine, class_=AsyncSession)


class DatabaseSession:
    @staticmethod
    async def get_db() -> AsyncGenerator[AsyncSession, None]:
        async with _async_session_maker() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

    @staticmethod
    async def get_db_commit() -> AsyncGenerator[AsyncSession, None]:
        async with _async_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


db = DatabaseSession()
