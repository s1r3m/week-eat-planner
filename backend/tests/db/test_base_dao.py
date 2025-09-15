import pytest

from week_eat_planner.db.base import BaseDAO


class TestDAO(BaseDAO):
    model = None


@pytest.mark.parametrize(
    'dao_class',
    [
        pytest.param(TestDAO, id='none_model'),
        pytest.param(BaseDAO, id='base_dao'),
    ],
)
async def test_base_dao__no_model_assigned__error_raised(mocked_session, dao_class):
    with pytest.raises(ValueError) as exc:
        dao_class(mocked_session)

    assert str(exc.value) == 'A model must be specified in child classes!'
