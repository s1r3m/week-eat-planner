"""Authentication dependencies for FastAPI endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import UserRead
from week_eat_planner.db.session_maker import db
from week_eat_planner.security.token_provider import get_user_id_from_token
from week_eat_planner.services.user_service import UserService

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')
_oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl='/auth/login', auto_error=False)


async def get_current_active_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserRead:
    """FastAPI dependency to get the current user from a JWT token.

    Args:
        token: The OAuth2 password bearer token.
        session: The database session.

    Returns:
        The authenticated User object.
    """
    user = await UserService(session).get_user_by_token(token)
    return UserRead.model_validate(user)


async def get_optional_user(
    token: Annotated[str | None, Depends(_oauth2_scheme_optional)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> UserRead | None:
    """FastAPI dependency to optionally get the current user.

    If no token is provided, returns None instead of raising an error.

    Args:
        token: The optional OAuth2 password bearer token.
        session: The database session.

    Returns:
        The authenticated User object or None.
    """
    if not token:
        return None

    user = await UserService(session).get_user_by_token(token)
    return UserRead.model_validate(user)


async def get_active_user_id(token: Annotated[str, Depends(_oauth2_scheme)]) -> UUID:
    user_id = get_user_id_from_token(token)
    return user_id


async def get_optional_user_id(token: Annotated[str | None, Depends(_oauth2_scheme_optional)]) -> UUID | None:
    if not token:
        return None

    return await get_active_user_id(token)
