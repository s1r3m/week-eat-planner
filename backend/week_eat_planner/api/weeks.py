from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.constants import AppUrl
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.api.schemas import WeekPreviewOut, WeekCreate, WeekOut, WeekUpdate
from week_eat_planner.db.models import Week, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import WeekNotFound

router = APIRouter()


@router.post(AppUrl.WEEKS, response_model=WeekPreviewOut, status_code=HTTPStatus.CREATED)
async def create_week(
    week_data: WeekCreate,
    user: Annotated[User, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db_commit),
) -> Week:
    """Creates a new week for the current user.

    Also initiates seven days for the week with meal slots.

    Args:
        week_data: Data to create a new week, primarily the week's name.
        user: The authenticated user.
        session: The database session.

    Returns:
        The created week object.
    """
    logger.info(f'Request POST /weeks for user {user}.')
    week = await WeekDAO(session).create_week(user, name=week_data.name)
    await MealSlotDAO(session).init_meal_slots_for_week(week)

    return week


@router.get(AppUrl.WEEKS, response_model=list[WeekPreviewOut])
async def get_weeks(
    user: Annotated[User, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db),
) -> list[Week]:
    """Retrieves all weeks for the current user.

    Args:
        user: The authenticated user.
        session: The database session.

    Returns:
        A list of weeks belonging to the user.
    """
    logger.info(f'Request GET /weeks for user {user}.')
    weeks = await WeekDAO(session).get_weeks(user)
    return weeks


@router.get(AppUrl.WEEKS_TPL, response_model=WeekOut)
async def get_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Week:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to retrieve.
        user: The authenticated user.
        session: The database session.

    Returns:
        The requested week object.

    Raises:
        WeekNotFound: If the week does not exist or does not belong to the user.
    """
    logger.info(f'Request GET /weeks/{week_id} for user {user}.')
    week = await WeekDAO(session).get_week(week_id)
    if not week or week.user_id != user.id:
        logger.error(f'No week {week_id} for user {user}.')
        raise WeekNotFound
    return week


@router.put(AppUrl.WEEKS_TPL, response_model=WeekPreviewOut)
async def update_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    new_data: WeekUpdate,
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Week:
    """Updates a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to update.
        new_data: The new data for the week.
        user: The authenticated user.
        session: The database session for committing the update.

    Returns:
        The updated week object.

    Raises:
        WeekNotFound: If the week does not exist or does not belong to the user.
    """
    logger.info(f'Request PUT /weeks/{week_id} for user {user} with {new_data=}.')
    week_dao = WeekDAO(session)
    week = await week_dao.get_week(week_id)
    if not week or week.user_id != user.id:
        logger.error(f'No week {week_id} for user {user}.')
        raise WeekNotFound

    return await week_dao.update_week(week, new_data)


@router.delete(AppUrl.WEEKS_TPL, status_code=HTTPStatus.NO_CONTENT)
async def delete_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to delete.
        user: The authenticated user.
        session: The database session for committing the deletion.

    Raises:
        WeekNotFound: If the week does not exist or does not belong to the user.
    """
    logger.info(f'Request DELETE /weeks/{week_id} for user {user}.')
    week_dao = WeekDAO(session)
    week = await week_dao.get_week(week_id)
    if not week or week.user_id != user.id:
        logger.error(f'No week {week_id} for user {user}.')
        raise WeekNotFound

    await week_dao.delete_week(week)
    return None
