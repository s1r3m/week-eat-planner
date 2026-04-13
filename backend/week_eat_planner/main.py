"""Main entry point for the FastAPI application."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from week_eat_planner.api import auth, monitoring, recipe, user, week
from week_eat_planner.db.session_maker import db


@asynccontextmanager
async def lifespan(fast_app: FastAPI) -> AsyncGenerator[None, None]:
    await db.init()

    yield

    await db.close()


def create_app() -> FastAPI:
    fast_app = FastAPI(title='Week-Eat-Planner', lifespan=lifespan)

    fast_app.include_router(auth.router)
    fast_app.include_router(monitoring.router)
    fast_app.include_router(recipe.router)
    fast_app.include_router(user.router)
    fast_app.include_router(week.router)

    return fast_app


app = create_app()

origins = [
    'http://localhost:5173',
    'https://yourproductionfrontend.com',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def start_app() -> None:
    fast_app = create_app()
    uvicorn.run(fast_app, host='0.0.0.0', port=8000)
