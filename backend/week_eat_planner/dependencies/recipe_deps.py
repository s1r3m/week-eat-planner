from typing import Annotated
from uuid import UUID

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeRead, UserRead
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.services.recipe_service import RecipeService


async def get_recipe_by_id(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    read_session: Annotated[AsyncSession, Depends(db.get_db)],
) -> RecipeRead:
    """Dependency that retrieves a recipe by its ID and checks user permissions.

    Args:
        recipe_id: The ID of the recipe to retrieve.
        user: The current active user.
        read_session: The database session.

    Returns:
        The RecipeRead object.

    Raises:
        RecipeNotFound: If the recipe does not exist or the ID is invalid.
        RecipeForbidden: If the recipe is private and does not belong to the user.
    """
    try:
        recipe_uuid = UUID(recipe_id)
    except ValueError:
        logger.error(f'Invalid recipe ID -- not UUID: {recipe_id}')
        raise RecipeNotFound

    recipe = await RecipeService(read_session).get_recipe(recipe_uuid)
    if not recipe:
        logger.error(f'Recipe {recipe_uuid} does not exist.')
        raise RecipeNotFound

    if not recipe.is_public and recipe.user_id != user.id:
        logger.error(f'Recipe {recipe_uuid} does not belong to user {user.id}.')
        raise RecipeForbidden

    logger.info(f'Successfully loaded Recipe {recipe_uuid} read-only')
    return recipe


async def get_recipe_for_update(
    recipe_snapshot: Annotated[RecipeRead, Depends(get_recipe_by_id)],
    write_session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """Dependency that retrieves a recipe for update and ensures it exists.

    Args:
        recipe_snapshot: The recipe retrieved by get_recipe_by_id.
        write_session: The database session for write operations.

    Returns:
        The RecipeRead object, locked for update.

    Raises:
        RecipeNotFound: If the recipe does not exist (should not happen if get_recipe_by_id passed).
    """
    recipe = await RecipeService(write_session).get_recipe(recipe_snapshot.id, for_update=True)
    if not recipe:
        logger.error(f'Recipe {recipe_snapshot.id} does not exist.')
        raise RecipeNotFound

    logger.info(f'Successfully loaded Recipe {recipe_snapshot.id} for update')
    return recipe_snapshot
