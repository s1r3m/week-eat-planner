from io import BytesIO
from operator import itemgetter

import pytest
import pytest_asyncio
from fastapi import UploadFile, status
from starlette.datastructures import Headers

from tests.constants import RECIPE_INGREDIENTS, RECIPE_IS_PUBLIC, RECIPE_NAME, RECIPE_STEPS
from week_eat_planner.api.schemas import RecipeCreate, RecipeReadMinimal, RecipeUpdate
from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient, RecipeRead
from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.constants import AppUrl, MAX_IMAGE_SIZE_BYTES, StorageBucket, Unit
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.helpers import generate_uuid7


@pytest_asyncio.fixture
async def clean_storage(created_recipe):
    yield

    storage = StorageClient()
    await storage.delete_file(f'recipes/{created_recipe.id}.jpg')


@pytest_asyncio.fixture
async def uploaded_image(created_recipe_with_image):
    storage = StorageClient()
    image = UploadFile(
        file=BytesIO(b'fake image content'),
        filename='test.jpg',
        headers=Headers({'Content-Type': 'image/jpeg'}),
    )
    await storage.upload_image(image, StorageBucket.RECIPES, obj_id=created_recipe_with_image.id)

    yield

    storage = StorageClient()
    await storage.delete_file(f'recipes/{created_recipe_with_image.id}.jpg')


@pytest_asyncio.fixture
async def favorite_public_recipe(auth_client_for_created_user, public_created_recipe) -> Recipe:
    await auth_client_for_created_user.post(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=public_created_recipe.id)}'
    )
    public_created_recipe.is_favorite = True
    return public_created_recipe


@pytest_asyncio.fixture
async def favorite_private_recipe(auth_client_for_created_user, created_recipe) -> Recipe:
    await auth_client_for_created_user.post(f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}')
    created_recipe.is_favorite = True
    return created_recipe


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
    expected['author'] = created_user.username
    expected['image_url'] = None
    expected['is_favorite'] = False
    expected.pop('image_key', None)
    assert body == expected


async def test_get_recipe__no_auth_public_recipe__recipe_received(client, public_created_recipe):
    response = await client.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=public_created_recipe.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == RecipeRead.model_validate(public_created_recipe).model_dump(mode='json')


async def test_get_recipe__user_with_recipe__recipe_in_response(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == RecipeRead.model_validate(created_recipe).model_dump(mode='json')


async def test_get_recipe__user_with_favorite_recipe__recipe_in_response(
    auth_client_for_created_user, favorite_public_recipe
):
    response = await auth_client_for_created_user.get(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=favorite_public_recipe.id)}'
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == RecipeRead.model_validate(favorite_public_recipe).model_dump(mode='json')


async def test_get_recipe__recipe_with_image__recipe_in_response(
    auth_client_for_created_user, created_recipe_with_image
):
    response = await auth_client_for_created_user.get(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe_with_image.id)}'
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == RecipeRead.model_validate(created_recipe_with_image).model_dump(mode='json')


async def test_get_recipe__recipe_not_exist__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=bad_recipe_id)}')

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': f'Recipe {bad_recipe_id} not found'}


async def test_get_recipe__no_auth__error_in_response(client, created_recipe):
    response = await client.get(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {created_recipe.id} forbidden'}


async def test_get_my_recipes__empty_list__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.RECIPES_MY)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_my_recipes__recipe_exists__recipe_in_response(
    auth_client_for_created_user, created_recipe, created_recipe_for_other_user
):
    response = await auth_client_for_created_user.get(AppUrl.RECIPES_MY)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body == [RecipeReadMinimal.model_validate(created_recipe).model_dump(mode='json')]
    assert str(created_recipe_for_other_user.id) not in [recipe['id'] for recipe in body]


async def test_get_my_recipes__several_recipes__recipe_in_response(
    auth_client_for_created_user, created_recipe, created_recipe_with_image, created_recipe_for_other_user
):
    response = await auth_client_for_created_user.get(AppUrl.RECIPES_MY)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    actual_recipes = sorted(body, key=itemgetter('id'))
    assert actual_recipes == sorted(
        [
            RecipeReadMinimal.model_validate(created_recipe).model_dump(mode='json'),
            RecipeReadMinimal.model_validate(created_recipe_with_image).model_dump(mode='json'),
        ],
        key=itemgetter('id'),
    )
    assert str(created_recipe_for_other_user.id) not in [recipe['id'] for recipe in body]


async def test_get_my_recipes__no_auth__error_in_response(client):
    response = await client.get(AppUrl.RECIPES_MY)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_update_recipe__new_data__updated_recipe_in_response(auth_client_for_created_user, created_recipe):
    update_data = RecipeUpdate(
        name='new_name',
        is_public=False,
        steps=[CookingStep(order=0, step='new')],
        ingredients=[Ingredient(name='new', amount=1, unit=Unit.PIECES)],
    )

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}', json=update_data.model_dump(mode='json')
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    expected = update_data.model_dump(mode='json')
    expected.update(
        {
            'id': str(created_recipe.id),
            'user_id': str(created_recipe.user_id),
            'author': created_recipe.author,
            'is_favorite': created_recipe.is_favorite,
            'image_url': None,
        }
    )
    expected.pop('image_key')
    assert body == expected


async def test_update_recipe__no_auth__error_in_response(client, created_recipe):
    update_data = RecipeUpdate(
        name='new_name',
        is_public=False,
        steps=[CookingStep(order=0, step='new')],
        ingredients=[Ingredient(name='new', amount=1, unit=Unit.PIECES)],
    )

    response = await client.patch(
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

    response = await auth_client_for_created_user.patch(
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


@pytest.mark.usefixtures('uploaded_image')
async def test_delete_recipe__recipe_with_image__image_removed(auth_client_for_created_user, created_recipe_with_image):
    response = await auth_client_for_created_user.delete(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe_with_image.id)}'
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text
    # TODO: check somehow that the image is removed from the storage


async def test_delete_recipe__recipe_with_image__recipe_removed(
    auth_client_for_created_user, created_recipe_with_image
):
    response = await auth_client_for_created_user.delete(
        f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe_with_image.id)}'
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_recipe__other_user_existing_recipe__error_in_response(
    created_recipe, auth_client_for_created_user_2
):
    response = await auth_client_for_created_user_2.delete(f'{AppUrl.RECIPES_TPL.format(recipe_id=created_recipe.id)}')

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {created_recipe.id} forbidden'}


@pytest.mark.usefixtures('clean_storage')
async def test_upload_image__valid_file__image_is_uploaded(auth_client_for_created_user, created_recipe):
    files = {'image': ('test.jpg', b'fake image content', 'image/jpeg')}

    response = await auth_client_for_created_user.patch(
        f'{AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=created_recipe.id)}',
        files=files,
    )
    created_recipe.image_key = f'recipes/{created_recipe.id}.jpg'

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    expected = RecipeReadMinimal.model_validate(created_recipe).model_dump(mode='json')
    assert body == expected


async def test_upload_image__recipe_not_exists__error_in_response(auth_client_for_created_user):
    bad_recipe_id = generate_uuid7()
    files = {'image': ('test.jpg', b'fake image content', 'image/jpeg')}

    response = await auth_client_for_created_user.patch(
        AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=bad_recipe_id),
        files=files,
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json() == {'detail': f'Recipe {bad_recipe_id} not found'}


async def test_upload_image__unauthenticated__returns_401(client, created_recipe):
    files = {'image': ('test.jpg', b'fake image content', 'image/jpeg')}

    response = await client.patch(
        AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=created_recipe.id),
        files=files,
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


async def test_upload_image__not_owner__returns_403(auth_client_for_created_user, public_created_recipe):
    files = {'image': ('test.jpg', b'fake image content', 'image/jpeg')}

    response = await auth_client_for_created_user.patch(
        AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=public_created_recipe.id),
        files=files,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {public_created_recipe.id} forbidden'}


async def test_upload_image__invalid_content_type__returns_400(auth_client_for_created_user, created_recipe):
    files = {'image': ('test.txt', b'fake image content', 'text/plain')}

    response = await auth_client_for_created_user.patch(
        f'{AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=created_recipe.id)}',
        files=files,
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Unsupported image type' in response.json()['detail']


async def test_upload_image__file_too_large__returns_400(auth_client_for_created_user, created_recipe):
    large_content = b'a' * (MAX_IMAGE_SIZE_BYTES + 1)
    files = {'image': ('test.jpg', large_content, 'image/jpeg')}

    response = await auth_client_for_created_user.patch(
        f'{AppUrl.RECIPES_IMAGE_TPL.format(recipe_id=created_recipe.id)}',
        files=files,
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Image too large' in response.json()['detail']


async def test_add_favorite__not_mine_public_recipe__recipe_favorited(
    auth_client_for_created_user, public_created_recipe
):
    response = await auth_client_for_created_user.post(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=public_created_recipe.id)}'
    )

    assert response.status_code == status.HTTP_201_CREATED


async def test_add_favorite__my_private_recipe__recipe_favorited(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.post(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}'
    )

    assert response.status_code == status.HTTP_201_CREATED


async def test_add_favorite__already_favorite_recipe__no_error(auth_client_for_created_user, favorite_public_recipe):
    response = await auth_client_for_created_user.post(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=favorite_public_recipe.id)}'
    )

    assert response.status_code == status.HTTP_201_CREATED


async def test_add_favorite__not_mine_private_recipe__error_raised(auth_client_for_created_user_2, created_recipe):
    response = await auth_client_for_created_user_2.post(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}'
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {created_recipe.id} forbidden'}


async def test_delete_favorite__not_mine_public_favorited_recipe__recipe_unfavorited(
    auth_client_for_created_user, favorite_public_recipe
):
    response = await auth_client_for_created_user.delete(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=favorite_public_recipe.id)}'
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT


async def test_delete_favorite__my_private_favorited_recipe__recipe_unfavorited(
    auth_client_for_created_user, favorite_private_recipe
):
    response = await auth_client_for_created_user.delete(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=favorite_private_recipe.id)}'
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT


async def test_delete_favorite__not_mine_private_favorited_recipe__error_raised(
    auth_client_for_created_user, auth_client_for_created_user_2, created_recipe
):
    await auth_client_for_created_user.post(f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}')

    response = await auth_client_for_created_user_2.delete(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}'
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {'detail': f'Recipe {created_recipe.id} forbidden'}


async def test_delete_favorite__not_favorited_recipe__no_error(auth_client_for_created_user, created_recipe):
    response = await auth_client_for_created_user.delete(
        f'{AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=created_recipe.id)}'
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT


async def test_get_user_favorites__empty_list__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_FAVORITES}')

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_user_favorites__some_recipes__recipes_in_response(
    auth_client_for_created_user, favorite_private_recipe, favorite_public_recipe
):
    response = await auth_client_for_created_user.get(f'{AppUrl.RECIPES_FAVORITES}')

    assert response.status_code == status.HTTP_200_OK
    actual = sorted(response.json(), key=itemgetter('id'))
    assert actual == sorted(
        [
            RecipeReadMinimal.model_validate(favorite_private_recipe).model_dump(mode='json'),
            RecipeReadMinimal.model_validate(favorite_public_recipe).model_dump(mode='json'),
        ],
        key=itemgetter('id'),
    )


async def test_get_user_favorites__no_auth__error_in_response(client):
    response = await client.get(f'{AppUrl.RECIPES_FAVORITES}')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}
