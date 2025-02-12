from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import UserDAO
from week_eat_planner.api.schemas import UserOut
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import UserNotFound
from week_eat_planner.helpers import get_email_from_token

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/token')


async def get_current_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserOut:
    """Get the current user."""
    email = get_email_from_token(token)
    user_in_db = await UserDAO(session).get_user_by_email(email)
    if not user_in_db:
        raise UserNotFound
    return UserOut.model_validate(user_in_db)


async def get_current_active_user(
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> UserOut:
    """Get the current active user."""
    if not current_user.is_active:
        raise UserNotFound
    return current_user
