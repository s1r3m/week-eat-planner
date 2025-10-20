from typing import Annotated

from fastapi import APIRouter, Depends, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeCreate, UserOut, RecipeOut, RecipePreviewOut
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.dependencies.recipe_deps import get_recipe_by_id
from week_eat_planner.services.recipe_service import RecipeService

router = APIRouter()


@router.post(AppUrl.RECIPES, response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db_commit)],
) -> RecipeOut:
    """Creates a new recipe for the current user."""
    logger.info(f'Got POST {AppUrl.RECIPES} request for {user}.')
    recipe = await RecipeService(session).create_recipe(recipe_data, user)
    logger.info(f'Recipe "{recipe_data.name}" has been created!')

    return recipe


@router.get(AppUrl.RECIPES_TPL, response_model=RecipeOut)
async def get_recipe(
    recipe: Annotated[RecipeOut, Depends(get_recipe_by_id)],
    user: Annotated[UserOut, Depends(get_current_active_user)],
) -> RecipeOut:
    logger.info(f'Got GET {AppUrl.RECIPES_TPL} request for {user}.')
    return recipe


@router.get(AppUrl.RECIPES, response_model=list[RecipePreviewOut])
async def get_recipes(
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(db.get_db)],
) -> list[RecipePreviewOut]:
    logger.info(f'Got GET {AppUrl.RECIPES} request for {user}.')
    recipes = await RecipeService(session).get_all_user_recipes(user)
    logger.info(f'Successfully retrieved {len(recipes)} recipes for User {user.email}')

    return recipes
