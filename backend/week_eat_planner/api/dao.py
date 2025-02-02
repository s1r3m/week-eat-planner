from week_eat_planner.dao.base import BaseDAO
from week_eat_planner.dao.models import Meal, User, Week


class MealDAO(BaseDAO):
    model = Meal


class UserDAO(BaseDAO):
    model = User


class WeekDAO(BaseDAO):
    model = Week
