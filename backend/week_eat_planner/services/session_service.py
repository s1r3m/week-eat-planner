from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import SessionToken
from week_eat_planner.config import settings
from week_eat_planner.db.dao import SessionDAO
from week_eat_planner.db.models import Session, User
from week_eat_planner.exceptions import SessionNotFoundException
from week_eat_planner.security.token_provider import TokenProvider


class SessionService:
    def __init__(self, session: AsyncSession) -> None:
        self._session_dao = SessionDAO(session)

    async def create_session_token(self, db_user: User) -> str:
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
        token_hash = TokenProvider.hash_token(token)
        auth_session = await self._session_dao.find_one_or_none(SessionToken(session_token=token_hash))

        if not auth_session:
            raise SessionNotFoundException()

        return auth_session
