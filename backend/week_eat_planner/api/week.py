from typing import Annotated

from fastapi import APIRouter, Depends, Path, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user, get_optional_user
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
    return WeekReadMinimal.model_validate(week)


@router.get(AppUrl.WEEKS, response_model=list[WeekReadMinimal])
async def get_user_weeks(
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
    return [WeekReadMinimal.model_validate(week) for week in weeks]


@router.get(AppUrl.WEEKS_TPL, response_model=WeekRead)
async def get_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserRead | None, Depends(get_optional_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> WeekRead:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object, injected by dependency.

    Returns:
        The requested week object.
    """
    logger.info(f'Request GET {AppUrl.WEEKS_TPL.format(week_id=week_id)}.')
    week = await WeekService(session).get_visible_week(week_id, user)
    return WeekRead.model_validate(week)


@router.patch(AppUrl.WEEKS_TPL, response_model=WeekReadMinimal)
async def update_week(
    new_data: WeekUpdate,
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
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
    logger.info(f'Request PATCH {AppUrl.WEEKS_TPL.format(week_id=week_id)} with {new_data=}.')
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user)
    updated_week = await week_service.update_week(week, new_data)
    return WeekReadMinimal.model_validate(updated_week)


@router.delete(AppUrl.WEEKS_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week: The week object to delete.
        session: The database session for committing the deletion.
    """
    logger.info(f'Request DELETE {AppUrl.WEEKS_TPL.format(week_id=week_id)} by {user}.')
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user)
    await week_service.delete_week(week)


@router.patch(AppUrl.WEEK_SLOTS_TPL, response_model=list[MealSlotRead])
async def assign_recipe_to_meal_slot(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    slots_data: list[MealSlotAssign],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> list[MealSlotRead]:
    """Assigns the given recipes to meal slots or un-assigns if recipe_id is None.

    Args:
        slots_data: A list of slot assignments, each containing a slot ID and an optional recipe ID.
        week: The week containing the meal slots, injected by dependency.
        session: The database session for committing the changes.

    Returns:
        A list of updated meal slot objects.
    """
    logger.info(f'Request PATCH {AppUrl.WEEK_SLOTS_TPL.format(week_id=week_id)} with {slots_data=} by {user}.')
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user)
    updated_slots = await WeekService(session).assign_recipes_to_meal_slots(week, *slots_data)
    return [MealSlotRead.model_validate(meal_slot) for meal_slot in updated_slots]
