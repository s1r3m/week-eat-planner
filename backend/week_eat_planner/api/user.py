from typing import Annotated

from fastapi import APIRouter, Depends
from loguru import logger

from week_eat_planner.api.schemas import UserOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.dependencies.auth_deps import get_current_active_user

router = APIRouter()


@router.get(AppUrl.USER, response_model=UserOut)
async def get_user(user: Annotated[UserOut, Depends(get_current_active_user)]) -> UserOut:
    """Get the current user profile.

    Args:
        user: The current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET {AppUrl.USER} request for {user.email}.')
    return UserOut.model_validate(user)
