from datetime import datetime, timedelta, timezone
from uuid import UUID

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from uuid_utils import uuid7

import week_eat_planner.db.models as db_model
from week_eat_planner.config import settings
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.helpers import hash_refresh_token


class RefreshTokenDAO(BaseDAO):
    """Data Access Object for managing refresh tokens."""

    model = db_model.RefreshToken

    async def create_token(self, user: db_model.User, raw_token: str) -> db_model.RefreshToken:
        logger.debug(f'Creating refresh token for {user}.')
        token_hash = hash_refresh_token(raw_token)
        token_id = UUID(str(uuid7()))
        now = datetime.now(timezone.utc)
        refresh_token = db_model.RefreshToken(
            id=token_id,
            token_hash=token_hash,
            user_id=user.id,
            issued_at=now,
            expires_at=now + timedelta(days=settings.REFRESH_TOKEN_TTL),
            revoked=False,
        )
        try:
            self._session.add(refresh_token)
            await self._session.flush()
        except SQLAlchemyError as exc:
            logger.exception(f'Error while creating refresh token for {user=}: {exc}.')
            raise exc

        logger.debug(f'Refresh token for {user=} has been successfully created.')
        return refresh_token

    async def get_token_by_hash(self, token_hash: str) -> db_model.RefreshToken | None:
        logger.debug(f'Getting refresh token for {token_hash=}.')
        token = await self._get_one_or_none(token_hash=token_hash)
        return token

    async def revoke_token(self, old_token: db_model.RefreshToken, revoked_by_id: UUID | None) -> db_model.RefreshToken:
        logger.debug(f'Revoking {old_token}.')

        old_token.revoked = True
        old_token.replaced_by = revoked_by_id

        try:
            self._session.add(old_token)
        except SQLAlchemyError as exc:
            logger.exception(f'Error while revoking {old_token}: {exc}.')
            raise exc

        return old_token
