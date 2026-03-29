from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import OwnerId, RecipeCreate, RecipeRead, RecipeUpdate, UserRead
from week_eat_planner.api.schemas.recipe import RecipeId
from week_eat_planner.db.dao import RecipeDAO
from week_eat_planner.db.models import Recipe
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound


class RecipeService:
    """Service for handling recipe-related operations."""

    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: UserRead) -> Recipe:
        """Creates a new recipe.

        Args:
            recipe: The data for the new recipe.
            user: The user creating the recipe.s

        Returns:
            The created recipe.
        """
        logger.info(f'Creating new recipe for User {user.email} with recipe data: {recipe}')
        db_recipe = Recipe(**recipe.model_dump(), user_id=user.id)
        created_recipe = await self._recipe_dao.add(db_recipe)
        logger.info(f'Created {created_recipe} successfully.')

        return created_recipe

    async def get_user_recipe(self, recipe_id: str, user: UserRead, for_update: bool) -> Recipe:
        """Retrieves a single recipe by its ID.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            user: The user requesting the recipe.
            for_update: Whether to lock the recipe for an update.

        Returns:
            The requested recipe object.

        Raises:
            RecipeNotFound: If the recipe does not exist or the ID is invalid.
            RecipeForbidden: If the recipe is private and does not belong to the user.
        """
        logger.info(f'Getting recipe {recipe_id} for {user}.')
        try:
            recipe_uuid = UUID(recipe_id)
        except ValueError as exc:
            logger.error(f'Invalid recipe ID -- not UUID: {recipe_id}')
            raise RecipeNotFound(recipe_id) from exc

        recipe = await self._recipe_dao.find_one_or_none_by_id(recipe_uuid, for_update=for_update)
        if not recipe:
            logger.error(f'Recipe {recipe_uuid} not found.')
            raise RecipeNotFound(recipe_uuid)

        if not recipe.is_public and recipe.user_id != user.id:
            logger.error(f'Recipe {recipe_uuid} does not belong to user {user.id}.')
            raise RecipeForbidden(recipe_uuid)

        return recipe

    async def get_all_user_recipes(self, user: UserRead) -> list[Recipe]:
        """Retrieves all recipes for a given user.

        Args:
            user: The user whose recipes to retrieve.

        Returns:
            A list of the user's recipes.
        """
        logger.info(f'Getting all recipes for User {user.email}')
        recipes = await self._recipe_dao.find_all(OwnerId(user_id=user.id))

        return recipes

    async def update_recipe(self, recipe: RecipeRead, new_data: RecipeUpdate) -> Recipe:
        """Updates a recipe.

        Args:
            recipe: The recipe to update.
            new_data: The new data for the recipe.

        Returns:
            The updated recipe.
        """
        # TODO: rethink the method, so that it accepts only fields to update.
        logger.info(f'Updating recipe {recipe.id} with new data: {new_data}')
        updated_recipe = await self._recipe_dao.update(RecipeId(id=recipe.id), new_data)
        logger.info(f'Successfully updated recipe {recipe.id}')

        return updated_recipe

    async def delete_recipe(self, recipe: RecipeRead) -> int:
        """Deletes a recipe.

        Args:
            recipe: The recipe to delete.

        Returns:
            The number of deleted recipes.
        """
        logger.info(f'Deleting recipe {recipe.id}')
        count = await self._recipe_dao.delete(RecipeId(id=recipe.id))
        logger.info(f'Deleted {count} recipes.')
        return count
