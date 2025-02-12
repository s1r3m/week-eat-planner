from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import UserDAO
from week_eat_planner.api.schemas import UserCreate, UserOut, Token
from week_eat_planner.db.session_maker import db
from week_eat_planner.constants import TokenType
from week_eat_planner.exceptions import InvalidEmail, UserNotFound
from week_eat_planner.helpers import create_access_token, get_password_hash, verify_password

auth_router = APIRouter(prefix='/auth')


@auth_router.post('/user', response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def add_user(
    user_data: Annotated[UserCreate, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Any:
    """Add a user."""
    assert user_data.password
    hashed_password = get_password_hash(user_data.password)
    user_in_db = await UserDAO(session).create_user(email=user_data.email, hashed_password=hashed_password)

    return user_in_db


@auth_router.post('/token', response_model=Token)
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Token:
    """Login the user."""
    try:
        user = UserCreate(email=user_data.username, password='filler')
    except ValueError as exc:
        raise InvalidEmail from exc

    user_in_db = await UserDAO(session).get_user_by_email(user.email)

    if not (user_in_db and verify_password(user_in_db.hashed_password, user_data.password)):
        raise UserNotFound

    access_token = create_access_token(data={"sub": user_in_db.email})
    return Token(access_token=access_token, token_type=TokenType.BEARER)
