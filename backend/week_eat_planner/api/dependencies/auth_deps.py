from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import UserRead
from week_eat_planner.db.session_maker import db
from week_eat_planner.services.user_service import UserService

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')


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
