from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import MealSlot, Recipe, RefreshToken, User, Week
from week_eat_planner.db.models.user_favorites import UserFavorite


class MealSlotDAO(BaseDAO[MealSlot]):
    """Data Access Object for managing 'MealSlot' records in the database.

    Provides methods for CRUD operations and specialized queries for meal slots.
    """

    model = MealSlot


class RecipeDAO(BaseDAO[Recipe]):
    """Data Access Object for managing 'Recipe' records in the database.

    Provides methods for CRUD operations and specialized queries for recipes.
    """

    model = Recipe


class RefreshTokenDAO(BaseDAO[RefreshToken]):
    """Data Access Object for managing 'RefreshToken' records in the database.

    Provides methods for CRUD operations and specialized queries for refresh tokens.
    """

    model = RefreshToken


class UserDAO(BaseDAO[User]):
    """Data Access Object for managing 'User' records in the database.

    Provides methods for CRUD operations and specialized queries for users.
    """

    model = User


class UserFavoriteDAO(BaseDAO[UserFavorite]):
    """Data Access Object for managing 'UserFavorite' records in the database.

    Provides methods for CRUD operations and specialized queries for user favorites.
    """

    model = UserFavorite


class WeekDAO(BaseDAO[Week]):
    """Data Access Object for managing 'Week' records in the database.

    Provides methods for CRUD operations and specialized queries for weeks.
    """

    model = Week
