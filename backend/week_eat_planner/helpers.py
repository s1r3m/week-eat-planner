from datetime import datetime, timedelta, timezone

from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext

from week_eat_planner.config import settings
from week_eat_planner.exceptions import InvalidJwtToken

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def decode_token(token: str) -> str:
    """Decode the token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
    except (JWTError, ExpiredSignatureError) as exc:
        raise InvalidJwtToken from exc
    return email


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.TOKEN_TTL)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
