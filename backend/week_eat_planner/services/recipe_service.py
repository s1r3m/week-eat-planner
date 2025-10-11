from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import RecipeCreate, UserOut
from week_eat_planner.db.dao import RecipeDAO


class RecipeService:
    def __init__(self, session: AsyncSession) -> None:
        self._recipe_dao = RecipeDAO(session)

    async def create_recipe(self, user: UserOut, recipe_data: RecipeCreate) -> None:
        pass
