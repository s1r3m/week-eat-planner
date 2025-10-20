from typing import Annotated
from uuid import UUID

from fastapi import Depends, Path
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeOut
from week_eat_planner.db.session_maker import db
from week_eat_planner.exceptions import RecipeNotFound
from week_eat_planner.services.recipe_service import RecipeService


async def get_recipe_by_id(
    recipe_id: Annotated[str, Path(title='ID of the recipe to get')],
    read_session: Annotated[AsyncSession, Depends(db.get_db)],
) -> RecipeOut:
    try:
        recipe_id = UUID(recipe_id)
    except ValueError:
        logger.error(f'Invalid recipe ID -- not UUID: {recipe_id}')
        raise RecipeNotFound

    recipe = await RecipeService(read_session).get_recipe(recipe_id)
    if not recipe:
        logger.error(f'Recipe {recipe_id} does not exist.')
        raise RecipeNotFound

    logger.info(f'Successfully loaded Recipe {recipe_id} read-only')
    return recipe
