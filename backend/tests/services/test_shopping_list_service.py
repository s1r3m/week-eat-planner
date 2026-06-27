from copy import deepcopy
from operator import attrgetter
from unittest.mock import AsyncMock

import pytest
from tests.constants import RECIPE_1_INGREDIENTS, RECIPE_2_INGREDIENTS

from week_eat_planner import db
from week_eat_planner.api.schemas.recipe import Ingredient
from week_eat_planner.api.schemas.shopping_list import ShoppingListItems, ShoppingListRead
from week_eat_planner.constants import Unit
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.services.shopping_list_service import ShoppingListService


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    shopping_list_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.shopping_list_service.ShoppingListDAO', return_value=shopping_list_dao_mock)
    return shopping_list_dao_mock


async def test_get_aggregated_ingredients__no_recipes__calculated_correctly(mocked_session, db_week):
    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)
    assert result == []


@pytest.mark.parametrize('recipe_count', [1, 2, 7])
async def test_get_aggregated_ingredients__several_same_recipes__calculated_correctly(
    mocked_session, db_week, db_private_recipe, recipe_count
):
    for meal_slot in db_week.meal_slots[:recipe_count]:
        meal_slot.recipe_id = db_private_recipe.id
        meal_slot.recipe = db_private_recipe

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ingredients = deepcopy(RECIPE_1_INGREDIENTS)
    expected_ingredients[0].amount *= recipe_count
    assert result == expected_ingredients


async def test_get_aggregated_ingredients__recipe_with_no_ingredients__empty_list(
    mocked_session, db_week, db_private_recipe
):
    db_private_recipe.ingredients = []
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)
    
    assert result == []


async def test_get_aggregated_ingredients__same_name_different_units__separate_items(
    mocked_session, db_week, db_private_recipe, db_public_recipe
):
    ing1 = Ingredient(name='water', amount=100, unit=Unit.MILILITERS)
    ing2 = Ingredient(name='water', amount=1, unit=Unit.PIECES)
    db_private_recipe.ingredients = [ing1.model_dump()]
    db_public_recipe.ingredients = [ing2.model_dump()]
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[1].recipe = db_public_recipe
    db_week.meal_slots[1].recipe_id = db_public_recipe.id

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    assert result == [ing1, ing2]


async def test_get_aggregated_ingredients__floating_point_precision__calculated_correctly(
    mocked_session, db_week, db_private_recipe
):
    amount = 0.5
    count = 3
    ing = Ingredient(name='salt', amount=amount, unit=Unit.GRAM)
    db_private_recipe.ingredients = [ing.model_dump()]
    for meal_slot in db_week.meal_slots[:count]:
        meal_slot.recipe = db_private_recipe
        meal_slot.recipe_id = db_private_recipe.id

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    assert len(result) == 1
    assert result[0].name == 'salt'
    assert pytest.approx(result[0].amount) == amount * 3


async def test_get_aggregated_ingredients__complex_overlap__calculated_correctly(
    mocked_session, db_week, db_private_recipe, db_public_recipe
):
    ing_eggs = Ingredient(name='eggs', amount=2, unit=Unit.PIECES)
    ing_flour1 = Ingredient(name='flour', amount=100, unit=Unit.GRAM)
    ing_flour2 = Ingredient(name='flour', amount=200, unit=Unit.GRAM)
    ing_milk = Ingredient(name='milk', amount=500, unit=Unit.MILILITERS)
    db_private_recipe.ingredients = [ing_eggs.model_dump(), ing_flour1.model_dump()]
    db_public_recipe.ingredients = [ing_flour2.model_dump(), ing_milk.model_dump()]
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[1].recipe = db_public_recipe
    db_week.meal_slots[1].recipe_id = db_public_recipe.id

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ing_flour = Ingredient(name=ing_flour1.name, amount=ing_flour1.amount + ing_flour2.amount, unit=Unit.GRAM)
    assert sorted(result, key=attrgetter('name', 'unit')) == sorted([
        ing_eggs, ing_milk, expected_ing_flour
    ], key=attrgetter('name', 'unit'))


async def test_get_aggregated_ingredients__several_diff_recipes__calculated_correctly(
    mocked_session, db_week, db_public_recipe, db_private_recipe
):
    db_week.meal_slots[0].recipe = db_private_recipe
    db_week.meal_slots[0].recipe_id = db_private_recipe.id
    db_week.meal_slots[-1].recipe = db_public_recipe
    db_week.meal_slots[-1].recipe_id = db_public_recipe.id

    result = ShoppingListService(mocked_session)._get_aggregated_ingredients(db_week)

    expected_ingredients = deepcopy(RECIPE_1_INGREDIENTS)
    expected_ingredients.extend(deepcopy(RECIPE_2_INGREDIENTS))
    assert result == expected_ingredients


async def test_create__empty_week__empty_list(mocked_session, mocked_recipe_dao, db_week):
    ingredients = []
    added_list = ShoppingListRead(week_name=db_week.name, ingredients=ingredients)
    mocked_recipe_dao.add.return_value = added_list

    shopping_list = await ShoppingListService(mocked_session).create(db_week)

    assert shopping_list == added_list
    passed_shopping_list: ShoppingList = mocked_recipe_dao.add.call_args.args[0]
    assert passed_shopping_list.week_id == db_week.id
    assert passed_shopping_list.items == ShoppingListItems(ingredients=ingredients).model_dump()
