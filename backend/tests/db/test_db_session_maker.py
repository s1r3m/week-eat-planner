from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio

from week_eat_planner.db.session_maker import db


@pytest_asyncio.fixture(autouse=True)
async def mock_session_maker(mocker, mocked_session) -> None:
    session_maker_mock = mocker.MagicMock()
    session_maker_mock.return_value = mocked_session
    mocker.patch(
        'week_eat_planner.db.session_maker.async_sessionmaker',
        return_value=session_maker_mock,
    )


@pytest_asyncio.fixture
async def inited_db() -> AsyncGenerator[None, None]:
    await db.init()
    yield
    await db.close()


@pytest.mark.usefixtures('inited_db')
async def test_get_db__db_inited__no_commit_call(mocked_session):
    async for session in db.get_db():
        assert session is mocked_session

    mocked_session.commit.assert_not_awaited()


@pytest.mark.usefixtures('inited_db')
async def test_get_db__no_db_init__error_raised(mocked_session):
    with pytest.raises(ValueError):
        gen = db.get_db()
        session = await gen.__anext__()
        assert session is mocked_session
        await gen.athrow(ValueError)

    mocked_session.rollback.assert_awaited_once()


@pytest.mark.usefixtures('inited_db')
async def test_get_db__throws_exception__rollback_called(mocked_session):
    mocked_session.commit.side_effect = Exception('test')

    with pytest.raises(Exception):
        async for _ in db.get_db_commit():
            pass

    mocked_session.rollback.assert_awaited_once()


@pytest.mark.usefixtures('inited_db')
async def test_get_db__commit__commit_awaited(mocked_session):
    async for session in db.get_db_commit():
        assert session is mocked_session

    mocked_session.commit.assert_awaited_once()


@pytest.mark.usefixtures('inited_db')
async def test_get_db_commit__throws_exception__rollback_called(mocked_session):
    mocked_session.commit.side_effect = Exception('test')

    with pytest.raises(Exception):
        async for _ in db.get_db_commit():
            pass

    mocked_session.rollback.assert_awaited_once()


async def test_get_db_commit__no_db_init__error_raised(mocked_session):
    with pytest.raises(RuntimeError) as exc:
        async for session in db.get_db_commit():
            assert session is mocked_session

    assert str(exc.value) == 'Database not connected. Call init() first.'


async def test_db_close__no_init_db__error_raised():
    with pytest.raises(RuntimeError) as exc:
        await db.close()

    assert str(exc.value) == 'Database not connected. Call init() first.'
