from typing import Annotated

from fastapi import APIRouter, Depends, File, Path, UploadFile, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user, get_optional_user
from week_eat_planner.api.dependencies.storage_deps import get_storage_client
from week_eat_planner.api.schemas import RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate, UserRead
from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.constants import AppUrl, StorageBucket
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import check_image_suitable
from week_eat_planner.services.recipe_service import RecipeService

router = APIRouter(tags=['Recipe'])


@router.post(AppUrl.RECIPES, response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """Creates a new recipe for the current user.

    Args:
        recipe_data: The data for the new recipe.
        user: The authenticated user, injected by dependency.
        session: The database session.

    Returns:
        The newly created recipe.
    """
    logger.info(f'Got POST {AppUrl.RECIPES} request for {user}.')
    recipe = await RecipeService(session).create_recipe(recipe_data, user)
    logger.info(f'Recipe "{recipe_data.name}" has been created!')

    return RecipeRead.model_validate(recipe)


@router.get(AppUrl.RECIPES_MY, response_model=list[RecipeReadMinimal])
async def get_my_recipes(
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[RecipeReadMinimal]:
    """Retrieves all recipes created by the current user.

    Args:
        user: The authenticated user, injected by dependency.
        session: The database session.

    Returns:
        A list of recipes belonging to the user.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_MY} request for {user}.')
    recipes = await RecipeService(session).get_all_user_recipes(user)
    logger.info(f'Successfully retrieved {len(recipes)} recipes for User {user.email}')

    return [RecipeReadMinimal.model_validate(recipe) for recipe in recipes]


@router.get(AppUrl.RECIPES_FAVORITES, response_model=list[RecipeReadMinimal])
async def get_favorites(
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[RecipeReadMinimal]:
    logger.info(f'Got GET {AppUrl.RECIPES_FAVORITES} for {user}')
    favorites = await RecipeService(session).get_user_favorite_recipes(user)
    logger.info(f'Successfully retrieved {len(favorites)} for {user}')

    return [RecipeReadMinimal.model_validate(recipe) for recipe in favorites]


@router.get(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def get_recipe(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead | None, Depends(get_optional_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> RecipeRead:
    """Retrieves a single recipe by its ID.

    The user must have access to the recipe (either it's public or they own it).

    Args:
        recipe: The recipe object, injected by the `get_recipe_by_id` dependency.

    Returns:
        The requested recipe.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_TPL} request for {user}.')
    recipe = await RecipeService(session).get_visible_recipe(recipe_id, user)
    return RecipeRead.model_validate(recipe)


@router.patch(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def update_recipe(
    new_data: RecipeUpdate,
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """Updates a recipe.

    The user must be the owner of the recipe to update it.

    Args:
        new_data: The new data to update the recipe with.
        recipe: The recipe to update, injected by the `get_recipe_for_update` dependency.
        session: The database session.

    Returns:
        The updated recipe.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_TPL} for {recipe_id}')
    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    updated_recipe = await recipe_service.update_recipe(recipe, new_data)
    return RecipeRead.model_validate(updated_recipe)


@router.delete(AppUrl.RECIPES_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Deletes a recipe and its associated image.

    The user must be the owner of the recipe to delete it.

    Args:
        recipe: The recipe to delete, injected by the `get_recipe_for_update` dependency.
        storage: The storage client for deleting the recipe's image.
        session: The database session.

    Returns:
        None. A 204 No Content status code is returned on success.
    """
    logger.info(f'Got DELETE {AppUrl.RECIPES_TPL} for {recipe_id}')
    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    result = await recipe_service.delete_recipe(recipe)
    if result and recipe.image_key:
        await storage.delete_file(recipe.image_key)
        logger.debug(f'Image {recipe.image_key} was deleted.')


@router.patch(AppUrl.RECIPES_IMAGE_TPL, response_model=RecipeReadMinimal)
async def upload_image(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    image: UploadFile = File(...),  # noqa: B008
) -> RecipeReadMinimal:
    """The endpoint to upload an image to the recipe.

    Args:
        recipe_id: The recipe_id to update.
        session: The database session.
        storage: The storage client, injected by dependency.
        image: The image file to upload.

    Returns:
        The updated recipe containing the new image URL.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_IMAGE_TPL} for {recipe_id} with {image.filename}')

    await check_image_suitable(image)

    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    image_key = await storage.upload_image(image, StorageBucket.RECIPES, recipe.id)
    new_data = RecipeUpdate(image_key=image_key)
    updated_recipe = await recipe_service.update_recipe(recipe, new_data)

    return RecipeReadMinimal.model_validate(updated_recipe)


@router.post(AppUrl.RECIPES_FAVORITES_TPL, status_code=status.HTTP_201_CREATED, response_model=RecipeRead)
async def create_favorite(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    logger.info(f'Got {AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=recipe_id)} for {user}')
    recipe = await RecipeService(session).add_favorite(recipe_id, user)
    logger.info(f'Recipe {recipe_id} successfully marked favorite for {user}')

    return RecipeRead.model_validate(recipe)


@router.delete(AppUrl.RECIPES_FAVORITES_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    logger.info(f'Got {AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=recipe_id)} for {user}')
    await RecipeService(session).delete_favorite(recipe_id, user)
    logger.info(f'Recipe {recipe_id} successfully removed from favorites for {user}')
