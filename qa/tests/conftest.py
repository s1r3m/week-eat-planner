from collections.abc import Generator
from urllib import response

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
def created_user(actions, user) -> User:
    response = actions.user.register_user(user)
    body = response.json()
    user.id = body['id']

    return user
