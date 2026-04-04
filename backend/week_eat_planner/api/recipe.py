from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.dependencies.recipe_deps import get_recipe_by_id, get_recipe_for_update
from week_eat_planner.api.dependencies.storage_deps import get_storage_client
from week_eat_planner.api.schemas import RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate, UserRead
from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.constants import ALLOWED_IMAGE_TYPES, AppUrl, MAX_IMAGE_SIZE_BYTES, StorageBucket
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import ValidationException
from week_eat_planner.services.recipe_service import RecipeService

router = APIRouter(tags=['Recipe'])


@router.post(AppUrl.RECIPES, response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """
    Create a new recipe owned by the authenticated user.
    
    Returns:
        The created recipe as a `RecipeRead` model.
    """
    logger.info(f'Got POST {AppUrl.RECIPES} request for {user}.')
    recipe = await RecipeService(session).create_recipe(recipe_data, user)
    logger.info(f'Recipe "{recipe_data.name}" has been created!')

    return RecipeRead.model_validate(recipe)


@router.patch(AppUrl.RECIPES_IMAGE_TPL, response_model=RecipeRead)
async def upload_image(
    recipe: Annotated[RecipeRead, Depends(get_recipe_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    image: UploadFile = File(...),  # noqa: B008
) -> RecipeRead:
    """
    Upload an image and attach it to the given recipe.
    
    Validates the file's MIME type against ALLOWED_IMAGE_TYPES and enforces a maximum size of MAX_IMAGE_SIZE_BYTES. On success the file is stored in the recipes bucket and the recipe's stored image key is persisted; the updated recipe is returned.
    
    Parameters:
        image (UploadFile): The uploaded file; its MIME type and size are validated.
    
    Returns:
        RecipeRead: The updated recipe containing the new image key.
    
    Raises:
        ValidationException: If the image MIME type is unsupported or the file exceeds MAX_IMAGE_SIZE_BYTES.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_IMAGE_TPL} for {recipe.id} with {image.filename}')

    try:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise ValidationException(f'Unsupported image type: {image.content_type}')

        # Read at most MAX_IMAGE_SIZE_BYTES + 1 to check size limit
        content = await image.read(MAX_IMAGE_SIZE_BYTES + 1)
        if len(content) > MAX_IMAGE_SIZE_BYTES:
            raise ValidationException(
                f'Image too large: maximum size is {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB',
            )

        # Reset file pointer for storage client
        await image.seek(0)

        image_key = await storage.upload_image(image, StorageBucket.RECIPES, recipe.id)
        new_data = RecipeUpdate(image_key=image_key)
        updated_recipe = await RecipeService(session).update_recipe(recipe, new_data)

        return RecipeRead.model_validate(updated_recipe)
    finally:
        await image.close()


@router.get(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def get_recipe(
    recipe: Annotated[RecipeRead, Depends(get_recipe_by_id)],
    user: Annotated[UserRead, Depends(get_current_active_user)],
) -> RecipeRead:
    """
    Retrieve a single recipe by ID. The route dependency enforces that the authenticated user is authorized to access the recipe.
    
    Returns:
        The requested recipe as a RecipeRead model.
    """
    logger.info(f'Got GET {AppUrl.RECIPES_TPL} request for {user}.')
    return recipe


@router.get(AppUrl.RECIPES, response_model=list[RecipeReadMinimal])
async def get_recipes(
    user: Annotated[UserRead, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[RecipeReadMinimal]:
    """
    Retrieve all recipes owned by the authenticated user.
    
    Parameters:
        user: Authenticated user whose recipes will be retrieved.
    
    Returns:
        A list of recipe summary models (`RecipeReadMinimal`) belonging to the user.
    """
    logger.info(f'Got GET {AppUrl.RECIPES} request for {user}.')
    recipes = await RecipeService(session).get_all_user_recipes(user)
    logger.info(f'Successfully retrieved {len(recipes)} recipes for User {user.email}')

    return [RecipeReadMinimal.model_validate(recipe) for recipe in recipes]


@router.patch(AppUrl.RECIPES_TPL, response_model=RecipeRead)
async def update_recipe(
    new_data: RecipeUpdate,
    recipe: Annotated[RecipeRead, Depends(get_recipe_for_update)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """
    Update an existing recipe owned by the current user.
    
    Parameters:
        new_data (RecipeUpdate): Fields to apply to the recipe.
        recipe (RecipeRead): The target recipe (injected; ensures caller is authorized to modify it).
        session (AsyncSession): Database session used to persist the update.
    
    Returns:
        RecipeRead: The updated recipe.
    """
    logger.info(f'Got PATCH {AppUrl.RECIPES_TPL} for {recipe}')
    updated_recipe = await RecipeService(session).update_recipe(recipe, new_data)
    return RecipeRead.model_validate(updated_recipe)


@router.delete(AppUrl.RECIPES_TPL, status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe: Annotated[RecipeRead, Depends(get_recipe_for_update)],
    storage: Annotated[StorageClient, Depends(get_storage_client)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> None:
    """
    Delete the given recipe and its associated image from storage.
    
    The authenticated user must own the recipe. If deletion succeeds and the recipe has an `image_key`, the corresponding image file is removed from storage.
    """
    logger.info(f'Got DELETE {AppUrl.RECIPES_TPL} for {recipe}')
    result = await RecipeService(session).delete_recipe(recipe)
    if result and recipe.image_key:
        await storage.delete_file(recipe.image_key)
        logger.debug(f'Image {recipe.image_key} was deleted.')
