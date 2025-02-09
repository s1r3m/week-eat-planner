import asyncio
import pytest
import pytest_asyncio
from sqlalchemy import Column, Integer, String
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import Base


class TestModel(Base):
    __tablename__ = 'test'

    id = Column(Integer, primary_key=True)
    name = Column(String)

    def __eq__(self, other: 'TestModel') -> bool:
        return self.id == other.id and self.name == other.name


class TestDAO(BaseDAO):
    model = TestModel


@pytest_asyncio.fixture
async def mocked_session(mocker) -> AsyncSession:
    return mocker.AsyncMock(spec=AsyncSession)


@pytest.fixture
def test_dao(mocked_session):
    return TestDAO(mocked_session)


@pytest_asyncio.fixture(autouse=True, scope='module')
def loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_model():
    return TestModel(id=1, name='test')


@pytest.fixture
def mocked_record(mocked_session, mocker, test_model):
    mocked_result = mocker.MagicMock()
    mocked_result.scalar_one_or_none.return_value = test_model
    mocked_session.execute.return_value = mocked_result

    return test_model


@pytest.fixture
def mocked_record_none(mocked_session, mocker, test_model):
    mocked_result = mocker.MagicMock()
    mocked_result.scalar_one_or_none.return_value = None
    mocked_session.execute.return_value = mocked_result

    return test_model


@pytest.fixture
def mocked_filter(mocker, mocked_record):
    mock_filter = mocker.MagicMock()
    mock_filter.model_dump.return_value = {'id': mocked_record.id}

    return mock_filter


@pytest.fixture
def mocked_filter_none(mocker, mocked_session):
    mock_filter = mocker.MagicMock()
    mock_filter.model_dump.return_value = {}
    mocked_result = mocker.MagicMock()
    mocked_session.execute.return_value = mocked_result
    mocked_result.scalar_one_or_none.return_value = None

    return mock_filter


@pytest.fixture
def pydantic_model(mocker, test_model):
    model = mocker.MagicMock()
    model.model_dump.return_value = {'id': test_model.id, 'name': test_model.name}

    return model


async def test_get_one_or_none_by_id__record_exists__record_returned(test_dao, mocked_record):
    result = await test_dao.get_one_or_none_by_id(mocked_record.id)
    assert result == mocked_record


async def test_get_one_or_none_by_id__record_not_exists__none_returned(test_dao, mocked_record_none):
    result = await test_dao.get_one_or_none_by_id(mocked_record_none.id)
    assert result is None


async def test_get_one_or_none_by_id__sql_error__exception_raised(test_dao, mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError('SQL error')
    with pytest.raises(SQLAlchemyError) as exc:
        await test_dao.get_one_or_none_by_id(1)
    assert str(exc.value) == 'SQL error'


async def test_get_one_or_none__record_exists__record_returned(test_dao, mocked_session, mocked_filter, mocked_record):
    result = await test_dao.get_one_or_none(mocked_filter)
    assert result == mocked_record
    mocked_session.execute.assert_called_once()


async def test_get_one_or_none__record_not_exists__none_returned(test_dao, mocked_filter_none):
    result = await test_dao.get_one_or_none(mocked_filter_none)
    assert result is None


async def test_get_one_or_none__sql_error__exception_raised(test_dao, mocked_session, mocked_filter_none):
    mocked_session.execute.side_effect = SQLAlchemyError('SQL error')
    with pytest.raises(SQLAlchemyError) as exc:
        await test_dao.get_one_or_none(mocked_filter_none)
    assert str(exc.value) == 'SQL error'


async def test_add__valid_obj__exception_raised(test_dao, pydantic_model, test_model):
    result = await test_dao.add(pydantic_model)
    assert result == test_model


async def test_add__sql_error__exception_raised(test_dao, mocked_session, pydantic_model):
    mocked_session.add.side_effect = SQLAlchemyError('SQL error')

    with pytest.raises(SQLAlchemyError) as exc:
        await test_dao.add(pydantic_model)

    assert str(exc.value) == 'SQL error'


async def test_dao_model__no_model__exception_raised(mocked_session):
    class BadDAO(BaseDAO):
        pass

    with pytest.raises(ValueError) as exc:
        BadDAO(mocked_session)

    assert str(exc.value) == 'A model must be specified in child classes!'
