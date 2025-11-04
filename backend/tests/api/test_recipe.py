from typing import Callable

import pytest_asyncio
from fastapi import status

from tests.constants import PASSWORD
from week_eat_planner.api.schemas import RecipeCreate, RecipeOut, RecipePreviewOut, RecipeUpdate, UserOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.helpers import generate_uuid7

RECIPE_NAME = 'Eggs'
RECIPE_IS_PUBLIC = False
RECIPE_INGREDIENTS = {'eggs': 2}


@pytest_asyncio.fixture
async def created_recipe(created_recipe_factory: Callable, created_user: UserOut) -> RecipeOut:
    recipe_create = RecipeCreate(name=RECIPE_NAME, is_public=RECIPE_IS_PUBLIC, ingredients=RECIPE_INGREDIENTS)

    return await created_recipe_factory(created_user, recipe_data=recipe_create)


async def test_create_recipe__with_auth__recipe_in_response(auth_client_for_created_user, created_user):
    params = {'name': RECIPE_NAME, 'is_public': RECIPE_IS_PUBLIC, 'ingredients': RECIPE_INGREDIENTS}

    response = await auth_client_for_created_user.post(AppUrl.RECIPES, json=params)

    body = response.json()
    assert response.status_code == status.HTTP_201_CREATED
    assert body.pop('id')
    assert body == {
        'name': RECIPE_NAME,
        'user_id': str(created_user.id),
        'is_public': RECIPE_IS_PUBLIC,
        'ingredients': RECIPE_INGREDIENTS,
    }


async def test_get_recipe__user_with_recipe__recipe_in_response(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == created_recipe.model_dump(mode='json')


async def test_get_recipe__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_week_id)}')

    assert response.status_code == RecipeNotFound.status_code
    assert response.json() == {'detail': RecipeNotFound.detail}


async def test_get_recipe__no_auth__error_in_response(client, created_recipe):
    response = await client.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_get_recipes__empty_list__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.RECIPES)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_recipes__recipe_exists__recipe_in_response(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.get(AppUrl.RECIPES)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [RecipePreviewOut.model_validate(created_recipe.model_dump()).model_dump(mode='json')]


async def test_get_recipes__no_auth__error_in_response(client, created_recipe):
    response = await client.get(f'{AppUrl.RECIPES}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_recipe__new_data__updated_recipe_in_response(auth_client_for_created_user, created_recipe):
    update_data = RecipeUpdate(name='new_name', is_public=False, ingredients={'new': 2})

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}', json=update_data.model_dump(mode='json')
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == {
        'id': str(created_recipe.id),
        'name': update_data.name,
        'user_id': str(created_recipe.user_id),
        'is_public': update_data.is_public,
        'ingredients': update_data.ingredients,
    }


async def test_update_recipe__no_auth__error_in_response(client, created_recipe):
    update_data = RecipeUpdate(name='new_name', is_public=False, ingredients={'new': 2})

    response = await client.patch(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}', json=update_data.model_dump(mode='json')
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_recipe__recipe_not_exists__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}',
        json={'name': 'test'},
    )

    assert response.status_code == RecipeNotFound.status_code
    assert response.json() == {'detail': RecipeNotFound.detail}


async def test_delete_recipe__no_auth__error_in_response(client, created_recipe):
    response = await client.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_delete_recipe__user_without_recipe__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()

    response = await auth_client_for_created_user.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}')

    assert response.status_code == RecipeNotFound.status_code
    assert response.json() == {'detail': RecipeNotFound.detail}


async def test_delete_recipe__user_with_recipe__recipe_removed(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_recipe__other_user_existing_recipe__error_in_response(
    created_recipe, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)
    response = await user_client_2.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == RecipeForbidden.status_code
    assert response.json() == {'detail': RecipeForbidden.detail}
