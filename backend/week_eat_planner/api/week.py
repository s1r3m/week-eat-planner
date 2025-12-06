from typing import Annotated

from fastapi import APIRouter, Depends, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.dependencies.week_deps import get_week_by_id, get_week_for_update
from week_eat_planner.api.schemas import (
    MealSlotAssign,
    MealSlotRead,
    UserRead,
    WeekCreate,
    WeekRead,
    WeekReadMinimal,
    WeekUpdate,
)
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.services.week_service import WeekService

router = APIRouter(tags=['Weeks'])


@router.post(AppUrl.WEEKS, response_model=WeekReadMinimal, status_code=status.HTTP_201_CREATED)
async def create_week(
    week_data: WeekCreate,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> WeekReadMinimal:
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
    week = await WeekService(session).create_week_with_slots(user, week_data)
    return week


@router.get(AppUrl.WEEKS, response_model=list[WeekReadMinimal])
async def get_weeks(
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[WeekReadMinimal]:
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


@router.get(AppUrl.WEEKS_TPL, response_model=WeekRead)
async def get_week(
    week: Annotated[WeekRead, Depends(get_week_by_id)],
) -> WeekRead:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object, injected by dependency.

    Returns:
        The requested week object.
    """
    logger.info(f'Request GET {AppUrl.WEEKS_TPL.format(week_id=week.id)}.')
    return week


@router.patch(AppUrl.WEEKS_TPL, response_model=WeekReadMinimal)
async def update_week(
    new_data: WeekUpdate,
    week: Annotated[WeekReadMinimal, Depends(get_week_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> WeekReadMinimal:
    """Updates a specific week.

    The week must belong to the currently authenticated user.

    Args:
        new_data: The new data for the week.
        week: The week to be updated.
        session: The database session.

    Returns:
        The updated week object.
    """
    logger.info(f'Request PATCH {AppUrl.WEEKS_TPL.format(week_id=week.id)} with {new_data=}.')
    new_week = await WeekService(session).update_week(week, new_data)
    return new_week


@router.delete(AppUrl.WEEKS_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_week(
    week: Annotated[WeekReadMinimal, Depends(get_week_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object to delete.
        session: The database session for committing the deletion.
    """
    logger.info(f'Request DELETE /weeks/{week.id} for {week.user_id}.')
    await WeekService(session).delete_week(week)
    return None


@router.patch(AppUrl.WEEK_SLOTS_TPL, response_model=list[MealSlotRead])
async def assign_recipe_to_meal_slot(
    slots_data: list[MealSlotAssign],
    week: Annotated[WeekRead, Depends(get_week_by_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> list[MealSlotRead]:
    """Assign the given recipe to a slot or un-assign if recipe_id is None."""
    logger.info(f'Request PATCH {AppUrl.WEEK_SLOTS_TPL.format(week_id=week.id)} with {slots_data=}.')
    updated_slots = await WeekService(session).assign_recipes_to_meal_slots(week, *slots_data)
    return updated_slots
