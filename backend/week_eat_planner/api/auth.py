"""API router for authentication-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from httpx import AsyncClient
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_auth_session, get_current_user
from week_eat_planner.api.dependencies.httpx_client_deps import get_httpx_client
from week_eat_planner.api.schemas import ActivationToken, GoogleCode, SuccessResponse, UserCreate, UserLogin, UserRead
from week_eat_planner.constants import AppUrl, SESSION_COOIKE_NAME
from week_eat_planner.db.models import Session, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import UserAlreadyActivatedException
from week_eat_planner.helpers import set_session_cookie
from week_eat_planner.services.auth_service import AuthService
from week_eat_planner.services.email_service import EmailService
from week_eat_planner.services.session_service import SessionService

router = APIRouter(tags=['Auth'])


@router.post(AppUrl.AUTH_SIGNUP, response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> User:
    """Register a user with an email address, password, and display name.

    Args:
        user_data: Password account details for the new user.
        session: Database session committed by the dependency after the endpoint returns.

    Returns:
        The created user record, serialized as UserRead.

    Raises:
        UserAlreadyExistsException: If the email is already registered (HTTP 409).
    """
    logger.info(f'Got POST {AppUrl.AUTH_SIGNUP} request for {user_data.email}')
    auth_service = AuthService(session)
    created_user = await auth_service.register_user(user_data)
    activation_token = await auth_service.create_activation_token(created_user)
    await EmailService().send_activation_email(created_user, activation_token)

    return created_user


@router.post(AppUrl.AUTH_LOGIN, response_model=UserRead)
async def login(
    user_data: UserLogin,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> User:
    """Authenticate password credentials and set a session cookie.

    The response body contains a success status. The opaque session token is
    sent only in an HTTP-only cookie, with its hash stored in the database.

    Args:
        user_data: Email address and password to verify.
        session: Database session committed by the dependency after the endpoint returns.
        response: Response to receive the session cookie.

    Returns:
        A logged in user.

    Raises:
        OAuthAccountException: If the account has no password (HTTP 409).
        InvalidCredentialsException: If the credentials are incorrect (HTTP 401).
    """
    logger.info(f'Got POST {AppUrl.AUTH_LOGIN} request with {user_data.email=}')
    user = await AuthService(session).login(user_data)
    session_token = await SessionService(session).create_session_token(user)
    set_session_cookie(response, session_token)
    return user


@router.post(AppUrl.AUTH_LOGOUT, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    auth_session: Annotated[Session | None, Depends(get_current_auth_session)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Delete the current stored session and clear the session cookie.

    Missing, unknown, or expired session cookies still result in HTTP 204.

    Args:
        response: Response whose session cookie will be cleared.
        auth_session: Valid session resolved from the cookie, or None.
        session: Database session committed by the dependency after the endpoint returns.
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
    """Authenticate a verified Google identity and set a session cookie.

    Create an account on first login, or reuse the account matching the Google
    provider and user ID. The body contains a success status; the opaque
    session token is sent in an HTTP-only cookie.

    Args:
        data: One-time authorization code from the Google consent screen.
        session: Database session committed by the dependency after the endpoint returns.
        httpx_client: Shared HTTP client used for Google token and signing-key requests.
        response: Response to receive the session cookie.

    Returns:
        A success response after creating the authentication session.

    Raises:
        PasswordAccountException: If the Google email belongs to a password account.
        OAuthAccountException: If the email belongs to a different OAuth identity.
        OAuthInvalidCodeException: If Google rejects the authorization code.
        OAuthProviderException: If communication or identity verification fails.
    """
    logger.info(f'Got POST {AppUrl.AUTH_GOOGLE_EXCHANGE} request')
    user = await AuthService(session).login_with_google(data, httpx_client)
    session_token = await SessionService(session).create_session_token(user)
    set_session_cookie(response, session_token)

    return SuccessResponse()


@router.post(AppUrl.AUTH_VERIFY, response_model=SuccessResponse)
async def verify_activation(
    token: ActivationToken,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> SuccessResponse:
    """Verify a user's account using an activation token.

    Args:
        token: Account activation token to verify.
        session: Database session committed by the dependency after the endpoint returns.

    Returns:
        A success response after activating the account.

    Raises:
        BadActivationToken: If the token is invalid, expired, or already redeemed.
    """
    logger.info(f'Got POST {AppUrl.AUTH_VERIFY} request')
    await AuthService(session).activate_user_with_token(token.token)

    return SuccessResponse()


@router.post(AppUrl.AUTH_REACTIVATE, response_model=SuccessResponse)
async def recreate_activation_token(
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> SuccessResponse:
    """Creates a new activation token if the old one is lost."""
    logger.info(f'Got POST {AppUrl.AUTH_REACTIVATE} request')
    if user.is_email_verified:
        raise UserAlreadyActivatedException()

    activation_token = await AuthService(session).create_activation_token(user)
    await EmailService().send_activation_email(user, activation_token)

    return SuccessResponse()
