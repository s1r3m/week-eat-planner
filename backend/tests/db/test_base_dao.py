import pytest
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Mapped
from sqlalchemy.testing.schema import mapped_column

from week_eat_planner.db.base import Base, BaseDAO
from week_eat_planner.helpers import generate_uuid7

ERROR_MESSAGE = 'Error in DB!'


class NoModelDAO(BaseDAO):
    model = None  # type: ignore


class MyTestModel(Base):
    __tablename__ = 'tests'
    field: Mapped[int] = mapped_column()


class MyTestDAO(BaseDAO):
    model = MyTestModel


class MyTestModelOut(BaseModel):
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
        await MyTestDAO(mocked_session).add(MyTestModel(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_one_or_none_by_id__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_one_or_none_by_id(obj_id=generate_uuid7())

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_one_or_none__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_one_or_none(MyTestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_all__error__error_raised(mocked_session):
    """
    Verifies that calling find_all on the DAO propagates a SQLAlchemyError raised by the database session.
    
    Configures the mocked session to raise SQLAlchemyError with ERROR_MESSAGE when executed, calls MyTestDAO.find_all, and asserts that the same SQLAlchemyError is raised and carries the exact ERROR_MESSAGE.
    """
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_all()

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_update__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).update(MyTestModelOut(field=1), MyTestModelOut(field=2))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_delete__error__error_raised(mocked_session):
    """
    Verifies that BaseDAO.delete propagates a SQLAlchemyError raised by the database session.
    
    Asserts that calling delete on MyTestDAO re-raises the SQLAlchemyError with the original message when the session's execute method raises that error.
    """
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).delete(MyTestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_find_many_by_ids__no_ids__empty_list_returned(mocked_session):
    result = await MyTestDAO(mocked_session).find_many_by_ids(obj_ids=[])
    assert result == []


async def test_find_many_by_ids__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_many_by_ids(obj_ids=[generate_uuid7()])

    assert str(exc.value) == ERROR_MESSAGE
