"""Data Access Objects for database operations."""

from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import MealSlot, Recipe, Session, ShoppingList, User, UserFavorite, Week


class MealSlotDAO(BaseDAO[MealSlot]):
    """Data access for meal slots using inherited asynchronous CRUD operations."""

    model = MealSlot


class SessionDAO(BaseDAO[Session]):
    """Data access for authentication sessions using inherited asynchronous CRUD operations."""

    model = Session


class RecipeDAO(BaseDAO[Recipe]):
    """Data access for recipes using inherited asynchronous CRUD operations."""

    model = Recipe


class ShoppingListDAO(BaseDAO[ShoppingList]):
    """Data access for shopping lists using inherited asynchronous CRUD operations."""

    model = ShoppingList


class UserDAO(BaseDAO[User]):
    """Data access for users using inherited asynchronous CRUD operations."""

    model = User


class UserFavoriteDAO(BaseDAO[UserFavorite]):
    """Data access for user favorites using inherited asynchronous CRUD operations."""

    model = UserFavorite


class WeekDAO(BaseDAO[Week]):
    """Data access for weeks using inherited asynchronous CRUD operations."""

    model = Week
