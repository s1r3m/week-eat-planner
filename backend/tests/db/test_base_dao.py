from re import M

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


async def test_base_dao_add__success__instance_returned(mocked_session):
    dao = MyTestDAO(mocked_session)
    instance = MyTestModel(field=1)

    result = await dao.add(instance)

    assert result == instance
    mocked_session.add.assert_called_once_with(instance)
    mocked_session.flush.assert_awaited_once()
    mocked_session.refresh.assert_awaited_once_with(instance)


async def test_base_dao_add__error__error_raised(mocked_session):
    mocked_session.add.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).add(MyTestModel(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_one_or_none_by_id__success__instance_returned(mocker, mocked_session):
    dao = MyTestDAO(mocked_session)
    obj_id = generate_uuid7()
    expected_instance = MyTestModel(id=obj_id, field=1)
    mocked_result = mocker.Mock()
    mocked_result.scalar_one_or_none.return_value = expected_instance
    mocked_session.execute.return_value = mocked_result

    result = await dao.find_one_or_none_by_id(obj_id=obj_id)

    assert result == expected_instance
    mocked_session.execute.assert_awaited_once()


async def test_base_dao_find_one_or_none_by_id__for_update__query_with_for_update(mocker, mocked_session):
    dao = MyTestDAO(mocked_session)
    obj_id = generate_uuid7()
    mocked_session.execute.return_value = mocker.Mock()

    await dao.find_one_or_none_by_id(obj_id=obj_id, for_update=True)

    mocked_session.execute.assert_awaited_once()


async def test_base_dao_find_one_or_none_by_id__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_one_or_none_by_id(obj_id=generate_uuid7())

    assert str(exc.value) == ERROR_MESSAGE


@pytest.mark.parametrize(
    'for_update',
    [
        pytest.param(False, id='read-only'),
        pytest.param(True, id='for_edit'),
    ],
)
async def test_base_dao_find_one_or_none__success__instance_returned(mocker, mocked_session, for_update):
    dao = MyTestDAO(mocked_session)
    filters = MyTestModelOut(field=1)
    expected_instance = MyTestModel(field=1)
    mocked_result = mocker.Mock()
    mocked_result.scalar_one_or_none.return_value = expected_instance
    mocked_session.execute.return_value = mocked_result

    result = await dao.find_one_or_none(filters, for_update)

    assert result == expected_instance
    mocked_session.execute.assert_awaited_once()


async def test_base_dao_find_one_or_none__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_one_or_none(MyTestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_find_all__success__list_returned(mocker, mocked_session):
    dao = MyTestDAO(mocked_session)
    expected_instances = [MyTestModel(field=1), MyTestModel(field=2)]
    mocked_result = mocker.Mock()
    mocked_result.scalars.return_value.all.return_value = expected_instances
    mocked_session.execute.return_value = mocked_result

    result = await dao.find_all()

    assert result == expected_instances
    mocked_session.execute.assert_awaited_once()


async def test_base_dao_find_all__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_all()

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_update__success__updated_instance_returned(mocker, mocked_session):
    dao = MyTestDAO(mocked_session)
    filters = MyTestModelOut(field=1)
    values = MyTestModelOut(field=2)
    expected_instance = MyTestModel(field=2)
    mocked_result = mocker.Mock()
    mocked_result.scalar_one.return_value = expected_instance
    mocked_session.execute.return_value = mocked_result

    result = await dao.update(filters, values)

    assert result == expected_instance
    mocked_session.execute.assert_awaited_once()
    mocked_session.flush.assert_awaited_once()
    mocked_session.refresh.assert_awaited_once_with(expected_instance)


async def test_base_dao_update__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).update(MyTestModelOut(field=1), MyTestModelOut(field=2))

    assert str(exc.value) == ERROR_MESSAGE


async def test_base_dao_delete__success__count_returned(mocked_session):
    dao = MyTestDAO(mocked_session)
    filters = MyTestModelOut(field=1)
    mocked_result = mocked_session.execute.return_value
    mocked_result.rowcount = 1

    result = await dao.delete(filters)

    assert result == 1
    mocked_session.execute.assert_awaited_once()


async def test_base_dao_delete__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).delete(MyTestModelOut(field=1))

    assert str(exc.value) == ERROR_MESSAGE


async def test_find_many_by_ids__success__list_returned(mocker, mocked_session):
    dao = MyTestDAO(mocked_session)
    obj_ids = [generate_uuid7(), generate_uuid7()]
    expected_instances = [MyTestModel(id=obj_ids[0], field=1), MyTestModel(id=obj_ids[1], field=2)]
    mocked_result = mocker.Mock()
    mocked_result.scalars.return_value.all.return_value = expected_instances
    mocked_session.execute.return_value = mocked_result

    result = await dao.find_many_by_ids(obj_ids=obj_ids)

    assert result == expected_instances
    mocked_session.execute.assert_awaited_once()


async def test_find_many_by_ids__no_ids__empty_list_returned(mocked_session):
    result = await MyTestDAO(mocked_session).find_many_by_ids(obj_ids=[])
    assert result == []


async def test_find_many_by_ids__error__error_raised(mocked_session):
    mocked_session.execute.side_effect = SQLAlchemyError(ERROR_MESSAGE)

    with pytest.raises(SQLAlchemyError) as exc:
        await MyTestDAO(mocked_session).find_many_by_ids(obj_ids=[generate_uuid7()])

    assert str(exc.value) == ERROR_MESSAGE
