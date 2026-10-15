"""API router for recipe-related endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Path, UploadFile, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user, get_optional_user
from week_eat_planner.api.dependencies.storage_deps import get_storage_client
from week_eat_planner.api.schemas import RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate
from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.constants import AppUrl, StorageBucket
from week_eat_planner.db.models import Recipe, User
from week_eat_planner.db.session_maker import db
from week_eat_planner.helpers import check_image_suitable
from week_eat_planner.services.recipe_service import RecipeService

router = APIRouter(tags=['Recipe'])


@router.post(AppUrl.RECIPES, response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Recipe:
    """Creates a new recipe for the current user.

    Args:
        recipe_data: The data for the new recipe.
        user: The user requesting the operation.
        session: Database session committed after the endpoint returns.

    Returns:
        The newly created recipe.
    """
    logger.info(f'Got POST {AppUrl.RECIPES} request for user {user.id}')
    recipe = await RecipeService(session).create_recipe(recipe_data, user)
    logger.info(f'Recipe "{recipe_data.name}" created')

    return recipe


@router.get(AppUrl.RECIPES_MY, response_model=list[RecipeReadMinimal])
async def get_my_recipes(
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[Recipe]:
    """Retrieves all recipes created by the current user.

    Args:
        user: The user requesting the operation.
        session: Database session without automatic commit.

    Returns:
        A list of recipes belonging to the user.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_MY} request for user {user.id}')
    recipes = await RecipeService(session).get_all_user_recipes(user)
    logger.info(f'Successfully retrieved {len(recipes)} recipes for user {user.id}')

    return recipes


@router.get(AppUrl.RECIPES_FAVORITES, response_model=list[RecipeReadMinimal])
async def get_favorites(
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[Recipe]:
    """Retrieves all favorite recipes for the current user.

    Args:
        user: The user requesting the operation.
        session: Database session without automatic commit.

    Returns:
        A list of the user's favorite recipes.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_FAVORITES} for user {user.id}')
    favorites = await RecipeService(session).get_user_favorite_recipes(user)
    logger.info(f'Successfully retrieved {len(favorites)} favorites for user {user.id}')

    return favorites


@router.get(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def get_recipe(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User | None, Depends(get_optional_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> Recipe:
    """Retrieves a single recipe by its ID.

    The user must have access to the recipe (either it's public or they own it).

    Args:
        recipe_id: ID of the recipe to get.
        user: The authenticated user, or None for an anonymous request.
        session: Database session without automatic commit.

    Returns:
        The requested recipe.

    Raises:
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the requesting user cannot access the recipe.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_TPL} request for user {user}')
    recipe = await RecipeService(session).get_visible_recipe(recipe_id, user)
    return recipe


@router.patch(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def update_recipe(
    new_data: RecipeUpdate,
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Recipe:
    """Updates a recipe.

    The user must be the owner of the recipe to update it.

    Args:
        new_data: The new data to update the recipe with.
        recipe_id: ID of the recipe to update.
        user: The user requesting the operation.
        session: Database session committed after the endpoint returns.

    Returns:
        The updated recipe.

    Raises:
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the requesting user does not own the recipe.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_TPL} for recipe {recipe_id}')
    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    updated_recipe = await recipe_service.update_recipe(recipe, new_data)
    return updated_recipe


@router.delete(AppUrl.RECIPES_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Delete a recipe owned by the current user and its stored image, if present.

    Unlike image replacement, a storage deletion failure propagates to the
    caller. Successful requests return HTTP 204.

    Args:
        recipe_id: UUID string identifying the recipe to delete.
        user: Authenticated, active user who must own the recipe.
        storage: Object storage client used to delete the associated image.
        session: Database session committed by the dependency after the endpoint returns.

    Raises:
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the user does not own the recipe.
        ValueError: If the stored image reference lacks a bucket/key separator.
    """
    logger.info(f'Got DELETE {AppUrl.RECIPES_TPL} for recipe {recipe_id}')
    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    result = await recipe_service.delete_recipe(recipe)
    if result and recipe.image_key:
        await storage.delete_file(recipe.image_key)
        logger.debug(f'Image {recipe.image_key} was deleted.')


@router.patch(AppUrl.RECIPES_IMAGE_TPL, response_model=RecipeReadMinimal)
async def upload_image(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    image: UploadFile = File(...),  # noqa: B008
) -> Recipe:
    """Upload a replacement image for a recipe owned by the current user.

    Validate the upload, store the image, and update the recipe's bucket/key
    reference. Deleting a previous image is best effort; failures are logged
    without rejecting the replacement. The response serializes a recipe preview
    with a computed image URL.

    Args:
        recipe_id: UUID string identifying the recipe to update.
        user: Authenticated, active user who must own the recipe.
        session: Database session committed by the dependency after the endpoint returns.
        storage: Object storage client used to upload and delete images.
        image: Image file with an allowed MIME type and a size of at most 5 MiB.

    Returns:
        The updated recipe record, serialized as RecipeReadMinimal.

    Raises:
        ImageContentTypeMissingException: If the upload has no content type.
        UnsupportedImageTypeException: If the MIME type is not allowed.
        ImageTooLargeException: If the image exceeds the maximum size.
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the user does not own the recipe.
        ValueError: If the uploaded file has no filename.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_IMAGE_TPL} for recipe {recipe_id} with {image.filename}')

    await check_image_suitable(image)

    recipe_service = RecipeService(session)
    recipe = await recipe_service.get_recipe_for_edit(recipe_id, user)
    old_image_key = recipe.image_key
    image_key = await storage.upload_image(image, StorageBucket.RECIPES, recipe.id)

    new_data = RecipeUpdate(image_key=image_key)
    updated_recipe = await recipe_service.update_recipe(recipe, new_data)
    if old_image_key:
        logger.info(f'Cleaning the old image image_key={old_image_key}')
        try:
            await storage.delete_file(old_image_key)
        except Exception as exc:
            logger.exception(f'Failed to delete old image {old_image_key}: {exc}')

    return updated_recipe


@router.post(AppUrl.RECIPES_FAVORITES_TPL, status_code=status.HTTP_201_CREATED, response_model=RecipeReadMinimal)
async def create_favorite(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> Recipe:
    """Adds a recipe to the user's favorites.

    Args:
        recipe_id: The ID of the recipe to favorite.
        user: The user requesting the operation.
        session: Database session committed after the endpoint returns.

    Returns:
        The favorited recipe.

    Raises:
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the requesting user cannot access the recipe.
    """
    logger.info(f'Got POST {AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=recipe_id)} for user {user.id}')
    recipe = await RecipeService(session).add_favorite(recipe_id, user)
    logger.info(f'Recipe {recipe_id} successfully marked favorite for user {user.id}')

    return recipe


@router.delete(AppUrl.RECIPES_FAVORITES_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """Removes a recipe from the user's favorites.

    Args:
        recipe_id: The ID of the recipe to unfavorite.
        user: The user requesting the operation.
        session: Database session committed after the endpoint returns.

    Raises:
        RecipeNotFoundException: If the ID is invalid or the recipe does not exist.
        RecipeForbiddenException: If the requesting user cannot access the recipe.
    """
    logger.info(f'Got DELETE {AppUrl.RECIPES_FAVORITES_TPL.format(recipe_id=recipe_id)} for user {user.id}')
    await RecipeService(session).delete_favorite(recipe_id, user)
    logger.info(f'Recipe {recipe_id} successfully removed from favorites for user {user.id}')
