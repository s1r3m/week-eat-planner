"""Helper functions for authentication and password management."""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext

from week_eat_planner.config import settings
from week_eat_planner.exceptions import InvalidJwtToken

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def get_email_from_token(token: str) -> str:
    """Decodes a JWT token to extract the user's email address.

    Args:
        token: The JWT token to decode.

    Returns:
        The email address contained within the token.

    Raises:
        InvalidJwtToken: If the token is expired, invalid, or cannot be decoded.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get('sub')
        if not email:
            raise InvalidJwtToken
    except (JWTError, ExpiredSignatureError) as exc:
        raise InvalidJwtToken from exc
    return email


def create_access_token(email: str) -> str:
    """Creates a new JWT access token.

    Args:
        email: The email address to use as the token's subject.

    Returns:
        A new JWT access token as a string.
    """
    to_encode: dict[str, Any] = {'sub': email}
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.TOKEN_TTL)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


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
