"""Utility for creating and validating JWT and refresh tokens."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from jose import ExpiredSignatureError, JWTError, jwt

from week_eat_planner.config import settings
from week_eat_planner.exceptions import InvalidJwtTokenException, NoEmailInTokenException, TokenExpiredException


class TokenProvider:
    """Factory for creating and hashing JWT access tokens and opaque refresh tokens."""

    @classmethod
    def create_access_token(cls, email: str) -> str:
        """Creates a new JWT access token for a user.

        Args:
            email: The email address to use as the token's subject.

        Returns:
            The encoded JWT access token.
        """
        now = datetime.now(UTC)
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_TTL)
        to_encode = {
            'sub': email,
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


def get_email_from_token(token: str) -> str:
    """Decodes a JWT token to extract the user's email address.

    Validates the token's signature, expiration, issuer, and audience.

    Args:
        token: The JWT token to decode.

    Returns:
        The email address from the token's 'sub' claim.

    Raises:
        NoEmailInTokenException: If the 'sub' claim is missing or not a string.
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
        email: str | None = payload.get('sub')
        if not email or not isinstance(email, str):
            raise NoEmailInTokenException()
    except ExpiredSignatureError as exc:
        raise TokenExpiredException() from exc
    except JWTError as exc:
        raise InvalidJwtTokenException() from exc

    return email
