import asyncio
from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from week_eat_planner.api.schemas import OwnerId, RecipeCreate, RecipeFavoriteFilter, RecipeUpdate, RecordId, UserRead
from week_eat_planner.db.dao import RecipeDAO, UserFavoriteDAO
from week_eat_planner.db.models import Recipe
from week_eat_planner.db.models.user_favorites import UserFavorite
from week_eat_planner.exceptions import RecipeForbidden, RecipeNotFound


class RecipeService:
    """Service for handling recipe-related operations."""

    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)
        self._user_favorites_dao = UserFavoriteDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: UserRead) -> Recipe:
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

        return created_recipe

    async def get_visible_recipe(self, recipe_id: str, user: UserRead | None = None) -> Recipe:
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
        logger.info(f'Getting visible recipe {recipe_id} for {user}.')
        recipe = await self._get_recipe(recipe_id, for_update=False)

        if not recipe.is_public and (user is None or recipe.user_id != user.id):
            logger.error(f'{user} cannot access the {recipe}')
            raise RecipeForbidden(recipe.id)

        if user:
            favorite: UserFavorite | None = await self._user_favorites_dao.find_one_or_none(
                RecipeFavoriteFilter(user_id=user.id, recipe_id=recipe.id)
            )
            recipe.is_favorite = favorite is not None

        return recipe

    async def get_recipe_for_edit(self, recipe_id: str, user: UserRead) -> Recipe:
        """Retrieves a recipe for editing.

        Ensures the user owns the recipe and locks it for update.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            user: The user requesting the recipe for edit.

        Returns:
            The requested recipe object.

        Raises:
            RecipeNotFound: If the recipe does not exist or the ID is invalid.
            RecipeForbidden: If the user does not own the recipe.
        """
        logger.info(f'Getting user recipe {recipe_id} for {user}.')
        recipe = await self._get_recipe(recipe_id, for_update=True)
        if recipe.user_id != user.id:
            logger.error(f'{user} cannot access the {recipe}')
            raise RecipeForbidden(recipe.id)

        return recipe

    async def _get_recipe(self, recipe_id: str, for_update: bool) -> Recipe:
        """Internal helper to retrieve a recipe from the database.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            for_update: Whether to lock the database row for update.

        Returns:
            The recipe object.

        Raises:
            RecipeNotFound: If the recipe does not exist or the ID is invalid.
        """
        try:
            recipe_uuid = UUID(recipe_id)
        except ValueError as exc:
            logger.error(f'Invalid recipe ID -- not UUID: {recipe_id}')
            raise RecipeNotFound(recipe_id) from exc

        recipe = await self._recipe_dao.find_one_or_none_by_id(recipe_uuid, for_update=for_update)
        if not recipe:
            logger.error(f'Recipe {recipe_uuid} not found.')
            raise RecipeNotFound(recipe_uuid)

        return recipe

    async def get_all_user_recipes(self, user: UserRead) -> list[Recipe]:
        """Retrieves all recipes for a given user.

        Args:
            user: The user whose recipes to retrieve.

        Returns:
            A list of the user's recipes.
        """
        logger.info(f'Getting all recipes for User {user.email}')
        recipes, favorites = await asyncio.gather(
            self._recipe_dao.find_all(OwnerId(user_id=user.id)),
            self._user_favorites_dao.find_all(OwnerId(user_id=user.id)),
        )
        favorite_ids = {f.recipe_id for f in favorites}
        for recipe in recipes:
            recipe.is_favorite = recipe.id in favorite_ids
        logger.info(f'Successfully got {len(recipes)} records')

        return recipes

    async def update_recipe(self, recipe: Recipe, new_data: RecipeUpdate) -> Recipe:
        """Updates a recipe.

        Args:
            recipe: The recipe to update.
            new_data: The new data for the recipe.

        Returns:
            The updated recipe.
        """
        logger.info(f'Updating recipe {recipe.id} with new data: {new_data}')
        updated_recipe = await self._recipe_dao.update(RecordId(id=recipe.id), new_data)
        logger.info(f'Successfully updated recipe {recipe.id}')

        return updated_recipe

    async def delete_recipe(self, recipe: Recipe) -> int:
        """Deletes a recipe.

        Args:
            recipe: The recipe to delete.

        Returns:
            The number of deleted recipes.
        """
        logger.info(f'Deleting recipe {recipe.id}')
        count = await self._recipe_dao.delete(RecordId(id=recipe.id))
        logger.info(f'Deleted {count} recipes.')
        return count

    async def add_favorite(self, recipe_id: str, user: UserRead) -> Recipe:
        """Marks a recipe as a favorite for the user.

        Args:
            recipe_id: The ID of the recipe to favorite.
            user: The user who is favoriting the recipe.

        Returns:
            The recipe object with is_favorite=True.
        """
        logger.info(f'Marking the recipe {recipe_id} favorite for {user=}')
        recipe = await self.get_visible_recipe(recipe_id, user)
        record = UserFavorite(user_id=user.id, recipe_id=recipe.id)

        if recipe.is_favorite:
            logger.warning(f'Recipe {recipe_id=} is already favorited')
            return recipe

        await self._user_favorites_dao.add(record)
        recipe.is_favorite = True
        logger.info('Successfully marked the recipe as favorite')

        return recipe

    async def delete_favorite(self, recipe_id: str, user: UserRead) -> int:
        """Removes a recipe from the user's favorites.

        Args:
            recipe_id: The ID of the recipe to remove from favorites.
            user: The user who is removing the favorite.

        Returns:
            The number of deleted favorite records (0 or 1).
        """
        logger.info(f'Deleting user favorite {recipe_id=} for {user=}')
        recipe = await self.get_visible_recipe(recipe_id, user)
        if not recipe.is_favorite:
            logger.warning(f'Recipe {recipe_id=} is not favorited')
            return 0

        count = await self._user_favorites_dao.delete(RecipeFavoriteFilter(user_id=user.id, recipe_id=recipe.id))
        logger.info(f'Deleted {count} user_favorites.')
        return count

    async def get_user_favorite_recipes(self, user: UserRead) -> list[Recipe]:
        """Retrieves all recipes favorited by a user.

        Args:
            user: The user whose favorites to retrieve.

        Returns:
            A list of favorited recipes.
        """
        logger.info(f'Getting all user_favorites for {user=}')
        favorites = await self._user_favorites_dao.find_all(
            OwnerId(user_id=user.id),
            options=[selectinload(UserFavorite.recipe)],
        )
        logger.info(f'Successfully got {len(favorites)} user_favorites')

        return [favorite.recipe for favorite in favorites]
