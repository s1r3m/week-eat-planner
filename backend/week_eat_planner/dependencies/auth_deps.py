from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.db.models import User
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import InvalidJwtToken, UserNotFound
from week_eat_planner.helpers import get_email_from_token

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')


async def get_current_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> User:
    """FastAPI dependency to get the current user from a JWT token.

    Args:
        token: The OAuth2 password bearer token.
        session: The database session.

    Returns:
        The authenticated User object.

    Raises:
        UserNotFound: If the user from the token does not exist.
        InvalidJwtToken: If the token is invalid or expired.
    """
    email = get_email_from_token(token)
    user_in_db = await UserDAO(session).get_user_by_email(email)
    if not user_in_db:
        raise UserNotFound
    return user_in_db


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """FastAPI dependency to get the current active user.

    This dependency relies on `get_current_user` to first resolve the user.

    Args:
        current_user: The user object obtained from the `get_current_user`
            dependency.

    Returns:
        The authenticated and active User object.

    Raises:
        UserNotFound: If the user is not active.
    """
    if not current_user.is_active:
        raise UserNotFound
    return current_user
