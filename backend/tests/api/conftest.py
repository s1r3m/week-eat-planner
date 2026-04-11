from collections.abc import AsyncGenerator, Callable, Generator
from http import HTTPStatus
from typing import TypeVar

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from tests.constants import (
    EMAIL,
    PASSWORD,
    RECIPE_INGREDIENTS,
    RECIPE_IS_PUBLIC,
    RECIPE_NAME,
    USERNAME,
    WEEK_1_NAME,
    WEEK_2_NAME,
)
from week_eat_planner.api.schemas import (
    RecipeCreate,
    RecipeUpdate,
    UserCreate,
    UserRead,
    WeekCreate,
)
from week_eat_planner.constants import AppUrl, StorageBucket
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.db.models.week import Week
from week_eat_planner.db.session_maker import db
from week_eat_planner.main import app
from week_eat_planner.services.auth_service import AuthService
from week_eat_planner.services.recipe_service import RecipeService
from week_eat_planner.services.week_service import WeekService

T = TypeVar('T')
AsyncYieldFixture = AsyncGenerator[T, None]
YieldFixture = Generator[T, None, None]


@pytest_asyncio.fixture
async def db_connection() -> AsyncYieldFixture[None]:
    await db.init()
    yield
    await db.close()


@pytest_asyncio.fixture
async def db_session(db_connection: None) -> AsyncYieldFixture[AsyncSession]:
    connection = await db.engine.connect()
    trans = await connection.begin()

    session_maker = async_sessionmaker(connection, class_=AsyncSession, expire_on_commit=False)
    session = session_maker()

    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncYieldFixture[AsyncClient]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[db.get_db] = override_get_db
    app.dependency_overrides[db.get_db_commit] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as ac:
        yield ac

    del app.dependency_overrides[db.get_db]
    del app.dependency_overrides[db.get_db_commit]


@pytest.fixture
def auth_client_factory(client: AsyncClient) -> Callable:
    async def _factory(user: UserRead, password: str) -> AsyncClient:
        client.headers['Authorization'] = ''
        token_data = {'username': user.email, 'password': password}
        response = await client.post(AppUrl.AUTH_LOGIN, data=token_data)
        assert response.status_code == HTTPStatus.OK, f'{response.status_code}: {response.text}'
        body = response.json()
        token = body['access_token']
        client.headers['Authorization'] = f'Bearer {token}'
        return client

    return _factory


@pytest_asyncio.fixture
async def logout_client_for_created_user(auth_client_factory: Callable, created_user: UserRead) -> AsyncClient:
    auth_client = await auth_client_factory(created_user, PASSWORD)
    await auth_client.post(AppUrl.AUTH_LOGOUT)  # Remove cookies
    auth_client.headers['Authorization'] = ''
    return auth_client


@pytest.fixture
def created_week_factory(db_session: AsyncSession) -> Callable:
    async def _factory(user: UserRead, week_data: WeekCreate) -> Week:
        week = await WeekService(db_session).create_week_with_slots(user, week_data)
        await db_session.flush()
        return week

    return _factory


@pytest.fixture
def user_factory(db_session: AsyncSession) -> Callable:
    async def _factory(user_data: UserCreate) -> UserRead:
        user = await AuthService(db_session).register_user(user_data)
        await db_session.flush()
        return UserRead.model_validate(user)

    return _factory


@pytest.fixture
def created_recipe_factory(db_session: AsyncSession) -> Callable:
    async def _factory(user: UserRead, recipe_data: RecipeCreate) -> Recipe:
        recipe = await RecipeService(db_session).create_recipe(recipe_data, user)
        await db_session.flush()
        return recipe

    return _factory


@pytest_asyncio.fixture
async def created_user(user_factory: Callable) -> UserRead:
    return await user_factory(UserCreate(email=EMAIL, password=PASSWORD, username=USERNAME))


@pytest_asyncio.fixture
async def created_user_2(user_factory: Callable) -> UserRead:
    return await user_factory(UserCreate(email='user_2@test.com', password=PASSWORD, username=None))


@pytest_asyncio.fixture
async def created_week(created_week_factory: Callable, created_user: UserRead) -> Week:
    return await created_week_factory(created_user, WeekCreate(name=WEEK_1_NAME))


@pytest_asyncio.fixture
async def created_week_2(created_week_factory: Callable, created_user: UserRead) -> Week:
    return await created_week_factory(created_user, WeekCreate(name=WEEK_2_NAME))


@pytest_asyncio.fixture
async def created_recipe(created_recipe_factory: Callable, created_user: UserRead) -> Recipe:
    recipe_create = RecipeCreate(
        name=RECIPE_NAME, is_public=RECIPE_IS_PUBLIC, ingredients=RECIPE_INGREDIENTS, is_favorite=False
    )

    return await created_recipe_factory(created_user, recipe_data=recipe_create)


@pytest_asyncio.fixture
async def created_recipe_for_other_user(created_recipe_factory: Callable, created_user_2: UserRead) -> Recipe:
    recipe_create = RecipeCreate(
        name='other_user_recipe', is_public=RECIPE_IS_PUBLIC, ingredients=RECIPE_INGREDIENTS, is_favorite=False
    )
    return await created_recipe_factory(created_user_2, recipe_data=recipe_create)


@pytest_asyncio.fixture
async def created_recipe_with_image(
    created_recipe_factory: Callable, created_user: UserRead, db_session: AsyncSession
) -> Recipe:
    recipe_create = RecipeCreate(
        name='another_name', is_public=RECIPE_IS_PUBLIC, ingredients=RECIPE_INGREDIENTS, is_favorite=False
    )
    recipe = await created_recipe_factory(created_user, recipe_data=recipe_create)
    update_data = RecipeUpdate(image_key=f'{StorageBucket.RECIPES}/{recipe.id}.jpg')
    updated_recipe = await RecipeService(db_session).update_recipe(recipe, update_data)
    return updated_recipe


@pytest_asyncio.fixture
async def auth_client_for_created_user(auth_client_factory: Callable, created_user: UserRead) -> AsyncClient:
    return await auth_client_factory(created_user, PASSWORD)
