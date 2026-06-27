from copy import deepcopy
from unittest.mock import AsyncMock

import pytest
from tests.constants import RECIPE_1_INGREDIENTS, RECIPE_2_INGREDIENTS

from week_eat_planner.api.schemas.shopping_list import ShoppingListItems, ShoppingListRead
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
