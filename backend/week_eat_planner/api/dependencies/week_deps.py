from typing import Annotated

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import UserRead
from week_eat_planner.api.schemas.week import WeekRead, WeekReadMinimal
from week_eat_planner.db.session_maker import db
from week_eat_planner.services.week_service import WeekService


async def get_week_by_id(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    read_session: Annotated[AsyncSession, Depends(db.get_db)],
) -> WeekRead:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to retrieve.
        user: The authenticated user.
        read_session: The database session in read-only mode.

    Returns:
        The requested week object.
    """
    logger.info(f'Requesting Week with raw {week_id=} for {user}.')
    week = await WeekService(read_session).get_week_for_user(week_id, user, for_update=False)
    logger.info(f'Successfully loaded week {week.id} read-only')

    return WeekRead.model_validate(week)


async def get_week_for_update(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    write_session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> WeekReadMinimal:
    """Retrieves a week from the database with a lock for updating.

    This dependency should be used when a week needs to be updated. It re-fetches
    the week provided by `get_week_by_id` within a new transaction with write
    permissions, and it's expected that the underlying DAO method will lock the
    row for update.

    Args:
        week_id: The ID of the week to retrieve.
        user: The authenticated user.
        write_session: The database session with commit capabilities.

    Returns:
        The `Week` object ready for updates
    """
    logger.info(f'Requesting Week with raw {week_id=} for {user}.')
    week = await WeekService(write_session).get_week_for_user(week_id, user, for_update=True)
    logger.info(f'Successfully loaded week {week.id} for update')
    return WeekReadMinimal.model_validate(week)
