from typing import Annotated

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dependencies.auth_deps import get_current_active_user
from week_eat_planner.api.schemas import RecipeRead, UserRead
from week_eat_planner.db.session_maker import db
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
    """
    logger.info(f'Requesting Read-Only Recipe {recipe_id} for {user}')
    recipe = await RecipeService(read_session).get_user_recipe(recipe_id, user, for_update=False)
    logger.info(f'Successfully loaded Read-Only Recipe {recipe.id}.')
    return RecipeRead.model_validate(recipe)


async def get_recipe_for_update(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserRead, Depends(get_current_active_user)],
    write_session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeRead:
    """Dependency that retrieves a recipe for update and ensures it exists.

    Args:
        recipe_id: The ID of the recipe to retrieve.
        user: The current active user.
        write_session: The database session for write operations.

    Returns:
        The RecipeRead object, locked for update.
    """
    logger.info(f'Requesting Recipe {recipe_id} for {user} for update.')
    recipe = await RecipeService(write_session).get_user_recipe(recipe_id, user, for_update=True)
    logger.info(f'Successfully loaded Recipe {recipe.id} for update')
    return RecipeRead.model_validate(recipe)
