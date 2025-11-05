from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import (
    OwnerId,
    RecipeCreate,
    RecipeRead,
    RecipeReadMinimal,
    RecipeUpdate,
    UserRead,
)
from week_eat_planner.db.dao import RecipeDAO
from week_eat_planner.db.models import Recipe


class RecipeService:
    """Service for handling recipe-related operations."""

    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: UserRead) -> RecipeRead:
        """Creates a new recipe.

        Args:
            recipe: The data for the new recipe.
            user: The user creating the recipe.

        Returns:
            The created recipe.
        """
        logger.info(f'Creating new recipe for User {user.email} with recipe data: {recipe}')
        db_recipe = Recipe(**recipe.model_dump(), user_id=user.id)
        created_recipe = await self._recipe_dao.add(db_recipe)
        logger.info(f'Created {created_recipe} successfully.')

        return RecipeRead.model_validate(created_recipe)

    async def get_recipe(self, recipe_id: UUID, for_update: bool = False) -> RecipeRead | None:
        """Retrieves a single recipe by its ID.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            for_update: Whether to lock the recipe for an update.

        Returns:
            The recipe, or None if not found.
        """
        logger.info(f'Getting Recipe with id {recipe_id}.')
        recipe = await self._recipe_dao.find_one_or_none_by_id(obj_id=recipe_id, for_update=for_update)
        return RecipeRead.model_validate(recipe) if recipe else None

    async def get_all_user_recipes(self, user: UserRead) -> list[RecipeReadMinimal]:
        """Retrieves all recipes for a given user.

        Args:
            user: The user whose recipes to retrieve.

        Returns:
            A list of the user's recipes.
        """
        logger.info(f'Getting all recipes for User {user.email}')
        recipes = await self._recipe_dao.find_all(OwnerId(user_id=user.id))

        return [RecipeReadMinimal.model_validate(recipe) for recipe in recipes]

    async def update_recipe(self, recipe: RecipeRead, new_data: RecipeUpdate) -> RecipeRead:
        """Updates a recipe.

        Args:
            recipe: The recipe to update.
            new_data: The new data for the recipe.

        Returns:
            The updated recipe.
        """
        logger.info(f'Updating recipe {recipe.id} with new data: {new_data}')
        updated_recipe = await self._recipe_dao.update(recipe, new_data)
        logger.info(f'Successfully updated recipe {recipe.id}')

        return RecipeRead.model_validate(updated_recipe)

    async def delete_recipe(self, recipe: RecipeRead) -> int:
        """Deletes a recipe.

        Args:
            recipe: The recipe to delete.

        Returns:
            The number of deleted recipes.
        """
        logger.info(f'Deleting recipe {recipe.id}')
        count = await self._recipe_dao.delete(recipe)
        logger.info(f'Deleted {count} recipes.')
        return count
