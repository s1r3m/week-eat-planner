from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.config import settings
from week_eat_planner.constants import AppUrl, REFRESH_TOKEN_COOKIE_NAME, TokenType
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import RefreshTokenMissing
from week_eat_planner.services.auth_service import AuthService

router = APIRouter()


@router.post(AppUrl.AUTH_SIGNUP, response_model=schema.UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: schema.UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> db_model.User:
    logger.info(f'Got POST /signup request with {user_data}.')
    created_user = await AuthService(session).register_user(str(user_data.email), user_data.password)
    return created_user


@router.post(AppUrl.AUTH_LOGIN, response_model=schema.Token)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> schema.Token:
    """Login the user and return an access token.

    Validates credentials and returns a JWT bearer token upon success.

    Args:
        user_data: The user's login credentials.
        session: The database session.
        response: A Response object to set cookies to.
    Returns:
        Access and refresh tokens.

    Raises:
        UserNotFound: If a user with the email is not registered.
        InvalidEmail: If the email format is invalid.
    """
    logger.info(f'Got POST /login request for {user_data.username=}.')
    access_token, refresh_token = await AuthService(session).login(user_data.username, user_data.password)
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        # secure=True,  # TODO: enable HTTPS
        samesite='strict',
        max_age=settings.REFRESH_TOKEN_TTL,
        path='/auth',
    )

    return schema.Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_REFRESH, response_model=schema.Token)
async def refresh_tokens(
    request: Request,
    response: Response,
    user: Annotated[db_model.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> schema.Token:
    """Refreshes access and refresh tokens.

    This endpoint takes an existing refresh token from the request cookies,
    validates it, revokes the old token, generates a new refresh token and
    access token, and sets the new refresh token in the response cookies.

    Args:
        request: The incoming request object, used to retrieve the refresh token cookie.
        response: The response object, used to set the new refresh token cookie.
        user: The currently authenticated user, obtained via dependency injection.
        session: The database session, obtained via dependency injection.

    Returns:
        A schema.Token object containing the new access token and its type.

    Raises:
        RefreshTokenMissing: If the refresh token cookie is not found in the request.
        InvalidRefreshToken: If the refresh token found in the cookie is invalid or has been revoked.
        TokenExpiredException: If the refresh token found in the cookie has expired.
    """
    logger.info(f'Got POST /refresh request for {user}.')
    cookie_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not cookie_token:
        logger.error(f'No refresh token in request cookies for {user}.')
        raise RefreshTokenMissing

    access_token, refresh_token = await AuthService(session).refresh_tokens(user, cookie_token)
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        # secure=True,  # TODO: enable HTTPS
        samesite='strict',
        max_age=settings.REFRESH_TOKEN_TTL,
        path='/auth',
    )

    return schema.Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_LOGOUT, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    user: Annotated[db_model.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Logs out the current user.

    This endpoint revokes the refresh token associated with the current user
    and deletes the refresh token cookie from the client. If no refresh token
    is found, or it's already invalid/revoked, it logs a warning and proceeds
    without error.

    Args:
        request: The incoming request object, used to retrieve the refresh token cookie.
        response: The response object, used to delete the refresh token cookie.
        user: The currently authenticated user, obtained via dependency injection.
        session: The database session, obtained via dependency injection.

    Returns:
        None. The response status code is 204 No Content upon successful logout
        or if the token was already missing/invalid.
    """
    logger.info(f'Got POST /logout request for {user}.')
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        logger.warning(f'No refresh token in request cookies for {user}.')
        return

    await AuthService(session).logout(user, refresh_token)
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE_NAME, path='/auth')
    return
