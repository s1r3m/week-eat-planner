from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.api.schemas import UserCreate, UserOut, Token
from week_eat_planner.db.models import User
from week_eat_planner.db.session_maker import db
from week_eat_planner.constants import TokenType
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import InvalidEmail, UserAlreadyExists, UserNotFound
from week_eat_planner.helpers import (
    create_access_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix='/auth')


@router.post('/signup', response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def add_user(
    user_data: UserCreate,
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> User:
    """Adds a user.

    Checks if a user with the given email already exists. If not, it hashes the
    password and creates a new user in the database.

    Raises:
        UserAlreadyExists: If a user with the same email is already registered.
    """
    logger.info(f'Got POST /signup request with {user_data}.')
    user_dao = UserDAO(session)
    user = await user_dao.get_user_by_email(user_data.email)
    if user:
        raise UserAlreadyExists

    hashed_password = get_password_hash(user_data.password)
    user_in_db = await user_dao.create_user(email=user_data.email, hashed_password=hashed_password)

    return user_in_db


@router.post('/login', response_model=Token)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Token:
    """Login the user and return an access token.

    Validates credentials and returns a JWT bearer token upon success.

    Raises:
        UserNotFound: If a user with the email is not registered.
        InvalidEmail: If the email format is invalid.
    """
    logger.info(f'Got POST /login request for {user_data.username}.')
    try:
        UserCreate(email=user_data.username, password='filler')
    except ValueError as exc:
        raise InvalidEmail from exc

    user_in_db = await UserDAO(session).get_user_by_email(user_data.username)

    if not (user_in_db and verify_password(user_data.password, user_in_db.hashed_password)):
        raise UserNotFound

    access_token = create_access_token(user_in_db.email)
    return Token(access_token=access_token, token_type=TokenType.BEARER)


@router.get('/me', response_model=UserOut)
async def get_user(user: Annotated[UserOut, Depends(get_current_active_user)]) -> UserOut:
    """Get the current user profile."""
    logger.info(f'Got GET /me request for {user}.')
    return user
