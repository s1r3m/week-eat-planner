import week_eat_planner.db.models as db_model
from week_eat_planner.db.base import BaseDAO


class MealSlotDAO(BaseDAO):
    """Data Access Object for managing meal slots."""

    model = db_model.MealSlot
