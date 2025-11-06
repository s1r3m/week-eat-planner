from unittest.mock import AsyncMock

import pytest

from week_eat_planner.api.dependencies.recipe_deps import get_recipe_by_id, get_recipe_for_update
from week_eat_planner.api.schemas import RecipeRead, UserRead
from week_eat_planner.helpers import generate_uuid7

RECIPE_ID = generate_uuid7()
RECIPE_INGREDIENTS = {'eggs': 2}
RECIPE_NAME = 'recipe'


@pytest.fixture
def mocked_recipe_service(mocker) -> AsyncMock:
    recipe_service_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.api.dependencies.recipe_deps.RecipeService', return_value=recipe_service_mock)
    return recipe_service_mock


@pytest.fixture
def recipe_read(user_read: UserRead) -> RecipeRead:
    return RecipeRead(
        id=RECIPE_ID, user_id=user_read.id, name=RECIPE_NAME, is_public=False, ingredients=RECIPE_INGREDIENTS
    )


async def test_get_recipe_by_id__recipe_exist__recipe_returned(
    mocked_recipe_service, mocked_session, recipe_read, user_read
):
    str_recipe_id = str(recipe_read.id)
    mocked_recipe_service.get_user_recipe.return_value = recipe_read

    recipe = await get_recipe_by_id(str_recipe_id, user_read, mocked_session)

    assert recipe == recipe_read
    mocked_recipe_service.get_user_recipe.assert_awaited_once_with(str_recipe_id, user_read, for_update=False)


async def test_get_recipe_for_update__recipe_exists__recipe_returned(
    mocked_recipe_service, mocked_session, recipe_read, user_read
):
    str_recipe_id = str(recipe_read.id)
    mocked_recipe_service.get_user_recipe.return_value = recipe_read

    recipe = await get_recipe_for_update(str_recipe_id, user_read, mocked_session)

    assert recipe == recipe_read
    mocked_recipe_service.get_user_recipe.assert_awaited_once_with(str_recipe_id, user_read, for_update=True)
