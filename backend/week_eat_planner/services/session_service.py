"""Create, validate, and revoke stored authentication sessions."""

from datetime import UTC, datetime, timedelta

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import OwnerId, SessionToken
from week_eat_planner.config import settings
from week_eat_planner.db.dao import SessionDAO
from week_eat_planner.db.models import Session, User
from week_eat_planner.exceptions import SessionExpiredException, SessionNotFoundException
from week_eat_planner.security.token_provider import TokenProvider


class SessionService:
    """Manage stored authentication sessions within the caller's transaction."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize database access using the provided session.

        Args:
            session: Database session whose transaction is managed by the caller.
        """
        self._session_dao = SessionDAO(session)

    async def create_session_token(self, db_user: User) -> str:
        """Create an opaque token and store its hash in a new session.

        The session starts with the current UTC time as last_used_at and expires
        SESSION_TTL_DAYS later. The caller manages the database transaction.

        Args:
            db_user: User who owns the new session.

        Returns:
            The plain-text token to send to the client; only its SHA-256 hash is stored.
        """
        token = TokenProvider.get_session_token()
        hashed_token = TokenProvider.hash_token(token)

        now = datetime.now(UTC)
        auth_session = Session(
            user_id=db_user.id,
            hashed_token=hashed_token,
            last_used_at=now,
            expires_at=now + timedelta(days=settings.SESSION_TTL_DAYS),
        )

        await self._session_dao.add(auth_session)

        return token

    async def get_sesion_by_token(self, token: str) -> Session:
        """Find a session by its token hash and reject expired sessions.

        This lookup does not update last_used_at or extend the expiration time.

        Args:
            token: Plain-text session token from the request cookie.

        Returns:
            The matching unexpired session, including its eagerly loaded user.

        Raises:
            SessionNotFoundException: If no stored session matches the token hash.
            SessionExpiredException: If the session expires at or before the current UTC time.
        """
        token_hash = TokenProvider.hash_token(token)
        auth_session = await self._session_dao.find_one_or_none(SessionToken(hashed_token=token_hash))

        if not auth_session:
            raise SessionNotFoundException()

        if auth_session.expires_at <= datetime.now(UTC):
            raise SessionExpiredException()

        return auth_session

    async def revoke_all_sessions(self, user: User) -> int:
        """Delete every stored session belonging to a user.

        Args:
            user: User whose sessions should be revoked.

        Returns:
            The number of deleted sessions.
        """
        logger.debug(f'Revoking all user {user.id} sessions')
        count = await self._session_dao.delete(OwnerId(user_id=user.id))
        logger.info(f'Revoked {count} sessions for {user.id}')

        return count
