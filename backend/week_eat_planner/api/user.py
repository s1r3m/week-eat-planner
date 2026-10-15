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
from week_eat_planner.services.session_service import SessionService
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
        user: The user requesting the operation.
        session: Database session committed after the endpoint returns.

    Returns:
        The updated user profile.

    Raises:
        UserNotFoundException: If the user record no longer exists.
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
    """Change the password, revoke all sessions, and set a new session cookie.

    Verify the old password, update the stored password hash, delete the user's
    existing sessions, and authenticate again to create the replacement session.

    Args:
        data: Current and replacement passwords.
        user: Current authenticated, active user.
        session: Database session committed by the dependency after the endpoint returns.
        response: Response to receive the new HTTP-only session cookie.

    Returns:
        A success response after changing the password and creating the new session.

    Raises:
        UserNotFoundException: If the user record is missing.
        OAuthAccountException: If the account has no password.
        InvalidCredentialsException: If the current password is incorrect.
    """
    logger.info(f'Got PATCH {AppUrl.USER_PASSWORD} request for user {user.id}')
    updated_user = await UserService(session).change_password(user, data.old_password, data.new_password)
    await SessionService(session).revoke_all_sessions(user)
    logged_in_user = await AuthService(session).login(UserLogin(email=updated_user.email, password=data.new_password))
    session_token = await SessionService(session).create_session_token(logged_in_user)
    logger.info('Password change is successful')
    set_session_cookie(response, session_token)
    return SuccessResponse()
