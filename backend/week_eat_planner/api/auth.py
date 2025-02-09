from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import UserDAO
from week_eat_planner.api.schemas import EmailModel, UserCreate, UserModel, UserShow
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import InvalidEmail, UserNotFound
from week_eat_planner.helpers import create_access_token

auth_router = APIRouter(prefix='/auth')


@auth_router.post('/add', response_model=UserShow, status_code=status.HTTP_201_CREATED)
async def add_user(
    user_data: Annotated[UserCreate, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> UserShow:
    """Add a user."""
    user_dao = UserDAO(session)
    hashed_password = UserModel.get_password_hash(user_data.password)
    user_in_db = await user_dao.create_user(email=user_data.email, hashed_password=hashed_password)

    logger.debug(f'User with {user_in_db} is about to be returned')
    return UserShow.model_validate(user_in_db)


@auth_router.post('/token')
async def login(
    user_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> dict:
    """Login the user."""
    try:
        email = EmailModel(email=user_data.username)
    except ValueError as exc:
        raise InvalidEmail from exc

    user_in_db = await UserDAO(session).get_one_or_none(filter_=email)

    if not (user_in_db and UserModel.model_validate(user_in_db).verify_password(user_data.password)):
        raise UserNotFound

    access_token = create_access_token(data={"sub": user_in_db.email})
    return {'access_token': access_token, 'token_type': 'bearer'}
