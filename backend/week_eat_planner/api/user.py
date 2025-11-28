from typing import Annotated

from fastapi import APIRouter, Depends
from loguru import logger

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import UserRead
from week_eat_planner.constants import AppUrl

router = APIRouter(tags=['User'])


@router.get(AppUrl.USER, response_model=UserRead)
async def get_user(user: Annotated[UserRead, Depends(get_current_active_user)]) -> UserRead:
    """Get the current user profile.

    Args:
        user: The current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET {AppUrl.USER} request for {user.email}.')
    return UserRead.model_validate(user)
