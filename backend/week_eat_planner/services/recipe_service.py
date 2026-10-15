"""Service layer for recipe-related business logic."""

from uuid import UUID

from loguru import logger
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from week_eat_planner.api.schemas import OwnerId, RecipeCreate, RecipeFavoriteFilter, RecipeUpdate, RecordId
from week_eat_planner.db.dao import RecipeDAO, UserFavoriteDAO
from week_eat_planner.db.models import Recipe, User, UserFavorite
from week_eat_planner.exceptions import RecipeForbiddenException, RecipeNotFoundException


class RecipeService:
    """Service for handling recipe-related operations."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize database access using the provided session.

        Args:
            session: Database session whose transaction is managed by the caller.
        """
        self._session = session
        self._recipe_dao = RecipeDAO(session)
        self._user_favorites_dao = UserFavoriteDAO(session)

    async def create_recipe(self, recipe: RecipeCreate, user: User) -> Recipe:
        """Creates a new recipe.

        Args:
            recipe: The data for the new recipe.
            user: The user requesting the operation.

        Returns:
            The created recipe.
        """
        logger.info(f'Creating new recipe "{recipe.name}" for user {user.id}')
        db_recipe = Recipe(**recipe.model_dump(), user_id=user.id)
        created_recipe = await self._recipe_dao.add(db_recipe)
        logger.info(f'Created recipe {created_recipe.id} successfully')

        return created_recipe

    async def get_visible_recipe(self, recipe_id: str, user: User | None = None) -> Recipe:
        """Retrieve a public recipe or a recipe owned by the requesting user.

        For an authenticated user, populate the recipe's is_favorite flag from
        their favorite records.

        Args:
            recipe_id: UUID string identifying the recipe.
            user: Requesting user, defaulting to None for anonymous access to public recipes.

        Returns:
            The visible recipe with its requesting user's favorite status, when applicable.

        Raises:
            RecipeNotFoundException: If the recipe does not exist or the ID is invalid.
            RecipeForbiddenException: If the recipe is private and the user is absent or not its owner.
        """
        logger.info(f'Getting visible recipe {recipe_id} for user {user.id if user else None}')
        recipe = await self._get_recipe(recipe_id, for_update=False)

        if not recipe.is_public and (not user or recipe.user_id != user.id):
            logger.error(f'User {user.id if user else None} cannot access recipe {recipe.id}')
            raise RecipeForbiddenException(recipe.id)

        if user and user.id:
            favorite: UserFavorite | None = await self._user_favorites_dao.find_one_or_none(
                RecipeFavoriteFilter(user_id=user.id, recipe_id=recipe.id)
            )
            recipe.is_favorite = favorite is not None

        return recipe

    async def get_recipe_for_edit(self, recipe_id: str, user: User) -> Recipe:
        """Retrieves a recipe for editing.

        Ensures the user owns the recipe and locks it for update.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            user: The user requesting the operation.

        Returns:
            The requested recipe object.

        Raises:
            RecipeNotFoundException: If the recipe does not exist or the ID is invalid.
            RecipeForbiddenException: If the user does not own the recipe.
        """
        logger.info(f'Getting user recipe {recipe_id} for user {user.id}')
        recipe = await self._get_recipe(recipe_id, for_update=True)
        if recipe.user_id != user.id:
            logger.error(f'User {user.id} cannot access recipe {recipe.id}')
            raise RecipeForbiddenException(recipe.id)

        return recipe

    async def _get_recipe(self, recipe_id: str, for_update: bool) -> Recipe:
        """Internal helper to retrieve a recipe from the database.

        Args:
            recipe_id: The ID of the recipe to retrieve.
            for_update: Whether to lock the database row for update.

        Returns:
            The recipe object.

        Raises:
            RecipeNotFoundException: If the recipe does not exist or the ID is invalid.
        """
        try:
            recipe_uuid = UUID(recipe_id)
        except ValueError as exc:
            logger.error(f'Invalid recipe ID -- not UUID: {recipe_id}')
            raise RecipeNotFoundException(recipe_id) from exc

        recipe = await self._recipe_dao.find_one_or_none_by_id(recipe_uuid, for_update=for_update)
        if not recipe:
            logger.error(f'Recipe {recipe_uuid} not found')
            raise RecipeNotFoundException(recipe_uuid)

        return recipe

    async def get_all_user_recipes(self, user: User) -> list[Recipe]:
        """Retrieve recipes owned by a user and populate their favorite flags.

        Args:
            user: User whose recipes and favorites should be queried.

        Returns:
            The user's recipes, or an empty list if the user has no recipes.
        """
        logger.info(f'Getting all recipes for user {user.id}')
        recipes = await self._recipe_dao.find_all(OwnerId(user_id=user.id))
        favorites = await self._user_favorites_dao.find_all(OwnerId(user_id=user.id))

        favorite_ids = {f.recipe_id for f in favorites}
        for recipe in recipes:
            recipe.is_favorite = recipe.id in favorite_ids
        logger.info(f'Successfully got {len(recipes)} recipes')

        return recipes

    async def update_recipe(self, recipe: Recipe, new_data: RecipeUpdate) -> Recipe:
        """Updates a recipe.

        Args:
            recipe: The recipe to update.
            new_data: The new data for the recipe.

        Returns:
            The updated recipe.
        """
        logger.info(f'Updating recipe {recipe.id}')
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
        logger.info(f'Deleted {count} recipes')
        return count

    async def add_favorite(self, recipe_id: str, user: User) -> Recipe:
        """Mark a visible recipe as a favorite, tolerating an existing association.

        Return immediately if the favorite is already present. If insertion
        raises IntegrityError, roll back the supplied session and reload the recipe
        before returning it with is_favorite set to True.

        Args:
            recipe_id: UUID string identifying the recipe to favorite.
            user: User who will own the favorite association.

        Returns:
            The recipe with is_favorite set to True.

        Raises:
            RecipeNotFoundException: If the recipe does not exist or the ID is invalid.
            RecipeForbiddenException: If the recipe is private and not owned by the user.
        """
        logger.info(f'Marking recipe {recipe_id} favorite for user {user.id}')
        recipe = await self.get_visible_recipe(recipe_id, user)

        if recipe.is_favorite:
            logger.warning(f'Recipe {recipe_id} is already favorited')
            return recipe

        record = UserFavorite(user_id=user.id, recipe_id=recipe.id)

        try:
            await self._user_favorites_dao.add(record)
        except IntegrityError:
            await self._session.rollback()
            logger.warning(f'Recipe {recipe_id} is already favorited')
            recipe = await self.get_visible_recipe(recipe_id, user)

        recipe.is_favorite = True
        logger.info('Successfully marked the recipe as favorite')

        return recipe

    async def delete_favorite(self, recipe_id: str, user: User) -> int:
        """Removes a recipe from the user's favorites.

        Args:
            recipe_id: The ID of the recipe to remove from favorites.
            user: The user requesting the operation.

        Returns:
            The number of deleted favorite records (0 or 1).

        Raises:
            RecipeNotFoundException: If the recipe does not exist or the ID is invalid.
            RecipeForbiddenException: If the recipe is private and does not belong to the user.
        """
        logger.info(f'Deleting user favorite {recipe_id} for user {user.id}')
        recipe = await self.get_visible_recipe(recipe_id, user)
        if not recipe.is_favorite:
            logger.warning(f'Recipe {recipe_id} is not favorited')
            return 0

        count = await self._user_favorites_dao.delete(RecipeFavoriteFilter(user_id=user.id, recipe_id=recipe.id))
        logger.info(f'Deleted {count} user_favorites')
        return count

    async def get_user_favorite_recipes(self, user: User) -> list[Recipe]:
        """Retrieve a user's favorite recipes that remain visible to them.

        Skip recipes made private by another owner and mark returned recipes with
        is_favorite set to True.

        Args:
            user: User whose favorite associations should be queried.

        Returns:
            Visible favorite recipes, or an empty list if none remain accessible.
        """
        logger.info(f'Getting all user_favorites for user {user.id}')
        favorites = await self._user_favorites_dao.find_all(
            OwnerId(user_id=user.id),
            options=[selectinload(UserFavorite.recipe)],
        )
        logger.info(f'Successfully got {len(favorites)} user_favorites')
        recipes: list[Recipe] = []
        for favorite in favorites:
            recipe = favorite.recipe
            if not recipe.is_public and recipe.user_id != user.id:
                logger.warning(f'Skipping inaccessible favorite recipe {recipe.id}')
                continue
            recipe.is_favorite = True
            recipes.append(recipe)

        return recipes
