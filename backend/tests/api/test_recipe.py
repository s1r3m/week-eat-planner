from fastapi import status

from tests.constants import PASSWORD, RECIPE_INGREDIENTS, RECIPE_IS_PUBLIC, RECIPE_NAME, RECIPE_STEPS
from week_eat_planner.api.schemas import RecipeCreate, RecipeReadMinimal, RecipeUpdate
from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient
from week_eat_planner.constants import AppUrl, Unit
from week_eat_planner.helpers import generate_uuid7


async def test_create_recipe__with_auth__recipe_in_response(auth_client_for_created_user, created_user):
    create_data = RecipeCreate(
        name=RECIPE_NAME,
        is_public=RECIPE_IS_PUBLIC,
        steps=RECIPE_STEPS,
        ingredients=RECIPE_INGREDIENTS,
    )

    response = await auth_client_for_created_user.post(AppUrl.RECIPES, json=create_data.model_dump(mode='json'))

    body = response.json()
    assert response.status_code == status.HTTP_201_CREATED
    assert body.pop('id')
    expected = create_data.model_dump(mode='json')
    expected['user_id'] = str(created_user.id)
    assert body == expected


async def test_get_recipe__user_with_recipe__recipe_in_response(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == created_recipe.model_dump(mode='json')


async def test_get_recipe__recipe_not_exist__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}')

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': f'Recipe {bad_recipe_id} not found'}


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
    assert response.json() == [RecipeReadMinimal.model_validate(created_recipe.model_dump()).model_dump(mode='json')]


async def test_get_recipes__no_auth__error_in_response(client, created_recipe):
    response = await client.get(f'{AppUrl.RECIPES}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_recipe__new_data__updated_recipe_in_response(auth_client_for_created_user, created_recipe):
    update_data = RecipeUpdate(
        name='new_name',
        is_public=False,
        steps=[CookingStep(order=0, step='new')],
        ingredients=[Ingredient(name='new', amount=1, unit=Unit.PIECES)],
    )

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}', json=update_data.model_dump(mode='json')
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK

    expected = update_data.model_dump(mode='json')
    expected.update(
        {
            'id': str(created_recipe.id),
            'user_id': str(created_recipe.user_id),
        }
    )
    assert body == expected


async def test_update_recipe__no_auth__error_in_response(client, created_recipe):
    update_data = RecipeUpdate(
        name='new_name',
        is_public=False,
        steps=[CookingStep(order=0, step='new')],
        ingredients=[Ingredient(name='new', amount=1, unit=Unit.PIECES)],
    )

    response = await client.put(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}', json=update_data.model_dump(mode='json')
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_recipe__recipe_not_exists__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()
    update_data = RecipeUpdate(
        name='new_name',
        is_public=False,
        steps=[CookingStep(order=0, step='new')],
        ingredients=[Ingredient(name='new', amount=1, unit=Unit.PIECES)],
    )

    response = await auth_client_for_created_user.put(
        url=f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}',
        json=update_data.model_dump(mode='json'),
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': f'Recipe {bad_recipe_id} not found'}


async def test_delete_recipe__no_auth__error_in_response(client, created_recipe):
    response = await client.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_delete_recipe__user_without_recipe__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()

    response = await auth_client_for_created_user.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}')

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': f'Recipe {bad_recipe_id} not found'}


async def test_delete_recipe__user_with_recipe__recipe_removed(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_recipe__other_user_existing_recipe__error_in_response(
    created_recipe, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)
    response = await user_client_2.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {created_recipe.id} forbidden'}
