from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.db.models as db_model
from week_eat_planner.db.user_dao import UserDAO
from week_eat_planner.security.token_provider import get_email_from_token


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self._user_dao = UserDAO(session)

    async def get_user(self, token: str) -> db_model.User | None:
        email = get_email_from_token(token)
        user = await self._user_dao.get_user_by_email(email)

        return user
