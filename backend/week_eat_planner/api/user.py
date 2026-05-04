"""API router for user-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import UserRead
from week_eat_planner.api.schemas.user import UserUpdate
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.services.user_service import UserService

router = APIRouter(tags=['User'])


@router.get(AppUrl.USER, response_model=UserRead)
async def get_user(user: Annotated[UserRead, Depends(get_current_active_user)]) -> UserRead:
    """Get the current user profile.

    Args:
        user: The current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET {AppUrl.USER} request for user {user.id}')
    return user


@router.patch(AppUrl.USER, response_model=UserRead)
async def update_user(
    new_data: UserUpdate,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> UserRead:
    logger.info(f'Got PATCH {AppUrl.USER} request for user {user.id}')
    updated_user = await UserService(session).update_user(user, new_data)
    logger.info(f'User {user.id} updated successfully')
    return UserRead.model_validate(updated_user)
