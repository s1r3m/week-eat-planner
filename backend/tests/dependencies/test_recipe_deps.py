from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from week_eat_planner.api.schemas import RecipeOut, UserOut
from week_eat_planner.dependencies.recipe_deps import get_recipe_by_id, get_recipe_for_update
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.helpers import generate_uuid7

RECIPE_ID = generate_uuid7()
RECIPE_INGREDIENTS = {'eggs': 2}
RECIPE_NAME = 'recipe'


@pytest.fixture
def mocked_recipe_dao(mocker) -> AsyncMock:
    recipe_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.recipe_service.RecipeDAO', return_value=recipe_dao_mock)
    return recipe_dao_mock


@pytest.fixture
def recipe_out(user_out: UserOut) -> RecipeOut:
    return RecipeOut(
        id=RECIPE_ID, user_id=user_out.id, name=RECIPE_NAME, is_public=False, ingredients=RECIPE_INGREDIENTS
    )


async def test_get_recipe_by_id__recipe_exist__recipe_returned(mocked_recipe_dao, mocked_session, recipe_out, user_out):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = recipe_out

    recipe = await get_recipe_by_id(str(recipe_out.id), user_out, mocked_session)

    assert recipe == recipe_out
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=False)


async def test_get_recipe_by_id__recipe_not_exist__error_raised(
    mocked_recipe_dao, mocked_session, recipe_out, user_out
):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        await get_recipe_by_id(str(recipe_out.id), user_out, mocked_session)

    assert exc.value.status_code == RecipeNotFound.status_code
    assert exc.value.detail == RecipeNotFound.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=False)


async def test_get_recipe_by_id__private_recipe_not_owned___error_raised(
    mocked_recipe_dao, mocked_session, recipe_out, user_out_2
):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = recipe_out

    with pytest.raises(HTTPException) as exc:
        await get_recipe_by_id(str(recipe_out.id), user_out_2, mocked_session)

    assert exc.value.status_code == RecipeForbidden.status_code
    assert exc.value.detail == RecipeForbidden.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=False)


async def test_get_recipe_by_id__public_recipe_not_owned___recipe_in_response(
    mocked_recipe_dao, mocked_session, recipe_out, user_out_2
):
    recipe_out.is_public = True
    mocked_recipe_dao.find_one_or_none_by_id.return_value = recipe_out

    recipe = await get_recipe_by_id(str(recipe_out.id), user_out_2, mocked_session)

    assert recipe == recipe_out
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=False)


async def test_get_recipe_by_id__not_uuid__error_raised(mocked_recipe_dao, mocked_session, recipe_out, user_out):
    bad_uuid = 'not_uuid'

    with pytest.raises(HTTPException) as exc:
        await get_recipe_by_id(bad_uuid, user_out, mocked_session)

    assert exc.value.status_code == RecipeNotFound.status_code
    assert exc.value.detail == RecipeNotFound.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_not_awaited()


async def test_get_recipe_for_update__recipe_exists__recipe_returned(mocked_recipe_dao, mocked_session, recipe_out):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = recipe_out

    recipe = await get_recipe_for_update(recipe_out, mocked_session)

    assert recipe == recipe_out
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=True)


async def test_get_recipe_for_update__recipe_not_exist__error_raised(
    mocked_recipe_dao, mocked_session, recipe_out, user_out
):
    mocked_recipe_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        await get_recipe_for_update(recipe_out, mocked_session)

    assert exc.value.status_code == RecipeNotFound.status_code
    assert exc.value.detail == RecipeNotFound.detail
    mocked_recipe_dao.find_one_or_none_by_id.assert_awaited_once_with(obj_id=recipe_out.id, for_update=True)
