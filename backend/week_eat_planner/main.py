"""Main entry point for the FastAPI application."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from week_eat_planner.api import auth, monitoring, recipe, user, week
from week_eat_planner.clients.async_client import http_client_manager
from week_eat_planner.db.session_maker import db


@asynccontextmanager
async def lifespan(fast_app: FastAPI) -> AsyncGenerator[None, None]:
    """Manages the application lifespan.

    Initializes the database connection pool on startup and closes it, along with
    any other global resources like the HTTP client, on shutdown.

    Args:
        fast_app: The FastAPI application instance.
    """
    await db.init()

    yield

    await http_client_manager.close_client()
    await db.close()


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application.

    Includes all API routers and adds CORS middleware.

    Returns:
        The configured FastAPI application instance.
    """
    fast_app = FastAPI(title='Week-Eat-Planner', lifespan=lifespan)

    fast_app.include_router(auth.router)
    fast_app.include_router(monitoring.router)
    fast_app.include_router(recipe.router)
    fast_app.include_router(user.router)
    fast_app.include_router(week.router)

    return fast_app


app = create_app()

origins = [
    'http://localhost:3000',
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
    """Starts the application using uvicorn.

    This function is used as an entry point for the application.
    """
    fast_app = create_app()
    uvicorn.run(fast_app, host='0.0.0.0', port=8000)
