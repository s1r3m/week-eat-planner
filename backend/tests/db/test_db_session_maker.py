import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.dao.session_maker import DatabaseSession


@pytest.fixture(scope='module', autouse=True)
def loop():
    loop = asyncio.new_event_loop()

    yield loop

    loop.close()


@pytest_asyncio.fixture
async def mock_session(mocker) -> AsyncSession:
    mock_session = mocker.AsyncMock(spec=AsyncSession)
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    return mock_session


@pytest_asyncio.fixture(autouse=True)
async def mock_session_maker(mocker, mock_session) -> AsyncSession:
    mocker.patch('week_eat_planner.dao.session_maker.async_session_maker', return_value=mock_session)


async def test_get_db__always__no_commit_call(mock_session):
    async for session in DatabaseSession.get_db():
        assert session is mock_session


async def test_get_db__commit__commit_awaited(mock_session):
    async for session in DatabaseSession.get_db_commit():
        assert session is mock_session

    mock_session.commit.assert_awaited_once()


async def test_get_db_commit__throws_exception__rollback_called(mock_session):
    mock_session.commit.side_effect = Exception('test')

    with pytest.raises(Exception):
        async for _ in DatabaseSession.get_db_commit():
            pass

    mock_session.rollback.assert_awaited_once()
    mock_session.close.assert_awaited_once()
