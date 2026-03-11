from unittest.mock import AsyncMock

import pytest
from fastapi import status
from tests.api.conftest import WEEK_1_NAME
from tests.constants import FOR_UPDATE_PARAMETRIZE, WEEK_1_ID

from week_eat_planner.api.schemas import (
    MealSlotAssign,
    UserRead,
    WeekCreate,
    WeekRead,
    WeekReadMinimal,
    WeekUpdate,
)
from week_eat_planner.db.models import DayOfWeek, MealSlot, MealType, Recipe, Week
from week_eat_planner.exceptions import MealSlotAssignException, WeekForbidden, WeekNotFound
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.week_service import WeekService


@pytest.fixture
def mocked_week_dao(mocker) -> AsyncMock:
    week_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.week_service.WeekDAO', return_value=week_dao_mock)
    return week_dao_mock


@pytest.fixture
def mocked_meal_slot_dao(mocker) -> AsyncMock:
    meal_slot_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.week_service.MealSlotDAO', return_value=meal_slot_dao_mock)
    return meal_slot_dao_mock


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    recipe_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.week_service.RecipeDAO', return_value=recipe_dao_mock)
    return recipe_dao_mock


@pytest.fixture
def db_week(user_read: UserRead, db_meal_slots: list[MealSlot]) -> Week:
    return Week(id=WEEK_1_ID, name=WEEK_1_NAME, user_id=user_read.id, meal_slots=db_meal_slots)


@pytest.fixture
def week_read(db_week: Week) -> WeekRead:
    return WeekRead.model_validate(db_week)


@pytest.fixture
def db_meal_slots() -> list[MealSlot]:
    slots = []
    for meal_type in MealType:
        for day in DayOfWeek:
            slot = MealSlot(
                id=generate_uuid7(),
                week_id=WEEK_1_ID,
                day_of_week=day,
                meal_type=meal_type,
                recipe_id=None,
            )
            slots.append(slot)
    return slots


@pytest.fixture
def db_meal_slot_for_update(db_meal_slots: list[MealSlot]) -> MealSlot:
    return db_meal_slots[0]


@pytest.fixture
def updated_db_meal_slot(db_meal_slot_for_update: MealSlot, db_recipe: Recipe) -> MealSlot:
    return MealSlot(
        id=db_meal_slot_for_update.id,
        week_id=db_meal_slot_for_update.week_id,
        day_of_week=db_meal_slot_for_update.day_of_week,
        meal_type=db_meal_slot_for_update.meal_type,
        recipe_id=db_recipe.id,
    )


@pytest.fixture
def db_meal_slot_for_update_2(db_meal_slots: list[MealSlot]) -> MealSlot:
    return db_meal_slots[1]


@pytest.fixture
def updated_db_meal_slot_2(db_meal_slot_for_update_2: MealSlot) -> MealSlot:
    return MealSlot(
        id=db_meal_slot_for_update_2.id,
        week_id=db_meal_slot_for_update_2.week_id,
        day_of_week=db_meal_slot_for_update_2.day_of_week,
        meal_type=db_meal_slot_for_update_2.meal_type,
        recipe_id=None,
    )


@pytest.fixture
def other_week_db_meal_slot(db_meal_slot_for_update: MealSlot) -> MealSlot:
    return MealSlot(
        id=db_meal_slot_for_update.id,
        week_id=generate_uuid7(),
        day_of_week=db_meal_slot_for_update.day_of_week,
        meal_type=db_meal_slot_for_update.meal_type,
        recipe_id=None,
    )


@pytest.fixture
def other_user_recipe() -> Recipe:
    return Recipe(
        id=generate_uuid7(),
        user_id=generate_uuid7(),
        name='Salad',
        ingredients={'tomato': 1},
    )


async def test_create_week__name__week_created(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.add.return_value = db_week
    week = await WeekService(mocked_session).create_week_with_slots(user_read, WeekCreate(name=WEEK_1_NAME))
    assert week == db_week


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__week_exists__week_returned(
    mocked_week_dao, mocked_session, db_week, user_read, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = db_week

    week = await WeekService(mocked_session).get_week_for_user(str_week_id, user_read, for_update=for_update)

    assert week == db_week
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__no_week__error_raised(
    mocked_week_dao, mocked_session, db_week, user_read, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(WeekNotFound) as exc:
        await WeekService(mocked_session).get_week_for_user(str_week_id, user_read, for_update=for_update)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Week {str_week_id} not found'
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_week_for_user__week_not_owned__error_raised(
    mocked_week_dao, mocked_session, db_week, user_read_2, for_update
):
    str_week_id = str(db_week.id)
    mocked_week_dao.find_one_or_none_by_id.return_value = db_week

    with pytest.raises(WeekForbidden) as exc:
        await WeekService(mocked_session).get_week_for_user(str_week_id, user_read_2, for_update=for_update)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == f'Week {db_week.id} forbidden'
    mocked_week_dao.find_one_or_none_by_id.assert_awaited_once_with(db_week.id, for_update=for_update)


async def test_get_week_for_user__not_uuid__error_raised(mocked_week_dao, mocked_session, user_read):
    bad_uuid = 'not_uuid'

    with pytest.raises(WeekNotFound) as exc:
        await WeekService(mocked_session).get_week_for_user(bad_uuid, user_read, for_update=False)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Week {bad_uuid} not found'
    mocked_week_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_weeks__user_no_weeks__empty_list_returned(mocked_week_dao, mocked_session, user_read):
    mocked_week_dao.find_all.return_value = []
    weeks = await WeekService(mocked_session).get_weeks(user_read)
    assert weeks == []


async def test_get_weeks__user_with_weeks__weeks_returned(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.find_all.return_value = [db_week]
    weeks = await WeekService(mocked_session).get_weeks(user_read)
    assert weeks == [db_week]


async def test_update_week__valid_data__week_updated(mocked_week_dao, mocked_session, user_read, db_week):
    new_name = 'New Week Name'
    updated_db_week = Week(id=db_week.id, name=new_name, user_id=user_read.id)
    mocked_week_dao.update.return_value = updated_db_week
    week_preview = WeekReadMinimal.model_validate(db_week)

    week = await WeekService(mocked_session).update_week(week_preview, WeekUpdate(name=new_name))

    assert week == updated_db_week


async def test_delete_week__always__week_deleted(mocked_week_dao, mocked_session, user_read, db_week):
    mocked_week_dao.delete.return_value = 1
    week_preview = WeekReadMinimal.model_validate(db_week)

    await WeekService(mocked_session).delete_week(week_preview)

    mocked_week_dao.delete.assert_awaited_once_with(week_preview)


async def test_assign_recipes_to_meal_slots__valid_slot_and_recipe__recipe_assigned(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    db_meal_slot_for_update,
    db_recipe,
    updated_db_meal_slot,
):
    mocked_recipe_dao.find_many_by_ids.return_value = [db_recipe]
    mocked_meal_slot_dao.find_many_by_ids.return_value = [db_meal_slot_for_update]
    mocked_meal_slot_dao.update.return_value = updated_db_meal_slot
    slot_data = MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id=str(db_recipe.id))

    updated_slots = await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, slot_data)

    assert updated_slots == [updated_db_meal_slot]


async def test_assign_recipes_to_meal_slots__valid_slot_and_none_recipe__recipe_unassigned(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    db_meal_slot_for_update,
    db_recipe,
    updated_db_meal_slot,
):
    updated_db_meal_slot.recipe_id = None
    mocked_recipe_dao.find_many_by_ids.return_value = [db_recipe]
    mocked_meal_slot_dao.find_many_by_ids.return_value = [db_meal_slot_for_update]
    mocked_meal_slot_dao.update.return_value = updated_db_meal_slot
    slot_data = MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id=None)

    updated_slots = await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, slot_data)

    assert updated_slots == [updated_db_meal_slot]


async def test_assign_recipes_to_meal_slots__mixed_recipe_and_none_multiple_slots__slots_updated(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    db_meal_slot_for_update,
    db_meal_slot_for_update_2,
    db_recipe,
    updated_db_meal_slot,
    updated_db_meal_slot_2,
):
    mocked_recipe_dao.find_many_by_ids.return_value = [db_recipe]
    mocked_meal_slot_dao.find_many_by_ids.return_value = [db_meal_slot_for_update, db_meal_slot_for_update_2]
    mocked_meal_slot_dao.update.side_effect = [updated_db_meal_slot, updated_db_meal_slot_2]
    slots_data = [
        MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id=str(db_recipe.id)),
        MealSlotAssign(slot_id=str(db_meal_slot_for_update_2.id), recipe_id=None),
    ]

    updated_slots = await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, *slots_data)

    assert updated_slots == [updated_db_meal_slot, updated_db_meal_slot_2]


@pytest.mark.usefixtures('db_meal_slot_for_update')
async def test_assign_recipes_to_meal_slots__bad_slot_id__errors_raised(mocked_session, week_read, db_recipe):
    slot_data = MealSlotAssign(slot_id='bad_slot_id', recipe_id=str(db_recipe.id))

    with pytest.raises(MealSlotAssignException) as exc:
        await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, slot_data)

    error_messages = [
        {**slot_data.model_dump(), 'error': 'Invalid slot ID'},
    ]

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Error during assigning meal_slots: {error_messages}'


async def test_assign_recipes_to_meal_slots__bad_recipe_id__errors_raised(
    mocked_session, week_read, db_meal_slot_for_update
):
    slot_data = MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id='bad_recipe_id')

    with pytest.raises(MealSlotAssignException) as exc:
        await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, slot_data)

    error_messages = [
        {**slot_data.model_dump(), 'error': 'Invalid recipe ID'},
    ]

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Error during assigning meal_slots: {error_messages}'


async def test_assign_recipes_to_meal_slots__not_found_db_objects__errors_raised(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    db_meal_slot_for_update,
    db_meal_slot_for_update_2,
    db_recipe,
):
    mocked_recipe_dao.find_many_by_ids.return_value = []
    mocked_meal_slot_dao.find_many_by_ids.return_value = [db_meal_slot_for_update]
    slots_data = [
        MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id=str(db_recipe.id)),
        MealSlotAssign(slot_id=str(db_meal_slot_for_update_2.id), recipe_id=None),
    ]

    with pytest.raises(MealSlotAssignException) as exc:
        await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, *slots_data)

    error_messages = [
        {**slots_data[0].model_dump(), 'error': 'Recipe not found'},
        {**slots_data[1].model_dump(), 'error': 'Meal slot not found'},
    ]
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Error during assigning meal_slots: {error_messages}'


async def test_assign_recipes_to_meal_slots__slot_from_other_week__error_raised(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    other_week_db_meal_slot,
):
    mocked_recipe_dao.find_many_by_ids.return_value = []
    mocked_meal_slot_dao.find_many_by_ids.return_value = [other_week_db_meal_slot]
    slots_data = [MealSlotAssign(slot_id=str(other_week_db_meal_slot.id), recipe_id=None)]

    with pytest.raises(MealSlotAssignException) as exc:
        await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, *slots_data)

    error_message = {**slots_data[0].model_dump(), 'error': f'Meal slot not part of week {week_read.id}'}
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Error during assigning meal_slots: {[error_message]}'


async def test_assign_recipes_to_meal_slots__slot_not_found__error_raised(
    mocked_recipe_dao,
    mocked_meal_slot_dao,
    mocked_session,
    week_read,
    db_meal_slot_for_update,
    other_user_recipe,
):
    mocked_recipe_dao.find_many_by_ids.return_value = [other_user_recipe]
    mocked_meal_slot_dao.find_many_by_ids.return_value = [db_meal_slot_for_update]
    slots_data = [MealSlotAssign(slot_id=str(db_meal_slot_for_update.id), recipe_id=str(other_user_recipe.id))]

    with pytest.raises(MealSlotAssignException) as exc:
        await WeekService(mocked_session).assign_recipes_to_meal_slots(week_read, *slots_data)

    error_message = {**slots_data[0].model_dump(), 'error': 'Recipe not owned by user'}
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Error during assigning meal_slots: {[error_message]}'
