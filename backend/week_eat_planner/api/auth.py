from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import Token, UserCreate, UserRead
from week_eat_planner.config import settings
from week_eat_planner.constants import AppUrl, REFRESH_TOKEN_COOKIE_NAME, TokenType
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import (
    RefreshTokenMissing,
    TokenExpired,
    TokenForbidden,
    TokenNotFound,
    TokenRevoked,
)
from week_eat_planner.services.auth_service import AuthService

router = APIRouter()


@router.post(AppUrl.AUTH_SIGNUP, response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> UserRead:
    """Registers a new user.

    Args:
        user_data: The user's email and password.

    Returns:
        The public information for the newly created user.

    Raises:
        HTTPException: 409 Conflict if a user with the same email already exists.
    """
    logger.info(f'Got POST {AppUrl.AUTH_SIGNUP} request with {user_data}.')
    created_user = await AuthService(session).register_user(user_data)
    return UserRead.model_validate(created_user)


@router.post(AppUrl.AUTH_LOGIN, response_model=Token)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> Token:
    """Authenticates a user and returns an access token.

    On successful authentication, an access token is returned in the response body,
    and a refresh token is set as an HTTP-only cookie.

    Args:
        user_data: The user's login credentials (username and password).

    Returns:
        A Token object containing the access token.

    Raises:
        HTTPException: 401 Unauthorized if credentials are invalid or the email format is incorrect.
    """
    logger.info(f'Got POST {AppUrl.AUTH_LOGIN} request for {user_data.username=}.')
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

    return Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_REFRESH, response_model=Token)
async def refresh_tokens(
    request: Request,
    response: Response,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Token:
    """Generates a new access token using a refresh token.

    This endpoint requires a valid refresh token to be present in an HTTP-only cookie.
    If the refresh token is valid, a new access token is returned and a new
    refresh token is set in the cookie.

    Returns:
        A new access token.

    Raises:
        HTTPException: 401 Unauthorized if the refresh token is missing, invalid, or expired.
    """
    logger.info(f'Got POST {AppUrl.AUTH_REFRESH} request for {user}.')
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

    return Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_LOGOUT, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Logs out the current user by invalidating their session.

    This endpoint invalidates the user's refresh token and removes the
    corresponding cookie from the client, effectively ending the session.

    Calling this endpoint when already logged out (e.g., with a missing or
    invalid refresh token) will still result in a successful response.

    Returns:
        None. A 204 No Content status code is returned on success.
    """
    logger.info(f'Got POST {AppUrl.AUTH_LOGOUT} request for {user}.')
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        logger.warning(f'No refresh token in request cookies for {user}.')
        return

    try:
        await AuthService(session).logout(user, refresh_token)
    except HTTPException as exc:
        # If the token was already expired, revoked, or not found, the user
        # is effectively logged out, so we can return a success response.
        if exc not in (TokenExpired, TokenForbidden, TokenNotFound, TokenRevoked):
            raise
        logger.warning(f'Logout attempted for {user.email} with already invalid refresh token: {exc.detail}')

    response.delete_cookie(key=REFRESH_TOKEN_COOKIE_NAME, path='/auth')
    return
