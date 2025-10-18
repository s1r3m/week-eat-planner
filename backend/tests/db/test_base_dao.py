import pytest
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Mapped
from sqlalchemy.testing.schema import mapped_column

from week_eat_planner.db.base import Base, BaseDAO

pytestmark = pytest.mark.usefixtures('clean_db')

ERROR_MESSAGE = 'Error in DB!'


class NoModelDAO(BaseDAO):
    model = None


class TestModel(Base):
    __tablename__ = 'tests'
    field: Mapped[int] = mapped_column()


class TestDAO(BaseDAO):
    model = TestModel


class TestModelOut(BaseModel):
    field: int


@pytest.mark.parametrize(
    'dao_class',
    [
        pytest.param(NoModelDAO, id='none_model'),
        pytest.param(BaseDAO, id='base_dao'),
    ],
)
async def test_base_dao__no_model_assigned__error_raised(mocked_session, dao_class):
    with pytest.raises(ValueError) as exc:
        dao_class(mocked_session)

    assert str(exc.value) == 'A model must be specified in child classes!'


async def test_base_dao_add__error__error_raised(mocked_session):
    mocked_session.add.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).add(TestModel(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_one_or_none_by_id__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).find_one_or_none_by_id(obj_id=1)

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_one_or_none__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).find_one_or_none(TestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_all__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).find_all()

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_update__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).update(TestModelOut(field=1), TestModelOut(field=2))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_delete__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await TestDAO(mocked_session).delete(TestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE
