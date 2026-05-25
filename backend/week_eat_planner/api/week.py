"""API router for week-related endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_active_user_id, get_optional_user_id
from week_eat_planner.api.schemas import (
    MealSlotAssign,
    MealSlotRead,
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
    user_id: Annotated[UUID, Depends(get_active_user_id)],
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
    logger.info(f'Got POST {AppUrl.WEEKS} request for user {user_id}')
    week = await WeekService(session).create_week_with_slots(user_id, week_data)
    return WeekReadMinimal.model_validate(week)


@router.get(AppUrl.WEEKS, response_model=list[WeekReadMinimal])
async def get_user_weeks(
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[WeekReadMinimal]:
    """Retrieves all weeks for the current user.

    Args:
        user: The authenticated user.
        session: The database session.

    Returns:
        A list of weeks belonging to the user.
    """
    logger.info(f'Got GET {AppUrl.WEEKS} request for user {user_id}')
    weeks = await WeekService(session).get_weeks(user_id)
    return [WeekReadMinimal.model_validate(week) for week in weeks]


@router.get(AppUrl.WEEKS_TPL, response_model=WeekRead)
async def get_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user_id: Annotated[UUID | None, Depends(get_optional_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> WeekRead:
    """Retrieves a specific week by its ID.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to retrieve.
        user: The authenticated user or None for public access (TODO).
        session: The database session.

    Returns:
        The requested week object.
    """
    logger.info(f'Got GET {AppUrl.WEEKS_TPL.format(week_id=week_id)}')
    week = await WeekService(session).get_visible_week(week_id, user_id)
    return WeekRead.model_validate(week)


@router.patch(AppUrl.WEEKS_TPL, response_model=WeekReadMinimal)
async def update_week(
    new_data: WeekUpdate,
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> WeekReadMinimal:
    """Updates a specific week.

    The week must belong to the currently authenticated user.

    Args:
        new_data: The new data for the week.
        week_id: The ID of the week to update.
        user: The authenticated user.
        session: The database session.

    Returns:
        The updated week object.
    """
    logger.info(f'Got PATCH {AppUrl.WEEKS_TPL.format(week_id=week_id)}')
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user_id)
    updated_week = await week_service.update_week(week, new_data)
    return WeekReadMinimal.model_validate(updated_week)


@router.delete(AppUrl.WEEKS_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_week(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a specific week.

    The week must belong to the currently authenticated user.

    Args:
        week_id: The ID of the week to delete.
        user: The authenticated user.
        session: The database session.
    """
    logger.info(f'Got DELETE {AppUrl.WEEKS_TPL.format(week_id=week_id)} for user {user_id}')
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user_id)
    await week_service.delete_week(week)


@router.patch(AppUrl.WEEK_SLOTS_TPL, response_model=list[MealSlotRead])
async def assign_recipe_to_meal_slot(
    week_id: Annotated[str, Path(title='ID of the week to get')],
    slots_data: list[MealSlotAssign],
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> list[MealSlotRead]:
    """Assigns the given recipes to meal slots or un-assigns if recipe_id is None.

    Args:
        week_id: The ID of the week containing the slots.
        slots_data: A list of slot assignments, each containing a slot ID and an optional recipe ID.
        user: The authenticated user.
        session: The database session.

    Returns:
        A list of updated meal slot objects.
    """
    logger.info(
        f'Got PATCH {AppUrl.WEEK_SLOTS_TPL.format(week_id=week_id)} with {len(slots_data)} slots for user {user_id}'
    )
    week_service = WeekService(session)
    week = await week_service.get_week_for_edit(week_id, user_id)
    updated_slots = await week_service.assign_recipes_to_meal_slots(week, *slots_data)
    return [MealSlotRead.model_validate(meal_slot) for meal_slot in updated_slots]
