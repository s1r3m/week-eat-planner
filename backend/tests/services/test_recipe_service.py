from unittest.mock import AsyncMock

import pytest
from fastapi import status
from tests.constants import FOR_UPDATE_PARAMETRIZE, RECIPE_INGREDIENTS, RECIPE_IS_PUBLIC, RECIPE_NAME, RECIPE_STEPS

from week_eat_planner.api.schemas import RecipeCreate, RecipeRead, RecipeUpdate
from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient, RecipeId
from week_eat_planner.constants import Unit
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.services.recipe_service import RecipeService


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    recipe_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.recipe_service.RecipeDAO', return_value=recipe_dao_mock)
    return recipe_dao_mock


@pytest.fixture
def recipe_create() -> RecipeCreate:
    return RecipeCreate(
        name=RECIPE_NAME,
        is_public=RECIPE_IS_PUBLIC,
        steps=RECIPE_STEPS,
        ingredients=RECIPE_INGREDIENTS,
    )


async def test_create_recipe__valid_data__recipe_created(
    mocked_session, mocked_recipe_dao, db_recipe, recipe_create, user_read
):
    mocked_recipe_dao.add.return_value = db_recipe
    recipe = await RecipeService(mocked_session).create_recipe(recipe_create, user_read)
    assert recipe == db_recipe


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_recipe__recipe_exists__recipe_returned(
    mocked_session, mocked_recipe_dao, db_recipe, user_read, for_update
):
    str_recipe_id = str(db_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_recipe

    recipe = await RecipeService(mocked_session).get_user_recipe(str_recipe_id, user_read, for_update=for_update)

    assert recipe == db_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_recipe.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_recipe__recipe_not_exist__error_raised(
    mocked_recipe_dao, mocked_session, db_recipe, user_read, for_update
):
    str_recipe_id = str(db_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(RecipeNotFound) as exc:
        await RecipeService(mocked_session).get_user_recipe(str_recipe_id, user_read, for_update=for_update)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Recipe {str_recipe_id} not found'
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_recipe.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_recipe__private_recipe_not_owned___error_raised(
    mocked_recipe_dao, mocked_session, db_recipe, user_read_2, for_update
):
    db_recipe.is_public = False
    str_recipe_id = str(db_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_recipe

    with pytest.raises(RecipeForbidden) as exc:
        await RecipeService(mocked_session).get_user_recipe(str_recipe_id, user_read_2, for_update=for_update)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == f'Recipe {str_recipe_id} forbidden'
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_recipe.id, for_update=for_update)


@pytest.mark.parametrize('for_update', FOR_UPDATE_PARAMETRIZE)
async def test_get_recipe__public_recipe_not_owned___recipe_in_response(
    mocked_recipe_dao, mocked_session, db_recipe, user_read_2, for_update
):
    db_recipe.is_public = True
    str_recipe_id = str(db_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_recipe

    recipe = await RecipeService(mocked_session).get_user_recipe(str_recipe_id, user_read_2, for_update=for_update)

    assert recipe == db_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_recipe.id, for_update=for_update)


async def test_get_recipe__not_uuid__error_raised(mocked_recipe_dao, mocked_session, user_read):
    bad_uuid = 'not_uuid'

    with pytest.raises(RecipeNotFound) as exc:
        await RecipeService(mocked_session).get_user_recipe(bad_uuid, user_read, for_update=False)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Recipe {bad_uuid} not found'
    mocked_recipe_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_recipes__user_with_recipes__recipes_returned(
    mocked_session, mocked_recipe_dao, db_recipe, user_read
):
    mocked_recipe_dao.find_all.return_value = [db_recipe]
    recipe = await RecipeService(mocked_session).get_all_user_recipes(user_read)
    assert recipe == [db_recipe]


@pytest.mark.parametrize(
    ('field_params'),
    [
        pytest.param({'name': 'new_name'}, id='name'),
        pytest.param({'is_public': False}, id='is_public'),
        pytest.param({'ingredients': [Ingredient(name='new', amount=1, unit=Unit.PIECES)]}, id='ingredients'),
        pytest.param({'steps': [CookingStep(order=0, step='test')]}, id='steps'),
        pytest.param({'image_key': 'new_key'}, id='image_key'),
        pytest.param({'name': 'new_name', 'is_public': False}, id='several'),
    ],
)
async def test_update_recipe__valid_new_data__recipe_updated(
    mocked_session, mocked_recipe_dao, db_recipe, field_params
):
    recipe_out = RecipeRead.model_validate(db_recipe)
    for name, value in field_params.items():
        setattr(db_recipe, name, value)
    mocked_recipe_dao.update.return_value = db_recipe
    update_params = RecipeUpdate(**field_params)

    updated_recipe = await RecipeService(mocked_session).update_recipe(recipe_out, update_params)

    assert updated_recipe == db_recipe


async def test_delete_recipe__valid_id__recipe_deleted(mocked_session, mocked_recipe_dao, db_recipe):
    mocked_recipe_dao.delete.return_value = 1
    recipe_out = RecipeRead.model_validate(db_recipe)

    await RecipeService(mocked_session).delete_recipe(recipe_out)

    mocked_recipe_dao.delete.assert_awaited_once_with(RecipeId(id=recipe_out.id))
