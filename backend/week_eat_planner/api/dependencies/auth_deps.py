"""Authentication dependencies for FastAPI endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer

from week_eat_planner.constants import ACCESS_TOKEN_COOKIE_NAME
from week_eat_planner.exceptions import NoAccessTokenException
from week_eat_planner.security.token_provider import get_user_id_from_token

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')
_oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl='/auth/login', auto_error=False)


async def get_active_user_id(request: Request) -> UUID:
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not access_token:
        raise NoAccessTokenException()

    user_id = get_user_id_from_token(access_token)
    return user_id


async def get_optional_user_id(token: Annotated[str | None, Depends(_oauth2_scheme_optional)]) -> UUID | None:
    if not token:
        return None

    return None
