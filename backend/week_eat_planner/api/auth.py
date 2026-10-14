"""API router for authentication-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from httpx import AsyncClient
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_auth_session
from week_eat_planner.api.dependencies.httpx_client_deps import get_httpx_client
from week_eat_planner.api.schemas import SuccessResponse, UserCreate, UserRead
from week_eat_planner.api.schemas.user import GoogleCode, UserLogin
from week_eat_planner.constants import AppUrl, SESSION_COOIKE_NAME
from week_eat_planner.db.models import Session, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import set_session_cookie
from week_eat_planner.services.auth_service import AuthService

router = APIRouter(tags=['Auth'])


@router.post(AppUrl.AUTH_SIGNUP, response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> User:
    """Registers a new user.

    Args:
        user_data: The user's email and password.

    Returns:
        UserRead object with created user info.

    Raises:
        SignUpWithAuthException: If the request contains an Authorization header.
        HTTPException: 409 Conflict if a user with the same email already exists.
    """
    logger.info(f'Got POST {AppUrl.AUTH_SIGNUP} request for {user_data.email}')
    auth_service = AuthService(session)
    created_user = await auth_service.register_user(user_data)

    return created_user


@router.post(AppUrl.AUTH_LOGIN, response_model=SuccessResponse)
async def login(
    user_data: UserLogin,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> SuccessResponse:
    """Authenticates a user and returns an access token.

    On successful authentication, an access token is returned in the response body,
    and a refresh token is set as an HTTP-only cookie.

    Args:
        user_data: The user's login credentials (email and password).

    Returns:
        A SuccessResponse indicating successful authentication.

    Raises:
        LoginWithAuthException: If the request contains an Authorization header.
        HTTPException: 401 Unauthorized if credentials are invalid or the email format is incorrect.
    """
    logger.info(f'Got POST {AppUrl.AUTH_LOGIN} request with {user_data.email=}')
    session_token = await AuthService(session).login(user_data)
    set_session_cookie(response, session_token)
    return SuccessResponse()


@router.post(AppUrl.AUTH_LOGOUT, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    auth_session: Annotated[Session | None, Depends(get_current_auth_session)],
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
    logger.info(f'Got POST {AppUrl.AUTH_LOGOUT} request for with session.')
    if not auth_session:
        logger.warning('A logout request with missing session is registered')
    else:
        await AuthService(session).logout(auth_session)
    response.delete_cookie(key=SESSION_COOIKE_NAME)


@router.post(AppUrl.AUTH_GOOGLE_EXCHANGE, response_model=SuccessResponse)
async def google_auth(
    data: GoogleCode,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    httpx_client: Annotated[AsyncClient, Depends(get_httpx_client)],
    response: Response,
) -> SuccessResponse:
    """Authenticates a user via the Google OAuth 2.0 authorization code flow.

    Accepts the one-time authorization code from the frontend, exchanges it
    with Google, and returns an access token. A refresh token is set as an
    HTTP-only cookie. Creates a new user account on first login.

    Args:
        data: The authorization code payload received from the Google consent screen.

    Returns:
        A SuccessResponse indicating successful authentication.

    Raises:
        PasswordAccountException: If the Google email is already registered with
            a password account.
        OAuthInvalidCodeException: If Google rejects the authorization code.
        OAuthProviderException: If the Google token exchange or JWT verification fails.
    """
    logger.info(f'Got POST {AppUrl.AUTH_GOOGLE_EXCHANGE} request')
    session_token = await AuthService(session).login_with_google(data, httpx_client)

    set_session_cookie(response, session_token)
    return SuccessResponse()
