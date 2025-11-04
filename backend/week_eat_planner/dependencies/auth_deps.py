from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import UserOut
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import InvalidCredentials
from week_eat_planner.services.user_service import UserService

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')


async def get_current_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserOut:
    """FastAPI dependency to get the current user from a JWT token.

    Args:
        token: The OAuth2 password bearer token.
        session: The database session.

    Returns:
        The authenticated User object.

    Raises:
        InvalidCredentials: If the user from the token does not exist.
        NoEmailInToken: If the 'sub' claim is missing or not a string.
        TokenExpiredException: If the token has expired.
        InvalidJwtToken: If the token is invalid for any other reason.
    """
    user = await UserService(session).get_user_by_token(token)
    if not user:
        raise InvalidCredentials
    return user


async def get_current_active_user(
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> UserOut:
    """FastAPI dependency to get the current active user.

    This dependency relies on `get_current_user` to first resolve the user.

    Args:
        current_user: The user object obtained from the `get_current_user`
            dependency.

    Returns:
        The authenticated and active User object.

    Raises:
        InvalidCredentials: If the user not found is not active.
        NoEmailInToken: If the 'sub' claim is missing or not a string.
        TokenExpiredException: If the token has expired.
        InvalidJwtToken: If the token is invalid for any other reason.
    """
    if not current_user.is_active:
        logger.error(f'User {current_user} is not active.')
        raise InvalidCredentials
    return current_user
