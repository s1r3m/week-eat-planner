"""API router for user-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import SuccessResponse, UserChangePassword, UserLogin, UserRead, UserUpdate
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.models import User
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import set_session_cookie
from week_eat_planner.services.auth_service import AuthService
from week_eat_planner.services.user_service import UserService

router = APIRouter(tags=['User'])


@router.get(AppUrl.USER, response_model=UserRead)
async def get_user(
    user: Annotated[User, Depends(get_current_active_user)],
) -> User:
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
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> User:
    """Update the current user's profile.

    Args:
        new_data: Fields to update (username).
        user_id: The ID of the current authenticated user.
        session: Database session with auto-commit.

    Returns:
        The updated user profile.
    """
    logger.info(f'Got PATCH {AppUrl.USER} request for user {user.id}')
    updated_user = await UserService(session).update_user(user, new_data)
    logger.info(f'User {user.id} updated successfully')
    return updated_user


@router.patch(AppUrl.USER_PASSWORD, response_model=SuccessResponse)
async def change_password(
    data: UserChangePassword,
    user: Annotated[User, Depends(get_current_active_user)],
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
        A SuccessResponse indicating successful password change.
    """
    logger.info(f'Got PATCH {AppUrl.USER_PASSWORD} request for user {user.id}')
    updated_user = await UserService(session).change_password(user, data.old_password, data.new_password)
    session_token = await AuthService(session).login(UserLogin(email=updated_user.email, password=data.new_password))
    logger.info('Password change is successful')

    set_session_cookie(response, session_token)
    return SuccessResponse()
