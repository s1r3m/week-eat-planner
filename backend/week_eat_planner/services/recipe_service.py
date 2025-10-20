from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeCreate, UserOut, RecipeOut, UserID, RecipePreviewOut, RecipeUserId
from week_eat_planner.db.dao import RecipeDAO
from week_eat_planner.db.models import Recipe
from week_eat_planner.exceptions import RecipeNotFound


class RecipeService:
    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: UserOut) -> RecipeOut:
        logger.info(f'Creating new recipe for User {user.email} with recipe data: {recipe}')
        db_recipe = Recipe(**recipe.model_dump(), user_id=user.id)
        created_recipe = await self._recipe_dao.add(db_recipe)
        logger.debug(f'Created {created_recipe}.')

        return RecipeOut.model_validate(created_recipe)

    async def get_recipe(self, recipe_id: UUID) -> RecipeOut:
        logger.info(f'Getting Recipe with id {recipe_id}.')
        recipe = await self._recipe_dao.find_one_or_none_by_id(recipe_id, for_update=False)
        if not recipe:
            logger.error(f'Recipe with id {recipe_id} not found')
            raise RecipeNotFound

        return RecipeOut.model_validate(recipe)

    async def get_all_user_recipes(self, user: UserOut) -> list[RecipePreviewOut]:
        logger.info(f'Getting all recipes for User {user.email}')
        recipes = await self._recipe_dao.find_all(RecipeUserId(user_id=user.id))

        return [RecipePreviewOut.model_validate(recipe) for recipe in recipes]
