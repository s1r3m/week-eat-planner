from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext

from week_eat_planner.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_email_from_token(token: str) -> str:
    """Decode the token and return email from it."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
    except (JWTError, ExpiredSignatureError) as exc:
        raise ValueError('Invalid token') from exc
    return email


def create_access_token(email: str) -> str:
    """Create encoded by jwt token."""
    to_encode: dict[str, Any] = {'sub': email}
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.TOKEN_TTL)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_password_hash(password: str) -> str:
    """Get a hashed string from password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain_password against hashed_password."""
    return pwd_context.verify(plain_password, hashed_password)
