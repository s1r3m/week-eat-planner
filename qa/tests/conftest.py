from collections.abc import Generator

import pytest

from wep_qa.actions import Actions
from wep_qa.constants import EMAIL
from wep_qa.qa_models import User


@pytest.fixture
def actions() -> Generator[Actions]:
    wep_actions = Actions()

    yield wep_actions

    wep_actions.cleanup()


@pytest.fixture
def user() -> User:
    return User(email=EMAIL, username=f'User_{EMAIL}')


@pytest.fixture
def created_user(actions: Actions) -> User:
    user = User(email='user_1@wep.com', password='Us3rPas$w04d_1', username='User 1')
    response = actions.user.register_user(user)
    body = response.json()
    user.id = body['id']

    return user


@pytest.fixture
def auth_user(actions: Actions, created_user: User) -> User:
    response = actions.user.login_user(created_user)

    return created_user
