from typing import Annotated

from fastapi import APIRouter, Depends, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.dependencies.week_deps import get_week_by_id, get_week_for_update
from week_eat_planner.services.week_service import WeekService

router = APIRouter()


@router.post(AppUrl.WEEKS, response_model=schema.WeekPreviewOut, status_code=status.HTTP_201_CREATED)
async def create_week(
    week_data: schema.WeekCreate,
    user: Annotated[db_model.User, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db_commit),
) -> db_model.Week:
    """Creates a new week for the current user.

    Also initiates seven days for the week with meal slots.

    Args:
        week_data: Data to create a new week, primarily the week's name.
        user: The authenticated user.
        session: The database session.

    Returns:
        The created week object.
    """
    logger.info(f'Request POST /weeks for {user}.')
    week = await WeekService(session).create_week_with_slots(user, week_data.name)
    return week


@router.get(AppUrl.WEEKS, response_model=list[schema.WeekPreviewOut])
async def get_weeks(
    user: Annotated[db_model.User, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db),
) -> list[db_model.Week]:
    """Retrieves all weeks for the current user.

    Args:
        user: The authenticated user.
        session: The database session.

    Returns:
        A list of weeks belonging to the user.
    """
    logger.info(f'Request GET /weeks for {user}.')
    weeks = await WeekService(session).get_weeks(user)
    return weeks


@router.get(AppUrl.WEEKS_TPL, response_model=schema.WeekOut)
async def get_week(
    week: Annotated[db_model.Week, Depends(get_week_by_id)],
) -> db_model.Week:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object, injected by dependency.

    Returns:
        The requested week object.
    """
    return week


@router.put(AppUrl.WEEKS_TPL, response_model=schema.WeekPreviewOut)
async def update_week(
    new_data: schema.WeekUpdate,
    week: Annotated[db_model.Week, Depends(get_week_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> db_model.Week:
    """Updates a specific week.

    The week must belong to the currently authenticated user.

    Args:
        new_data: The new data for the week.
        week: The week object to update.
        session: The database session for committing the update.

    Returns:
        The updated week object.
    """
    logger.info(f'Request PUT /weeks/{week.id} for {week.user} with {new_data=}.')
    return await WeekService(session).update_week(week, new_data)


@router.delete(AppUrl.WEEKS_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_week(
    week: Annotated[db_model.Week, Depends(get_week_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object to delete.
        session: The database session for committing the deletion.
    """
    logger.info(f'Request DELETE /weeks/{week.id} for {week.user}.')
    await WeekService(session).delete_week(week)
    return None
