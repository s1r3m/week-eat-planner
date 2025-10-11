import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class RecipeDAO(BaseDAO):
    """Data Access Object for managing recipes."""

    model = db_model.Recipe
