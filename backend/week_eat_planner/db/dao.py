from week_eat_planner.db.base import BaseDAO
from week_eat_planner.db.models import MealSlot, Recipe, RefreshToken, User, Week


class MealSlotDAO(BaseDAO[MealSlot]):
    """Data Access Object for managing meal slots."""

    model = MealSlot


class RecipeDAO(BaseDAO[Recipe]):
    """Data Access Object for managing recipes."""

    model = Recipe


class RefreshTokenDAO(BaseDAO[RefreshToken]):
    """Data Access Object for managing refresh tokens."""

    model = RefreshToken


class UserDAO(BaseDAO[User]):
    """Data Access Object for managing users."""

    model = User


class WeekDAO(BaseDAO[Week]):
    """Data Access Object for managing weeks."""

    model = Week
