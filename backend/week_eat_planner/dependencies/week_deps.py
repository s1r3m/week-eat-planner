from typing import Annotated

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.db.models as db_models
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import WeekForbidden, WeekNotFound


async def get_week_by_id(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[db_models.User, Depends(get_current_active_user)],
    read_session: Annotated[AsyncSession, Depends(db.get_db)],
) -> db_models.Week:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to retrieve.
        user: The authenticated user.
        read_session: The database session in read-only mode.

    Returns:
        The requested week object.

    Raises:
        WeekNotFound: If the week does not exist
        WeekForbidden: If the week does not belong to the user.
    """
    logger.info(f'Requesting {week_id} for user {user}.')
    week = await WeekDAO(read_session).get_week(week_id)
    if not week:
        logger.error(f'Week {week_id} does not exist.')
        raise WeekNotFound

    if week.user_id != user.id:
        logger.error(f'The week {week_id} is not owned by {user}.')
        raise WeekForbidden

    return week


async def get_week_for_update(
    week_snapshot: Annotated[db_models.Week, Depends(get_week_by_id)],
    write_session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> db_models.Week:
    """Retrieves a week from the database with a lock for updating.

    This dependency should be used when a week needs to be updated. It re-fetches
    the week provided by `get_week_by_id` within a new transaction with write
    permissions, and it's expected that the underlying DAO method will lock the
    row for update.

    Args:
        week_snapshot: The week object to be re-fetched and locked, as
            retrieved by `get_week_by_id`.
        write_session: The database session with commit capabilities.

    Returns:
        The `Week` object ready for updates, or `None` if the week has been
        deleted since it was initially retrieved.

    Raises:
        WeekNotFound: If the week does not exist or has been deleted.
    """
    week = await WeekDAO(write_session).get_week(week_snapshot.id, for_update=True)
    if not week:
        logger.error(f'Week {week_snapshot} disappeared.')
        raise WeekNotFound

    return week
