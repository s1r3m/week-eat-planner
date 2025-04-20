import uvicorn
from fastapi import FastAPI

from week_eat_planner.api.api import router
from week_eat_planner.api.auth import auth_router


app = FastAPI(title='Week-Eat-Planner')
app.include_router(router)
app.include_router(auth_router)


def start_app():
    uvicorn.run(app, host='0.0.0.0', port=8000)
