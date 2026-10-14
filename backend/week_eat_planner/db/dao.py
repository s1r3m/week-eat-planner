"""Data Access Objects for database operations."""

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import MealSlot, Recipe, Session, ShoppingList, User, UserFavorite, Week


class MealSlotDAO(BaseDAO[MealSlot]):
    """Data Access Object for managing 'MealSlot' records in the database.

    Provides methods for CRUD operations and specialized queries for meal slots.
    """

    model = MealSlot


class SessionDAO(BaseDAO[Session]):
    """Data Access Object for managing user auth sessions in db."""

    model = Session


class RecipeDAO(BaseDAO[Recipe]):
    """Data Access Object for managing 'Recipe' records in the database.

    Provides methods for CRUD operations and specialized queries for recipes.
    """

    model = Recipe


class ShoppingListDAO(BaseDAO[ShoppingList]):
    """Data Access Object for managing 'ShoppingList' records in the database.

    Provides methods for CRUD operations on shopping lists.
    """

    model = ShoppingList


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
