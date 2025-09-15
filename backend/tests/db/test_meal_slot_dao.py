import pytest
from sqlalchemy.exc import SQLAlchemyError

from week_eat_planner.db.models import DayOfWeek, MealType

DB_ERROR = 'DB MealSlot Error'


async def test_init_meal_slots__valid_week__days_inited(meal_slot_dao, db_week):
    slots = await meal_slot_dao.init_meal_slots_for_week(db_week)

    for slot in slots:
        assert slot.week_id == db_week.id
        assert slot.day_of_week in DayOfWeek  # For now
        assert slot.meal_type in MealType  # For now
        assert not slot.recipe_id


async def test_init_meal_slots__db_error__error_raised(mocked_session, meal_slot_dao, db_week):
    mocked_session.add.side_effect = SQLAlchemyError(DB_ERROR)

    with pytest.raises(SQLAlchemyError) as exc:
        await meal_slot_dao.init_meal_slots_for_week(db_week)

    assert str(exc.value) == DB_ERROR
