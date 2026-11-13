import asyncio
from collections.abc import Callable, Coroutine
from functools import wraps
from typing import Any, ParamSpec, TypeVar

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.db.dao import UserDAO
from week_eat_planner.db.session_maker import db

P = ParamSpec('P')
R = TypeVar('R')


def async_to_sync(func: Callable[P, Coroutine[Any, Any, R]]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(func(*args, **kwargs))

    return wrapper


@async_to_sync
async def remove_user(user_id: str) -> bool:
    async with db.session_maker.begin() as session:
        count = await UserDAO(session).delete(RecordId(id=user_id))
    return bool(count)
