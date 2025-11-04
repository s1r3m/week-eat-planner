from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import (
    ModelUserId,
    RecipeCreate,
    RecipeOut,
    RecipePreviewOut,
    RecipeUpdate,
    UserOut,
)
from week_eat_planner.db.dao import RecipeDAO
from week_eat_planner.db.models import Recipe


class RecipeService:
    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: UserOut) -> RecipeOut:
        logger.info(f'Creating new recipe for User {user.email} with recipe data: {recipe}')
        db_recipe = Recipe(**recipe.model_dump(), user_id=user.id)
        created_recipe = await self._recipe_dao.add(db_recipe)
        logger.info(f'Created {created_recipe} successfully.')

        return RecipeOut.model_validate(created_recipe)

    async def get_recipe(self, recipe_id: UUID, for_update: bool = False) -> RecipeOut | None:
        logger.info(f'Getting Recipe with id {recipe_id}.')
        recipe = await self._recipe_dao.find_one_or_none_by_id(obj_id=recipe_id, for_update=for_update)
        return RecipeOut.model_validate(recipe) if recipe else None

    async def get_all_user_recipes(self, user: UserOut) -> list[RecipePreviewOut]:
        logger.info(f'Getting all recipes for User {user.email}')
        recipes = await self._recipe_dao.find_all(ModelUserId(user_id=user.id))

        return [RecipePreviewOut.model_validate(recipe) for recipe in recipes]

    async def update_recipe(self, recipe: RecipeOut, new_data: RecipeUpdate) -> RecipeOut:
        logger.info(f'Updating recipe {recipe.id} with new data: {new_data}')
        updated_recipe = await self._recipe_dao.update(recipe, new_data)
        logger.info(f'Successfully updated recipe {recipe.id}')

        return RecipeOut.model_validate(updated_recipe)

    async def delete_recipe(self, recipe: RecipeOut) -> int:
        logger.info(f'Deleting recipe {recipe.id}')
        count = await self._recipe_dao.delete(recipe)
        logger.info(f'Deleted {count} recipes.')
        return count
