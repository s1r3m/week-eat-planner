from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.constants import WEEKS, WEEK
from week_eat_planner.db.meal_slot_dao import MealSlotDAO
from week_eat_planner.db.week_dao import WeekDAO
from week_eat_planner.api.schemas import UserOut, WeekPreviewOut, WeekCreate, WeekOut, WeekUpdate
from week_eat_planner.db.models import Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user

router = APIRouter()


@router.post(WEEKS, response_model=WeekPreviewOut, status_code=HTTPStatus.CREATED)
async def create_week(
    week_data: Annotated[WeekCreate, Depends()],
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db_commit),
) -> Week:
    """Creates a new week for the current user.
    Initiate seven days for it with slots.

    Args:
        week_data: The name of the week from the request body.
        user: The authenticated user.
        session: The database session.

    Returns:
        The new week with created days and MealSlots.
    """
    logger.info(f'Request POST /weeks for user {user}.')
    week = await WeekDAO(session).create_week(user, name=week_data.name)
    await MealSlotDAO(session).init_meal_slots_for_week(week)

    return week


@router.get(WEEKS, response_model=list[WeekPreviewOut])
async def get_weeks(
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db),
) -> list[Week]:
    """Retrieves all weeks for the current user.

    Args:
        user: The authenticated user.
        session: The database session.

    Returns:
        A list of weeks for the user.
    """
    logger.info(f'Request GET /weeks for user {user}.')
    weeks = await WeekDAO(session).get_weeks(user)
    return weeks


@router.get(WEEK, response_model=WeekOut)
async def get_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Week:
    logger.info(f'Request GET /weeks/{week_id} for user {user}.')
    week = await WeekDAO(session).get_week(week_id)
    if not week or week.user_id != user.id:
        logger.error(f'No week {week_id} for user {user}.')
        raise ValueError(f'No week with {week_id=}')
    return week


@router.put(WEEK, response_model=WeekPreviewOut)
async def update_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    new_data: Annotated[WeekUpdate, Depends()],
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Week:
    logger.info(f'Request PUT /weeks/{week_id} for user {user} with {new_data=}.')
    week_dao = WeekDAO(session)
    week = await week_dao.get_week(week_id)
    if not week or week.user_id != user.id:
        logger.error(f'No week {week_id} for user {user}.')
        raise ValueError(f'No week with {week_id=}')

    await week_dao.update_week(week_id, new_data)
    await session.refresh(week)
    return week
