from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import MealSlot, Recipe, RefreshToken, User, Week


class MealSlotDAO(BaseDAO):
    """Data Access Object for managing meal slots."""

    model = MealSlot


class RecipeDAO(BaseDAO):
    """Data Access Object for managing recipes."""

    model = Recipe


class RefreshTokenDAO(BaseDAO):
    """Data Access Object for managing refresh tokens."""

    model = RefreshToken


class UserDAO(BaseDAO):
    """Data Access Object for managing users."""

    model = User


class WeekDAO(BaseDAO):
    """Data Access Object for managing weeks."""

    model = Week
