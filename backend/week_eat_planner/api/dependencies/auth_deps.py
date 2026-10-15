"""Authentication dependencies for FastAPI endpoints."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.constants import SESSION_COOIKE_NAME
from week_eat_planner.db.models import Session, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import NoSessionTokenException, SessionException, UserNotFoundException
from week_eat_planner.services.session_service import SessionService


async def get_current_auth_session(
    request: Request,
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Session | None:
    """Resolve an unexpired session from the request cookie, if present.

    Args:
        request: Incoming request containing the optional session cookie.
        session: Database session used to look up the hashed token.

    Returns:
        The stored session, or None if the cookie is missing or the session is
        unknown or expired. This dependency does not reject inactive users.
    """
    session_token = request.cookies.get(SESSION_COOIKE_NAME)
    if not session_token:
        return None

    try:
        auth_session = await SessionService(session).get_sesion_by_token(session_token)
    except SessionException:
        return None

    return auth_session


async def get_optional_user(auth_session: Annotated[Session | None, Depends(get_current_auth_session)]) -> User | None:
    """Return the user associated with an optional authentication session.

    Args:
        auth_session: Valid session from the request cookie, or None.

    Returns:
        The session's user, or None for an unauthenticated request. The user's
        active status is not checked.
    """
    if not auth_session:
        return None

    return auth_session.user


async def get_current_active_user(user: Annotated[User | None, Depends(get_optional_user)]) -> User:
    """Require an authenticated user whose account is active.

    Args:
        user: User resolved from the session cookie, or None.

    Returns:
        The authenticated, active user.

    Raises:
        NoSessionTokenException: If no valid session resolved to a user (HTTP 401).
        UserNotFoundException: If the authenticated user's account is inactive (HTTP 409).
    """
    if not user:
        raise NoSessionTokenException()

    if not user.is_active:
        raise UserNotFoundException(user_id=user.id)

    return user
