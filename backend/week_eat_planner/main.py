from fastapi import FastAPI

from week_eat_planner.api.api import router
from week_eat_planner.api.auth import auth_router


app = FastAPI()
app.include_router(router)
app.include_router(auth_router)
