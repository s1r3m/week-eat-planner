from typing import Annotated
from uuid import UUID

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeOut, UserOut
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound
from week_eat_planner.services.recipe_service import RecipeService


async def get_recipe_by_id(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    user: Annotated[UserOut, Depends(get_current_active_user)],
    read_session: Annotated[AsyncSession, Depends(db.get_db)],
) -> RecipeOut:
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
    recipe_snapshot: Annotated[RecipeOut, Depends(get_recipe_by_id)],
    write_session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeOut:
    recipe = await RecipeService(write_session).get_recipe(recipe_snapshot.id, for_update=True)
    if not recipe:
        logger.error(f'Recipe {recipe_snapshot.id} does not exist.')
        raise RecipeNotFound

    logger.info(f'Successfully loaded Recipe {recipe_snapshot.id} for update')
    return recipe_snapshot
