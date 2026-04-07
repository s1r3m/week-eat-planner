from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from week_eat_planner.config import database_url


class DatabaseSession:
    """Manages the creation and lifecycle of database sessions."""

    def __init__(self) -> None:
        self._engine: AsyncEngine | None = None
        self._session_maker: async_sessionmaker[AsyncSession] | None = None

    async def init(self) -> None:
        """Initializes the database engine and session maker.

        Creates an asynchronous engine and a session factory for PostgreSQL.
        """
        self._engine = create_async_engine(url=database_url)
        self._session_maker = async_sessionmaker(self._engine, class_=AsyncSession)

    async def close(self) -> None:
        """Closes the database connection.

        Disposes of the asynchronous engine and resets internal state.
        """
        await self.engine.dispose()
        self._engine = None
        self._session_maker = None

    @property
    def engine(self) -> AsyncEngine:
        """Returns the current database engine.

        Returns:
            The SQLAlchemy AsyncEngine instance.

        Raises:
            RuntimeError: If the database is not connected (init() not called).
        """
        if not self._engine:
            raise RuntimeError('Database not connected. Call init() first.')
        return self._engine

    @property
    def session_maker(self) -> async_sessionmaker:
        """Returns the database session factory.

        Returns:
            The async_sessionmaker instance for creating new sessions.

        Raises:
            RuntimeError: If the database is not connected (init() not called).
        """
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
