import uvicorn
from fastapi import FastAPI

from week_eat_planner.api.auth import router as auth_router
from week_eat_planner.api.monitoring import router as monitoring_router
from week_eat_planner.api.recipe import router as recipe_router
from week_eat_planner.api.user import router as user_router
from week_eat_planner.api.week import router as weeks_router

app = FastAPI(title='Week-Eat-Planner')
app.include_router(auth_router)
app.include_router(monitoring_router)
app.include_router(recipe_router)
app.include_router(user_router)
app.include_router(weeks_router)


def start_app() -> None:
    uvicorn.run(app, host='0.0.0.0', port=8000)
