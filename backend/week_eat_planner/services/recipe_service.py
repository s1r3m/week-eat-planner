from sqlalchemy.ext.asyncio import AsyncSession

import week_eat_planner.api.schemas as schema
import week_eat_planner.db.models as db_model
from week_eat_planner.db.recipe_dao import RecipeDAO


class RecipeService:
    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, user: db_model.User, recipe_data: schema.RecipeCreate) -> None:
        pass
