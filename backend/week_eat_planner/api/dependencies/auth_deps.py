"""Authentication dependencies for FastAPI endpoints."""

from uuid import UUID

from fastapi import Request

from week_eat_planner.constants import ACCESS_TOKEN_COOKIE_NAME
from week_eat_planner.exceptions import NoAccessTokenException
from week_eat_planner.security.token_provider import get_user_id_from_token


async def get_active_user_id(request: Request) -> UUID:
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not access_token:
        raise NoAccessTokenException()

    user_id = get_user_id_from_token(access_token)
    return user_id


async def get_optional_user_id(request: Request) -> UUID | None:
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not access_token:
        return None

    user_id = get_user_id_from_token(access_token)
    return user_id
