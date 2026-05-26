from unittest.mock import ANY, AsyncMock

import pytest
from sqlalchemy.exc import IntegrityError
from tests.constants import RECIPE_INGREDIENTS, RECIPE_NAME, RECIPE_STEPS

from week_eat_planner.api.schemas import RecipeCreate, RecipeUpdate
from week_eat_planner.api.schemas.common import OwnerId, RecordId
from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient, RecipeFavoriteFilter
from week_eat_planner.constants import Unit
from week_eat_planner.db.models.user_favorites import UserFavorite
from week_eat_planner.exceptions import RecipeForbiddenException, RecipeNotFoundException
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
    recipe = await RecipeService(mocked_session).create_recipe(recipe_create, user_read.id)
    assert recipe == db_private_recipe


async def test_get_visible_recipe__public_recipe_with_auth__recipe_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_public_recipe, user_read
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read.id)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__public_favorite_recipe__recipe_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_public_recipe, user_read
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = UserFavorite(
        user_id=user_read.id, recipe_id=db_public_recipe.id
    )

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read.id)

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

    with pytest.raises(RecipeNotFoundException) as exc:
        await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read.id)

    error = RecipeNotFoundException(str_recipe_id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_private_recipe.id, for_update=False)


async def test_get_visible_recipe__private_recipe_not_owned___error_raised(
    mocked_recipe_dao, mocked_session, db_private_recipe, user_read_2
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe

    with pytest.raises(RecipeForbiddenException) as exc:
        await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read_2.id)

    error = RecipeForbiddenException(db_private_recipe.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_private_recipe.id, for_update=False)


async def test_get_visible_recipe__public_recipe_not_owned___recipe_in_response(
    mocked_recipe_dao, mocked_user_favorites_dao, mocked_session, db_public_recipe, user_read_2
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None

    recipe = await RecipeService(mocked_session).get_visible_recipe(str_recipe_id, user_read_2.id)

    assert recipe == db_public_recipe
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(db_public_recipe.id, for_update=False)


async def test_get_visible_recipe__not_uuid__error_raised(mocked_recipe_dao, mocked_session):
    bad_uuid = 'not_uuid'

    with pytest.raises(RecipeNotFoundException) as exc:
        await RecipeService(mocked_session).get_visible_recipe(bad_uuid)

    error = RecipeNotFoundException(bad_uuid)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_recipes__user_with_recipes__recipes_returned(
    mocked_session, mocked_recipe_dao, mocked_user_favorites_dao, db_private_recipe, db_public_recipe, user_read
):
    mocked_recipe_dao.find_all.return_value = [db_private_recipe, db_public_recipe]
    mocked_user_favorites_dao.find_all.return_value = []

    result = await RecipeService(mocked_session).get_all_user_recipes(user_read.id)

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
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_public_recipe, user_read_2
):
    user_favorite = UserFavorite(user_id=user_read_2.id, recipe_id=db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None
    mocked_user_favorites_dao.add.return_value = user_favorite

    result = await RecipeService(mocked_session).add_favorite(str(db_public_recipe.id), user_read_2.id)

    assert result == db_public_recipe


async def test_add_favorite__already_favorited__early_return(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_public_recipe, user_read_2
):
    str_recipe_id = str(db_public_recipe.id)
    user_favorite = UserFavorite(user_id=user_read_2.id, recipe_id=db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = user_favorite

    result = await RecipeService(mocked_session).add_favorite(str_recipe_id, user_read_2.id)

    assert result == db_public_recipe
    assert result.is_favorite is True
    mocked_user_favorites_dao.add.assert_not_awaited()


async def test_add_favorite__integrity_error__rollbacks_and_refetches(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_public_recipe, user_read_2
):
    str_recipe_id = str(db_public_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    user_favorite = UserFavorite(user_id=user_read_2.id, recipe_id=db_public_recipe.id)
    mocked_user_favorites_dao.find_one_or_none.side_effect = [None, user_favorite]
    mocked_user_favorites_dao.add.side_effect = IntegrityError('test', None, Exception())

    result = await RecipeService(mocked_session).add_favorite(str_recipe_id, user_read_2.id)

    assert result == db_public_recipe
    assert result.is_favorite is True
    mocked_session.rollback.assert_awaited_once()
    assert mocked_user_favorites_dao.find_one_or_none.call_count == 1 + 1


async def test_add_favorite__my_private_recipe__recipe_favorited(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_private_recipe, user_read
):
    str_recipe_id = str(db_private_recipe.id)
    user_favorite = UserFavorite(user_id=user_read.id, recipe_id=db_private_recipe.id, id=generate_uuid7())
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None
    mocked_user_favorites_dao.add.return_value = user_favorite

    result = await RecipeService(mocked_session).add_favorite(str_recipe_id, user_read.id)

    assert result == db_private_recipe


async def test_add_favorite__not_mine_private_recipe__error_raised(
    mocked_session, mocked_recipe_dao, db_private_recipe, user_read_2
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe

    with pytest.raises(RecipeForbiddenException) as exc:
        await RecipeService(mocked_session).add_favorite(str_recipe_id, user_read_2.id)

    error = RecipeForbiddenException(db_private_recipe.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_delete_favorite__public_favorite_recipe__recipe_unfavorited(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_public_recipe, user_read
):
    str_recipe_id = str(db_public_recipe.id)
    user_favorite = UserFavorite(user_id=user_read.id, recipe_id=db_public_recipe.id, id=generate_uuid7())
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_public_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = user_favorite
    mocked_user_favorites_dao.delete.return_value = 1

    result = await RecipeService(mocked_session).delete_favorite(str_recipe_id, user_read.id)

    assert result == 1
    mocked_user_favorites_dao.delete.assert_awaited_once_with(
        RecipeFavoriteFilter(user_id=user_read.id, recipe_id=db_public_recipe.id)
    )


async def test_delete_favorite__my_private_favorite_recipe__recipe_unfavorited(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_private_recipe, user_read
):
    str_recipe_id = str(db_private_recipe.id)
    user_favorite = UserFavorite(user_id=user_read.id, recipe_id=db_private_recipe.id, id=generate_uuid7())
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = user_favorite
    mocked_user_favorites_dao.delete.return_value = 1

    result = await RecipeService(mocked_session).delete_favorite(str_recipe_id, user_read.id)

    assert result == 1
    mocked_user_favorites_dao.delete.assert_awaited_once_with(
        RecipeFavoriteFilter(user_id=user_read.id, recipe_id=db_private_recipe.id)
    )


async def test_delete_favorite__not_favorite_recipe__not_unfavorited(
    mocked_session, mocked_user_favorites_dao, mocked_recipe_dao, db_private_recipe, user_read
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe
    mocked_user_favorites_dao.find_one_or_none.return_value = None
    mocked_user_favorites_dao.delete.return_value = 1

    result = await RecipeService(mocked_session).delete_favorite(str_recipe_id, user_read.id)

    assert result == 0
    mocked_user_favorites_dao.delete.assert_not_awaited()


async def test_delete_favorite__not_mine_private_favorite_recipe__error_raised(
    mocked_session, mocked_recipe_dao, db_private_recipe, user_read_2
):
    str_recipe_id = str(db_private_recipe.id)
    mocked_recipe_dao.find_one_or_none_by_id.return_value = db_private_recipe

    with pytest.raises(RecipeForbiddenException) as exc:
        await RecipeService(mocked_session).delete_favorite(str_recipe_id, user_read_2.id)

    error = RecipeForbiddenException(db_private_recipe.id)
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_get_user_favorite__favorite_exists__user_favorite_returned(
    mocked_session, mocked_user_favorites_dao, db_user_favorite, user_read
):
    mocked_user_favorites_dao.find_all.return_value = [db_user_favorite]

    result = await RecipeService(mocked_session).get_user_favorite_recipes(user_read.id)

    assert result == [db_user_favorite.recipe]
    mocked_user_favorites_dao.find_all.assert_awaited_once_with(OwnerId(user_id=user_read.id), options=ANY)


async def test_get_user_favorite__inaccessible_recipe__recipe_skipped(
    mocked_session, mocked_user_favorites_dao, db_private_recipe, user_read_2
):
    inaccessible_favorite = UserFavorite(
        id=generate_uuid7(),
        user_id=user_read_2.id,
        recipe_id=db_private_recipe.id,
        recipe=db_private_recipe,
    )
    mocked_user_favorites_dao.find_all.return_value = [inaccessible_favorite]

    result = await RecipeService(mocked_session).get_user_favorite_recipes(user_read_2.id)

    assert result == []
    mocked_user_favorites_dao.find_all.assert_awaited_once_with(OwnerId(user_id=user_read_2.id), options=ANY)
