from copy import copy
from unittest.mock import AsyncMock

import pytest

from week_eat_planner.api.schemas import RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate
from week_eat_planner.db.models import Recipe
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.recipe_service import RecipeService


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    recipe_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.recipe_service.RecipeDAO', return_value=recipe_dao_mock)
    return recipe_dao_mock


@pytest.fixture
def recipe_create() -> RecipeCreate:
    return RecipeCreate(
        name='recipe',
        is_public=True,
        ingredients={'ingredient': 'value'},
    )


@pytest.fixture
def db_recipe(user_out, recipe_create) -> Recipe:
    return Recipe(
        id=generate_uuid7(),
        name=recipe_create.name,
        user_id=user_out.id,
        is_public=recipe_create.is_public,
        ingredients=recipe_create.ingredients,
    )


@pytest.fixture
def recipe_out(db_recipe) -> RecipeRead:
    return RecipeRead.model_validate(db_recipe)


async def test_create_recipe__valid_data__recipe_created(
    mocked_session, mocked_recipe_dao, db_recipe, recipe_create, user_out, recipe_out
):
    mocked_recipe_dao.add.return_value = db_recipe
    recipe = await RecipeService(mocked_session).create_recipe(recipe_create, user_out)
    assert recipe == recipe_out


async def test_get_recipe__recipe_exists__recipe_returned(mocked_session, mocked_recipe_dao, db_recipe):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_recipe
    recipe = await RecipeService(mocked_session).get_recipe(db_recipe.id)
    assert recipe == RecipeRead.model_validate(recipe)


async def test_get_recipe__recipe_not_exists__none_returned(mocked_session, mocked_recipe_dao, db_recipe):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = None
    recipe = await RecipeService(mocked_session).get_recipe(db_recipe.id)
    assert recipe is None


async def test_get_recipes__user_with_recipes__recipes_returned(mocked_session, mocked_recipe_dao, db_recipe, user_out):
    mocked_recipe_dao.find_all.return_value = [db_recipe]
    recipe = await RecipeService(mocked_session).get_all_user_recipes(user_out)
    assert recipe == [RecipeReadMinimal.model_validate(db_recipe)]


@pytest.mark.parametrize(
    'name, is_public, ingredients',
    [
        pytest.param('new_name', None, None, id='name'),
        pytest.param(None, False, None, id='is_public'),
        pytest.param(None, None, {'ingredient1': 'value1'}, id='ingredients'),
        pytest.param('new_name', False, None, id='several'),
    ],
)
async def test_update_recipe__valid_new_data__recipe_updated(
    mocked_session, mocked_recipe_dao, db_recipe, user_out, name, is_public, ingredients
):
    recipe_out = RecipeRead.model_validate(db_recipe)
    updated_db_recipe = copy(db_recipe)
    updated_db_recipe.name = name or db_recipe.name
    updated_db_recipe.is_public = is_public or db_recipe.is_public
    updated_db_recipe.ingredients = ingredients or db_recipe.ingredients
    mocked_recipe_dao.update.return_value = updated_db_recipe
    update_params = RecipeUpdate(
        name=updated_db_recipe.name, is_public=updated_db_recipe.is_public, ingredients=updated_db_recipe.ingredients
    )

    updated_recipe = await RecipeService(mocked_session).update_recipe(recipe_out, update_params)

    assert updated_recipe == RecipeRead.model_validate(updated_db_recipe)


async def test_delete_recipe__valid_id__recipe_deleted(mocked_session, mocked_recipe_dao, db_recipe):
    mocked_recipe_dao.delete.return_value = 1
    recipe_out = RecipeRead.model_validate(db_recipe)

    await RecipeService(mocked_session).delete_recipe(recipe_out)

    mocked_recipe_dao.delete.assert_awaited_once_with(recipe_out)
