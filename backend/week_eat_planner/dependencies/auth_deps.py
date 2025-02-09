from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import UserDAO
from week_eat_planner.api.schemas import EmailModel, UserModel
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import UserNotFound
from week_eat_planner.helpers import decode_token

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/token')


async def get_current_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserModel:
    """Get the current user."""
    email = decode_token(token)
    user_in_db = await UserDAO(session).get_one_or_none(filter_=EmailModel(email=email))
    if not user_in_db:
        raise UserNotFound
    return UserModel.model_validate(user_in_db)


async def get_current_active_user(
    current_user: Annotated[UserModel, Depends(get_current_user)],
) -> UserModel:
    """Get the current active user."""
    if not current_user.is_active:
        raise UserNotFound
    return current_user
