from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from week_eat_planner.config import database_url


class DatabaseSession:
    """Manages the creation and lifecycle of database sessions."""

    def __init__(self) -> None:
        self._engine: AsyncEngine | None = None
        self._session_maker: async_sessionmaker[AsyncSession] | None = None

    async def init(self) -> None:
        self._engine = create_async_engine(url=database_url)
        self._session_maker = async_sessionmaker(self._engine, class_=AsyncSession)

    async def close(self) -> None:
        await self.engine.dispose()
        self._engine = None
        self._session_maker = None

    @property
    def engine(self) -> AsyncEngine:
        if not self._engine:
            raise RuntimeError('Database not connected. Call init() first.')
        return self._engine

    @property
    def session_maker(self) -> async_sessionmaker:
        if not self._session_maker:
            raise RuntimeError('Database not connected. Call init() first.')
        return self._session_maker

    async def get_db(self) -> AsyncGenerator[AsyncSession, None]:
        """FastAPI dependency to get a database session for read-only operations.

        Yields:
            An asynchronous database session.
        """

        async with self.session_maker() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

    async def get_db_commit(self) -> AsyncGenerator[AsyncSession, None]:
        """FastAPI dependency to get a database session and commit changes.

        Yields:
            An asynchronous database session.
        """

        async with self.session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


db = DatabaseSession()
