from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schemas
import week_eat_planner.db.models as db_models
from week_eat_planner.config import settings
from week_eat_planner.constants import AppUrl, REFRESH_TOKEN_COOKIE_NAME, TokenType
from week_eat_planner.db.refresh_token_dao import RefreshTokenDAO
from week_eat_planner.db.session_maker import db
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import (
    InvalidEmail,
    InvalidRefreshToken,
    RefreshTokenMissing,
    UserAlreadyExists,
    UserNotFound,
)
from week_eat_planner.helpers import (
    create_access_token,
    generate_refresh_token,
    get_password_hash,
    hash_refresh_token,
    verify_password,
)

router = APIRouter()


@router.post(AppUrl.AUTH_SIGNUP, response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: schemas.UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> db_models.User:
    """Adds a user.

    Checks if a user with the given email already exists. If not, it hashes the
    password and creates a new user in the database.

    Args:
        user_data: The user data to create a new user.
        session: The database session.

    Returns:
        The created user.

    Raises:
        UserAlreadyExists: If a user with the same email is already registered.
    """
    logger.info(f'Got POST /signup request with {user_data}.')
    user_dao = UserDAO(session)
    user = await user_dao.get_user_by_email(user_data.email)
    if user:
        raise UserAlreadyExists

    hashed_password = get_password_hash(user_data.password)
    created_user = await user_dao.create_user(email=user_data.email, hashed_password=hashed_password)

    return created_user


@router.post(AppUrl.AUTH_LOGIN, response_model=schemas.Token)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    response: Response,
) -> schemas.Token:
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
    logger.info(f'Got POST /login request for {user_data.username}.')
    try:
        schemas.UserCreate(email=user_data.username, password='filler')
    except ValueError as exc:
        raise InvalidEmail from exc

    db_user = await UserDAO(session).get_user_by_email(user_data.username)

    if not (db_user and verify_password(user_data.password, db_user.hashed_password)):
        raise UserNotFound

    access_token = create_access_token(db_user.email)
    refresh_token = generate_refresh_token()
    await RefreshTokenDAO(session).create_token(db_user, refresh_token)

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        # secure=True,  # TODO: enable HTTPS
        samesite='strict',
        max_age=settings.REFRESH_TOKEN_TTL,
        path='/auth',
    )

    return schemas.Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_REFRESH, response_model=schemas.Token)
async def refresh_tokens(
    request: Request,
    response: Response,
    user: Annotated[db_models.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> schemas.Token:
    logger.info(f'Got POST /refresh request for {user.email=}.')
    cookie_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not cookie_token:
        logger.error(f'No refresh token in request cookies for {user.email=}.')
        raise RefreshTokenMissing

    refresh_token_dao = RefreshTokenDAO(session)
    token_hash = hash_refresh_token(cookie_token)
    old_token = await refresh_token_dao.get_token_by_hash(token_hash)
    if not old_token or old_token.revoked or old_token.expires_at <= datetime.now(timezone.utc):
        logger.error(f'Invalid refresh token in request cookies for {user.email=}.')
        raise InvalidRefreshToken

    new_raw_token = generate_refresh_token()
    new_token = await refresh_token_dao.create_token(user, new_raw_token)
    await refresh_token_dao.revoke_token(old_token, revoked_by_id=new_token.id)

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=new_raw_token,
        httponly=True,
        # secure=True,  # TODO: enable HTTPS
        samesite='strict',
        max_age=settings.REFRESH_TOKEN_TTL,
        path='/auth',
    )
    access_token = create_access_token(user.email)
    return schemas.Token(access_token=access_token, token_type=TokenType.BEARER)


@router.post(AppUrl.AUTH_LOGOUT, status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    user: Annotated[db_models.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        logger.warning(f'No refresh token in request cookies for {user.email=}.')
        return

    refresh_token_dao = RefreshTokenDAO(session)
    token_hash = hash_refresh_token(refresh_token)
    db_token = await refresh_token_dao.get_token_by_hash(token_hash)
    if not db_token:
        logger.warning(f'Invalid refresh token in request cookies for {user.email=}.')
        return

    await refresh_token_dao.revoke_token(db_token, revoked_by_id=None)
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE_NAME, path='/auth')
    return


@router.get(AppUrl.AUTH_ME, response_model=schemas.UserOut)
async def get_user(user: Annotated[db_models.User, Depends(get_current_active_user)]) -> schemas.UserOut:
    """Get the current user profile.

    Args:
        user: The current authenticated user.

    Returns:
        The current user's profile.
    """
    logger.info(f'Got GET /me request for {user.email}.')
    return schemas.UserOut.model_validate(user)
