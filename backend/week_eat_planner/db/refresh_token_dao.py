from datetime import datetime, timedelta, timezone

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

import week_eat_planner.db.models as db_model
from week_eat_planner.config import settings
from week_eat_planner.db.base import BaseDAO
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.security.token_provider import TokenProvider


class RefreshTokenDAO(BaseDAO):
    """Data Access Object for managing refresh tokens."""

    model = db_model.RefreshToken

    async def save(self, user: db_model.User, raw_token: str) -> db_model.RefreshToken:
        """Saves a new refresh token to the database.

        The raw token is hashed before being stored.

        Args:
            user: The user to whom the token belongs.
            raw_token: The unhashed refresh token string.

        Returns:
            The newly created RefreshToken database object.

        Raises:
            SQLAlchemyError: If a database error occurs during the save operation.
        """
        logger.debug(f'Creating {self.model.__name__} record for {user.id=}.')
        token_hash = TokenProvider.hash_refresh_token(raw_token)
        token_id = generate_uuid7()
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
            logger.error(f'Error while creating {self.model.__name__} record for {user.id=}: {exc}.')
            raise exc

        logger.debug(f'{self.model.__name__} record for {user.id=} has been successfully created.')
        return refresh_token

    async def get_token_by_hash(self, token_hash: str) -> db_model.RefreshToken | None:
        """Retrieves a refresh token from the database by its hash.

        Args:
            token_hash: The hashed refresh token to search for.

        Returns:
            The matching RefreshToken object, or None if not found.
        """
        logger.debug(f'Querying for {self.model.__name__} with {token_hash=}.')
        token = await self._get_one_or_none(token_hash=token_hash, options=[selectinload(self.model.user)])
        return token

    async def revoke_token(
        self, old_token: db_model.RefreshToken, revoked_by: db_model.RefreshToken | None
    ) -> db_model.RefreshToken:
        """Marks a refresh token as revoked in the database.

        Args:
            old_token: The token object to be revoked.
            revoked_by: The new token that is replacing the old one. Can be None.

        Returns:
            The updated (revoked) token object.

        Raises:
            SQLAlchemyError: If a database error occurs during the update.
        """
        logger.debug(
            f'Revoking {self.model.__name__} record {old_token.id} by {revoked_by.id if revoked_by else None}.'
        )
        old_token.revoked = True
        old_token.replaced_by = revoked_by.id if revoked_by else None

        try:
            self._session.add(old_token)
        except SQLAlchemyError as exc:
            logger.error(f'Error while revoking {self.model.__name__} record {old_token.id}: {exc}.')
            raise exc

        return old_token
