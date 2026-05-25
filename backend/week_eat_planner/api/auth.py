"""API router for authentication-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from httpx import AsyncClient
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.dependencies.httpx_client_deps import get_httpx_client
from week_eat_planner.api.schemas import UserCreate, UserRead
from week_eat_planner.api.schemas.user import GoogleCode
from week_eat_planner.constants import (
    ACCESS_TOKEN_COOIKE_PATH,
    ACCESS_TOKEN_COOKIE_NAME,
    AppUrl,
    REFRESH_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_PATH,
)
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import (
    LoginWithAuthException,
    RefreshTokenMissingException,
    RefreshTokenNotFoundException,
    SignUpWithAuthException,
    TokenExpiredException,
    TokenForbidden,
    TokenRevokedException,
)
from week_eat_planner.helpers import set_access_cookies, set_refresh_cookie
from week_eat_planner.services.auth_service import AuthService

router = APIRouter(tags=['Auth'])


@router.post(AppUrl.AUTH_SIGNUP, response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    request: Request,
    response: Response,
) -> UserRead:
    """Registers a new user and authenticates them.

    Args:
        user_data: The user's email and password.

    Returns:
        A Token object containing the access token and token type.

    Raises:
        SignUpWithAuthException: If the request contains an Authorization header.
        HTTPException: 409 Conflict if a user with the same email already exists.
    """
    logger.info(f'Got POST {AppUrl.AUTH_SIGNUP} request for {user_data.email}')
    if request.headers.get('Authorization'):
        logger.warning('Authorization header should not be set for sign up requests')
        raise SignUpWithAuthException()

    auth_service = AuthService(session)
    created_user = await auth_service.register_user(user_data)
    access_token, refresh_token = await auth_service.login(created_user.email, user_data.password)
    set_refresh_cookie(response, refresh_token)
    set_access_cookies(response, access_token)

    return UserRead.model_validate(created_user)


@router.post(AppUrl.AUTH_LOGIN)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    request: Request,
    response: Response,
) -> None:
    """Authenticates a user and returns an access token.

    On successful authentication, an access token is returned in the response body,
    and a refresh token is set as an HTTP-only cookie.

    Args:
        user_data: The user's login credentials (username and password).

    Returns:
        TBD

    Raises:
        LoginWithAuthException: If the request contains an Authorization header.
        HTTPException: 401 Unauthorized if credentials are invalid or the email format is incorrect.
    """
    logger.info(f'Got POST {AppUrl.AUTH_LOGIN} request for {user_data.username=}')
    if request.headers.get('Authorization'):
        logger.warning('Authorization header should not be set for login requests')
        raise LoginWithAuthException()

    access_token, refresh_token = await AuthService(session).login(user_data.username, user_data.password)
    set_refresh_cookie(response, refresh_token)
    set_access_cookies(response, access_token)


@router.post(AppUrl.AUTH_REFRESH)
async def refresh_tokens(
    request: Request,
    response: Response,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Generates a new access token using a refresh token.

    This endpoint requires a valid refresh token to be present in an HTTP-only cookie.
    If the refresh token is valid, a new access token is returned and a new
    refresh token is set in the cookie.

    Returns:
        TBD

    Raises:
        HTTPException: 401 Unauthorized if the refresh token is missing, invalid, or expired.
    """
    logger.info(f'Got POST {AppUrl.AUTH_REFRESH} request')
    cookie_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not cookie_token:
        logger.error('No refresh token in request cookies')
        raise RefreshTokenMissingException()

    access_token, refresh_token = await AuthService(session).refresh_tokens(cookie_token)
    set_refresh_cookie(response, refresh_token)
    set_access_cookies(response, access_token)


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
    logger.info(f'Got POST {AppUrl.AUTH_LOGOUT} request for user {user.id}')
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        logger.warning(f'No refresh token in request cookies for user {user.id}')
        return

    try:
        await AuthService(session).logout(user, refresh_token)
    except (TokenExpiredException, TokenForbidden, RefreshTokenNotFoundException, TokenRevokedException) as exc:
        # If the token was already expired, revoked, or not found, the user
        # is effectively logged out, so we can return a success response.
        logger.warning(f'Logout attempted for user {user.id} with already invalid refresh token: {exc.detail}')

    response.delete_cookie(key=REFRESH_TOKEN_COOKIE_NAME, path=REFRESH_TOKEN_COOKIE_PATH)
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE_NAME, path=ACCESS_TOKEN_COOIKE_PATH)
    return


@router.post(AppUrl.AUTH_GOOGLE_EXCHANGE)
async def google_auth(
    data: GoogleCode,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    httpx_client: Annotated[AsyncClient, Depends(get_httpx_client)],
    response: Response,
) -> None:
    """Authenticates a user via the Google OAuth 2.0 authorization code flow.

    Accepts the one-time authorization code from the frontend, exchanges it
    with Google, and returns an access token. A refresh token is set as an
    HTTP-only cookie. Creates a new user account on first login.

    Args:
        data: The authorization code payload received from the Google consent screen.

    Returns:
        TBD

    Raises:
        PasswordAccountException: If the Google email is already registered with
            a password account.
        OAuthInvalidCodeException: If Google rejects the authorization code.
        OAuthProviderException: If the Google token exchange or JWT verification fails.
    """
    logger.info(f'Got POST {AppUrl.AUTH_GOOGLE_EXCHANGE} request')
    access_token, refresh_token = await AuthService(session).login_with_google(data, httpx_client)

    set_refresh_cookie(response, refresh_token)
    set_access_cookies(response, access_token)
