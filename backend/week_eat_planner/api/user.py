"""API router for user-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import Token, UserRead
from week_eat_planner.api.schemas.user import UserChangePassword, UserUpdate
from week_eat_planner.constants import AppUrl, TokenType
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import set_refresh_cookie
from week_eat_planner.services.auth_service import AuthService
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
    """Update the current user's profile.

    Args:
        new_data: Fields to update (username).
        user: The current authenticated user.
        session: Database session with auto-commit.

    Returns:
        The updated user profile.
    """
    logger.info(f'Got PATCH {AppUrl.USER} request for user {user.id}')
    updated_user = await UserService(session).update_user(user, new_data)
    logger.info(f'User {user.id} updated successfully')
    return UserRead.model_validate(updated_user)


@router.patch(AppUrl.USER_PASSWORD)
async def change_password(
    data: UserChangePassword,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> Token:
    """Changes the current user's password.

    Validates the old password before setting the new one. On success,
    it re-authenticates the user and returns a new access token while
    setting a new refresh token cookie.

    Args:
        data: Schema containing old and new passwords.
        user: The currently authenticated user.
        session: Database session.
        response: FastAPI response object for setting cookies.

    Returns:
        A new access token for the user.
    """
    logger.info(f'Got PATCH {AppUrl.USER_PASSWORD} request for user {user.id}')
    updated_user = await UserService(session).change_password(user, data.old_password, data.new_password)
    access_token, refresh_token = await AuthService(session).login(updated_user.email, data.new_password)

    logger.info('Login successful')
    set_refresh_cookie(response, refresh_token)
    return Token(access_token=access_token, token_type=TokenType.BEARER)
