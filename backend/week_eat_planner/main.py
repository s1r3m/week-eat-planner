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
async def lifespan(fast_app: FastAPI) -> AsyncGenerator[None]:
    """Initialize database resources and close shared resources on normal shutdown.

    Args:
        fast_app: FastAPI application using this lifespan context.

    Yields:
        None while the application serves requests.
    """
    await db.init()

    yield

    await http_client_manager.close_client()
    await db.close()


def create_app() -> FastAPI:
    """Create a FastAPI application with its lifespan and API routers.

    CORS middleware is attached separately to the module-level app instance.

    Returns:
        A new FastAPI application with authentication, monitoring, recipe, user,
        and week routers.
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
    """Run a newly created application with Uvicorn on 0.0.0.0:8000.

    This console entry point calls create_app(), whose result does not include
    the CORS middleware attached separately to the module-level app.
    """
    fast_app = create_app()
    uvicorn.run(fast_app, host='0.0.0.0', port=8000)
