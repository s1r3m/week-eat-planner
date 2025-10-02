"""Helper functions for authentication and password management."""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from uuid_utils import uuid7

from week_eat_planner.config import settings
from week_eat_planner.exceptions import InvalidJwtToken, NoEmailInToken, TokenExpiredException

pwd_context = CryptContext(schemes=['bcrypt'])


def get_email_from_token(token: str) -> str:
    """Decodes a JWT token to extract the user's email address.

    Validates the token's signature, expiration, issuer, and audience.

    Args:
        token: The JWT token to decode.

    Returns:
        The email address from the token's 'sub' claim.

    Raises:
        NoEmailInToken: If the 'sub' claim is missing or not a string.
        TokenExpiredException: If the token has expired.
        InvalidJwtToken: If the token is invalid for any other reason.
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
            raise NoEmailInToken
    except ExpiredSignatureError as exc:
        raise TokenExpiredException from exc
    except JWTError as exc:
        raise InvalidJwtToken from exc

    return email


def create_access_token(email: str) -> str:
    """Creates a new JWT access token for a user.

    Args:
        email: The email address to use as the token's subject.

    Returns:
        The encoded JWT access token.
    """
    now = datetime.now(timezone.utc)
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


def generate_refresh_token() -> str:
    """Generates a cryptographically secure URL-safe string for a refresh token.

    Returns:
        A new refresh token.
    """
    token = secrets.token_urlsafe(64)
    return token


def hash_refresh_token(token: str) -> str:
    """Hashes a refresh token using SHA256 for secure storage.

    Args:
        token: The plain-text refresh token.

    Returns:
        The hex digest of the hashed token.
    """
    digest = hashlib.sha256(token.encode('utf-8')).hexdigest()
    return digest


def verify_hash_equals(hash_a: str, hash_b: str) -> bool:
    """Compares two hashes in a timing-attack-resistant way.

    Args:
        hash_a: The first hash to compare.
        hash_b: The second hash to compare.

    Returns:
        True if the hashes are equal, False otherwise.
    """
    return hmac.compare_digest(hash_a, hash_b)


def get_password_hash(password: str) -> str:
    """Hashes a plain text password.

    Args:
        password: The plain text password to hash.

    Returns:
        The hashed password as a string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a hashed password.

    Args:
        plain_password: The plain text password to verify.
        hashed_password: The hashed password to compare against.

    Returns:
        True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_uuid7() -> UUID:
    """uuid7() returns uuid_utils.UUID but the DB doesn't recognise that.

    Instead, convert the new value to uuid.UUID type.

    Returns:
        uuid.UUID uuid7() representation.
    """
    return UUID(str(uuid7()))
