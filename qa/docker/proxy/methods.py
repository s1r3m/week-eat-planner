import asyncio
from collections.abc import Callable, Coroutine
from functools import wraps
from typing import Any, ParamSpec, TypeVar

from sqlalchemy import func, select, text
from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.db.base import Base
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
async def check_db_isolation() -> None:
    exclude_tables = ['alembic_version']
    tables = [
        table
        for table in Base.metadata.tables.values()
        if table.schema == 'public' and table.name not in exclude_tables
    ]
    if not tables:
        return

    async with db.session_maker.begin() as session:
        counts = await session.execute(
            select(
                *(
                    select(func.count()).select_from(table).scalar_subquery().label(table.fullname)
                    for table in tables
                )
            )
        )
        nonempty_tables = {name: count for name, count in counts.mappings().one().items() if count}
        if nonempty_tables:
            preparer = db.engine.dialect.identifier_preparer
            table_names = ', '.join(
                f'{preparer.quote_schema("public")}.{preparer.quote(table.name)}' for table in tables
            )
            await session.execute(text(f'TRUNCATE TABLE {table_names} RESTART IDENTITY'))
        raise ValueError('\n'.join(f'DB leakage: {table_name}: {count}' for table_name, count in nonempty_tables.items()))


@async_to_sync
async def remove_user(user_id: str) -> bool:
    async with db.session_maker.begin() as session:
        count = await UserDAO(session).delete(RecordId(id=user_id))
    return bool(count)
