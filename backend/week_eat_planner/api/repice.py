from typing import Annotated

from fastapi import APIRouter
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user
from week_eat_planner.services.recipe_service import RecipeService

router = APIRouter()


@router.post(AppUrl.RECIPES)
async def create_recipe(
    recipe_data: schema.RecipeCreate,
    user: Annotated[db_model.User, get_current_active_user],
    session: Annotated[AsyncSession, db.get_db_commit],
) -> None:
    """Creates a new recipe for the current user."""
    logger.info(f'Got POST {AppUrl.RECIPES} request for {user}.')
    await RecipeService(session).create_recipe(user, recipe_data)
    return None


@router.get(AppUrl.RECIPES)
async def get_recipes() -> None:
    pass


@router.get(AppUrl.RECIPES_TPL)
async def get_recipe() -> None:
    pass
