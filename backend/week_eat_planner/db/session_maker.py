from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from week_eat_planner.config import database_url

_engine = create_async_engine(url=database_url)
_async_session_maker = async_sessionmaker(_engine, class_=AsyncSession)


class DatabaseSession:
    @staticmethod
    async def _get_session(commit: bool = False) -> AsyncGenerator[AsyncSession, None]:
        async with _async_session_maker() as session:
            try:
                yield session
                if commit:
                    await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    @staticmethod
    async def get_db() -> AsyncGenerator[AsyncSession, None]:
        async for session in DatabaseSession._get_session():
            yield session

    @staticmethod
    async def get_db_commit() -> AsyncGenerator[AsyncSession, None]:
        async for session in DatabaseSession._get_session(commit=True):
            yield session


db = DatabaseSession()
