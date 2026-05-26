"""Utility for creating and validating JWT and refresh tokens."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from jose import ExpiredSignatureError, JWTError, jwt

from week_eat_planner.config import settings
from week_eat_planner.exceptions import InvalidJwtTokenException, NoSubInTokenException, TokenExpiredException


class TokenProvider:
    """Factory for creating and hashing JWT access tokens and opaque refresh tokens."""

    @classmethod
    def create_access_token(cls, user_id: UUID) -> str:
        """Creates a new JWT access token for a user.

        Args:
            user_id: The user_id to use as the token's subject.

        Returns:
            The encoded JWT access token.
        """
        now = datetime.now(UTC)
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_TTL)
        to_encode = {
            'sub': str(user_id),
            'iat': int(now.timestamp()),
            'exp': int(expire.timestamp()),
            'aud': settings.JWT_AUDIENCE,
            'iss': settings.JWT_ISSUER,
        }
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @classmethod
    def create_refresh_token(cls) -> str:
        """Generates a cryptographically secure URL-safe string for a refresh token.

        Returns:
            A new refresh token.
        """
        token = secrets.token_urlsafe(64)
        return token

    @classmethod
    def hash_refresh_token(cls, token: str) -> str:
        """Hashes a refresh token using SHA256 for secure storage.

        Args:
            token: The plain-text refresh token.

        Returns:
            The hex digest of the hashed token.
        """
        digest = hashlib.sha256(token.encode('utf-8')).hexdigest()
        return digest


def get_user_id_from_token(token: str) -> UUID:
    """Decodes a JWT token to extract the user's ID.

    Validates the token's signature, expiration, issuer, and audience.

    Args:
        token: The JWT token to decode.

    Returns:
        user_id from the token's 'sub' claim.

    Raises:
        NoSubInTokenException: If the 'sub' claim is missing or empty.
        TokenExpiredException: If the token has expired.
        InvalidJwtTokenException: If the token is invalid for any other reason.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={'verify_aud': True},
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER,
        )
        user_id: str | None = payload.get('sub')
        if not user_id:
            raise NoSubInTokenException()
        return UUID(user_id)
    except ExpiredSignatureError as exc:
        raise TokenExpiredException() from exc
    except (JWTError, ValueError) as exc:
        raise InvalidJwtTokenException() from exc
