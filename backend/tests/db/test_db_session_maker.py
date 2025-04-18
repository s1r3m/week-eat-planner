import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.db.session_maker import db


@pytest_asyncio.fixture(autouse=True)
async def mock_session_maker(mocker, mocked_session) -> AsyncSession:
    mocker.patch(
        'week_eat_planner.db.session_maker._async_session_maker',
        return_value=mocked_session,
    )


async def test_get_db__always__no_commit_call(mocked_session):
    async for session in db.get_db():
        assert session is mocked_session


async def test_get_db__commit__commit_awaited(mocked_session):
    async for session in db.get_db_commit():
        assert session is mocked_session

    mocked_session.commit.assert_awaited_once()


async def test_get_db_commit__throws_exception__rollback_called(mocked_session):
    mocked_session.commit.side_effect = Exception('test')

    with pytest.raises(Exception):
        async for _ in db.get_db_commit():
            pass

    mocked_session.rollback.assert_awaited_once()
    mocked_session.close.assert_awaited_once()
