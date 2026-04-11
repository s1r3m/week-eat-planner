from unittest.mock import AsyncMock

import pytest
from fastapi import status
from tests.constants import RECIPE_INGREDIENTS, RECIPE_NAME, RECIPE_STEPS

from week_eat_planner.api.schemas import RecipeCreate, RecipeUpdate
from week_eat_planner.api.schemas.common import OwnerId, RecordId
from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient
from week_eat_planner.constants import Unit
from week_eat_planner.db.models.user_favorites import UserFavorite
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.recipe_service import RecipeService


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    recipe_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.recipe_service.RecipeDAO', return_value=recipe_dao_mock)
    return recipe_dao_mock


@pytest.fixture
def mocked_user_favorites_dao(mocker) -> AsyncMock:
    user_favorites_dao = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.recipe_service.UserFavoriteDAO', return_value=user_favorites_dao)
    return user_favorites_dao


@pytest.fixture
def db_user_favorite(db_public_recipe, db_user) -> UserFavorite:
    return UserFavorite(
        id=generate_uuid7(),
        user_id=db_user.id,
        recipe_id=db_public_recipe.id,
        user=db_user,
        recipe=db_public_recipe,
    )


@pytest.fixture
def recipe_create() -> RecipeCreate:
    return RecipeCreate(
        name=RECIPE_NAME,
        is_public=False,
        steps=RECIPE_STEPS,
        ingredients=RECIPE_INGREDIENTS,
    )


async def test_create_recipe__valid_data__recipe_created(
    mocked_session, mocked_recipe_dao, db_private_recipe, recipe_create, user_read
):
    mocked_recipe_dao.add.return_value = db_private_recipe
    recipe = await RecipeService(mocked_session).create_recipe(recipe_create, user_read)
    assert recipe == db_private_recipe


async def test_get_visible_recipe__public_recipe_with_auth__recipe_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_public_recipe, user_read
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__public_favorite_recipe__recipe_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_public_recipe, user_read
):
    str_recipe_id = str(db_public_recipe.id)
    db_public_recipe.is_favorite = True
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = UserFavorite(
        user_id=user_read.id, recipe_id=db_public_recipe.id
    )

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__public_recipe_no_auth__recipe_returned(
    mocked_session, mocked_recipe_dao, db_public_recipe
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__recipe_not_exist__error_raised(
    mocked_recipe_dao, mocked_session, db_private_recipe, user_read
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(RecipeNotFound) as exc:
        await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Recipe {str_recipe_id} not found'
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_private_recipe.id, for_update=False)


async def test_get_visible_recipe__private_recipe_not_owned___error_raised(
    mocked_recipe_dao, mocked_session, db_private_recipe, user_read_2
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe

    with pytest.raises(RecipeForbidden) as exc:
        await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read_2)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == f'Recipe {str_recipe_id} forbidden'
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_private_recipe.id, for_update=False)


async def test_get_visible_recipe__public_recipe_not_owned___recipe_in_response(
    mocked_recipe_dao, mocked_user_favorites_dao, mocked_session, db_public_recipe, user_read_2
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read_2)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__not_uuid__error_raised(mocked_recipe_dao, mocked_session):
    bad_uuid = 'not_uuid'

    with pytest.raises(RecipeNotFound) as exc:
        await RecipeService(mocked_session).get_visible_recipe(bad_uuid)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'Recipe {bad_uuid} not found'
    mocked_recipe_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_recipes__user_with_recipes__recipes_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_private_recipe, db_public_recipe, user_read
):
    mocked_recipe_dao.find_all.return_value = [db_private_recipe, db_public_recipe]
    mocked_user_favorites_dao.find_all.return_value = []

    result = await RecipeService(mocked_session).get_all_user_recipes(user_read)

    assert result == [db_private_recipe, db_public_recipe]


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
    mocked_session, mocked_recipe_dao, db_private_recipe, field_params
):
    for name, value in field_params.items():
        setattr(db_private_recipe, name, value)
    mocked_recipe_dao.update.return_value = db_private_recipe
    update_params = RecipeUpdate(**field_params)

    updated_recipe = await RecipeService(mocked_session).update_recipe(db_private_recipe, update_params)

    assert updated_recipe == db_private_recipe


async def test_delete_recipe__valid_id__recipe_deleted(mocked_session, mocked_recipe_dao, db_private_recipe):
    mocked_recipe_dao.delete.return_value = 1
    await RecipeService(mocked_session).delete_recipe(db_private_recipe)
    mocked_recipe_dao.delete.assert_awaited_once_with(RecordId(id=db_private_recipe.id))


async def test_add_favorite__public_recipe__recipe_favorited(
    mocked_session, mocked_user_favorites_dao, db_public_recipe, user_read_2
):
    user_favorite = UserFavorite(user_id=user_read_2.id, recipe_id=db_public_recipe.id, id=generate_uuid7())
    mocked_user_favorites_dao.add.return_value = user_favorite

    result = await RecipeService(mocked_session).add_favorite(db_public_recipe, user_read_2)

    assert result == user_favorite


async def test_add_favorite__my_private_recipe__recipe_favorited(
    mocked_session, mocked_user_favorites_dao, db_private_recipe, user_read
):
    user_favorite = UserFavorite(user_id=user_read.id, recipe_id=db_private_recipe.id, id=generate_uuid7())
    mocked_user_favorites_dao.add.return_value = user_favorite
    result = await RecipeService(mocked_session).add_favorite(db_private_recipe, user_read)

    assert result == user_favorite


async def test_delete_favorite__user_favorite_exists__recipe_deleted(
    mocked_session, mocked_user_favorites_dao, db_user_favorite
):
    mocked_user_favorites_dao.delete.return_value = 1

    result = await RecipeService(mocked_session).delete_favorite(db_user_favorite)

    assert result == 1
    mocked_user_favorites_dao.delete.assert_awaited_once_with(RecordId(id=db_user_favorite.id))


async def test_delete_favorite__user_favorite_not_exists__no_errors(
    mocked_session, mocked_user_favorites_dao, db_user_favorite
):
    mocked_user_favorites_dao.delete.return_value = 0

    result = await RecipeService(mocked_session).delete_favorite(db_user_favorite)

    assert result == 0
    mocked_user_favorites_dao.delete.assert_awaited_once_with(RecordId(id=db_user_favorite.id))


async def test_get_user_favorite__favorite_exists__user_favorite_returned(
    mocked_session, mocked_user_favorites_dao, db_user_favorite, user_read
):
    mocked_user_favorites_dao.find_all.return_value = [db_user_favorite]

    result = await RecipeService(mocked_session).get_user_favorite_recipes(user_read)

    assert result == [db_user_favorite.recipe]
    mocked_user_favorites_dao.find_all.assert_awaited_once_with(OwnerId(user_id=user_read.id))
