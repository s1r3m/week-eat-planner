from typing import Annotated

from fastapi import APIRouter, Depends
from loguru import logger

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.constants import AppUrl
from week_eat_planner.dependencies.auth_deps import get_current_active_user

router = APIRouter()


@router.get(AppUrl.USER, response_model=schema.UserOut)
async def get_user(user: Annotated[db_model.User, Depends(get_current_active_user)]) -> schema.UserOut:
    """Get the current user profile.

    Args:
        user: The current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET /me request for {user.email}.')
    return schema.UserOut.model_validate(user)
