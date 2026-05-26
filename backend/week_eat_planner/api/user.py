"""API router for user-related endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Response
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_active_user_id
from week_eat_planner.api.schemas import UserRead
from week_eat_planner.api.schemas.common import SuccessResponse
from week_eat_planner.api.schemas.user import UserChangePassword, UserUpdate
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import set_access_cookies, set_refresh_cookie
from week_eat_planner.services.auth_service import AuthService
from week_eat_planner.services.user_service import UserService

router = APIRouter(tags=['User'])


@router.get(AppUrl.USER, response_model=UserRead)
async def get_user(
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserRead:
    """Get the current user profile.

    Args:
        user_id: The ID of the current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET {AppUrl.USER} request for user {user_id}')
    user = await UserService(session).get_user(user_id)
    return UserRead.model_validate(user)


@router.patch(AppUrl.USER, response_model=UserRead)
async def update_user(
    new_data: UserUpdate,
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> UserRead:
    """Update the current user's profile.

    Args:
        new_data: Fields to update (username).
        user_id: The ID of the current authenticated user.
        session: Database session with auto-commit.

    Returns:
        The updated user profile.
    """
    logger.info(f'Got PATCH {AppUrl.USER} request for user {user_id}')
    updated_user = await UserService(session).update_user(user_id, new_data)
    logger.info(f'User {user_id} updated successfully')
    return UserRead.model_validate(updated_user)


@router.patch(AppUrl.USER_PASSWORD, response_model=SuccessResponse)
async def change_password(
    data: UserChangePassword,
    user_id: Annotated[UUID, Depends(get_active_user_id)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> SuccessResponse:
    """Changes the current user's password.

    Validates the old password before setting the new one. On success,
    it re-authenticates the user and sets new access and refresh token cookies.

    Args:
        data: Schema containing old and new passwords.
        user_id: The ID of the currently authenticated user.
        session: Database session.
        response: FastAPI response object for setting cookies.

    Returns:
        None.
    """
    logger.info(f'Got PATCH {AppUrl.USER_PASSWORD} request for user {user_id}')
    updated_user = await UserService(session).change_password(user_id, data.old_password, data.new_password)
    access_token, refresh_token = await AuthService(session).login(updated_user.email, data.new_password)

    logger.info('Login successful')
    set_refresh_cookie(response, refresh_token)
    set_access_cookies(response, access_token)

    return SuccessResponse()
