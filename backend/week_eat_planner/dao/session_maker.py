from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.dao.database import async_session_maker


class DatabaseSession:
    @staticmethod
    async def _get_session(commit: bool = False) -> AsyncGenerator[AsyncSession, None]:
        async with async_session_maker() as session:
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
