from copy import deepcopy
from decimal import Decimal
from operator import attrgetter
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.exc import IntegrityError
from tests.constants import RECIPE_1_INGREDIENTS, RECIPE_2_INGREDIENTS

from week_eat_planner.api.schemas.common import RecordId, WeekId
from week_eat_planner.api.schemas.recipe import Ingredient
from week_eat_planner.api.schemas.shopping_list import ShoppingListItem, ShoppingListUpdate
from week_eat_planner.constants import Unit
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.exceptions import ShoppingListAlreadyExistsException, ShoppingListNotFoundException
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.shopping_list_service import ShoppingListService


@pytest.fixture
def mocked_shopping_list_dao(mocker) -> AsyncMock:
    shopping_list_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.shopping_list_service.ShoppingListDAO', return_value=shopping_list_dao_mock)
    return shopping_list_dao_mock


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.shopping_list_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


@pytest.fixture
def db_shopping_list(db_week) -> ShoppingList:
    return ShoppingList(id=generate_uuid7(), week_id=db_week.id, items=[])


async def test_get_aggregated_ingredients__no_recipes__calculated_correctly(mocked_session, db_week):
    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)
    assert result == []


@pytest.mark.parametrize('recipe_count', [1, 2, 7])
async def test_get_aggregated_ingredients__several_same_recipes__calculated_correctly(
    mocked_session, db_week, db_private_recipe, recipe_count
):
    for meal_slot in db_week.meal_slots[:recipe_count]:
        meal_slot.recipe_id = db_private_recipe.id
        meal_slot.recipe = db_private_recipe

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ingredients = deepcopy(RECIPE_1_INGREDIENTS)
    expected_ingredients[0].amount *= recipe_count
    assert result == [ShoppingListItem(**ing.model_dump(), checked=False) for ing in expected_ingredients]


async def test_get_aggregated_ingredients__recipe_with_no_ingredients__empty_list(
    mocked_session, db_week, db_private_recipe
):
    db_private_recipe.ingredients = []
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    assert result == []


async def test_get_aggregated_ingredients__same_name_different_units__separate_items(
    mocked_session, db_week, db_private_recipe, db_public_recipe
):
    ing1 = Ingredient(name='water', amount=Decimal('100'), unit=Unit.MILILITERS)
    ing2 = Ingredient(name='water', amount=Decimal('1'), unit=Unit.PIECES)
    db_private_recipe.ingredients = [ing1.model_dump()]
    db_public_recipe.ingredients = [ing2.model_dump()]
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[1].recipe = db_public_recipe
    db_week.meal_slots[1].recipe_id = db_public_recipe.id

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    assert result == [
        ShoppingListItem(**ing1.model_dump(), checked=False),
        ShoppingListItem(**ing2.model_dump(), checked=False),
    ]


async def test_get_aggregated_ingredients__floating_point_precision__calculated_correctly(
    mocked_session, db_week, db_private_recipe
):
    amount = Decimal('0.5')
    count = 3
    ing = Ingredient(name='salt', amount=amount, unit=Unit.GRAM)
    db_private_recipe.ingredients = [ing.model_dump()]
    for meal_slot in db_week.meal_slots[:count]:
        meal_slot.recipe = db_private_recipe
        meal_slot.recipe_id = db_private_recipe.id

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    assert len(result) == 1
    assert result[0].name == 'salt'
    assert pytest.approx(result[0].amount) == amount * 3


async def test_get_aggregated_ingredients__complex_overlap__calculated_correctly(
    mocked_session, db_week, db_private_recipe, db_public_recipe
):
    ing_eggs = Ingredient(name='eggs', amount=Decimal('2'), unit=Unit.PIECES)
    ing_flour1 = Ingredient(name='flour', amount=Decimal('100'), unit=Unit.GRAM)
    ing_flour2 = Ingredient(name='flour', amount=Decimal('200'), unit=Unit.GRAM)
    ing_milk = Ingredient(name='milk', amount=Decimal('500'), unit=Unit.MILILITERS)
    db_private_recipe.ingredients = [ing_eggs.model_dump(), ing_flour1.model_dump()]
    db_public_recipe.ingredients = [ing_flour2.model_dump(), ing_milk.model_dump()]
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[1].recipe = db_public_recipe
    db_week.meal_slots[1].recipe_id = db_public_recipe.id

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ing_flour = Ingredient(name=ing_flour1.name, amount=ing_flour1.amount + ing_flour2.amount, unit=Unit.GRAM)
    assert sorted(result, key=attrgetter('name', 'unit')) == sorted(
        [
            ShoppingListItem(**ing_eggs.model_dump(), checked=False),
            ShoppingListItem(**ing_milk.model_dump(), checked=False),
            ShoppingListItem(**expected_ing_flour.model_dump(), checked=False),
        ],
        key=attrgetter('name', 'unit'),
    )


async def test_get_aggregated_ingredients__several_diff_recipes__calculated_correctly(
    mocked_session, db_week, db_public_recipe, db_private_recipe
):
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[-1].recipe = db_public_recipe
    db_week.meal_slots[-1].recipe_id = db_public_recipe.id

    result = await ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ingredients = deepcopy(RECIPE_1_INGREDIENTS)
    expected_ingredients.extend(deepcopy(RECIPE_2_INGREDIENTS))
    assert result == [ShoppingListItem(**ing.model_dump(), checked=False) for ing in expected_ingredients]


async def test_create__week_exists__empty_list(mocked_session, mocked_shopping_list_dao, db_week):
    ingredients = []
    added_list = ShoppingList(week_id=db_week.id, items=[])
    mocked_shopping_list_dao.find_one_or_none.return_value = None
    mocked_shopping_list_dao.add.return_value = added_list

    shopping_list = await ShoppingListService(mocked_session).create(db_week)

    assert shopping_list == added_list
    passed_shopping_list: ShoppingList = mocked_shopping_list_dao.add.call_args.args[0]
    assert passed_shopping_list.week_id == db_week.id
    assert passed_shopping_list.items == [ing.model_dump(mode='json') for ing in ingredients]


async def test_create__shopping_list_exists__error_raised(
    mocked_session, mocked_shopping_list_dao, db_week, db_shopping_list
):
    mocked_shopping_list_dao.find_one_or_none.return_value = db_shopping_list

    with pytest.raises(ShoppingListAlreadyExistsException) as exc:
        await ShoppingListService(mocked_session).create(db_week)

    error = ShoppingListAlreadyExistsException(db_week.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_create__concurrent_insert__error_raised(mocked_session, mocked_shopping_list_dao, db_week):
    mocked_shopping_list_dao.find_one_or_none.return_value = None
    mocked_shopping_list_dao.add.side_effect = IntegrityError(None, None, BaseException())

    with pytest.raises(ShoppingListAlreadyExistsException) as exc:
        await ShoppingListService(mocked_session).create(db_week)

    error = ShoppingListAlreadyExistsException(db_week.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_get_by_week__list_exists__shopping_list_found(
    mocked_session, mocked_shopping_list_dao, db_shopping_list, db_week
):
    mocked_shopping_list_dao.find_one_or_none.return_value = db_shopping_list

    shopping_list = await ShoppingListService(mocked_session).get_by_week(db_week)

    assert shopping_list == db_shopping_list
    mocked_shopping_list_dao.find_one_or_none.assert_called_once_with(WeekId(week_id=db_week.id), for_update=False)


async def test_get_by_week__no_shopping_list__error_raised(mocked_session, mocked_shopping_list_dao, db_week):
    mocked_shopping_list_dao.find_one_or_none.return_value = None

    with pytest.raises(ShoppingListNotFoundException) as exc:
        await ShoppingListService(mocked_session).get_by_week(db_week)

    error = ShoppingListNotFoundException(db_week.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
    mocked_shopping_list_dao.find_one_or_none.assert_awaited_once_with(WeekId(week_id=db_week.id), for_update=False)


async def test_get_by_week_for_update__list_exists__shopping_list_found(
    mocked_session, mocked_shopping_list_dao, db_shopping_list, db_week
):
    mocked_shopping_list_dao.find_one_or_none.return_value = db_shopping_list

    shopping_list = await ShoppingListService(mocked_session).get_by_week_for_update(db_week)

    assert shopping_list == db_shopping_list
    mocked_shopping_list_dao.find_one_or_none.assert_called_once_with(WeekId(week_id=db_week.id), for_update=True)


async def test_get_by_week_for_update__no_shopping_list__error_raised(
    mocked_session, mocked_shopping_list_dao, db_week
):
    mocked_shopping_list_dao.find_one_or_none.return_value = None

    with pytest.raises(ShoppingListNotFoundException) as exc:
        await ShoppingListService(mocked_session).get_by_week_for_update(db_week)

    error = ShoppingListNotFoundException(db_week.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
    mocked_shopping_list_dao.find_one_or_none.assert_awaited_once_with(WeekId(week_id=db_week.id), for_update=True)


@pytest.mark.parametrize(
    'payload',
    [
        pytest.param(ShoppingListUpdate(items=[]), id='empty_payload'),
        pytest.param(
            ShoppingListUpdate(
                items=[
                    ShoppingListItem(name='Carrots', amount=Decimal(1.0), unit=Unit.PIECES, checked=True),
                    ShoppingListItem(name='Milk', amount=Decimal(500.0), unit=Unit.GRAM, checked=False),
                    ShoppingListItem(name='Canned tomatoes', amount=Decimal(0.5), unit=Unit.CANS, checked=False),
                ],
            ),
            id='not_empty_payload',
        ),
    ],
)
async def test_update__shopping_list_exists___updated_successfully(
    mocked_session, mocked_shopping_list_dao, db_shopping_list, payload
):
    db_shopping_list.items = payload.items
    mocked_shopping_list_dao.update.return_value = db_shopping_list

    updated_shopping_list = await ShoppingListService(mocked_session).update(db_shopping_list, payload)

    assert updated_shopping_list == db_shopping_list
    mocked_shopping_list_dao.update.assert_awaited_once_with(RecordId(id=db_shopping_list.id), payload)
